import { Cuisine, Technique, KitchenStation, Allergen } from '@/types/index';

export const CUISINES: Cuisine[] = [
  {
    id: 'european',
    name: 'European',
    children: [
      {
        id: 'french',
        name: 'French',
        parent: 'european',
        children: [
          { id: 'french_classical', name: 'Classical', parent: 'french' },
          { id: 'french_provencal', name: 'Provençal', parent: 'french' },
          { id: 'french_normandy', name: 'Normandy', parent: 'french' },
          { id: 'french_burgundy', name: 'Burgundy', parent: 'french' },
        ]
      },
      {
        id: 'italian',
        name: 'Italian',
        parent: 'european',
        children: [
          { id: 'italian_northern', name: 'Northern', parent: 'italian' },
          { id: 'italian_southern', name: 'Southern', parent: 'italian' },
          { id: 'italian_regional', name: 'Regional', parent: 'italian' },
        ]
      },
      {
        id: 'spanish',
        name: 'Spanish',
        parent: 'european',
        children: [
          { id: 'spanish_basque', name: 'Basque', parent: 'spanish' },
          { id: 'spanish_catalan', name: 'Catalan', parent: 'spanish' },
          { id: 'spanish_modernist', name: 'Modernist', parent: 'spanish' },
        ]
      },
      {
        id: 'german',
        name: 'German',
        parent: 'european',
      },
      {
        id: 'nordic',
        name: 'Nordic',
        parent: 'european',
      },
    ]
  },
  {
    id: 'asian',
    name: 'Asian',
    children: [
      {
        id: 'japanese',
        name: 'Japanese',
        parent: 'asian',
        children: [
          { id: 'japanese_kaiseki', name: 'Kaiseki', parent: 'japanese' },
          { id: 'japanese_sushi', name: 'Sushi', parent: 'japanese' },
          { id: 'japanese_contemporary', name: 'Contemporary', parent: 'japanese' },
        ]
      },
      {
        id: 'thai',
        name: 'Thai',
        parent: 'asian',
      },
      {
        id: 'indian',
        name: 'Indian',
        parent: 'asian',
        children: [
          { id: 'indian_northern', name: 'Northern', parent: 'indian' },
          { id: 'indian_southern', name: 'Southern', parent: 'indian' },
          { id: 'indian_contemporary', name: 'Contemporary', parent: 'indian' },
        ]
      },
      {
        id: 'chinese',
        name: 'Chinese',
        parent: 'asian',
      },
      {
        id: 'southeast_asian',
        name: 'Southeast Asian',
        parent: 'asian',
      },
    ]
  },
  {
    id: 'modern_fusion',
    name: 'Modern & Fusion',
    children: [
      { id: 'modernist', name: 'Modernist', parent: 'modern_fusion' },
      { id: 'molecular', name: 'Molecular', parent: 'modern_fusion' },
      { id: 'contemporary', name: 'Contemporary', parent: 'modern_fusion' },
      { id: 'progressive', name: 'Progressive', parent: 'modern_fusion' },
    ]
  },
  {
    id: 'middle_eastern',
    name: 'Middle Eastern',
  },
  {
    id: 'latin_american',
    name: 'Latin American',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian & Plant-Based',
  },
];

export const TECHNIQUES: Technique[] = [
  // Dry Heat
  {
    id: 'roasting',
    name: 'Roasting',
    category: 'dry_heat',
    description: 'Cooking with dry heat in an oven',
  },
  {
    id: 'grilling',
    name: 'Grilling',
    category: 'dry_heat',
    description: 'Cooking over direct heat on a grill',
  },
  {
    id: 'searing',
    name: 'Searing',
    category: 'dry_heat',
    description: 'High-heat cooking to create crust',
  },
  {
    id: 'pan_frying',
    name: 'Pan-Frying',
    category: 'dry_heat',
    description: 'Cooking in a shallow pan with oil',
  },
  {
    id: 'deep_frying',
    name: 'Deep-Frying',
    category: 'dry_heat',
    description: 'Cooking submerged in hot oil',
  },
  {
    id: 'baking',
    name: 'Baking',
    category: 'dry_heat',
    description: 'Cooking with dry heat in an oven',
  },
  // Wet Heat
  {
    id: 'boiling',
    name: 'Boiling',
    category: 'wet_heat',
    description: 'Cooking in rapidly bubbling liquid',
  },
  {
    id: 'simmering',
    name: 'Simmering',
    category: 'wet_heat',
    description: 'Cooking in gently bubbling liquid',
  },
  {
    id: 'braising',
    name: 'Braising',
    category: 'wet_heat',
    description: 'Browning then cooking slowly in liquid',
  },
  {
    id: 'steaming',
    name: 'Steaming',
    category: 'wet_heat',
    description: 'Cooking with steam',
  },
  {
    id: 'poaching',
    name: 'Poaching',
    category: 'wet_heat',
    description: 'Cooking gently in simmering liquid',
  },
  // Modernist
  {
    id: 'sous_vide',
    name: 'Sous Vide',
    category: 'modernist',
    description: 'Precision temperature cooking in sealed bags',
  },
  {
    id: 'spherification',
    name: 'Spherification',
    category: 'modernist',
    description: 'Creating liquid-filled spheres',
  },
  {
    id: 'foaming',
    name: 'Foaming',
    category: 'modernist',
    description: 'Creating foams and airs',
  },
  {
    id: 'gel_making',
    name: 'Gel Making',
    category: 'modernist',
    description: 'Creating gels and aspics',
  },
  {
    id: 'smoking',
    name: 'Smoking',
    category: 'modernist',
    description: 'Infusing with smoke flavors',
  },
  // Preservation
  {
    id: 'curing',
    name: 'Curing',
    category: 'preservation',
    description: 'Preserving with salt and spices',
  },
  {
    id: 'fermentation',
    name: 'Fermentation',
    category: 'preservation',
    description: 'Preserving through fermentation',
  },
  {
    id: 'pickling',
    name: 'Pickling',
    category: 'preservation',
    description: 'Preserving in acidic liquid',
  },
  {
    id: 'drying',
    name: 'Drying',
    category: 'preservation',
    description: 'Preserving through dehydration',
  },
  // Pastry
  {
    id: 'lamination',
    name: 'Lamination',
    category: 'pastry',
    description: 'Creating layers of butter and dough',
  },
  {
    id: 'tempering',
    name: 'Tempering',
    category: 'pastry',
    description: 'Controlling chocolate crystallization',
  },
  {
    id: 'proofing',
    name: 'Proofing',
    category: 'pastry',
    description: 'Allowing dough to rise',
  },
  {
    id: 'choux',
    name: 'Choux Pastry',
    category: 'pastry',
    description: 'Creating éclairs and profiteroles',
  },
];

