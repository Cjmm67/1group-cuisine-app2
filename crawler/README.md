# 1-Group Cuisine Recipe Crawler

A professional Python-based crawler that discovers and extracts recipes from the world's top 200 chefs, with AI-powered extraction and review workflows.

## Features

- **Chef Database**: 200 professional chefs organized by tier (global icons, major figures, rising stars)
- **Multi-Strategy Discovery**: Website crawling, search APIs, known publication sources, cookbook excerpts
- **3-Tier Extraction Engine**:
  - Tier 1: Structured data parsing (JSON-LD, Microdata, RDFa)
  - Tier 2: Claude LLM extraction with structured prompts
  - Tier 3: Vision OCR for PDF/image-based recipes
- **Normalization Pipeline**: Unit conversion, ingredient vocabulary matching, technique extraction, cost estimation
- **AI Review Queue**: Pre-scoring with auto-approval for high-quality recipes
- **Rate Limiting**: Per-domain rate limiting and daily caps
- **Robust Logging**: Structured JSON logging with database persistence

## Architecture

```
Crawler Pipeline:
  1. Discovery Module      → Find recipe URLs for chef
  2. Extraction Engine     → Extract recipe data (3 tiers)
  3. Normalization         → Standardize format and units
  4. Review Queue          → AI scoring and human review
  5. Database Storage      → PostgreSQL persistence
```

## Installation

### Local Development

```bash
# Clone and enter directory
cd crawler

# Install in development mode
pip install -e ".[dev]"

# Install Playwright browsers (for vision OCR)
playwright install chromium

# Setup database
export DATABASE_URL="postgresql://user:password@localhost/1group_cuisine"
python -c "from src.models import DatabaseManager; DatabaseManager('$DATABASE_URL').create_tables()"
```

### Docker

```bash
# Build image
docker build -t 1group-crawler .

# Run with environment variables
docker run \
  -e DATABASE_URL="postgresql://user:password@host/db" \
  -e REDIS_URL="redis://localhost:6379" \
  -e CLAUDE_API_KEY="sk-..." \
  1group-crawler crawl --tier 1
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/1group_cuisine
REDIS_URL=redis://localhost:6379/0

# APIs
CLAUDE_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
SERPAPI_KEY=...

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### YAML Configuration

Edit `config/crawler_config.yaml`:

```yaml
crawl_settings:
  max_recipes_per_chef: 10
  max_concurrent_requests: 5
  default_delay_seconds: 2
  request_timeout_seconds: 30
  retry_max_attempts: 3

rate_limits:
  greatbritishchefs.com:
    requests_per_second: 0.5
    daily_max: 50

extraction:
  confidence_threshold: 0.6
  auto_approve_threshold: 85
```

## Usage

### CLI Commands

#### Crawl recipes

```bash
# Crawl specific chef by name or ID
python -m crawler.cli crawl --chef "Massimo Bottura" --max-recipes 10

# Crawl entire tier
python -m crawler.cli crawl --tier 1
python -m crawler.cli crawl --tier 2
python -m crawler.cli crawl --tier 3

# Crawl all 200 chefs
python -m crawler.cli crawl

# Adjust concurrency
python -m crawler.cli crawl --tier 1 --concurrent 10
```

#### Review and score recipes

```bash
# Auto-score and approve high-quality recipes
python -m crawler.cli review --min-score 85

# View pending recipes
python -m crawler.cli recipes --pending --limit 20

# View approved recipes
python -m crawler.cli recipes --approved

# View rejected recipes
python -m crawler.cli recipes --rejected
```

#### Job management

```bash
# Show job status and statistics
python -m crawler.cli status

# Show specific job details
python -m crawler.cli status --job-id <job-uuid>

# Retry failed jobs
python -m crawler.cli retry-failed
```

### Python API

```python
import asyncio
from src.models import DatabaseManager
from src.orchestrator import CrawlOrchestrator
from src.chef_list import get_chef_by_id
from src.discovery import ChefData

async def main():
    db = DatabaseManager("postgresql://...")
    db.create_tables()

    orchestrator = CrawlOrchestrator(db)

    # Get chef
    chef = get_chef_by_id("chef_001")
    chef_data = ChefData(
        id=chef.id,
        name=chef.name,
        restaurant=chef.restaurant,
        location=chef.location,
        website=chef.website,
        cuisine_tags=chef.cuisine_tags,
    )

    # Run crawl
    job = await orchestrator.crawl_chef(chef_data, max_recipes=10)
    print(f"Found {job.recipes_found} recipes")

    await orchestrator.close()

