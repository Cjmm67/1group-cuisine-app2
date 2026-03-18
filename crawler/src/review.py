"""Review queue with AI pre-scoring for crawled recipes."""

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from .models import CrawledRecipe, ReviewStatus, DatabaseManager
from .normalizer import NormalizedRecipe

logger = logging.getLogger(__name__)


@dataclass
class ReviewScore:
    """AI-generated review score for a recipe."""

    recipe_id: str
    score: int  # 0-100
    completeness_score: float
    quality_score: float
    attribution_score: float
    recommendation: str  # AUTO_APPROVE, REVIEW, REJECT
    reasoning: list[str]


class ReviewQueue:
    """Manages review workflow with AI pre-scoring."""

    def __init__(self, db_manager: DatabaseManager) -> None:
        """Initialize review queue.

        Args:
            db_manager: Database manager instance.
        """
        self.db = db_manager

    async def score_recipe(self, recipe: NormalizedRecipe, raw_crawled: Optional[CrawledRecipe] = None) -> ReviewScore:
        """AI pre-score a recipe (0-100).

        Args:
            recipe: Normalized recipe to score.
            raw_crawled: Optional raw crawled recipe record.

        Returns:
            ReviewScore with detailed scoring.
        """
        reasoning: list[str] = []
        scores: dict[str, float] = {}

        # 1. Completeness Score (0-100)
        # Check for required fields
        completeness_weight = 0.35
        required_fields_present = 0
        required_fields = [
            recipe.title,
            recipe.ingredients,
            recipe.instructions,
            recipe.description,
        ]
        total_required = len(required_fields)

        for field in required_fields:
            if field:
                if isinstance(field, list) and len(field) > 0:
                    required_fields_present += 1
                elif field:
                    required_fields_present += 1

        completeness = (required_fields_present / total_required) * 100

        # Check ingredient detail level
        if recipe.ingredients:
            detailed_ingredients = sum(
                1 for ing in recipe.ingredients
                if ing.quantity_grams or ing.quantity_ml
            )
            ingredient_detail_ratio = detailed_ingredients / len(recipe.ingredients)
            completeness = (completeness + ingredient_detail_ratio * 100) / 2

        scores["completeness"] = completeness

        if completeness < 80:
            reasoning.append(f"Incomplete recipe data: {required_fields_present}/{total_required} core fields")

        # 2. Quality Score (0-100)
        quality_weight = 0.35
        quality_score = 50.0

        # Title quality
        if recipe.title and len(recipe.title) > 5:
            quality_score += 10
        if len(recipe.title or "") > 50:
            reasoning.append("Recipe title is unusually long")
            quality_score -= 5

        # Instructions quality
        if recipe.instructions:
            quality_score += 15
            if len(recipe.instructions) < 3:
                quality_score -= 5
                reasoning.append("Recipe has very few instructions")

        # Ingredient quality
        if recipe.ingredients:
            quality_score += 15
            if len(recipe.ingredients) < 2:
                quality_score -= 10
                reasoning.append("Recipe has very few ingredients")

        # Timing information
        if recipe.prep_time_minutes or recipe.cook_time_minutes:
            quality_score += 10
        else:
            reasoning.append("Missing timing information")

        # Serving information
        if recipe.serves:
            quality_score += 5
        else:
            reasoning.append("Missing serving/yield information")

        # Description quality
        if recipe.description and len(recipe.description) > 20:
            quality_score += 10
        else:
            reasoning.append("Description is missing or too short")

        quality_score = min(100, quality_score)
        scores["quality"] = quality_score

        # 3. Attribution & Source Quality (0-100)
        attribution_weight = 0.30
        attribution_score = 0.0

        if recipe.source_url:
            attribution_score += 20
            # Check if source is a credible domain
            source_lower = recipe.source_url.lower()
            credible_domains = [
                "greatbritishchefs.com",
                "finedininglovers.com",
                "michelin.com",
                "bonappetit.com",
                "seriouseats.com",
                "foodandwine.com",
            ]
            if any(domain in source_lower for domain in credible_domains):
                attribution_score += 30
            else:
                attribution_score += 15

        if recipe.cuisine:
            attribution_score += 15

        if recipe.difficulty:
            attribution_score += 10

        if recipe.techniques:
            attribution_score += 10

        scores["attribution"] = attribution_score

        # Calculate weighted overall score
        overall_score = (
            completeness * completeness_weight
            + quality_score * quality_weight
            + attribution_score * attribution_weight
        )
        overall_score = int(min(100, overall_score))

        # Determine recommendation
        if overall_score >= 85:
            recommendation = "AUTO_APPROVE"
        elif overall_score >= 70:
            recommendation = "REVIEW"
        else:
            recommendation = "REJECT"
            reasoning.append(f"Overall score below minimum threshold: {overall_score}")

        return ReviewScore(
            recipe_id=raw_crawled.id if raw_crawled else str(uuid.uuid4()),
            score=overall_score,
            completeness_score=completeness,
            quality_score=quality_score,
            attribution_score=attribution_score,
            recommendation=recommendation,
            reasoning=reasoning,
        )

    async def auto_approve(self, min_score: int = 85) -> list[CrawledRecipe]:
        """Auto-approve high-scoring recipes.

        Args:
            min_score: Minimum score for auto-approval.

        Returns:
            List of auto-approved recipes.
        """
        session = self.db.get_session()

        try:
            pending_recipes = (
                session.query(CrawledRecipe)
                .filter(CrawledRecipe.review_status == ReviewStatus.PENDING)
                .all()
            )

            approved: list[CrawledRecipe] = []

            for recipe in pending_recipes:
                if recipe.normalized_data:
                    # Score the recipe
                    norm_recipe = NormalizedRecipe(**recipe.normalized_data)
                    score = await self.score_recipe(norm_recipe, recipe)

                    if score.score >= min_score:
                        recipe.review_status = ReviewStatus.AUTO_APPROVED
                        recipe.review_score = score.score
                        recipe.reviewed_at = datetime.utcnow()
                        session.add(recipe)
                        approved.append(recipe)
                        logger.info(f"Auto-approved recipe {recipe.id}: {score.score}/100")

            session.commit()
            logger.info(f"Auto-approved {len(approved)} recipes")
            return approved

        finally:
            session.close()

    async def get_pending(self, limit: int = 100) -> list[CrawledRecipe]:
        """Get recipes awaiting human review.

        Args:
            limit: Maximum number to return.

        Returns:
            List of pending recipes.
        """
        session = self.db.get_session()

        try:
            pending = (
                session.query(CrawledRecipe)
                .filter(CrawledRecipe.review_status == ReviewStatus.PENDING)
                .limit(limit)
                .all()
            )

            logger.info(f"Found {len(pending)} recipes pending review")
            return pending

        finally:
            session.close()

    async def approve_recipe(
        self, recipe_id: str, reviewer_id: str, notes: Optional[str] = None
    ) -> CrawledRecipe:
        """Manually approve a recipe.

        Args:
            recipe_id: ID of recipe to approve.
            reviewer_id: ID of reviewer.
            notes: Optional reviewer notes.

        Returns:
            Updated CrawledRecipe.
        """
        session = self.db.get_session()

        try:
            recipe = session.query(CrawledRecipe).filter(CrawledRecipe.id == recipe_id).first()

            if not recipe:
                raise ValueError(f"Recipe {recipe_id} not found")

            recipe.review_status = ReviewStatus.APPROVED
            recipe.reviewed_by = reviewer_id
            recipe.reviewed_at = datetime.utcnow()
            recipe.reviewer_notes = notes

            session.commit()
            logger.info(f"Approved recipe {recipe_id}")
            return recipe

        finally:
            session.close()

    async def reject_recipe(
        self, recipe_id: str, reviewer_id: str, reason: str
    ) -> CrawledRecipe:
        """Reject a recipe.

        Args:
            recipe_id: ID of recipe to reject.
            reviewer_id: ID of reviewer.
            reason: Reason for rejection.

        Returns:
            Updated CrawledRecipe.
        """
        session = self.db.get_session()

        try:
            recipe = session.query(CrawledRecipe).filter(CrawledRecipe.id == recipe_id).first()

            if not recipe:
                raise ValueError(f"Recipe {recipe_id} not found")

            recipe.review_status = ReviewStatus.REJECTED
            recipe.reviewed_by = reviewer_id
            recipe.reviewed_at = datetime.utcnow()
            recipe.reviewer_notes = reason

            session.commit()
            logger.info(f"Rejected recipe {recipe_id}")
            return recipe

        finally:
            session.close()

    async def flag_recipe(self, recipe_id: str, reason: str) -> CrawledRecipe:
        """Flag a recipe for special attention.

        Args:
            recipe_id: ID of recipe to flag.
            reason: Reason for flagging.

        Returns:
            Updated CrawledRecipe.
        """
        session = self.db.get_session()

        try:
            recipe = session.query(CrawledRecipe).filter(CrawledRecipe.id == recipe_id).first()

            if not recipe:
                raise ValueError(f"Recipe {recipe_id} not found")

            recipe.review_status = ReviewStatus.FLAGGED
            recipe.reviewer_notes = reason
            session.commit()

            logger.info(f"Flagged recipe {recipe_id}")
            return recipe

        finally:
            session.close()

    async def get_review_stats(self) -> dict:
        """Get review queue statistics.

        Returns:
            Dictionary with review stats.
        """
        session = self.db.get_session()

        try:
            total = session.query(CrawledRecipe).count()
            pending = session.query(CrawledRecipe).filter(
                CrawledRecipe.review_status == ReviewStatus.PENDING
            ).count()
            approved = session.query(CrawledRecipe).filter(
                CrawledRecipe.review_status == ReviewStatus.APPROVED
            ).count()
            auto_approved = session.query(CrawledRecipe).filter(
                CrawledRecipe.review_status == ReviewStatus.AUTO_APPROVED
            ).count()
            rejected = session.query(CrawledRecipe).filter(
                CrawledRecipe.review_status == ReviewStatus.REJECTED
            ).count()
            flagged = session.query(CrawledRecipe).filter(
                CrawledRecipe.review_status == ReviewStatus.FLAGGED
            ).count()

            return {
                "total_recipes": total,
                "pending_review": pending,
                "approved": approved,
                "auto_approved": auto_approved,
                "rejected": rejected,
                "flagged": flagged,
                "approval_rate": (approved + auto_approved) / total * 100 if total > 0 else 0,
            }

        finally:
            session.close()
