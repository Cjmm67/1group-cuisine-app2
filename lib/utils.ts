import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Recipe, Chef } from '@/types/index';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number, currency: string = 'SGD'): string {
  const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function calculateScaledIngredient(
  originalWeight: number,
  originalServings: number,
  desiredServings: number
): number {
  return (originalWeight / originalServings) * desiredServings;
}

export function filterRecipes(
  recipes: Recipe[],
  filters: {
    cuisines?: string[];
    techniques?: string[];
    stations?: string[];
    ingredients?: string[];
    allergens?: string[];
    chefs?: string[];
    menuContext?: string[];
    sustainability?: {
      lowCarbon?: boolean;
      seasonal?: boolean;
      zeroWaste?: boolean;
    };
    foodCostRange?: [number, number];
    difficulty?: string[];
    searchQuery?: string;
  }
): Recipe[] {
  return recipes.filter((recipe) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        recipe.title.toLowerCase().includes(query) ||
        recipe.chef.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (filters.cuisines && filters.cuisines.length > 0) {
      const matchesCuisine = recipe.cuisines.some((c) => {
        // Direct match
        if (filters.cuisines!.includes(c.id)) return true;
        // Match on parent (e.g. recipe has 'italian' with parent 'european', filter has 'european')
        if (c.parent && filters.cuisines!.includes(c.parent)) return true;
        // Match on grandparent (e.g. recipe has 'french_breton' with parent 'french', and 'french' parent is 'european')
        if (c.parent) {
          // Check if any selected filter is an ancestor
          const parentCuisine = recipe.cuisines.find((p) => p.id === c.parent);
          if (parentCuisine?.parent && filters.cuisines!.includes(parentCuisine.parent)) return true;
        }
        return false;
      });
      if (!matchesCuisine) return false;
    }

    if (filters.techniques && filters.techniques.length > 0) {
      const matchesTechnique = recipe.techniques.some((t) =>
        filters.techniques!.includes(t.id)
      );
      if (!matchesTechnique) return false;
    }

    if (filters.stations && filters.stations.length > 0) {
      if (!filters.stations.includes(recipe.station.id)) return false;
    }

    if (filters.ingredients && filters.ingredients.length > 0) {
      const matchesIngredient = recipe.ingredients.some((i) =>
        filters.ingredients!.includes(i.name.toLowerCase())
      );
      if (!matchesIngredient) return false;
    }

    if (filters.allergens && filters.allergens.length > 0) {
      const hasAllergen = recipe.allergens.some((a) =>
        filters.allergens!.includes(a.id)
      );
      if (hasAllergen) return false;
    }

    if (filters.chefs && filters.chefs.length > 0) {
      if (!filters.chefs.includes(recipe.chef.id)) return false;
    }

    if (filters.menuContext && filters.menuContext.length > 0) {
      const matchesContext = recipe.menuContext.some((c) =>
        filters.menuContext!.includes(c)
      );
      if (!matchesContext) return false;
    }

    if (filters.sustainability) {
      const { lowCarbon, seasonal, zeroWaste } = filters.sustainability;
      if (lowCarbon && !recipe.sustainability.lowCarbon) return false;
      if (seasonal && !recipe.sustainability.seasonal) return false;
      if (zeroWaste && !recipe.sustainability.zeroWaste) return false;
    }

    if (filters.foodCostRange) {
      const [min, max] = filters.foodCostRange;
      if (recipe.foodCostPercent < min || recipe.foodCostPercent > max) return false;
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) return false;
    }

    return true;
  });
}

export function sortRecipes(
  recipes: Recipe[],
  sortBy: 'rating' | 'recent' | 'trending' | 'difficulty'
): Recipe[] {
  const sorted = [...recipes];

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'recent':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'trending':
      return sorted.sort((a, b) => b.reviews.length - a.reviews.length);
    case 'difficulty':
      const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
      return sorted.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
    default:
      return sorted;
  }
}

export function getSustainabilityColor(score: number): string {
  if (score >= 80) return 'bg-green-50 text-green-700';
  if (score >= 60) return 'bg-blue-50 text-blue-700';
  if (score >= 40) return 'bg-yellow-50 text-yellow-700';
  return 'bg-red-50 text-red-700';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
}

export function formatServings(servings: number, yield_?: string): string {
  if (yield_) return yield_;
  return `Serves ${servings}`;
}

export function calculateTotalTime(prepTime: number, cookTime: number): number {
  return prepTime + cookTime;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getMichelinStars(accolades: any[]): number {
  const michelin = accolades.find((a) => a.type === 'michelin');
  return michelin?.stars || 0;
}

export function hasAccolade(accolades: any[], type: string): boolean {
  return accolades.some((a) => a.type === type);
}

export function getAccoladeYear(accolades: any[], type: string): number | null {
  const accolade = accolades.find((a) => a.type === type);
  return accolade?.year || null;
}

export function calculateWasteReduction(
  previousWeight: number,
  currentWeight: number
): number {
  if (previousWeight === 0) return 0;
  return ((previousWeight - currentWeight) / previousWeight) * 100;
}
