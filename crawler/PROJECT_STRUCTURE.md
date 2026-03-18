# Project Structure

## Directory Layout

```
crawler/
│
├── 📄 pyproject.toml                  Project metadata & dependencies
├── 📄 Dockerfile                      Production Docker image
├── 📄 docker-compose.yml              Full stack (PostgreSQL + Redis + Crawler)
├── 📄 cli.py                          CLI entry point (6 commands)
├── 📄 README.md                       Full documentation (1,000+ lines)
├── 📄 SUMMARY.md                      Build summary & deliverables
├── 📄 PROJECT_STRUCTURE.md            This file
│
├── 🔧 config/
│   └── crawler_config.yaml            YAML configuration (rate limits, sources)
│
└── 🐍 src/
    ├── __init__.py                    Package initialization
    ├── config.py                      (220 lines) Config management
    ├── models.py                      (280 lines) SQLAlchemy ORM models
    ├── chef_list.py                   (2,100+ lines) 200 chefs database
    ├── discovery.py                   (420 lines) Recipe URL discovery
    ├── extraction.py                  (550 lines) 3-tier extraction engine
    ├── normalizer.py                  (480 lines) Normalization pipeline
    ├── orchestrator.py                (300 lines) Main orchestrator
    ├── review.py                      (380 lines) AI review queue
    └── utils.py                       (380 lines) Helper functions
```

## Module Guide

### Configuration & Setup

#### `config.py` (220 lines)
Core configuration management with Pydantic validation.

**Key Classes:**
- `CrawlerConfig` - Main configuration dataclass
- `CrawlSettingsConfig` - Crawl operation settings
- `RateLimitConfig` - Per-domain rate limits
- `ExtractionConfig` - Extraction engine settings
- `CredibleSourcesConfig` - Tiered source credibility

**Functions:**
- `load_config(yaml_path)` - Load from YAML + environment
- `get_config()` - Get global config instance
- `set_config(config)` - Set global config instance

**Usage:**
```python
from src.config import get_config
config = get_config()
print(config.database_url)
print(config.crawl_settings.max_recipes_per_chef)
```

#### `models.py` (280 lines)
SQLAlchemy ORM models for database persistence.

**Key Classes:**
- `CrawlJob` - Crawl job with status tracking
- `CrawledRecipe` - Individual recipe with extraction data
- `CrawlLog` - Timestamped log entries
- `DatabaseManager` - Connection & session management

**Enums:**
- `CrawlJobStatus` - PENDING, RUNNING, COMPLETED, FAILED, PAUSED
- `ReviewStatus` - PENDING, AUTO_APPROVED, APPROVED, REJECTED, FLAGGED
- `ExtractionTier` - TIER_1_STRUCTURED, TIER_2_LLM, TIER_3_VISION, FAILED

**Usage:**
```python
from src.models import DatabaseManager, CrawlJob
db = DatabaseManager("postgresql://...")
db.create_tables()
session = db.get_session()
jobs = session.query(CrawlJob).all()
```

### Core Pipeline

#### `discovery.py` (420 lines)
Multi-strategy recipe URL discovery.

**Key Classes:**
- `RecipeDiscovery` - Main discovery orchestrator
- `ChefData` - Chef information dataclass
- `CandidateURL` - Discovered recipe URL with metadata

**Discovery Strategies:**
1. `_strategy_chef_website()` - Crawl chef's personal website
2. `_strategy_search_api()` - Google/SerpAPI search
3. `_strategy_known_sources()` - Check credible publications
4. `_strategy_cookbook_excerpts()` - Find cookbook content

**Functions:**
- `discover_for_chef(chef)` - Run all strategies, deduplicate, score
- `check_robots_txt(domain, path)` - Verify crawling allowed
- `clean_url(url)` - Normalize URL for deduplication

**Usage:**
```python
from src.discovery import RecipeDiscovery, ChefData
discovery = RecipeDiscovery()
chef = ChefData(id="...", name="Massimo Bottura", ...)
urls = await discovery.discover_for_chef(chef)
```

#### `extraction.py` (550 lines)
3-tier recipe extraction engine with fallback strategies.

