# 1-Group Cuisine Database Layer

Complete Prisma + PostgreSQL database layer for the 1-Group Cuisine professional culinary platform.

## Structure

```
├── prisma/
│   ├── schema.prisma           # Complete Prisma schema with all models
│   ├── seed.ts                 # Comprehensive seed script with realistic data
│   └── migrations/
│       ├── 0_initial/
│       │   └── migration.sql   # Initial migration SQL
│       └── migration_lock.toml # Migration lock file
├── src/lib/
│   ├── db.ts                   # Prisma client singleton
│   └── redis.ts                # Redis client setup
├── docker-compose.yml          # Docker services (PostgreSQL, Redis, Elasticsearch)
├── .env.example                # Environment variables template
└── DATABASE_SETUP.md           # This file
```

## Database Models

### Core Models

- **User & Session**: Authentication and sessions
- **ChefProfile**: Chef profiles with career, specialisations, followers
- **Recipe**: Complete recipe model with ingredients, steps, costs, allergens
- **Restaurant**: Restaurant management with teams, waste tracking
- **Supplier**: Supplier management with products, pricing, certifications

### Classification & Taxonomy

- **CuisineTaxonomy**: 3-level hierarchy (European → French → Haute Cuisine)
- **TechniqueTaxonomy**: 5 technique categories with sub-techniques
- **KitchenStation**: 8 classic kitchen stations
- **Allergens**: 14 EU allergens tracked at recipe and ingredient level

### Features

- **Recipes**: Full recipe management with scaling, sustainability scores, costs
- **Ingredients**: Weight-based (grams), supplier linking, allergen tracking
- **Recipe Steps**: Detailed cooking instructions with techniques, timing, temperature
- **Scaling**: Non-linear recipe scaling rules
- **Masterclasses**: Video content with technique timestamps
- **Jobs**: Chef job listings and applications
- **Waste Tracking**: Restaurant waste logging by type
- **Ordering**: Supplier orders and line items
- **Crawler**: Recipe crawling pipeline with extraction tiers
- **Social**: Comments, likes, follower system

## Setup Instructions

### 1. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL 16 (cuisine:cuisine_dev)
- Redis 7 (password: redis_dev)
- Elasticsearch 8 (optional, for search)

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Initialize Database

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push

# Seed with realistic data
npm run db:seed
```

### 4. Verify Setup

```bash
# Open Prisma Studio
npm run db:studio

# Test Postgres connection
npm run docker:postgres

# Connect to Redis: docker-compose exec redis redis-cli
```

## Seed Data

The seed script creates:

- **50 Chef Profiles**: From the Top 200 chefs list (Bottura, Redzepi, Ducasse, etc.)
- **Cuisine Taxonomy**: 3 levels with all major cuisines
- **Technique Taxonomy**: 5 categories with 18+ techniques
- **25+ Recipes**: Professional recipes with:
  - Realistic ingredient quantities (weight-based in grams)
  - Food cost data (28-35% for fine dining)
  - Allergen flags
  - Sustainability scores
  - Scaling rules
- **5+ Masterclasses**: With 4 episodes each
- **15 Job Listings**: Chef positions across restaurants
- **Waste Log Entries**: Restaurant waste tracking
- **Supplier Data**: 3 suppliers with products and pricing

## Key Features

### Recipe Model

- **Title & Classification**: Cuisine, difficulty, course
- **Timing**: Prep, cook, rest times (calculated total)
- **Yield**: Value + unit (portions, grams)
- **Ingredients**: Groups with allergen tracking
- **Steps**: Groups with sequences, techniques, timing/temperature
- **Costs**: Food cost value, percentage, currency
- **Scaling**: Linear/custom/non-scalable with rules
- **Sustainability**: Carbon footprint, sustainability score
- **SEO**: Title, description for publishing
- **Visibility**: PRIVATE, PRO_ONLY, PUBLIC
- **Social**: Like count, comment count

### Ingredient Model

- **Quantity**: Decimal with alternative units
- **Cost**: Unit cost + total cost with currency
- **Properties**: Organic, local flags
- **Allergens**: Linked allergen flags
- **Supplier**: Optional supplier linking

### Allergen System

14 EU Allergens tracked:
- Gluten, Crustaceans, Mollusks, Peanuts, Tree Nuts
- Sesame, Celery, Mustard, Soy, Milk, Eggs, Fish
- Lupin, Sulfites

With severity levels: trace, moderate, severe

### Chef Career System

- **ChefProfile**: Current role, years of experience
- **CareerEntry**: Historical positions with dates
- **Accolade**: Awards and recognitions with year/issuer
- **Restaurant**: Links to current restaurant

### Restaurant Management

- **Restaurant**: Basic info, location, Michelin stars
- **RestaurantMember**: Chef team with roles/stations
- **RestaurantSupplier**: Primary/secondary supplier links
- **WasteLogEntry**: Waste tracking by type

### Supplier Management

- **Supplier**: Contact, location, certifications
- **SupplierProduct**: Product catalog with pricing
- **SupplierPriceFeed**: Time-series pricing data
- **SupplierReview**: Quality/reliability/communication scores

### Recipe Crawler Pipeline

**CrawledRecipe** model with statuses:
- PENDING → CRAWLING → EXTRACTED → NORMALIZED → IN_REVIEW → APPROVED → PUBLISHED

**ExtractionTiers**:
- JSON_LD: Structured data extraction
- LLM_EXTRACTION: AI-powered extraction
- VISION_OCR: Image-based extraction

With confidence scores and raw/normalized data fields.

## Environment Variables

```
# Database
DATABASE_URL=postgresql://cuisine:cuisine_dev@localhost:5432/onegroup_cuisine

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_dev
REDIS_DB=0

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Node
NODE_ENV=development
```

## Common Commands

```bash
# Schema management
npm run db:push              # Push schema to DB
npm run db:migrate           # Run migrations
npm run db:reset             # Reset database
npm run db:seed              # Run seed script
npm run db:studio            # Open Prisma Studio

# Docker
npm run docker:up            # Start services
npm run docker:down          # Stop services
npm run docker:logs          # View logs
npm run docker:postgres      # Connect to Postgres CLI

# Development
npm run dev                  # Start dev server
npm run build               # Build app
npm run type-check          # Type checking
```

## Indexes

All models include strategic indexes for:
- Foreign keys (efficient joins)
- Frequently queried fields (userId, status, createdAt)
- Filtering/sorting (difficulty, visibility, courseType)
- Full-text search preparation

## Performance Notes

- Prisma client is a singleton in development to avoid multiple instances
- Redis caching layer available via redis.ts
- Efficient pagination with cursor-based queries
- Proper foreign key relationships with CASCADE/RESTRICT options
- Composite unique constraints for proper data integrity

## Next Steps

1. Install dependencies: `npm install`
2. Start Docker: `docker-compose up -d`
3. Run migrations: `npm run db:push`
4. Seed database: `npm run db:seed`
5. Open Prisma Studio: `npm run db:studio`
6. Start development: `npm run dev`

## Support

For schema changes:
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Or `npm run db:push` for development
4. Update seed script if needed
5. Re-seed: `npm run db:reset && npm run db:seed`
