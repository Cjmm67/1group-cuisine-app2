# 1-Group Cuisine Database Architecture

## Overview

Complete, production-ready Prisma + PostgreSQL database layer for a professional culinary platform. The schema supports 50+ chef profiles, complete recipe management with scaling and costing, restaurant operations, supplier management, masterclasses, job listings, and a recipe crawler pipeline.

## Schema Highlights

### Total Size
- **1,061 lines** Prisma schema
- **904 lines** SQL migration
- **986 lines** seed script with 50+ top chefs
- **10 enums** for classification
- **40+ models** with complete relationships and indexes

### Key Models (40+)

#### Auth & Users
- `User`: Authentication with email, name, profile image
- `Session`: Session management
- `ChefProfile`: Chef profiles with followers, career, specialisations

#### Core Content
- `Recipe`: Complete recipe model with 25+ fields
- `IngredientGroup`, `Ingredient`: Weight-based ingredients
- `RecipeStepGroup`, `RecipeStep`: Detailed cooking instructions
- `AllergenFlag`: 14 EU allergens tracked at recipe/ingredient level

#### Classification
- `CuisineTaxonomy`: 3-level hierarchy (European → French → Haute Cuisine)
- `TechniqueTaxonomy`: 5 technique categories with 18+ techniques
- Enums: ChefRole (12), KitchenStation (8), RecipeDifficulty (3), WasteType (6), etc.

#### Business Operations
- `Restaurant`: Restaurant info with teams, suppliers
- `RestaurantMember`: Chef team management with roles/stations
- `Supplier`, `SupplierProduct`, `SupplierPriceFeed`: Supplier management
- `Order`, `OrderLineItem`: Purchase orders
- `WasteLogEntry`: Waste tracking by type

#### Content & Learning
- `Masterclass`, `Episode`: Video content with technique timestamps
- `MasterclassProgress`: Learning progress tracking
- `JobListing`, `JobApplication`, `RecruitmentMessage`: Chef recruiting

#### Pipeline & Social
- `CrawledRecipe`: Recipe crawler with JSON_LD/LLM/Vision extraction tiers
- `CrawlJob`: Crawler orchestration
- `Comment`, `Like`: Social features
- `UserFollower`: Follower system

### Enums (10 Total)

1. **ChefRole** (12 values): EXECUTIVE_CHEF, HEAD_CHEF, SOUS_CHEF, CHEF_DE_PARTIE, DEMI_CHEF, COMMIS, PASTRY_CHEF, PRIVATE_CHEF, CULINARY_INSTRUCTOR, CULINARY_CONSULTANT, CULINARY_STUDENT, STAGIAIRE

2. **KitchenStation** (8): GARDE_MANGER, SAUCIER, ROTISSEUR, POISSONNIER, ENTREMETIER, PATISSIER, BOULANGER, TOURNANT

3. **RecipeDifficulty** (3): PROFESSIONAL, ADVANCED_PROFESSIONAL, R_AND_D

4. **WasteType** (6): PREP_WASTE, PLATE_WASTE, SPOILAGE, OVERPRODUCTION, EXPIRED, QUALITY_REJECT

5. **SupplierCertification** (11): ORGANIC, BIODYNAMIC, MSC, ASC, FAIR_TRADE, REGENERATIVE, CARBON_NEUTRAL, B_CORP, DOP_AOC, HALAL, KOSHER

6. **RecipeVisibility** (3): PRIVATE, PRO_ONLY, PUBLIC

7. **ScalingType** (3): LINEAR, CUSTOM, NON_SCALABLE

8. **CrawlStatus** (7): PENDING, CRAWLING, EXTRACTED, NORMALIZED, IN_REVIEW, APPROVED, REJECTED, PUBLISHED

9. **ExtractionTier** (3): JSON_LD, LLM_EXTRACTION, VISION_OCR

10. **AllergenType** (14): GLUTEN, CRUSTACEANS, MOLLUSKS, PEANUTS, TREE_NUTS, SESAME, CELERY, MUSTARD, SOY, MILK, EGGS, FISH, LUPIN, SULFITES

## Core Features