**Key Classes:**
- `RecipeExtractor` - Main extraction orchestrator
- `ExtractedRecipe` - Extracted recipe data
- `Ingredient` - Ingredient with quantity/unit
- `RecipeStep` - Single instruction step

**Extraction Tiers:**
1. **Tier 1** (0.9 confidence) - JSON-LD, Microdata, RDFa parsing
2. **Tier 2** (0.75 confidence) - Claude LLM extraction
3. **Tier 3** (0.65 confidence) - Vision OCR with Playwright

**Functions:**
- `extract(url, html)` - Try tiers in order
- `_tier1_structured_data(html, url)` - Parse schema markup
- `_tier2_llm_extraction(html, url)` - Claude API extraction
- `_tier3_vision_ocr(url)` - Screenshot + Vision

**Usage:**
```python
from src.extraction import RecipeExtractor
extractor = RecipeExtractor()
recipe = await extractor.extract("https://...", html_content)
print(f"Confidence: {recipe.extraction_confidence}")
print(f"Title: {recipe.title}")
```

#### `normalizer.py` (480 lines)
Recipe standardization and deduplication.

**Key Classes:**
- `NormalizationPipeline` - Main normalizer
- `NormalizedRecipe` - Standardized recipe format
- `NormalizedIngredient` - Ingredient with conversions

**Normalization Steps:**
1. Unit conversion (cups→g, oz→g, etc.)
2. Ingredient vocabulary matching
3. Technique extraction & tagging
4. Difficulty classification
5. Food cost estimation
6. Sustainability scoring
7. Deduplication with embeddings

**Functions:**
- `normalize(extracted)` - Run full pipeline
- `_normalize_ingredients()` - Unit conversion
- `_normalize_cuisine()` - Map to taxonomy
- `_estimate_food_cost()` - Price estimation
- `_calculate_sustainability_score()` - Eco-scoring
- `is_duplicate()` - Detect duplicates

**Usage:**
```python
from src.normalizer import NormalizationPipeline
normalizer = NormalizationPipeline()
normalized = await normalizer.normalize(extracted_recipe)
print(f"Cost: ${normalized.estimated_food_cost_usd}")
```

#### `orchestrator.py` (300 lines)
Main crawl orchestrator coordinating entire pipeline.

**Key Classes:**
- `CrawlOrchestrator` - Main orchestrator

**Functions:**
- `crawl_chef(chef, max_recipes)` - Crawl single chef
- `crawl_all(chefs, tier)` - Crawl multiple chefs
- `retry_failed()` - Retry failed jobs

**Pipeline Flow:**
1. Discovery → find URLs
2. Fetch HTML from each URL
3. Extract recipe (3 tiers)
4. Normalize
5. Save to database
6. Update job status

**Usage:**
```python
from src.orchestrator import CrawlOrchestrator
orchestrator = CrawlOrchestrator(db)
job = await orchestrator.crawl_chef(chef, max_recipes=10)
print(f"Found {job.recipes_found} recipes")
```

#### `review.py` (380 lines)
AI review queue with pre-scoring and approval workflow.

**Key Classes:**
- `ReviewQueue` - Review management
- `ReviewScore` - AI-generated score

**Scoring Factors (0-100):**
- Completeness (35%) - Required fields
- Quality (35%) - Instructions & ingredients detail
- Attribution (30%) - Source credibility

**Functions:**
- `score_recipe(recipe)` - AI pre-score
- `auto_approve(min_score)` - Auto-approve ≥ 85
- `get_pending()` - Get recipes needing review
- `approve_recipe()` - Manual approval
- `reject_recipe()` - Manual rejection
- `flag_recipe()` - Flag for attention
- `get_review_stats()` - Queue statistics

**Scoring Logic:**
- Score ≥ 85: AUTO_APPROVE
- Score 70-84: Manual REVIEW
- Score < 70: REJECT

**Usage:**
```python
from src.review import ReviewQueue
queue = ReviewQueue(db)
approved = await queue.auto_approve(min_score=85)
stats = await queue.get_review_stats()
```

