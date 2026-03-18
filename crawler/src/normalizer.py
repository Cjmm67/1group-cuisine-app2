"""Normalisation pipeline for standardized recipe format."""

import logging
import math
from dataclasses import dataclass, asdict
from typing import Any, Optional

import numpy as np
from sentence_transformers import SentenceTransformer, util

from .extraction import ExtractedRecipe, Ingredient, RecipeStep

logger = logging.getLogger(__name__)


# Unit conversion factors to grams (for common ingredients)
UNIT_TO_GRAMS = {
    "cup": {"default": 240, "flour": 120, "sugar": 200, "butter": 225, "milk": 240},
    "tbsp": {"default": 15, "butter": 15, "flour": 8, "sugar": 12},
    "tsp": {"default": 5, "salt": 5},
    "oz": {"default": 28.35},
    "ml": {"default": 1.0},
    "l": {"default": 1000},
    "g": {"default": 1},
    "kg": {"default": 1000},
    "lb": {"default": 453.592},
}

# Difficulty classifications
DIFFICULTY_LEVELS = ["Easy", "Intermediate", "Advanced", "Professional", "Advanced Professional", "R&D"]

# Cuisine taxonomy
CUISINE_TAXONOMY = [
    "French",
    "Italian",
    "Japanese",
    "Chinese",
    "Spanish",
    "Indian",
    "Thai",
    "Mexican",
    "Mediterranean",
    "Korean",
    "Vietnamese",
    "Turkish",
    "Lebanese",
    "Greek",
    "Nordic",
    "British",
    "American",
    "Brazilian",
    "Peruvian",
    "Turkish",
    "Portuguese",
    "German",
    "Austrian",
    "Belgian",
    "Dutch",
    "Scandinavian",
    "Eastern European",
]

# Technique taxonomy
TECHNIQUE_TAXONOMY = [
    "Grilling",
    "Sautéing",
    "Braising",
    "Steaming",
    "Roasting",
    "Baking",
    "Frying",
    "Poaching",
    "Simmering",
    "Sous-vide",
    "Smoking",
    "Curing",
    "Marinating",
    "Emulsifying",
    "Tempering",
    "Clarifying",
    "Caramelizing",
    "Deglazing",
    "Reducing",
    "Whisking",
    "Folding",
    "Kneading",
    "Fermentation",
    "Spherification",
    "Molecular gastronomy",
    "Plating",
    "Garnishing",
]

# Common allergens
ALLERGENS = [
    "Peanuts",
    "Tree nuts",
    "Milk",
    "Eggs",
    "Fish",
    "Shellfish",
    "Wheat",
    "Soy",
    "Sesame",
    "Sulfites",
]

# Basic ingredient pricing (per kg in USD)
INGREDIENT_PRICES = {
    "chicken breast": 8.0,
    "beef": 12.0,
    "salmon": 18.0,
    "white rice": 2.5,
    "olive oil": 15.0,
    "butter": 10.0,
    "milk": 3.5,
    "eggs": 6.0,
    "flour": 2.0,
    "sugar": 1.5,
    "salt": 0.5,
}


@dataclass
class NormalizedIngredient:
    """Normalized ingredient with standardized units."""

    name: str
    quantity_grams: Optional[float] = None
    quantity_ml: Optional[float] = None
    original_quantity: Optional[float] = None
    original_unit: Optional[str] = None
    preparation: Optional[str] = None
    controlled_vocabulary_match: Optional[str] = None
    estimated_cost_usd: Optional[float] = None


