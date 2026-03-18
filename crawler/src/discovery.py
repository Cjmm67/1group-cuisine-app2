"""Recipe discovery module for finding recipe URLs."""

import asyncio
import logging
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from .config import get_config
from .utils import check_robots_txt, clean_url

logger = logging.getLogger(__name__)


@dataclass
class ChefData:
    """Data about a chef."""

    id: str
    name: str
    restaurant: str
    location: str
    website: Optional[str] = None
    cuisine_tags: Optional[list[str]] = None
    accolades: Optional[list[str]] = None


@dataclass
class CandidateURL:
    """A candidate recipe URL for extraction."""

    url: str
    source: str  # Strategy that found it
    credibility_score: float  # 1-10
    title: Optional[str] = None
    confidence: float = 0.5


class RecipeDiscovery:
    """Discovers recipe URLs for each chef using multiple strategies."""

    def __init__(self) -> None:
        """Initialize the discovery module."""
        self.config = get_config()
        self.http_client = httpx.AsyncClient(timeout=self.config.crawl_settings.request_timeout_seconds)
        self.session = httpx.Client(timeout=self.config.crawl_settings.request_timeout_seconds)
        self.discovered_urls: set[str] = set()

    async def discover_for_chef(self, chef: ChefData) -> list[CandidateURL]:
        """Run all discovery strategies and return deduplicated URLs.

        Args:
            chef: Chef data object.

        Returns:
            List of deduplicated candidate URLs, sorted by credibility score.
        """
        logger.info(f"Starting discovery for chef: {chef.name}")
        self.discovered_urls.clear()
        candidates: list[CandidateURL] = []

        try:
            # Strategy 1: Chef's own website
            website_urls = await self._strategy_chef_website(chef)
            candidates.extend(website_urls)
            logger.debug(f"Strategy 1 (chef website) found {len(website_urls)} URLs")

            # Strategy 2: Search API
            search_urls = await self._strategy_search_api(chef)
            candidates.extend(search_urls)
            logger.debug(f"Strategy 2 (search API) found {len(search_urls)} URLs")

            # Strategy 3: Known sources
            known_urls = await self._strategy_known_sources(chef)
            candidates.extend(known_urls)
            logger.debug(f"Strategy 3 (known sources) found {len(known_urls)} URLs")

            # Strategy 4: Cookbook excerpts
            cookbook_urls = await self._strategy_cookbook_excerpts(chef)
            candidates.extend(cookbook_urls)
            logger.debug(f"Strategy 4 (cookbook excerpts) found {len(cookbook_urls)} URLs")

            # Deduplicate by URL
            unique_candidates: dict[str, CandidateURL] = {}
            for candidate in candidates:
                clean = clean_url(candidate.url)
                if clean not in unique_candidates:
                    unique_candidates[clean] = candidate
                else:
                    # Keep the one with higher credibility score
                    if candidate.credibility_score > unique_candidates[clean].credibility_score:
                        unique_candidates[clean] = candidate

            result = sorted(
                unique_candidates.values(), key=lambda x: x.credibility_score, reverse=True
            )
            logger.info(
                f"Discovery for {chef.name} complete: {len(result)} unique URLs found"
            )
            return result

        except Exception as e:
            logger.error(f"Error discovering recipes for {chef.name}: {e}")
            return []

    async def _strategy_chef_website(self, chef: ChefData) -> list[CandidateURL]:
        """Crawl chef's own website for recipes.

        Args:
            chef: Chef data object.

        Returns:
            List of candidate URLs found on chef's website.
        """
        if not chef.website:
            return []

        try:
            # Check robots.txt
            domain = urlparse(chef.website).netloc
            if not check_robots_txt(self.session, domain, "/"):
                logger.warning(f"robots.txt disallows crawling {domain}")
                return []

            response = await self.http_client.get(chef.website, follow_redirects=True)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            candidates: list[CandidateURL] = []

            # Look for recipe links
            recipe_keywords = ["recipe", "receta", "recette", "rezept", "ricetta"]
            for link in soup.find_all("a", href=True):
                href = link.get("href")
                text = (link.get_text() or "").lower()

                # Check if link text or href contains recipe keywords
                if any(keyword in text or keyword in href.lower() for keyword in recipe_keywords):
                    full_url = urljoin(chef.website, href)
                    if self._is_valid_recipe_url(full_url):
                        candidates.append(
                            CandidateURL(
                                url=full_url,
                                source="chef_website",
                                credibility_score=8.5,
                                title=text or None,
                                confidence=0.7,
                            )
                        )

            return candidates

        except Exception as e:
            logger.debug(f"Error crawling chef website {chef.website}: {e}")
            return []

    async def _strategy_search_api(self, chef: ChefData) -> list[CandidateURL]:
        """Search Google/SerpAPI for chef recipes on credible sources.

        Args:
            chef: Chef data object.

        Returns:
            List of candidate URLs from search results.
        """
        if not self.config.serpapi_key and not self.config.google_search_api_key:
            logger.debug("No search API keys configured, skipping search API strategy")
            return []

        candidates: list[CandidateURL] = []
        search_queries = [
            f"{chef.name} recipe",
            f"{chef.name} {chef.restaurant} recipe",
            f"{chef.name} signature dish",
            f"{chef.name} cuisine recipe",
        ]

        for query in search_queries:
            try:
                results = await self._perform_search(query)
                for result in results:
                    if self._is_valid_recipe_url(result["url"]):
                        candidates.append(
                            CandidateURL(
                                url=result["url"],
                                source="search_api",
                                credibility_score=self._score_source_domain(result["url"]),
                                title=result.get("title"),
                                confidence=0.6,
                            )
                        )
            except Exception as e:
                logger.debug(f"Error searching for {query}: {e}")

        return candidates

    async def _strategy_known_sources(self, chef: ChefData) -> list[CandidateURL]:
        """Check known publications for chef recipes.

        Args:
            chef: Chef data object.

        Returns:
            List of candidate URLs from known sources.
        """
        candidates: list[CandidateURL] = []
        known_domains = (
            self.config.credible_sources.tier_1
            + self.config.credible_sources.tier_2
            + self.config.credible_sources.tier_3
        )

        search_queries = [
            f"site:{domain} {chef.name} recipe" for domain in known_domains
        ]

        for query in search_queries:
            try:
                results = await self._perform_search(query)
                for result in results:
                    if self._is_valid_recipe_url(result["url"]):
                        candidates.append(
                            CandidateURL(
                                url=result["url"],
                                source="known_sources",
                                credibility_score=self._score_source_domain(result["url"]),
                                title=result.get("title"),
                                confidence=0.8,
                            )
                        )
            except Exception as e:
                logger.debug(f"Error searching {query}: {e}")

        return candidates

    async def _strategy_cookbook_excerpts(self, chef: ChefData) -> list[CandidateURL]:
        """Find cookbook excerpt recipes.

        Args:
            chef: Chef data object.

        Returns:
            List of candidate URLs from cookbook sources.
        """
        candidates: list[CandidateURL] = []
        cookbook_domains = [
            "amazon.com",
            "goodreads.com",
            "cookbooks.com",
            "publishersweekly.com",
        ]

        for domain in cookbook_domains:
            query = f"site:{domain} {chef.name} cookbook recipe"
            try:
                results = await self._perform_search(query)
                for result in results:
                    if self._is_valid_recipe_url(result["url"]):
                        candidates.append(
                            CandidateURL(
                                url=result["url"],
                                source="cookbook_excerpts",
                                credibility_score=7.0,
                                title=result.get("title"),
                                confidence=0.5,
                            )
                        )
            except Exception as e:
                logger.debug(f"Error searching {query}: {e}")

        return candidates

    async def _perform_search(self, query: str) -> list[dict]:
        """Perform a search query.

        Args:
            query: Search query string.

        Returns:
            List of search results with 'url' and 'title' keys.
        """
        # Placeholder for search API integration
        # Would integrate with SerpAPI or Google Custom Search API
        await asyncio.sleep(0.5)  # Rate limiting
        return []

    def _is_valid_recipe_url(self, url: str) -> bool:
        """Check if URL is likely to be a recipe page.

        Args:
            url: URL to validate.

        Returns:
            True if URL looks like a recipe page.
        """
        recipe_keywords = [
            "recipe",
            "receta",
            "recette",
            "rezept",
            "ricetta",
            "dish",
            "cuisine",
        ]
        url_lower = url.lower()
        return any(keyword in url_lower for keyword in recipe_keywords)

    def _score_source_domain(self, url: str) -> float:
        """Score a domain based on credibility.

        Args:
            url: Full URL to score.

        Returns:
            Credibility score from 1-10.
        """
        domain = urlparse(url).netloc.lower()

        tier_1_domains = self.config.credible_sources.tier_1
        tier_2_domains = self.config.credible_sources.tier_2
        tier_3_domains = self.config.credible_sources.tier_3

        for tier_1 in tier_1_domains:
            if tier_1 in domain:
                return 9.5

        for tier_2 in tier_2_domains:
            if tier_2 in domain:
                return 8.0

        for tier_3 in tier_3_domains:
            if tier_3 in domain:
                return 6.5

        # Default score for other domains
        return 5.0

    async def close(self) -> None:
        """Close HTTP connections."""
        await self.http_client.aclose()
        self.session.close()
