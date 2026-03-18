# 1-Group Cuisine - Professional Culinary Platform

A modern, production-ready Next.js frontend for a professional culinary platform serving Singapore's 1-Group hospitality portfolio.

## Overview

1-Group Cuisine is a sophisticated web application designed for professional chefs, culinary students, and suppliers to discover recipes, connect with renowned chefs, explore masterclasses, and manage sustainable kitchen practices.

## Features

### 🍽️ Core Features
- **Recipe Discovery**: Advanced filtering system with 9 dimensions (cuisine, technique, station, ingredients, allergens, chef accolades, menu context, sustainability, food cost)
- **Chef Directory**: Browse and connect with world-class chefs
- **Masterclasses**: Learn from culinary experts with structured courses
- **Job Marketplace**: Find culinary positions and opportunities
- **Supplier Directory**: Connect with premium food suppliers
- **Sustainability Hub**: Track waste, log ingredients, optimize kitchen practices
- **Unified Search**: Search across all content types

### 🎨 Design
- Premium 1-Group branding (Gold #C5A572, Charcoal #2D2D2D)
- Responsive design (mobile-first)
- Professional typography (Playfair Display, Inter)
- Accessible and performant

### 🛠️ Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **React**: 18.2.0
- **Styling**: Tailwind CSS 3.4.0
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Language**: TypeScript

## Project Structure

```
1group-cuisine-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Landing/home page
│   ├── globals.css              # Global styles & CSS variables
│   ├── (auth)/                  # Auth group layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── recipes/                 # Recipe pages
│   │   ├── page.tsx            # Recipe browse with 9-dimension filters
│   │   └── [slug]/page.tsx     # Recipe detail
│   ├── chefs/                   # Chef pages
│   │   ├── page.tsx            # Chef directory
│   │   └── [slug]/page.tsx     # Chef profile
│   ├── masterclasses/           # Masterclass pages
│   │   ├── page.tsx            # Browse masterclasses
│   │   └── [slug]/page.tsx     # Course detail with episodes
│   ├── marketplace/page.tsx      # Job board
│   ├── sustainability/page.tsx   # Waste dashboard & logger
│   ├── suppliers/page.tsx        # Supplier directory
│   └── search/page.tsx           # Unified search
├── components/                   # React components
│   ├── ui/                      # Atomic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Slider.tsx
│   │   ├── Modal.tsx
│   │   └── Avatar.tsx
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── recipe/                  # Recipe components
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── RecipeFilters.tsx    # 9-dimension filter system
│   │   ├── IngredientList.tsx
│   │   └── StepList.tsx
│   ├── chef/                    # Chef components
│   │   ├── ChefCard.tsx
│   │   └── ChefProfile.tsx
│   ├── masterclass/             # Masterclass components
│   │   ├── MasterclassCard.tsx
│   │   └── EpisodeList.tsx
│   ├── waste/                   # Sustainability components
│   │   ├── WasteLogger.tsx
│   │   └── WasteDashboard.tsx
│   └── search/
│       └── SearchBar.tsx
├── lib/
│   ├── api.ts                  # API client (ready for backend integration)
│   ├── utils.ts                # Utility functions
│   ├── constants.ts            # Cuisine taxonomy, techniques, stations, allergens
│   └── mockData.ts             # Mock data for development
├── hooks/                       # Custom React hooks
│   ├── useRecipes.ts
│   ├── useChefs.ts
│   └── useAuth.ts
├── store/                       # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
├── types/index.ts              # TypeScript type definitions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 1group-cuisine-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check
```

## Key Pages & Features

### 1. **Recipe Search** (Most Important)
- **Location**: `/recipes`
- **9-Dimension Filter System**:
  1. Cuisine (hierarchical: European > French > Provençal)
  2. Technique (Dry Heat, Wet Heat, Modernist, Preservation, Pastry)
  3. Kitchen Station (Garde Manger, Saucier, Rôtisseur, etc.)
  4. Ingredient (typeahead search)
  5. Dietary/Allergen (14 EU allergens)
  6. Chef/Accolades (Michelin, 50 Best)
  7. Menu Context (tasting menu, à la carte, brunch, zero waste)
  8. Sustainability (low carbon, seasonal, zero waste toggles)
  9. Food Cost Range (15%-50% slider)
- Real-time reactive filtering (no "Apply" button)
- View toggle (grid/list)
- Sorting options (rating, recent, trending, difficulty)

### 2. **Recipe Detail**
- Full recipe with ingredient scaling
- Weight-based measurements (grams)
- Step-by-step method with technique tags
- Station assignments per step
- Allergen matrix
- Food cost percentage
- Sustainability score
- Chef information and related recipes

### 3. **Chef Directory**
- Browse world-class chefs
- Search by name, restaurant, specialty
- Filter and sort
- Chef cards with accolades (Michelin stars, 50 Best)

### 4. **Chef Profile**
- Detailed biography
- Specialties and expertise
- Recipe portfolio
- Masterclass listings
- Career statistics

### 5. **Masterclasses**
- Browse structured courses
- Episodes with timestamps
- Chef bios and credentials
- Enrollment and pricing
- Related recipes per episode

### 6. **Job Marketplace**
- Job listings with filters
- Experience level, employment type
- Salary ranges
- Apply functionality
- Location-based search

### 7. **Sustainability Hub**
- Waste logging interface
- Track waste by category
- Daily trend charts
- Category breakdown (pie chart)
- Prevention notes
- Sustainability tips

### 8. **Supplier Directory**
- Premium suppliers
- Verified badges
- Ratings and reviews
- Specialty filters
- Contact information

### 9. **Unified Search**
- Search across recipes, chefs, masterclasses
- Type filtering
- Popular suggestions
- Real-time results

## Mock Data

The application includes comprehensive mock data covering:
- **5 World-Class Chefs**: Massimo Bottura, René Redzepi, Gaggan Anand, Thomas Keller, Clare Smyth
- **5 Complete Recipes**: With full ingredients, steps, and metadata
- **2 Masterclasses**: With episodes and structured content
- **5+ Job Listings**: Various roles and experience levels
- **3 Suppliers**: With verified status and specialties

All mock data uses realistic information from actual restaurants and chefs.

## API Integration

The `lib/api.ts` client is ready for backend integration:

```typescript
// Example usage
const recipes = await apiClient.getRecipes({ 
  page: 1, 
  limit: 20,
  search: 'risotto'
});

const chef = await apiClient.getChefBySlug('massimo-bottura');
```

Replace mock data calls with actual API endpoints when backend is ready.

## Styling & Branding

### Color Palette
- **Primary Gold**: #C5A572
- **Dark Charcoal**: #2D2D2D
- **Warm White**: #F5F0E8
- **Text**: #1A1A1A
- **Tailwind**: Extended color configuration in `tailwind.config.ts`

### Typography
- **Headings**: Playfair Display (serif, premium)
- **Body**: Inter (clean, readable)

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly controls
- Optimized grid layouts

## Performance Optimizations

- Server-side rendering with Next.js
- Image optimization (next/image ready)
- Lazy loading for components
- Efficient filtering (client-side memoization)
- Zustand for minimal re-renders
- TanStack Query ready for caching

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=1-Group Cuisine
NEXT_PUBLIC_APP_DESCRIPTION=Professional culinary platform
```

## Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Real backend API integration
- [ ] User profiles and accounts
- [ ] Recipe saving/bookmarks
- [ ] Comments and ratings
- [ ] Social features (follow chefs)
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Payment processing (Stripe)

## Contributing

This is a production-ready application. For modifications:

1. Maintain TypeScript strict mode
2. Follow existing component patterns
3. Keep accessibility standards (a11y)
4. Test responsive design
5. Use existing UI component library

## License

Proprietary - 1-Group Singapore

## Support

For issues or questions, contact the development team.

---

**Built with** ❤️ **for professional chefs worldwide**