@dataclass
class NormalizedRecipe:
    """Fully normalized recipe."""

    title: str
    source_url: str
    ingredients: list[NormalizedIngredient]
    instructions: list[RecipeStep]
    description: Optional[str] = None
    cuisine: Optional[str] = None
    difficulty: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    total_time_minutes: Optional[int] = None
    serves: Optional[int] = None
    techniques: list[str] = None
    allergens: list[str] = None
    dietary_tags: list[str] = None
    sustainability_score: Optional[float] = None
    estimated_food_cost_usd: Optional[float] = None
    deduplication_hash: Optional[str] = None

    def __post_init__(self):
        if self.techniques is None:
            self.techniques = []
        if self.allergens is None:
            self.allergens = []
        if self.dietary_tags is None:
            self.dietary_tags = []

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "title": self.title,
            "source_url": self.source_url,
            "ingredients": [asdict(ing) for ing in self.ingredients],
            "instructions": [asdict(inst) for inst in self.instructions],
            "description": self.description,
            "cuisine": self.cuisine,
            "difficulty": self.difficulty,
            "prep_time_minutes": self.prep_time_minutes,
            "cook_time_minutes": self.cook_time_minutes,
            "total_time_minutes": self.total_time_minutes,
            "serves": self.serves,
            "techniques": self.techniques,
            "allergens": self.allergens,
            "dietary_tags": self.dietary_tags,
            "sustainability_score": self.sustainability_score,
            "estimated_food_cost_usd": self.estimated_food_cost_usd,
        }