### Database & Chef Data

#### `models.py` - Database Tables
```sql
crawl_jobs:
  - id (PK)
  - chef_id (FK)
  - status (enum)
  - recipes_found, recipes_approved
  - started_at, completed_at
  - error_message

crawled_recipes:
  - id (PK)
  - job_id (FK)
  - source_url (unique)
  - extraction_tier (enum)
  - confidence_score
  - raw_data (JSON)
  - normalized_data (JSON)
  - review_status (enum)
  - review_score

crawl_logs:
  - id (PK)
  - job_id (FK)
  - level, message, context (JSON)
  - timestamp
```

#### `chef_list.py` (2,100+ lines)
Complete database of 200 professional chefs.

**Organization:**
- **Tier 1 (50 chefs)** - Global icons (Massimo Bottura, Joan Rocafort, etc.)
- **Tier 2 (70 chefs)** - Major figures (Anne-Sophie Pic, Daniel Humm, etc.)
- **Tier 3 (80 chefs)** - Rising stars (Kylie Kwong, David Zilber, etc.)

**Chef Class:**
```python
@dataclass
class Chef:
    id: str
    name: str
    restaurant: str
    location: str
    country: str
    tier: int  # 1, 2, or 3
    website: Optional[str]
    cuisine_tags: list[str]
    accolades: list[str]
    michelin_stars: int
    world_rank: Optional[int]
```

**Functions:**
- `get_all_chefs()` - All 200 chefs
- `get_chefs_by_tier(tier)` - Filter by tier
- `get_chef_by_id(chef_id)` - Find by ID

### Utilities & CLI

#### `utils.py` (380 lines)
Helper functions for URL handling, rate limiting, logging.

**Key Classes:**
- `RateLimiter` - Per-domain rate limiting
- `RobotsTxtChecker` - robots.txt parser

**Functions:**
- `clean_url(url)` - URL normalization
- `extract_domain(url)` - Domain extraction
- `check_robots_txt(domain, path)` - Verify crawling allowed
- `setup_logging()` - Configure structlog
- `parse_duration_string()` - Parse time strings
- `sanitize_filename()` - Safe file names

**Usage:**
```python
from src.utils import RateLimiter, clean_url
rate_limiter = RateLimiter(config.rate_limits)
await rate_limiter.wait_for_domain(url)
clean = clean_url(url)
```

#### `cli.py` (389 lines)
Rich CLI with 6 commands.

**Commands:**
1. `crawl` - Crawl recipes
   - `--chef <name>` - Single chef
   - `--tier <1-3>` - Entire tier
   - `--max-recipes <n>` - Limit
   - `--concurrent <n>` - Parallelism

2. `review` - AI score & approve
   - `--min-score <0-100>` - Approval threshold

3. `recipes` - View by status
   - `--pending/--approved/--rejected`
   - `--limit <n>`

4. `status` - Job management
   - `--job-id <uuid>` - Details

5. `retry-failed` - Retry errors

**Usage:**
```bash
python -m crawler.cli crawl --tier 1
python -m crawler.cli review --min-score 85
python -m crawler.cli status --job-id abc123
```

## Key Interfaces

### RecipeDiscovery.discover_for_chef()
```python
async def discover_for_chef(self, chef: ChefData) -> list[CandidateURL]:
    """Returns: List of URLs with credibility scores (1-10)"""
    candidates = [
        CandidateURL(url="...", source="chef_website", credibility_score=8.5),
        CandidateURL(url="...", source="search_api", credibility_score=7.0),
    ]
    return sorted(candidates, key=lambda x: x.credibility_score, reverse=True)
```

### RecipeExtractor.extract()
```python
async def extract(self, url: str, html: str) -> Optional[ExtractedRecipe]:
    """Returns: ExtractedRecipe with confidence score or None"""
    return ExtractedRecipe(
        title="Truffle Risotto",
        ingredients=[...],
        instructions=[...],
        extraction_confidence=0.92,
        # ... other fields
    )
```