asyncio.run(main())
```

## Project Structure

```
crawler/
├── pyproject.toml              # Project config and dependencies
├── Dockerfile                  # Container image
├── README.md                   # This file
├── cli.py                      # CLI entry point
├── config/
│   └── crawler_config.yaml     # YAML configuration
└── src/
    ├── __init__.py
    ├── config.py               # Configuration management
    ├── models.py               # SQLAlchemy ORM models
    ├── chef_list.py            # 200 chefs (3 tiers)
    ├── discovery.py            # Recipe URL discovery
    ├── extraction.py           # 3-tier extraction engine
    ├── normalizer.py           # Standardization pipeline
    ├── orchestrator.py         # Main crawl orchestrator
    ├── review.py               # Review queue and scoring
    └── utils.py                # Helper functions
```

## Database Schema

### Tables

- **crawl_jobs**: Crawl job metadata and progress
- **crawled_recipes**: Individual crawled recipes with extraction data
- **crawl_logs**: Timestamped log entries for each job

### Key Fields

```sql
CREATE TABLE crawl_jobs (
    id VARCHAR PRIMARY KEY,
    chef_id VARCHAR NOT NULL,
    status ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    recipes_found INTEGER,
    recipes_approved INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE crawled_recipes (
    id VARCHAR PRIMARY KEY,
    job_id VARCHAR REFERENCES crawl_jobs,
    source_url VARCHAR UNIQUE,
    extraction_tier ENUM('TIER_1_STRUCTURED', 'TIER_2_LLM', 'TIER_3_VISION'),
    confidence_score FLOAT,
    raw_data JSONB,
    normalized_data JSONB,
    review_status ENUM('PENDING', 'APPROVED', 'AUTO_APPROVED', 'REJECTED', 'FLAGGED'),
    review_score INTEGER
);
```

## Extraction Tiers

### Tier 1: Structured Data (Confidence: 0.9)
Parses JSON-LD, Microdata, and RDFa from HTML. Fastest and most reliable for pages with proper schema markup.

```python
# Example structured recipe
{
  "@type": "Recipe",
  "name": "Signature Dish",
  "recipeIngredient": ["2 cups flour", "1 cup sugar"],
  "recipeInstructions": [...],
  "prepTime": "PT30M",
  "cookTime": "PT1H"
}
```

### Tier 2: LLM Extraction (Confidence: 0.75)
Sends HTML to Claude API with structured extraction prompt. Works on complex layouts and less structured pages.

### Tier 3: Vision OCR (Confidence: 0.65)
Screenshots page and uses Claude Vision API. Handles PDF recipes and image-heavy layouts.

## Review Scoring

AI pre-scoring evaluates recipes on:
- **Completeness** (35%): Required fields presence
- **Quality** (35%): Instructions detail, ingredient count, descriptions
- **Attribution** (30%): Source credibility, cuisine type, difficulty

Scores >= 85 are auto-approved. 70-84 go to human review. <70 are rejected.

## Rate Limiting

Default: 1 request/second per domain, 100 daily max

Per-domain overrides in config:
```yaml
rate_limits:
  greatbritishchefs.com:
    requests_per_second: 0.5
    daily_max: 50
```

## Logging

Structured JSON logging with database persistence:

```json
{
  "timestamp": "2026-03-17T10:30:45.123Z",
  "job_id": "abc123...",
  "level": "INFO",
  "message": "Successfully extracted: Truffle Risotto",
  "context": {
    "chef": "Massimo Bottura",
    "confidence": 0.92
  }
}
```

## Performance

Typical performance with default settings:
- **Discovery**: 2-5 minutes per chef
- **Extraction**: 30-60 seconds per recipe (Tier 1-2)
- **Normalization**: 1-2 seconds per recipe
- **Throughput**: ~10 recipes/minute per concurrent worker

Optimize with:
- Increase `max_concurrent_requests` (default: 5, max recommended: 20)
- Cache search results across multiple chefs
- Use higher confidence thresholds to skip slow tiers

## Development

### Running Tests

```bash
pytest -v src/

# With coverage
pytest --cov=src tests/
```

### Code Quality

```bash
# Format
black src/ tests/

# Lint
flake8 src/ tests/

# Type checking
mypy src/
```

### Building Docs

```bash
# Auto-generate from docstrings
pdoc src/crawler --html --output-dir docs/
```

## Troubleshooting

### Connection refused to PostgreSQL
```bash
# Check database is running and accessible
psql postgresql://user:password@localhost/1group_cuisine -c "SELECT 1"
```

### 429 Too Many Requests
Reduce `max_concurrent_requests` and increase `default_delay_seconds` in config.

### Extraction confidence too low
Lower `confidence_threshold` in config or adjust extraction tier weighting.

### Memory usage high
Limit concurrent requests with `--concurrent` flag, or reduce `max_recipes_per_chef`.

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes with tests
3. Run `black`, `flake8`, `mypy`
4. Submit pull request

## License

Proprietary - 1-Group Cuisine Platform

## Support

For issues or questions:
- Documentation: See project README
- API Issues: Check Claude API status
- Database Issues: Check PostgreSQL logs
- Contributions: Submit PR with tests