export const KITCHEN_STATIONS: KitchenStation[] = [
  {
    id: 'garde_manger',
    name: 'Garde Manger',
    description: 'Cold station - salads, cold preparations, charcuterie',
  },
  {
    id: 'saucier',
    name: 'Saucier',
    description: 'Sauce station - sauces, hot appetizers',
  },
  {
    id: 'rotisseur',
    name: 'Rôtisseur',
    description: 'Roast station - roasted and braised meats',
  },
  {
    id: 'poissonnier',
    name: 'Poissonnier',
    description: 'Fish station - fish and seafood',
  },
  {
    id: 'entremetier',
    name: 'Entremetier',
    description: 'Vegetable station - vegetables and soups',
  },
  {
    id: 'patissier',
    name: 'Pâtissier',
    description: 'Pastry station - desserts and pastries',
  },
  {
    id: 'boulanger',
    name: 'Boulanger',
    description: 'Bread station - breads and rolls',
  },
  {
    id: 'tournant',
    name: 'Tournant',
    description: 'Swing station - backup for all stations',
  },
];

export const ALLERGENS: Allergen[] = [
  { id: 'cereals', name: 'Cereals containing gluten', code: 'gluten' },
  { id: 'crustaceans', name: 'Crustaceans', code: 'crustaceans' },
  { id: 'eggs', name: 'Eggs', code: 'eggs' },
  { id: 'fish', name: 'Fish', code: 'fish' },
  { id: 'peanuts', name: 'Peanuts', code: 'peanuts' },
  { id: 'soybeans', name: 'Soybeans', code: 'soybeans' },
  { id: 'milk', name: 'Milk (including lactose)', code: 'milk' },
  { id: 'tree_nuts', name: 'Tree nuts', code: 'tree_nuts' },
  { id: 'celery', name: 'Celery', code: 'celery' },
  { id: 'mustard', name: 'Mustard', code: 'mustard' },
  { id: 'sesame', name: 'Sesame', code: 'sesame' },
  { id: 'sulfites', name: 'Sulfites', code: 'sulfites' },
  { id: 'mollusks', name: 'Mollusks', code: 'mollusks' },
  { id: 'lupin', name: 'Lupin', code: 'lupin' },
];

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'executive'] as const;
export const JOB_TYPES = ['full_time', 'part_time', 'contract', 'temporary'] as const;
export const MENU_CONTEXTS = ['tasting_menu', 'a_la_carte', 'brunch', 'zero_waste'] as const;

export const MENU_CONTEXT_LABELS: Record<string, string> = {
  tasting_menu: 'Tasting Menu',
  a_la_carte: 'À la Carte',
  brunch: 'Brunch',
  zero_waste: 'Zero Waste',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export const SUSTAINABILITY_SCORE_RANGES = {
  excellent: { min: 80, color: 'text-green-600', bg: 'bg-green-50' },
  good: { min: 60, max: 79, color: 'text-blue-600', bg: 'bg-blue-50' },
  fair: { min: 40, max: 59, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  improving: { min: 0, max: 39, color: 'text-red-600', bg: 'bg-red-50' },
};

export const DEFAULT_FOOD_COST_RANGE: [number, number] = [0, 100];
export const MAX_FOOD_COST = 70;

export const INGREDIENT_GROUPS = [
  'protein',
  'vegetable',
  'fruit',
  'dairy',
  'grain',
  'oil',
  'seasoning',
  'other',
] as const;

export const WASTE_CATEGORIES = [
  'trim',
  'spoilage',
  'preparation',
  'service',
  'other',
] as const;

export const API_ENDPOINTS = {
  RECIPES: '/recipes',
  CHEFS: '/chefs',
  MASTERCLASSES: '/masterclasses',
  JOBS: '/jobs',
  SUPPLIERS: '/suppliers',
  WASTE_LOGS: '/waste-logs',
  AUTH: '/auth',
};