### Recipe Model (25+ Fields)
```
- Identification: id, userId, title, slug
- Classification: cuisineId, difficulty, recipeCourse
- Timing: prepTimeMinutes, cookTimeMinutes, restTimeMinutes, totalTimeMinutes
- Yield: yieldValue, yieldUnit, servingsMin, servingsMax
- Ingredients: ingredientGroups[], ingredients[], allergenFlags[]
- Steps: stepGroups[], steps[] with techniques, timing, temperature
- Plating: platingNotes, platingDimensions, temperature
- Costs: foodCostValue, foodCostCurrency, foodCostPercentage (28-35% fine dining)
- Scaling: scalingType, scalingRules[]
- Sustainability: sustainabilityScore, carbonfootprint
- SEO: seoTitle, seoDescription
- Visibility: visibility (PRIVATE/PRO_ONLY/PUBLIC), isPublished, publishedAt
- Social: commentCount, likeCount, comments[], likes[]
- Metadata: createdAt, updatedAt, deletedAt
```

### Chef Profile Features
- Current role, years of experience
- Michelin stars tracking
- Career history (CareerEntry)
- Accolades and awards
- Specialisations (link to CuisineTaxonomy)
- Follower system with UserFollower
- Restaurant association

### Ingredient Management
- Decimal quantities in grams
- Alternative units (cups, ounces, etc.)
- Cost tracking (unit + total)
- Supplier linking
- Allergen flags with severity
- Organic/local indicators

### Restaurant Operations
- Team management with roles and kitchen stations
- Supplier relationships (primary/secondary)
- Waste tracking by type (prep, plate, spoilage, overproduction, expired, quality reject)
- Michelin star tracking
- Location (city, country, coordinates)

### Supplier System
- Product catalog with SKU tracking
- Time-series pricing feeds
- Certifications: Organic, Biodynamic, MSC, ASC, Fair Trade, Regenerative, Carbon Neutral, B Corp, DOP/AOC, Halal, Kosher
- Quality/reliability/communication ratings
- Lead time tracking
- Stock status

### Recipe Crawler Pipeline
Status flow: PENDING → CRAWLING → EXTRACTED → NORMALIZED → IN_REVIEW → APPROVED → REJECTED/PUBLISHED

Extraction tiers:
- JSON_LD: Structured data extraction
- LLM_EXTRACTION: AI-powered extraction
- VISION_OCR: Image/OCR-based extraction

Fields:
- sourceUrl (unique), sourceTitle, sourceSiteName
- extractionTier, extractionTimestamp, confidenceScore
- rawHtml, rawJson, normalizedData
- status, reviewedBy, reviewedAt, reviewNotes
- publishedAsRecipeId (link to Recipe if approved)

## Indexes

Strategic indexes for performance:
- Foreign keys: All relationships indexed for join efficiency
- Frequently queried: userId, email, status, createdAt
- Filtering/sorting: difficulty, visibility, courseType, city, station
- Search preparation: slug, name

## Data Types

- **IDs**: CUID (distributed unique IDs)
- **Timestamps**: DateTime with millisecond precision
- **Currency**: Decimal(10,2) for exact amounts
- **Measurements**: Decimal(10,3) for quantities
- **Flexible Data**: JSONB for extensibility (platingDimensions, allergens array, technique timestamps)
- **Arrays**: TEXT[] for simple lists (certifications, kitchen stations)

## Relationships & Integrity

### Cascade Rules
- User → ChefProfile, Sessions, Recipes (CASCADE)
- Recipe → IngredientGroups, Steps, Comments, Likes (CASCADE)
- Supplier → Orders, Products (CASCADE)
- Restaurant → Members, WasteLogs (CASCADE)

### Restrict Rules
- Supplier → Orders (RESTRICT to prevent orphaned orders)

### Set Null
- ChefProfile.currentRestaurantId (allow orphaned profiles)
- Ingredient.ingredientGroupId (allow ungrouped ingredients)

## Seed Data

The seed script (prisma/seed.ts) creates realistic data:

### 50 Chef Profiles
Top chefs including:
- Massimo Bottura (Osteria Francescana, 3 stars)
- René Redzepi (Noma, 3 stars)
- Alain Ducasse, Heston Blumenthal, Ferran Adrià
- Thomas Keller, Gordon Ramsay, Gaggan Anand
- And 42 more world-class chefs

### Cuisine Taxonomy
3-level hierarchy:
- Level 1: European, Asian, Americas
- Level 2: French, Italian, Spanish, Nordic, Japanese, Thai, Chinese, Indian, Mexican
- Level 3: Haute Cuisine, Nouvelle Cuisine, Modernist, Basque, Sushi, Kaiseki, etc.

