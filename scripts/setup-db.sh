#!/bin/bash
set -e

echo "🚀 1-Group Cuisine Database Setup"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start Docker services
echo "1️⃣  Starting Docker services..."
docker-compose up -d
echo "✅ Docker services started"

# Wait for PostgreSQL to be ready
echo "2️⃣  Waiting for PostgreSQL to be ready..."
sleep 3
until docker-compose exec -T postgres pg_isready -U cuisine > /dev/null 2>&1; do
  echo "   Waiting for PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Wait for Redis to be ready
echo "3️⃣  Waiting for Redis to be ready..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
  echo "   Waiting for Redis..."
  sleep 1
done
echo "✅ Redis is ready"

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo "4️⃣  Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
else
  echo "4️⃣  Dependencies already installed"
fi

# Run migrations
echo "5️⃣  Running database migrations..."
npm run db:push
echo "✅ Migrations completed"

# Seed database
echo "6️⃣  Seeding database with realistic data..."
npm run db:seed
echo "✅ Database seeded"

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "  • Open Prisma Studio:  npm run db:studio"
echo "  • Start development:   npm run dev"
echo "  • View container logs: npm run docker:logs"
echo ""
echo "Docker services running:"
echo "  • PostgreSQL: localhost:5432 (cuisine:cuisine_dev)"
echo "  • Redis:      localhost:6379 (password: redis_dev)"
echo "  • Elasticsearch: localhost:9200"
