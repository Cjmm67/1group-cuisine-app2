# Quick Start Guide - 1-Group Cuisine Database

## 5-Minute Setup

### 1. Start Services (30 seconds)
```bash
cd 1group-cuisine-app
docker-compose up -d
```

Services will be available:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: localhost:9200

### 2. Install & Initialize Database (2 minutes)
```bash
npm install
npm run db:push
npm run db:seed
```

### 3. Verify Setup (30 seconds)
```bash
# Open Prisma Studio to visualize database
npm run db:studio
```

Browser will open at: http://localhost:5555

### 4. Verify with Direct Connection (Optional)
```bash
# Connect directly to PostgreSQL
npm run docker:postgres

# In the psql prompt:
\dt                    # List all tables
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Recipe";
SELECT COUNT(*) FROM "ChefProfile";
\q                     # Quit
```

## Connected Data

After seeding, you have:
- **50 chef profiles** (Bottura, Redzepi, Ducasse, etc.)
- **20 restaurants** with teams
- **25+ professional recipes** with costs & ingredients
- **100+ ingredients** with suppliers and costs
- **5+ masterclasses** with video episodes
- **15 job listings** for chefs
- **Complete taxonomies** (cuisines, techniques, allergens)
- **Waste logs** and supplier data

## Environment Setup

Create `.env.local`:
```bash
cp .env.example .env.local
```

Default values work for local development:
```
DATABASE_URL="postgresql://cuisine:cuisine_dev@localhost:5432/onegroup_cuisine"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_dev
```

## Common First Tasks

### View All Recipes
```bash
npm run db:studio
# Navigate to Recipe table, click through
```

### Query Recipes Programmatically
```typescript
// In your app (src/lib/db.ts already imported)
import prisma from '@/lib/db'

const recipes = await prisma.recipe.findMany({
  include: {
    user: { select: { name: true } },
    ingredients: { include: { allergens: true } },
    steps: { include: { techniques: true } }
  },
  take: 10
})
```

### Query Chef Profiles
```typescript
const chefs = await prisma.chefProfile.findMany({
  include: {
    user: true,
    accolades: true,
    specialisations: true,
    currentRestaurant: true
  },
  take: 5
})
```

### Get Recipes by Cuisine
```typescript
const frenchRecipes = await prisma.recipe.findMany({
  where: {
    cuisine: { slug: 'french' }
  },
  include: { user: { select: { name: true } } }
})
```

### Allergen Queries
```typescript
// Find recipes with specific allergen
const fishRecipes = await prisma.recipe.findMany({
  where: {
    allergenFlags: {
      some: { allergenType: 'FISH' }
    }
  }
})
```

### Cost Analysis
```typescript
// High-cost recipes
const expensiveRecipes = await prisma.recipe.findMany({
  where: {
    foodCostPercentage: { gte: 30 }
  },
  orderBy: { foodCostPercentage: 'desc' }
})
```

## Development Workflow

### 1. Make Schema Changes
```bash
# Edit prisma/schema.prisma
nano prisma/schema.prisma

# Push changes
npm run db:push
```

### 2. Create New Recipe
```typescript
const recipe = await prisma.recipe.create({
  data: {
    title: 'My New Dish',
    slug: 'my-new-dish',
    userId: chefId,
    difficulty: 'PROFESSIONAL',
    yieldValue: 4,
    yieldUnit: 'portions',
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    totalTimeMinutes: 50,
    description: 'A beautiful dish...',
    visibility: 'PRO_ONLY',
    ingredients: {
      create: [
        {
          name: 'Prime Beef',
          quantity: 400,
          unit: 'g',
          sequence: 1
        }
      ]
    }
  }
})
```

### 3. Reset Database
```bash
# Careful! This deletes all data
npm run db:reset
npm run db:seed    # Re-seed with original data
```

## Monitoring & Debugging

### Check Docker Logs
```bash
# All services
npm run docker:logs

# Just PostgreSQL
docker-compose logs -f postgres

# Just Redis
docker-compose logs -f redis
```

### Verify PostgreSQL Connection
```bash
npm run docker:postgres
# Use \l to list databases
# Use \dt to list tables
```

### Check Data Integrity
```bash
# From Prisma Studio or your app
const chefCount = await prisma.chefProfile.count()
const recipeCount = await prisma.recipe.count()
const restaurantCount = await prisma.restaurant.count()
```

## Performance Tips

1. **Use Prisma Select**
   ```typescript
   // Only fetch what you need
   const chefs = await prisma.chefProfile.findMany({
     select: { id: true, name: true }  // Not userId!
   })
   ```

2. **Batch Queries**
   ```typescript
   // Instead of loop, use createMany
   await prisma.ingredient.createMany({
     data: ingredientsList
   })
   ```

3. **Cache with Redis**
   ```typescript
   import { cacheGet, cacheSet } from '@/lib/redis'
   
   // Get from cache or DB
   let chef = await cacheGet(`chef:${id}`)
   if (!chef) {
     chef = await prisma.chefProfile.findUnique({ where: { id } })
     await cacheSet(`chef:${id}`, chef, 3600) // 1 hour
   }
   ```

## Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is in use
lsof -i :5432

# Or restart Docker
docker-compose restart postgres
```

### Migration conflicts
```bash
# Reset and start fresh
npm run db:reset
npm run db:push
npm run db:seed
```

### Out of sync with remote
```bash
# Pull latest migrations
git pull

# Apply them
npm run db:migrate
```

### Can't connect to Redis
```bash
# Verify Redis is running
docker-compose logs redis

# Test connection
npm run docker:logs
```

## Next Steps

1. **Build API routes** that consume this database
2. **Add caching** with Redis for high-traffic queries
3. **Implement search** with Elasticsearch
4. **Add crawler** that uses CrawledRecipe model
5. **Set up testing** with seeded test data

## File Structure Reference

```
prisma/
├── schema.prisma          # Data models
├── seed.ts               # Seed script
└── migrations/
    └── 0_initial/

src/lib/
├── db.ts                 # Prisma client
└── redis.ts              # Redis client

docker-compose.yml        # Services
.env.example              # Config template
DATABASE_SETUP.md         # Full docs
ARCHITECTURE.md           # Schema docs
```

## Support

- **Schema help**: Check ARCHITECTURE.md
- **Setup issues**: Check DATABASE_SETUP.md
- **Queries**: Use Prisma Studio to inspect data
- **Performance**: Monitor with `npm run db:studio`

Get started with: `bash scripts/setup-db.sh`