class NormalizationPipeline:
    """Normalizes extracted recipes to standardized format."""

    def __init__(self) -> None:
        """Initialize the normalizer."""
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.deduplication_cache: dict[str, tuple[str, np.ndarray]] = {}

    async def normalize(self, extracted: ExtractedRecipe) -> NormalizedRecipe:
        """Normalize an extracted recipe.

        Args:
            extracted: ExtractedRecipe from extraction engine.

        Returns:
            NormalizedRecipe with standardized format.
        """
        logger.info(f"Normalizing recipe: {extracted.title}")

        # Normalize ingredients
        normalized_ingredients = await self._normalize_ingredients(extracted.ingredients)

        # Normalize difficulty
        difficulty = self._normalize_difficulty(extracted.difficulty)

        # Normalize cuisine
        cuisine = self._normalize_cuisine(extracted.cuisine)

        # Extract and normalize techniques
        techniques = await self._extract_techniques(extracted.instructions)

        # Normalize allergens
        allergens = self._normalize_allergens(extracted.allergens or [])

        # Calculate food cost
        food_cost = self._estimate_food_cost(normalized_ingredients)

        # Calculate sustainability score
        sustainability = await self._calculate_sustainability_score(normalized_ingredients)

        # Generate deduplication hash
        dedup_hash = self._generate_deduplication_hash(
            extracted.title, normalized_ingredients
        )

        recipe = NormalizedRecipe(
            title=extracted.title,
            source_url=extracted.source_url or "",
            ingredients=normalized_ingredients,
            instructions=extracted.instructions,
            description=extracted.description,
            cuisine=cuisine,
            difficulty=difficulty,
            prep_time_minutes=extracted.prep_time_minutes,
            cook_time_minutes=extracted.cook_time_minutes,
            total_time_minutes=extracted.total_time_minutes,
            serves=extracted.serves,
            techniques=techniques,
            allergens=allergens,
            dietary_tags=extracted.dietary_tags or [],
            sustainability_score=sustainability,
            estimated_food_cost_usd=food_cost,
            deduplication_hash=dedup_hash,
        )

        return recipe

    async def _normalize_ingredients(self, ingredients: list[Ingredient]) -> list[NormalizedIngredient]:
        """Normalize ingredients to standardized units.

        Args:
            ingredients: List of extracted ingredients.

        Returns:
            List of normalized ingredients.
        """
        normalized: list[NormalizedIngredient] = []

        for ing in ingredients:
            quantity_grams = None
            quantity_ml = None

            # Convert to grams or ml
            if ing.quantity and ing.unit:
                unit_lower = ing.unit.lower()
                ing_name_lower = ing.name.lower()

                # Try ingredient-specific conversion
                for base_unit, conversions in UNIT_TO_GRAMS.items():
                    if base_unit in unit_lower:
                        density = conversions.get(ing_name_lower, conversions.get("default"))
                        quantity_grams = ing.quantity * density
                        break

                # Fallback for liquid units
                if quantity_grams is None and unit_lower in ["ml", "l", "cup", "tbsp", "tsp"]:
                    try:
                        if unit_lower == "ml":
                            quantity_ml = ing.quantity
                        elif unit_lower == "cup":
                            quantity_ml = ing.quantity * 240
                        elif unit_lower == "tbsp":
                            quantity_ml = ing.quantity * 15
                        elif unit_lower == "tsp":
                            quantity_ml = ing.quantity * 5
                    except (ValueError, TypeError):
                        pass

            # Match against controlled vocabulary
            vocab_match = await self._match_ingredient_vocabulary(ing.name)

            # Estimate cost
            cost = self._estimate_ingredient_cost(ing.name, quantity_grams)

            normalized.append(
                NormalizedIngredient(
                    name=ing.name,
                    quantity_grams=quantity_grams,
                    quantity_ml=quantity_ml,
                    original_quantity=ing.quantity,
                    original_unit=ing.unit,
                    preparation=ing.preparation,
                    controlled_vocabulary_match=vocab_match,
                    estimated_cost_usd=cost,
                )
            )

        return normalized

    def _normalize_difficulty(self, difficulty: Optional[str]) -> Optional[str]:
        """Normalize difficulty to standard levels.

        Args:
            difficulty: Original difficulty string.

        Returns:
            Normalized difficulty level.
        """
        if not difficulty:
            return None

        difficulty_lower = difficulty.lower()

        # Map to standard levels
        if any(word in difficulty_lower for word in ["easy", "simple", "basic"]):
            return "Easy"
        elif any(word in difficulty_lower for word in ["intermediate", "medium"]):
            return "Intermediate"
        elif any(word in difficulty_lower for word in ["advanced", "hard"]):
            return "Advanced"
        elif any(word in difficulty_lower for word in ["professional", "expert"]):
            return "Professional"
        elif any(word in difficulty_lower for word in ["r&d", "research"]):
            return "R&D"

        return None

    def _normalize_cuisine(self, cuisine: Optional[str]) -> Optional[str]:
        """Normalize cuisine to taxonomy.

        Args:
            cuisine: Original cuisine string.

        Returns:
            Normalized cuisine from taxonomy.
        """
        if not cuisine:
            return None

        cuisine_lower = cuisine.lower()

        # Find best match in taxonomy
        for tax_cuisine in CUISINE_TAXONOMY:
            if tax_cuisine.lower() in cuisine_lower or cuisine_lower in tax_cuisine.lower():
                return tax_cuisine

        return None

    async def _extract_techniques(self, instructions: list[RecipeStep]) -> list[str]:
        """Extract cooking techniques from instructions.

        Args:
            instructions: Recipe instructions.

        Returns:
            List of detected techniques.
        """
        found_techniques: set[str] = set()

        for step in instructions:
            description_lower = step.description.lower() if step.description else ""

            # Check for technique mentions
            for technique in TECHNIQUE_TAXONOMY:
                if technique.lower() in description_lower:
                    found_techniques.add(technique)

            # Check step techniques if provided
            if step.techniques:
                for technique in step.techniques:
                    if technique in TECHNIQUE_TAXONOMY:
                        found_techniques.add(technique)

        return list(found_techniques)

    def _normalize_allergens(self, allergens: list[str]) -> list[str]:
        """Normalize allergen list to standard allergens.

        Args:
            allergens: List of allergen strings.

        Returns:
            Normalized allergen list.
        """
        normalized: set[str] = set()

        for allergen in allergens:
            allergen_lower = allergen.lower()

            for standard_allergen in ALLERGENS:
                if standard_allergen.lower() in allergen_lower:
                    normalized.add(standard_allergen)
                    break

        return list(normalized)

    async def _match_ingredient_vocabulary(self, ingredient_name: str) -> Optional[str]:
        """Match ingredient name against controlled vocabulary.

        Args:
            ingredient_name: Name of ingredient.

        Returns:
            Matched vocabulary term or None.
        """
        # Placeholder for controlled vocabulary matching
        # Would integrate with ingredient database
        return ingredient_name

    def _estimate_ingredient_cost(
        self, ingredient_name: str, quantity_grams: Optional[float]
    ) -> Optional[float]:
        """Estimate cost of an ingredient.

        Args:
            ingredient_name: Name of ingredient.
            quantity_grams: Quantity in grams.

        Returns:
            Estimated cost in USD.
        """
        if not quantity_grams:
            return None

        ingredient_lower = ingredient_name.lower()

        for known_ingredient, price_per_kg in INGREDIENT_PRICES.items():
            if known_ingredient in ingredient_lower:
                return (quantity_grams / 1000) * price_per_kg

        # Default estimate: $5 per kg for unknown ingredients
        return (quantity_grams / 1000) * 5.0

    def _estimate_food_cost(self, ingredients: list[NormalizedIngredient]) -> Optional[float]:
        """Estimate total food cost for recipe.

        Args:
            ingredients: Normalized ingredients.

        Returns:
            Total estimated cost in USD.
        """
        total_cost = 0.0
        has_any_cost = False

        for ing in ingredients:
            if ing.estimated_cost_usd:
                total_cost += ing.estimated_cost_usd
                has_any_cost = True

        return total_cost if has_any_cost else None

    async def _calculate_sustainability_score(
        self, ingredients: list[NormalizedIngredient]
    ) -> float:
        """Calculate sustainability score (0-100).

        Args:
            ingredients: Normalized ingredients.

        Returns:
            Sustainability score.
        """
        # Placeholder for sustainability calculation
        # Would integrate with carbon footprint database, seasonality data, etc.
        # For now, return a basic score
        score = 50.0  # Default neutral score

        # Reduce score for high-impact ingredients
        ingredient_names = [ing.name.lower() for ing in ingredients]
        if any("beef" in name for name in ingredient_names):
            score -= 15
        if any("imported" in name for name in ingredient_names):
            score -= 5

        # Increase score for sustainable practices
        if len(ingredients) < 10:
            score += 10  # Simpler recipes tend to be more sustainable

        return max(0.0, min(100.0, score))

    def _generate_deduplication_hash(self, title: str, ingredients: list[NormalizedIngredient]) -> str:
        """Generate hash for deduplication using embeddings.

        Args:
            title: Recipe title.
            ingredients: Normalized ingredients.

        Returns:
            Deduplication hash string.
        """
        # Create a summary string
        ingredient_names = " ".join([ing.name for ing in ingredients])
        summary = f"{title} {ingredient_names}"

        # Encode and return first 16 chars of base64 hash
        import hashlib
        hash_digest = hashlib.sha256(summary.encode()).hexdigest()[:16]

        return hash_digest

    async def is_duplicate(
        self, new_recipe: NormalizedRecipe, existing_recipes: list[NormalizedRecipe]
    ) -> bool:
        """Check if recipe is a duplicate of existing recipes.

        Args:
            new_recipe: Recipe to check.
            existing_recipes: List of existing recipes.

        Returns:
            True if duplicate detected.
        """
        # Use embeddings for similarity
        new_embedding = self.embedding_model.encode(
            new_recipe.title + " " + " ".join([ing.name for ing in new_recipe.ingredients])
        )

        for existing in existing_recipes:
            existing_embedding = self.embedding_model.encode(
                existing.title + " " + " ".join([ing.name for ing in existing.ingredients])
            )

            # Calculate cosine similarity
            similarity = util.pytorch_cos_sim(new_embedding, existing_embedding)[0][0].item()

            # High similarity threshold (0.85) for duplicate detection
            if similarity > 0.85:
                logger.info(f"Duplicate detected: {new_recipe.title} similar to {existing.title}")
                return True

        return False
