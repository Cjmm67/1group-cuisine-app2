"""Main crawl orchestrator managing the complete pipeline."""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from .config import get_config
from .discovery import ChefData, RecipeDiscovery
from .extraction import RecipeExtractor
from .models import CrawledRecipe, CrawlJob, CrawlJobStatus, CrawlLog, DatabaseManager, ExtractionTier, ReviewStatus
from .normalizer import NormalizationPipeline, NormalizedRecipe
from .utils import RateLimiter

logger = logging.getLogger(__name__)


class CrawlOrchestrator:
    """Orchestrates the complete crawling pipeline."""

    def __init__(self, db_manager: DatabaseManager) -> None:
        """Initialize orchestrator.

        Args:
            db_manager: Database manager instance.
        """
        self.config = get_config()
        self.db = db_manager
        self.discovery = RecipeDiscovery()
        self.extractor = RecipeExtractor()
        self.normalizer = NormalizationPipeline()
        self.rate_limiter = RateLimiter(self.config.rate_limits)

    async def crawl_chef(
        self, chef: ChefData, max_recipes: int = 10, job_id: Optional[str] = None
    ) -> CrawlJob:
        """Crawl recipes for a single chef.

        Args:
            chef: Chef data object.
            max_recipes: Maximum recipes to extract.
            job_id: Optional job ID for resuming.

        Returns:
            Completed CrawlJob.
        """
        if not job_id:
            job_id = str(uuid.uuid4())

        session = self.db.get_session()

        try:
            # Create or get crawl job
            job = session.query(CrawlJob).filter(CrawlJob.id == job_id).first()
            if not job:
                job = CrawlJob(
                    id=job_id,
                    chef_id=chef.id,
                    status=CrawlJobStatus.PENDING,
                    max_recipes=max_recipes,
                )
                session.add(job)
                session.commit()

            # Start job
            job.status = CrawlJobStatus.RUNNING
            job.started_at = datetime.utcnow()
            session.commit()

            self._log(session, job_id, "INFO", f"Starting crawl for {chef.name}")

            # Step 1: Discovery
            self._log(session, job_id, "INFO", "Running recipe discovery...")
            candidates = await self.discovery.discover_for_chef(chef)
            if not candidates:
                self._log(session, job_id, "WARNING", f"No recipe URLs found for {chef.name}")

            self._log(session, job_id, "INFO", f"Found {len(candidates)} candidate URLs")

            # Step 2: Extraction and Normalization
            recipes_extracted = 0
            recipes_approved = 0

            for idx, candidate in enumerate(candidates[:max_recipes], 1):
                try:
                    self._log(
                        session,
                        job_id,
                        "INFO",
                        f"Processing {idx}/{min(len(candidates), max_recipes)}: {candidate.url}",
                    )

                    # Respect rate limits
                    await self.rate_limiter.wait_for_domain(candidate.url)

                    # Fetch HTML
                    html = await self._fetch_html(candidate.url)
                    if not html:
                        self._log(session, job_id, "WARNING", f"Could not fetch {candidate.url}")
                        continue

                    # Extract recipe
                    extracted = await self.extractor.extract(candidate.url, html)
                    if not extracted:
                        self._log(session, job_id, "WARNING", f"Extraction failed for {candidate.url}")
                        continue

                    # Normalize recipe
                    normalized = await self.normalizer.normalize(extracted)

                    # Determine extraction tier
                    tier = ExtractionTier.TIER_1_STRUCTURED
                    if extracted.extraction_confidence < 0.85:
                        tier = ExtractionTier.TIER_2_LLM
                    if extracted.extraction_confidence < 0.65:
                        tier = ExtractionTier.TIER_3_VISION

                    # Save to database
                    recipe_id = str(uuid.uuid4())
                    crawled = CrawledRecipe(
                        id=recipe_id,
                        job_id=job_id,
                        chef_id=chef.id,
                        source_url=candidate.url,
                        extraction_tier=tier,
                        confidence_score=extracted.extraction_confidence,
                        raw_data=extracted.raw_json or {},
                        normalized_data=normalized.to_dict(),
                        review_status=ReviewStatus.PENDING,
                    )
                    session.add(crawled)
                    session.commit()

                    recipes_extracted += 1
                    self._log(
                        session,
                        job_id,
                        "INFO",
                        f"Successfully extracted: {extracted.title}",
                    )

                except Exception as e:
                    self._log(session, job_id, "ERROR", f"Error processing {candidate.url}: {str(e)}")

            # Step 3: Update job stats
            job.recipes_found = recipes_extracted
            job.completed_at = datetime.utcnow()
            job.status = CrawlJobStatus.COMPLETED
            session.commit()

            self._log(
                session,
                job_id,
                "INFO",
                f"Crawl completed: {recipes_extracted} recipes extracted",
            )

            return job

        except Exception as e:
            logger.error(f"Error crawling chef {chef.id}: {e}")
            job.status = CrawlJobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            session.commit()
            self._log(session, job_id, "ERROR", f"Crawl failed: {str(e)}")
            return job

        finally:
            session.close()

    async def crawl_all(self, chefs: list[ChefData], tier: Optional[int] = None) -> list[CrawlJob]:
        """Crawl all chefs (optionally filtering by tier).

        Args:
            chefs: List of all chefs to crawl.
            tier: Optional tier to limit crawling (1, 2, or 3).

        Returns:
            List of completed CrawlJobs.
        """
        max_concurrent = self.config.crawl_settings.max_concurrent_requests
        results: list[CrawlJob] = []

        # Filter by tier if specified
        chefs_to_crawl = chefs
        if tier:
            if tier == 1:
                chefs_to_crawl = chefs[:50]
            elif tier == 2:
                chefs_to_crawl = chefs[50:120]
            elif tier == 3:
                chefs_to_crawl = chefs[120:200]

        logger.info(f"Starting crawl for {len(chefs_to_crawl)} chefs")

        # Run concurrent crawls with semaphore
        semaphore = asyncio.Semaphore(max_concurrent)

        async def crawl_with_semaphore(chef: ChefData) -> CrawlJob:
            async with semaphore:
                return await self.crawl_chef(chef)

        tasks = [crawl_with_semaphore(chef) for chef in chefs_to_crawl]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        logger.info(f"Crawl complete. Processed {len(results)} chefs")
        return results

    async def retry_failed(self, max_age_hours: int = 24) -> list[CrawlJob]:
        """Retry failed extractions.

        Args:
            max_age_hours: Only retry jobs older than this.

        Returns:
            List of retried jobs.
        """
        session = self.db.get_session()

        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)

            # Find failed jobs
            failed_jobs = (
                session.query(CrawlJob)
                .filter(CrawlJob.status == CrawlJobStatus.FAILED)
                .filter(CrawlJob.created_at < cutoff_time)
                .all()
            )

            logger.info(f"Found {len(failed_jobs)} failed jobs to retry")

            results: list[CrawlJob] = []
            for job in failed_jobs:
                try:
                    logger.info(f"Retrying job {job.id} for chef {job.chef_id}")
                    job.status = CrawlJobStatus.PENDING
                    job.started_at = None
                    job.completed_at = None
                    job.recipes_found = 0
                    job.error_message = None
                    session.commit()

                    # Would need to load chef data from main app database
                    # This is a placeholder
                    results.append(job)

                except Exception as e:
                    logger.error(f"Error retrying job {job.id}: {e}")

            return results

        finally:
            session.close()

    async def _fetch_html(self, url: str) -> Optional[str]:
        """Fetch HTML from URL.

        Args:
            url: URL to fetch.

        Returns:
            HTML content or None if fetch failed.
        """
        try:
            response = await self.extractor.http_client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.debug(f"Error fetching {url}: {e}")
            return None

    def _log(self, session: Session, job_id: str, level: str, message: str) -> None:
        """Log a message to database.

        Args:
            session: Database session.
            job_id: Job ID.
            level: Log level.
            message: Log message.
        """
        try:
            log = CrawlLog(
                id=str(uuid.uuid4()),
                job_id=job_id,
                level=level,
                message=message,
                timestamp=datetime.utcnow(),
            )
            session.add(log)
            session.commit()
        except Exception as e:
            logger.error(f"Error logging message: {e}")

    async def close(self) -> None:
        """Clean up resources."""
        await self.discovery.close()
        await self.extractor.close()
        self.db.close()
