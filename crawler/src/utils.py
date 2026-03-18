"""Utility functions for the crawler."""

import asyncio
import hashlib
import logging
import re
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlparse

import httpx

from .config import RateLimitConfig

logger = logging.getLogger(__name__)


def clean_url(url: str) -> str:
    """Normalize URL for deduplication.

    Args:
        url: URL to clean.

    Returns:
        Cleaned URL.
    """
    # Remove fragment
    url = url.split("#")[0]
    # Remove query parameters
    url = url.split("?")[0]
    # Remove trailing slashes
    url = url.rstrip("/")
    # Convert to lowercase
    url = url.lower()
    return url


def extract_domain(url: str) -> str:
    """Extract domain from URL.

    Args:
        url: Full URL.

    Returns:
        Domain name.
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    # Remove www. prefix
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def check_robots_txt(session: httpx.Client, domain: str, path: str = "/") -> bool:
    """Check if URL is allowed by robots.txt.

    Args:
        session: HTTP client session.
        domain: Domain name.
        path: Path to check.

    Returns:
        True if allowed, False if disallowed.
    """
    try:
        robots_url = f"https://{domain}/robots.txt"
        response = session.get(robots_url, timeout=5)

        if response.status_code != 200:
            # If robots.txt doesn't exist, allow crawling
            return True

        robots_content = response.text.lower()

        # Simple robots.txt parser
        # Look for User-agent: * or User-agent: *crawler patterns
        lines = robots_content.split("\n")
        current_user_agent = None
        is_applicable = False

        for line in lines:
            line = line.strip().lower()

            if line.startswith("user-agent:"):
                current_user_agent = line.split("user-agent:")[1].strip()
                if current_user_agent in ["*", "*crawler", "googlebot"]:
                    is_applicable = True
                else:
                    is_applicable = False

            if is_applicable and line.startswith("disallow:"):
                disallow_path = line.split("disallow:")[1].strip()
                if disallow_path and path.startswith(disallow_path):
                    return False

        return True

    except Exception as e:
        logger.debug(f"Error checking robots.txt for {domain}: {e}")
        # Default to allowing if error checking
        return True


class RateLimiter:
    """Rate limiter for domain requests."""

    def __init__(self, rate_limits: dict[str, RateLimitConfig]) -> None:
        """Initialize rate limiter.

        Args:
            rate_limits: Dictionary of domain -> RateLimitConfig.
        """
        self.rate_limits = rate_limits
        self.domain_requests: dict[str, list[datetime]] = {}
        self.domain_daily_counts: dict[str, int] = {}
        self.last_daily_reset: dict[str, datetime] = {}

    async def wait_for_domain(self, url: str) -> None:
        """Wait if necessary before making request to domain.

        Args:
            url: URL to make request to.
        """
        domain = extract_domain(url)

        # Get rate limit config for domain
        config = self.rate_limits.get(domain)
        if not config:
            config = self.rate_limits.get("default")

        if not config:
            return

        # Check daily limit
        now = datetime.utcnow()
        if domain not in self.last_daily_reset or (now - self.last_daily_reset[domain]).days > 0:
            self.domain_daily_counts[domain] = 0
            self.last_daily_reset[domain] = now

        if self.domain_daily_counts.get(domain, 0) >= config.daily_max:
            logger.warning(f"Daily limit reached for {domain}")
            raise Exception(f"Daily rate limit exceeded for {domain}")

        # Check per-second rate limit
        if domain not in self.domain_requests:
            self.domain_requests[domain] = []

        requests = self.domain_requests[domain]
        requests = [req for req in requests if (now - req).seconds < 1]

        if len(requests) >= int(config.requests_per_second):
            wait_time = 1.0 / config.requests_per_second
            await asyncio.sleep(wait_time)

        self.domain_requests[domain] = requests
        self.domain_requests[domain].append(datetime.utcnow())
        self.domain_daily_counts[domain] = self.domain_daily_counts.get(domain, 0) + 1


def setup_logging(log_level: str = "INFO", log_format: str = "json") -> logging.Logger:
    """Setup structured logging.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR).
        log_format: Log format (json or text).

    Returns:
        Configured logger.
    """
    import structlog

    if log_format == "json":
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.JSONRenderer(),
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )
    else:
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.KeyValueRenderer(),
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            cache_logger_on_first_use=True,
        )

    # Set root logger level
    logging.basicConfig(
        format="%(message)s",
        level=getattr(logging, log_level),
    )

    return logging.getLogger(__name__)


def generate_job_id() -> str:
    """Generate a unique job ID.

    Returns:
        Job ID string.
    """
    import uuid
    return str(uuid.uuid4())


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage.

    Args:
        filename: Original filename.

    Returns:
        Sanitized filename.
    """
    # Remove invalid characters
    filename = re.sub(r"[<>:\"/\\|?*]", "", filename)
    # Replace spaces with underscores
    filename = filename.replace(" ", "_")
    # Limit length
    return filename[:255]