### NormalizationPipeline.normalize()
```python
async def normalize(self, extracted: ExtractedRecipe) -> NormalizedRecipe:
    """Returns: Standardized recipe with normalized units, costs, scores"""
    return NormalizedRecipe(
        ingredients=[NormalizedIngredient(name="...", quantity_grams=250.0)],
        estimated_food_cost_usd=15.50,
        sustainability_score=72.5,
        # ... other fields
    )
```

### CrawlOrchestrator.crawl_chef()
```python
async def crawl_chef(self, chef: ChefData, max_recipes: int = 10) -> CrawlJob:
    """Returns: CrawlJob with recipes_found, status, timestamps"""
    return CrawlJob(
        id="...",
        chef_id=chef.id,
        status=CrawlJobStatus.COMPLETED,
        recipes_found=8,
        recipes_approved=7,
    )
```

### ReviewQueue.score_recipe()
```python
async def score_recipe(self, recipe: NormalizedRecipe) -> ReviewScore:
    """Returns: 0-100 score with recommendation (AUTO_APPROVE/REVIEW/REJECT)"""
    return ReviewScore(
        recipe_id="...",
        score=87,
        recommendation="AUTO_APPROVE",
        reasoning=["Complete ingredients", "Detailed instructions"],
    )
```

## Configuration Hierarchy

1. **Environment Variables** (highest priority)
   - `DATABASE_URL`, `REDIS_URL`, `CLAUDE_API_KEY`, etc.

2. **YAML Config File** (config/crawler_config.yaml)
   - Crawl settings, rate limits, extraction thresholds
   - Credible sources by tier

3. **Defaults** (lowest priority)
   - Built-in defaults in config.py

**Example:**
```python
# Load with priority order
config = load_config("config/crawler_config.yaml")
# Environment vars override YAML
# Defaults fill in gaps
```

## Data Flow

```
Chef Data
    ↓
Discovery Module (4 strategies)
    ↓
List of URLs with credibility scores
    ↓
HTML Fetching
    ↓
Extraction Engine (3 tiers, fallback)
    ↓
ExtractedRecipe (raw, confidence score)
    ↓
Normalizer (units, vocabulary, costs, dedup)
    ↓
NormalizedRecipe (standardized format)
    ↓
Review Queue (AI scoring 0-100)
    ↓
ReviewScore (decision: auto-approve/review/reject)
    ↓
Database Storage (CrawledRecipe)
    ↓
Human Review (if needed)
    ↓
Publication → Main App
```

## Performance Optimization Tips

1. **Increase concurrency** (but respect rate limits):
   ```bash
   --concurrent 20  # vs default 5
   ```

2. **Use Tier 1 sources first**:
   - Higher confidence = faster approval

3. **Batch operations**:
   - Crawl by tier instead of individual chefs
   - Auto-approve in bulk

4. **Cache results**:
   - Discovery URLs can be reused across tiers
   - Search results valid for 24 hours

5. **Parallel review**:
   - Run multiple review jobs on pending recipes

## Common Tasks

### Add new chef
```python
from src.chef_list import Chef
new_chef = Chef(
    id="chef_201",
    name="Alice Waters",
    restaurant="Chez Panisse",
    # ...
    tier=1,
)
```

### Update rate limits
Edit `config/crawler_config.yaml`:
```yaml
rate_limits:
  example.com:
    requests_per_second: 0.5
    daily_max: 50
```

### View extraction quality
```bash
python -m crawler.cli recipes --pending --limit 20
# Check extraction_tier and confidence_score
```

### Debug a failed job
```bash
python -m crawler.cli status --job-id <job-id>
# Shows error_message, logs, related recipes
```

## Extension Points

1. **Add search API integration**
   - Implement `_perform_search()` in discovery.py

2. **Add extraction tier**
   - New `_tier4_*()` method in extraction.py

3. **Custom scoring**
   - Subclass `ReviewQueue.score_recipe()`

4. **Database backend**
   - Replace SQLAlchemy with another ORM

5. **Message queue**
   - Replace async with Celery tasks

---

**Total Code**: ~5,700 lines
**Total Files**: 19
**Python Modules**: 11
**Configuration Files**: 4
**Documentation**: 2,000+ lines
