export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'chef' | 'student' | 'supplier' | 'admin';
  createdAt: Date;
}

export interface Cuisine {
  id: string;
  name: string;
  region?: string;
  parent?: string;
  children?: Cuisine[];
}

export interface Technique {
  id: string;
  name: string;
  category: 'dry_heat' | 'wet_heat' | 'modernist' | 'preservation' | 'pastry';
  description: string;
}

export interface KitchenStation {
  id: string;
  name: 'Garde Manger' | 'Saucier' | 'Rôtisseur' | 'Poissonnier' | 'Entremetier' | 'Pâtissier' | 'Boulanger' | 'Tournant';
  description: string;
}

export interface Allergen {
  id: string;
  name: string;
  code: string;
}

export interface Accolade {
  type: 'michelin' | 'fifty_best' | 'guide' | 'award';
  stars?: number;
  year: number;
  restaurant?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  weight: number;
  unit: 'g' | 'ml' | 'tbsp' | 'tsp' | 'pcs' | 'oz' | 'lb' | 'l';
  allergens: string[];
  group: 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'oil' | 'seasoning' | 'other';
  sustainability: 'low_carbon' | 'seasonal' | 'local' | 'organic' | 'standard';
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  techniques: string[];
  station: KitchenStation | null;
  duration?: number;
}

export interface Chef {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  cuisine: string[];
  accolades: Accolade[];
  restaurant?: string;
  website?: string;
  yearsExperience: number;
  specialties: string[];
  recipes: Recipe[];
  masterclasses: Masterclass[];
  createdAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  chef: Chef;
  restaurant?: string;
  description: string;
  cuisines: Cuisine[];
  techniques: Technique[];
  station: KitchenStation;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prepTime: number;
  cookTime: number;
  servings: number;
  yield?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  allergens: Allergen[];
  foodCostPercent: number;
  image: string;
  menuContext: ('tasting_menu' | 'a_la_carte' | 'brunch' | 'zero_waste')[];
  sustainability: {
    lowCarbon: boolean;
    seasonal: boolean;
    zeroWaste: boolean;
    score: number;
  };
  rating: number;
  reviews: RecipeReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Masterclass {
  id: string;
  title: string;
  chef: Chef;
  description: string;
  image: string;
  videoId?: string;
  michelinLogo?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  cuisine: string[];
  duration: number;
  price: number;
  episodes: Episode[];
  rating: number;
  enrollmentCount: number;
  createdAt: Date;
}

export interface Episode {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  videoUrl?: string;
  relatedRecipeIds: string[];
}

export interface Job {
  id: string;
  title: string;
  restaurant: string;
  position: string;
  cuisine: string[];
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'executive';
  type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  postedDate: Date;
  deadline?: Date;
}

export interface Supplier {
  id: string;
  name: string;
  type: string[];
  description: string;
  logo?: string;
  location: string;
  rating: number;
  specialties: string[];
  verified: boolean;
  website?: string;
  createdAt: Date;
}

export interface WasteLog {
  id: string;
  chefId: string;
  date: Date;
  items: WasteItem[];
  notes?: string;
}

export interface WasteItem {
  id: string;
  ingredient: string;
  weight: number;
  unit: string;
  category: 'trim' | 'spoilage' | 'preparation' | 'service' | 'other';
  preventionNotes?: string;
}

export interface FilterState {
  cuisines: string[];
  techniques: string[];
  stations: string[];
  ingredients: string[];
  allergens: string[];
  chefAccolades: string[];
  menuContext: string[];
  sustainability: {
    lowCarbon: boolean;
    seasonal: boolean;
    zeroWaste: boolean;
  };
  foodCostRange: [number, number];
  difficulty: string[];
  searchQuery: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
