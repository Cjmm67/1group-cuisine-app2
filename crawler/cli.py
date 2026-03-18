"""CLI entry point for the crawler."""

import asyncio
import logging
import sys
from typing import Optional

import click

from src.chef_list import get_all_chefs, get_chef_by_id, get_chefs_by_tier
from src.config import get_config, set_config, load_config
from src.models import DatabaseManager, CrawlJob, ReviewStatus
from src.orchestrator import CrawlOrchestrator
from src.review import ReviewQueue
from src.utils import setup_logging
from src.discovery import ChefData

logger = logging.getLogger(__name__)


@click.group()
@click.option("--config", type=click.Path(exists=False), help="Path to config file")
@click.option("--log-level", type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"]), default="INFO")
def cli(config: Optional[str], log_level: str) -> None:
    """1-Group Cuisine Recipe Crawler CLI."""
    # Load configuration
    if config:
        cfg = load_config(config)
    else:
        cfg = get_config()

    set_config(cfg)

    # Setup logging
    setup_logging(log_level, cfg.log_format)


@cli.command()
@click.option("--chef", type=str, help="Chef name or ID to crawl")
@click.option("--tier", type=click.IntRange(1, 3), help="Crawl specific tier (1-3)")
@click.option("--max-recipes", type=int, default=10, help="Max recipes per chef")
@click.option("--concurrent", type=int, default=5, help="Concurrent requests")
def crawl(chef: Optional[str], tier: Optional[int], max_recipes: int, concurrent: int) -> None:
    """Crawl recipes for chefs.

    Examples:
        # Crawl specific chef
        crawl --chef "Massimo Bottura"

        # Crawl tier 1 chefs
        crawl --tier 1

        # Crawl all chefs
        crawl
    """
    config = get_config()
    db = DatabaseManager(config.database_url)
    db.create_tables()

    try:
        orchestrator = CrawlOrchestrator(db)

        if chef:
            # Find chef by name or ID
            all_chefs = get_all_chefs()
            target_chef = None

            for c in all_chefs:
                if c.id == chef or c.name.lower() == chef.lower():
                    target_chef = c
                    break

            if not target_chef:
                click.echo(f"Chef '{chef}' not found", err=True)
                sys.exit(1)

            click.echo(f"Crawling {target_chef.name} from {target_chef.restaurant}...")
            chef_data = ChefData(
                id=target_chef.id,
                name=target_chef.name,
                restaurant=target_chef.restaurant,
                location=target_chef.location,
                website=target_chef.website,
                cuisine_tags=target_chef.cuisine_tags,
                accolades=target_chef.accolades,
            )

            job = asyncio.run(orchestrator.crawl_chef(chef_data, max_recipes))
            click.echo(f"Complete! Found {job.recipes_found} recipes")

        elif tier:
            # Crawl entire tier
            tier_chefs = get_chefs_by_tier(tier)
            click.echo(f"Crawling {len(tier_chefs)} chefs from tier {tier}...")

            chef_datas = [
                ChefData(
                    id=c.id,
                    name=c.name,
                    restaurant=c.restaurant,
                    location=c.location,
                    website=c.website,
                    cuisine_tags=c.cuisine_tags,
                    accolades=c.accolades,
                )
                for c in tier_chefs
            ]

            jobs = asyncio.run(orchestrator.crawl_all(chef_datas, tier))
            total_recipes = sum(j.recipes_found for j in jobs)
            click.echo(f"Complete! Found {total_recipes} recipes from {len(jobs)} chefs")

        else:
            # Crawl all chefs
            all_chefs = get_all_chefs()
            click.echo(f"Crawling all {len(all_chefs)} chefs...")

            chef_datas = [
                ChefData(
                    id=c.id,
                    name=c.name,
                    restaurant=c.restaurant,
                    location=c.location,
                    website=c.website,
                    cuisine_tags=c.cuisine_tags,
                    accolades=c.accolades,
                )
                for c in all_chefs
            ]

            jobs = asyncio.run(orchestrator.crawl_all(chef_datas))
            total_recipes = sum(j.recipes_found for j in jobs)
            click.echo(f"Complete! Found {total_recipes} recipes from {len(jobs)} chefs")

    finally:
        asyncio.run(orchestrator.close())


@cli.command()
@click.option("--min-score", type=int, default=85, help="Minimum score for auto-approval")
def review(min_score: int) -> None:
    """Review and score crawled recipes.

    Auto-approves recipes above the score threshold.
    """
    config = get_config()
    db = DatabaseManager(config.database_url)

    try:
        queue = ReviewQueue(db)

        # Get pending recipes
        pending = asyncio.run(queue.get_pending())
        click.echo(f"Found {len(pending)} recipes pending review")

        if not pending:
            click.echo("No recipes to review")
            return

        # Score and auto-approve
        approved = asyncio.run(queue.auto_approve(min_score))
        click.echo(f"Auto-approved {len(approved)} recipes with score >= {min_score}")

        # Get remaining pending
        remaining = asyncio.run(queue.get_pending())
        click.echo(f"{len(remaining)} recipes still pending human review")

        # Show stats
        stats = asyncio.run(queue.get_review_stats())
        click.echo("\nReview Statistics:")
        click.echo(f"  Total recipes: {stats['total_recipes']}")
        click.echo(f"  Approved: {stats['approved']}")
        click.echo(f"  Auto-approved: {stats['auto_approved']}")
        click.echo(f"  Pending review: {stats['pending_review']}")
        click.echo(f"  Rejected: {stats['rejected']}")
        click.echo(f"  Flagged: {stats['flagged']}")
        click.echo(f"  Approval rate: {stats['approval_rate']:.1f}%")

    finally:
        db.close()


@cli.command()
@click.option("--job-id", type=str, help="Specific job ID to show details for")
@click.option("--limit", type=int, default=10, help="Limit results")
def status(job_id: Optional[str], limit: int) -> None:
    """Show crawl job status.

    Examples:
        # Show recent jobs
        status

        # Show specific job details
        status --job-id <job-id>
    """
    config = get_config()
    db = DatabaseManager(config.database_url)
    session = db.get_session()

    try:
        if job_id:
            # Show specific job details
            job = session.query(CrawlJob).filter(CrawlJob.id == job_id).first()

            if not job:
                click.echo(f"Job {job_id} not found", err=True)
                return

            click.echo(f"\nJob ID: {job.id}")
            click.echo(f"Chef ID: {job.chef_id}")
            click.echo(f"Status: {job.status.value}")
            click.echo(f"Recipes found: {job.recipes_found}")
            click.echo(f"Recipes approved: {job.recipes_approved}")
            click.echo(f"Started: {job.started_at}")
            click.echo(f"Completed: {job.completed_at}")

            if job.error_message:
                click.echo(f"Error: {job.error_message}")

            # Show related recipes
            click.echo("\nRecipes:")
            recipes = session.query(CrawledRecipe).filter_by(job_id=job.id).all()
            for recipe in recipes[:limit]:
                click.echo(f"  - {recipe.source_url}")
                click.echo(f"    Status: {recipe.review_status.value}")
                click.echo(f"    Score: {recipe.confidence_score:.2f}")

        else:
            # Show recent jobs
            jobs = (
                session.query(CrawlJob)
                .order_by(CrawlJob.created_at.desc())
                .limit(limit)
                .all()
            )

            if not jobs:
                click.echo("No jobs found")
                return

            click.echo(f"\nRecent {min(len(jobs), limit)} Jobs:")
            click.echo("-" * 80)

            for job in jobs:
                duration = ""
                if job.started_at and job.completed_at:
                    elapsed = job.completed_at - job.started_at
                    duration = f" ({elapsed.total_seconds():.0f}s)"

                click.echo(f"ID: {job.id}")
                click.echo(f"  Chef: {job.chef_id}")
                click.echo(f"  Status: {job.status.value}")
                click.echo(f"  Found: {job.recipes_found} recipes")
                click.echo(f"  Created: {job.created_at}{duration}")

    finally:
        session.close()
        db.close()


@cli.command()
@click.option("--pending", is_flag=True, help="Show pending recipes")
@click.option("--approved", is_flag=True, help="Show approved recipes")
@click.option("--rejected", is_flag=True, help="Show rejected recipes")
@click.option("--limit", type=int, default=10, help="Limit results")
def recipes(pending: bool, approved: bool, rejected: bool, limit: int) -> None:
    """View crawled recipes by review status.

    Examples:
        # Show pending recipes
        recipes --pending

        # Show approved recipes
        recipes --approved

        # Show all (default is pending)
        recipes
    """
    config = get_config()
    db = DatabaseManager(config.database_url)
    session = db.get_session()

    try:
        from src.models import CrawledRecipe

        if not any([pending, approved, rejected]):
            pending = True  # Default to pending

        if pending:
            recipes_list = (
                session.query(CrawledRecipe)
                .filter(CrawledRecipe.review_status == ReviewStatus.PENDING)
                .limit(limit)
                .all()
            )
            click.echo(f"\nPending Recipes ({len(recipes_list)} of {limit}):")

        elif approved:
            recipes_list = (
                session.query(CrawledRecipe)
                .filter(CrawledRecipe.review_status.in_([ReviewStatus.APPROVED, ReviewStatus.AUTO_APPROVED]))
                .limit(limit)
                .all()
            )
            click.echo(f"\nApproved Recipes ({len(recipes_list)} of {limit}):")

        elif rejected:
            recipes_list = (
                session.query(CrawledRecipe)
                .filter(CrawledRecipe.review_status == ReviewStatus.REJECTED)
                .limit(limit)
                .all()
            )
            click.echo(f"\nRejected Recipes ({len(recipes_list)} of {limit}):")

        click.echo("-" * 80)

        if not recipes_list:
            click.echo("No recipes found")
            return

        for recipe in recipes_list:
            click.echo(f"ID: {recipe.id}")
            click.echo(f"  URL: {recipe.source_url}")
            click.echo(f"  Chef: {recipe.chef_id}")
            click.echo(f"  Status: {recipe.review_status.value}")
            click.echo(f"  Score: {recipe.confidence_score:.2f}")
            if recipe.review_score:
                click.echo(f"  Review Score: {recipe.review_score}/100")
            click.echo()

    finally:
        session.close()
        db.close()


@cli.command()
def retry_failed() -> None:
    """Retry failed extraction jobs."""
    config = get_config()
    db = DatabaseManager(config.database_url)

    try:
        orchestrator = CrawlOrchestrator(db)
        failed_jobs = asyncio.run(orchestrator.retry_failed(max_age_hours=24))

        click.echo(f"Found {len(failed_jobs)} failed jobs to retry")
        click.echo("Run 'crawl --job-id <id>' to continue crawling")

    finally:
        asyncio.run(orchestrator.close())


if __name__ == "__main__":
    cli()