def calculate_hash(data: str) -> str:
    """Calculate SHA256 hash of data.

    Args:
        data: Data to hash.

    Returns:
        Hex hash string.
    """
    return hashlib.sha256(data.encode()).hexdigest()


def parse_duration_string(duration_str: str) -> Optional[int]:
    """Parse human-readable duration string to minutes.

    Args:
        duration_str: Duration string like "1 hour 30 minutes".

    Returns:
        Duration in minutes or None.
    """
    if not duration_str:
        return None

    total_minutes = 0
    duration_str = duration_str.lower()

    # Look for hours
    hours_match = re.search(r"(\d+)\s*(?:hour|hr|h)", duration_str)
    if hours_match:
        total_minutes += int(hours_match.group(1)) * 60

    # Look for minutes
    minutes_match = re.search(r"(\d+)\s*(?:minute|min|m)", duration_str)
    if minutes_match:
        total_minutes += int(minutes_match.group(1))

    # Look for seconds
    seconds_match = re.search(r"(\d+)\s*(?:second|sec|s)", duration_str)
    if seconds_match:
        total_minutes += int(seconds_match.group(1)) / 60

    return total_minutes if total_minutes > 0 else None


def get_time_since(start_time: datetime) -> str:
    """Get human-readable time since a datetime.

    Args:
        start_time: Start datetime.

    Returns:
        Human-readable time string.
    """
    elapsed = datetime.utcnow() - start_time

    if elapsed.days > 0:
        return f"{elapsed.days}d {elapsed.seconds // 3600}h"
    elif elapsed.seconds >= 3600:
        return f"{elapsed.seconds // 3600}h {(elapsed.seconds % 3600) // 60}m"
    elif elapsed.seconds >= 60:
        return f"{elapsed.seconds // 60}m {elapsed.seconds % 60}s"
    else:
        return f"{elapsed.seconds}s"


class RobotsTxtChecker:
    """Robust robots.txt parser and checker."""

    def __init__(self, session: httpx.Client) -> None:
        """Initialize checker.

        Args:
            session: HTTP client session.
        """
        self.session = session
        self.cache: dict[str, dict] = {}

    def is_allowed(self, url: str, user_agent: str = "Mozilla/5.0") -> bool:
        """Check if URL is allowed by robots.txt.

        Args:
            url: URL to check.
            user_agent: User-Agent string.

        Returns:
            True if allowed, False otherwise.
        """
        domain = extract_domain(url)
        parsed = urlparse(url)
        path = parsed.path or "/"

        # Get or fetch robots.txt for domain
        if domain not in self.cache:
            self._fetch_robots_txt(domain)

        rules = self.cache.get(domain, {}).get("rules", [])

        # Find applicable rules for this user-agent
        applicable_rules = []
        for rule in rules:
            if rule["user_agent"] == "*" or rule["user_agent"] == user_agent.lower():
                applicable_rules.append(rule)

        # Check disallow rules
        for rule in applicable_rules:
            if rule["disallow"] and path.startswith(rule["disallow"]):
                return False

        return True

    def _fetch_robots_txt(self, domain: str) -> None:
        """Fetch and parse robots.txt for domain.

        Args:
            domain: Domain to fetch robots.txt for.
        """
        try:
            url = f"https://{domain}/robots.txt"
            response = self.session.get(url, timeout=5)

            if response.status_code == 200:
                rules = self._parse_robots_txt(response.text)
                self.cache[domain] = {"rules": rules}
            else:
                # No robots.txt found, allow everything
                self.cache[domain] = {"rules": []}

        except Exception as e:
            logger.debug(f"Error fetching robots.txt for {domain}: {e}")
            # Allow on error
            self.cache[domain] = {"rules": []}

    @staticmethod
    def _parse_robots_txt(content: str) -> list[dict]:
        """Parse robots.txt content.

        Args:
            content: robots.txt file content.

        Returns:
            List of parsed rules.
        """
        rules = []
        lines = content.split("\n")
        current_user_agent = None

        for line in lines:
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue

            # Parse directives
            if line.lower().startswith("user-agent:"):
                current_user_agent = line.split(":", 1)[1].strip().lower()
            elif line.lower().startswith("disallow:") and current_user_agent:
                disallow_path = line.split(":", 1)[1].strip()
                rules.append(
                    {
                        "user_agent": current_user_agent,
                        "disallow": disallow_path,
                    }
                )

        return rules
