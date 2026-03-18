"""Configuration management for the crawler."""

import os
from dataclasses import dataclass, field
from typing import Optional

import yaml
from pydantic import BaseModel, Field


class RateLimitConfig(BaseModel):
    """Rate limit configuration for a domain."""

    requests_per_second: float = Field(default=1.0, ge=0.0)
    daily_max: int = Field(default=100, ge=1)


class ExtractionConfig(BaseModel):
    """Extraction engine configuration."""

    confidence_threshold: float = Field(default=0.6, ge=0.0, le=1.0)
    auto_approve_threshold: int = Field(default=85, ge=0, le=100)
    timeout_seconds: int = Field(default=30, ge=1)


class CrawlSettingsConfig(BaseModel):
    """Crawl operation settings."""

    max_recipes_per_chef: int = Field(default=10, ge=1)
    max_concurrent_requests: int = Field(default=5, ge=1)
    default_delay_seconds: float = Field(default=2.0, ge=0.0)
    request_timeout_seconds: int = Field(default=30, ge=1)
    retry_max_attempts: int = Field(default=3, ge=1)


class CredibleSourcesConfig(BaseModel):
    """Tier-based credible sources configuration."""

    tier_1: list[str] = Field(default_factory=list)
    tier_2: list[str] = Field(default_factory=list)
    tier_3: list[str] = Field(default_factory=list)


class CrawlerConfig(BaseModel):
    """Main crawler configuration."""

    # Database
    database_url: str = Field(default="postgresql://user:password@localhost/1group_cuisine")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0")

    # APIs
    claude_api_key: str = Field(default="")
    google_search_api_key: Optional[str] = Field(default=None)
    google_search_engine_id: Optional[str] = Field(default=None)
    serpapi_key: Optional[str] = Field(default=None)

    # Crawl settings
    crawl_settings: CrawlSettingsConfig = Field(default_factory=CrawlSettingsConfig)

    # Rate limits
    rate_limits: dict[str, RateLimitConfig] = Field(default_factory=dict)

    # Extraction
    extraction: ExtractionConfig = Field(default_factory=ExtractionConfig)

    # Credible sources
    credible_sources: CredibleSourcesConfig = Field(default_factory=CredibleSourcesConfig)

    # Logging
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")

    class Config:
        """Pydantic config."""

        extra = "allow"


def load_config(yaml_path: Optional[str] = None) -> CrawlerConfig:
    """Load configuration from YAML file and environment variables.

    Args:
        yaml_path: Path to YAML config file. If None, uses default locations.

    Returns:
        CrawlerConfig instance with loaded configuration.
    """
    # Default config dict
    config_dict: dict = {
        "database_url": os.getenv(
            "DATABASE_URL", "postgresql://user:password@localhost/1group_cuisine"
        ),
        "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        "claude_api_key": os.getenv("CLAUDE_API_KEY", ""),
        "google_search_api_key": os.getenv("GOOGLE_SEARCH_API_KEY"),
        "google_search_engine_id": os.getenv("GOOGLE_SEARCH_ENGINE_ID"),
        "serpapi_key": os.getenv("SERPAPI_KEY"),
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "log_format": os.getenv("LOG_FORMAT", "json"),
    }

    # Try to load YAML config
    if yaml_path is None:
        # Check common locations
        possible_paths = [
            "config/crawler_config.yaml",
            "/etc/1group-cuisine/crawler_config.yaml",
            os.path.expanduser("~/.1group-cuisine/crawler_config.yaml"),
        ]
        for path in possible_paths:
            if os.path.exists(path):
                yaml_path = path
                break

    if yaml_path and os.path.exists(yaml_path):
        with open(yaml_path, "r") as f:
            yaml_config = yaml.safe_load(f) or {}

        # Merge YAML config with defaults
        if "crawl_settings" in yaml_config:
            config_dict["crawl_settings"] = CrawlSettingsConfig(**yaml_config["crawl_settings"])

        if "rate_limits" in yaml_config:
            config_dict["rate_limits"] = {
                domain: RateLimitConfig(**limits)
                for domain, limits in yaml_config["rate_limits"].items()
            }

        if "extraction" in yaml_config:
            config_dict["extraction"] = ExtractionConfig(**yaml_config["extraction"])

        if "credible_sources" in yaml_config:
            config_dict["credible_sources"] = CredibleSourcesConfig(**yaml_config["credible_sources"])

    # Create default rate limit for unknown domains
    if "default" not in config_dict.get("rate_limits", {}):
        if "rate_limits" not in config_dict:
            config_dict["rate_limits"] = {}
        config_dict["rate_limits"]["default"] = RateLimitConfig()

    return CrawlerConfig(**config_dict)


# Global config instance
_config: Optional[CrawlerConfig] = None


def get_config() -> CrawlerConfig:
    """Get or load the global config instance."""
    global _config
    if _config is None:
        _config = load_config()
    return _config


def set_config(config: CrawlerConfig) -> None:
    """Set the global config instance."""
    global _config
    _config = config