### Technique Taxonomy
5 categories with 18+ techniques:
- Dry Heat: Roasting, Grilling, Sautéing, Frying
- Wet Heat: Boiling, Steaming, Poaching, Braising
- Modernist: Sous Vide, Spherification, Foaming
- Preservation: Fermentation, Curing, Pickling
- Pastry: Lamination, Tempering

### 25+ Professional Recipes
With realistic data:
- Turbot with brown butter and capers
- Risotto ai Funghi Porcini
- Sous Vide Beef Tenderloin
- Foie Gras Torchon
- Kaiseki Omakase
- Tom Yum Goong
- Prep times: 10-45 minutes
- Cook times: 0-120 minutes
- Food costs: 20-40 EUR
- Food cost percentages: 28-35% (fine dining standard)

### Suppliers with Products
- Provence Organic Fruits (MSC, Fair Trade, Organic)
- Nordic Seafood Co (MSC, Carbon Neutral)
- Heritage Meats Italia (Organic, Regenerative)

### 5+ Masterclasses
- Advanced Plating Techniques
- Sous Vide Mastery
- French Sauce Making
- Japanese Knife Skills
- Modernist Pastry

With 4 episodes each including technique timestamps.

### 15 Job Listings
Chef positions from Executive to Commis level across 20 restaurants.

### Waste Log Entries
50+ waste tracking entries across restaurant operations.

## Performance Considerations

### Pagination
Use cursor-based pagination with `take`/`skip` for large datasets:
```typescript
const recipes = await prisma.recipe.findMany({
  take: 20,
  skip: 0,
  cursor: { id: lastId },
  orderBy: { createdAt: 'desc' }
})
```

### Batch Operations
For bulk inserts use createMany:
```typescript
await prisma.ingredient.createMany({
  data: ingredientsList
})
```

### Caching
Redis client available via `src/lib/redis.ts` for:
- Recipe data (frequently accessed)
- Chef profiles (follower counts, trending)
- Supplier pricing (price feeds)
- Search results

### Query Optimization
- Always include specific fields with select/include
- Use indices for WHERE/ORDER BY clauses
- Avoid N+1 queries with nested includes
- Use Prisma Studio to monitor slow queries

## Deployment

### Development
```bash
npm run db:push                 # Push schema changes
npm run db:migrate              # Run migrations
npm run db:seed                 # Populate seed data
npm run db:studio               # Open visual database explorer
```

### Production
```bash
npm run db:migrate              # Run all pending migrations
# Seed script NOT run automatically in production
```

### Docker Services
```yaml
PostgreSQL 16:    cuisine_dev password
Redis 7:          redis_dev password
Elasticsearch 8:  anonymous access
```

## Security Considerations

1. **Passwords**: Hash before storing (bcrypt, argon2)
2. **API Keys**: Never log or expose in responses
3. **Allergens**: Critical safety data, always validated
4. **Food Costs**: Mark as sensitive data in logs
5. **User Data**: GDPR compliance for EU users
6. **Database URLs**: Never commit .env files
7. **Migrations**: Version control all changes
8. **Supplier Data**: Validate certifications and reviews

## Extensibility

The schema supports:
- Custom recipe fields via JSONB fields (platingDimensions, techniqueTimestamps)
- New allergens by adding to AllergenType enum
- New certifications via enum
- New job fields by extending JobListing
- Custom metadata in JSON columns

## File Structure

```
prisma/
├── schema.prisma             (1061 lines - complete schema)
├── seed.ts                   (986 lines - realistic seed data)
├── migrations/
│   ├── 0_initial/
│   │   └── migration.sql     (904 lines - initial schema)
│   └── migration_lock.toml   (migrations lock)

src/lib/
├── db.ts                     (Prisma client singleton)
└── redis.ts                  (Redis cache client)

docker-compose.yml            (PostgreSQL, Redis, Elasticsearch)
DATABASE_SETUP.md             (Setup instructions)
ARCHITECTURE.md               (This file)
```

## Next Steps

1. Initialize: `npm install && npm run db:push && npm run db:seed`
2. Explore: `npm run db:studio`
3. Develop: Build API routes consuming this schema
4. Scale: Add Redis caching layer for frequently accessed data
5. Monitor: Use Prisma metrics and database monitoring tools
