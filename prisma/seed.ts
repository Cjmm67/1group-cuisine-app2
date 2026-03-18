import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ============================================================================
  // CUISINE TAXONOMY (3 LEVELS)
  // ============================================================================
  console.log('Creating cuisine taxonomy...')

  // Level 1: Continents
  const european = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'European',
      slug: 'european',
      level: 1,
      description: 'European culinary traditions',
    },
  })

  const asian = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Asian',
      slug: 'asian',
      level: 1,
      description: 'Asian culinary traditions',
    },
  })

  const american = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Americas',
      slug: 'americas',
      level: 1,
      description: 'North and South American culinary traditions',
    },
  })

  // Level 2: Regions
  const french = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'French',
      slug: 'french',
      level: 2,
      parentId: european.id,
      description: 'French cuisine',
    },
  })

  const italian = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Italian',
      slug: 'italian',
      level: 2,
      parentId: european.id,
      description: 'Italian cuisine',
    },
  })

  const spanish = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Spanish',
      slug: 'spanish',
      level: 2,
      parentId: european.id,
      description: 'Spanish cuisine',
    },
  })

  const nordic = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Nordic',
      slug: 'nordic',
      level: 2,
      parentId: european.id,
      description: 'Nordic cuisine',
    },
  })

  const japanese = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Japanese',
      slug: 'japanese',
      level: 2,
      parentId: asian.id,
      description: 'Japanese cuisine',
    },
  })

  const thai = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Thai',
      slug: 'thai',
      level: 2,
      parentId: asian.id,
      description: 'Thai cuisine',
    },
  })

  const chinese = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Chinese',
      slug: 'chinese',
      level: 2,
      parentId: asian.id,
      description: 'Chinese cuisine',
    },
  })

  const indian = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Indian',
      slug: 'indian',
      level: 2,
      parentId: asian.id,
      description: 'Indian cuisine',
    },
  })

  const mexican = await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Mexican',
      slug: 'mexican',
      level: 2,
      parentId: american.id,
      description: 'Mexican cuisine',
    },
  })

  // Level 3: Sub-cuisines
  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Haute Cuisine',
      slug: 'haute-cuisine',
      level: 3,
      parentId: french.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Nouvelle Cuisine',
      slug: 'nouvelle-cuisine',
      level: 3,
      parentId: french.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Piedmont',
      slug: 'piedmont',
      level: 3,
      parentId: italian.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Sicilian',
      slug: 'sicilian',
      level: 3,
      parentId: italian.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Modernist',
      slug: 'modernist',
      level: 3,
      parentId: spanish.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Basque',
      slug: 'basque',
      level: 3,
      parentId: spanish.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Sushi',
      slug: 'sushi',
      level: 3,
      parentId: japanese.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Kaiseki',
      slug: 'kaiseki',
      level: 3,
      parentId: japanese.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Street Food',
      slug: 'thai-street',
      level: 3,
      parentId: thai.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Royal Court',
      slug: 'thai-royal',
      level: 3,
      parentId: thai.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Sichuan',
      slug: 'sichuan',
      level: 3,
      parentId: chinese.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'Cantonese',
      slug: 'cantonese',
      level: 3,
      parentId: chinese.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'North Indian',
      slug: 'north-indian',
      level: 3,
      parentId: indian.id,
    },
  })

  await prisma.cuisineTaxonomy.create({
    data: {
      name: 'South Indian',
      slug: 'south-indian',
      level: 3,
      parentId: indian.id,
    },
  })

  // ============================================================================
  // TECHNIQUE TAXONOMY (5 GROUPS)
  // ============================================================================
  console.log('Creating technique taxonomy...')

  // Level 1: Categories
  const dryHeat = await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Dry Heat Cooking',
      slug: 'dry-heat',
      level: 1,
      description: 'Cooking without liquid or steam',
    },
  })

  const wetHeat = await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Wet Heat Cooking',
      slug: 'wet-heat',
      level: 1,
      description: 'Cooking with liquid or steam',
    },
  })

  const modernist = await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Modernist Techniques',
      slug: 'modernist',
      level: 1,
      description: 'Contemporary and scientific cooking methods',
    },
  })

  const preservation = await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Preservation',
      slug: 'preservation',
      level: 1,
      description: 'Food preservation and fermentation',
    },
  })

  const pastry = await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Pastry & Baking',
      slug: 'pastry',
      level: 1,
      description: 'Pastry and baking techniques',
    },
  })

  // Level 2: Techniques
  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Roasting',
      slug: 'roasting',
      level: 2,
      parentId: dryHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Grilling',
      slug: 'grilling',
      level: 2,
      parentId: dryHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Sautéing',
      slug: 'sauteing',
      level: 2,
      parentId: dryHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Frying',
      slug: 'frying',
      level: 2,
      parentId: dryHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Boiling',
      slug: 'boiling',
      level: 2,
      parentId: wetHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Steaming',
      slug: 'steaming',
      level: 2,
      parentId: wetHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Poaching',
      slug: 'poaching',
      level: 2,
      parentId: wetHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Braising',
      slug: 'braising',
      level: 2,
      parentId: wetHeat.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Sous Vide',
      slug: 'sous-vide',
      level: 2,
      parentId: modernist.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Spherification',
      slug: 'spherification',
      level: 2,
      parentId: modernist.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Foaming',
      slug: 'foaming',
      level: 2,
      parentId: modernist.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Fermentation',
      slug: 'fermentation',
      level: 2,
      parentId: preservation.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Curing',
      slug: 'curing',
      level: 2,
      parentId: preservation.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Pickling',
      slug: 'pickling',
      level: 2,
      parentId: preservation.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Lamination',
      slug: 'lamination',
      level: 2,
      parentId: pastry.id,
    },
  })

  await prisma.techniqueTaxonomy.create({
    data: {
      name: 'Tempering',
      slug: 'tempering',
      level: 2,
      parentId: pastry.id,
    },
  })

  // ============================================================================
  // SUPPLIERS
  // ============================================================================
  console.log('Creating suppliers...')

  const fruitSupplier = await prisma.supplier.create({
    data: {
      name: 'Provence Organic Fruits',
      slug: 'provence-organic-fruits',
      email: 'contact@provencefruits.fr',
      website: 'https://provencefruits.fr',
      country: 'France',
      region: 'Provence',
      certifications: ['ORGANIC', 'FAIR_TRADE'],
      avgRating: 4.8,
    },
  })

  const seafoodSupplier = await prisma.supplier.create({
    data: {
      name: 'Nordic Seafood Co',
      slug: 'nordic-seafood',
      email: 'orders@nordicseafood.se',
      website: 'https://nordicseafood.se',
      country: 'Sweden',
      certifications: ['MSC', 'CARBON_NEUTRAL'],
      avgRating: 4.9,
    },
  })

  const meatSupplier = await prisma.supplier.create({
    data: {
      name: 'Heritage Meats Italia',
      slug: 'heritage-meats-italia',
      email: 'sales@heritagemeats.it',
      website: 'https://heritagemeats.it',
      country: 'Italy',
      certifications: ['ORGANIC', 'REGENERATIVE'],
      avgRating: 4.7,
    },
  })

  // Create supplier products
  await prisma.supplierProduct.create({
    data: {
      supplierId: fruitSupplier.id,
      name: 'White Peaches',
      sku: 'WP-001',
      unit: 'kg',
      minOrder: 5,
      currentPrice: 4.5,
      isOrganic: true,
      isFairTrade: true,
      inStock: true,
      leadTimeDays: 2,
    },
  })

  await prisma.supplierProduct.create({
    data: {
      supplierId: seafoodSupplier.id,
      name: 'Turbot Fillet',
      sku: 'TURBOT-001',
      unit: 'kg',
      minOrder: 3,
      currentPrice: 28.0,
      isOrganic: false,
      inStock: true,
      leadTimeDays: 1,
    },
  })

  await prisma.supplierProduct.create({
    data: {
      supplierId: meatSupplier.id,
      name: 'Wagyu Beef Ribeye',
      sku: 'WAGYU-RB-001',
      unit: 'kg',
      minOrder: 2,
      currentPrice: 85.0,
      isOrganic: true,
      inStock: true,
      leadTimeDays: 3,
    },
  })

  // ============================================================================
  // CREATE 50 CHEF PROFILES (Top 200 List)
  // ============================================================================
  console.log('Creating chef profiles...')

  const topChefs = [
    { name: 'Massimo Bottura', restaurant: 'Osteria Francescana', city: 'Modena', country: 'Italy', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'René Redzepi', restaurant: 'Noma', city: 'Copenhagen', country: 'Denmark', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Alain Ducasse', restaurant: 'Alain Ducasse at The Dorchester', city: 'London', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Heston Blumenthal', restaurant: 'The Fat Duck', city: 'Berkshire', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Ferran Adrià', restaurant: 'elBulli', city: 'Roses', country: 'Spain', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Thomas Keller', restaurant: 'The French Laundry', city: 'Napa Valley', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Gordon Ramsay', restaurant: 'Petrus', city: 'London', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Gaggan Anand', restaurant: 'Gaggan', city: 'Bangkok', country: 'Thailand', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Joan Roca', restaurant: 'El Celler de Can Roca', city: 'Girona', country: 'Spain', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Dominique Crenn', restaurant: 'Atelier Crenn', city: 'San Francisco', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Wolfgang Puck', restaurant: 'Spago', city: 'Beverly Hills', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Alice Waters', restaurant: 'Chez Panisse', city: 'Berkeley', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 1 },
    { name: 'Daniel Boulud', restaurant: 'Daniel', city: 'New York', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Jacques Pépin', restaurant: 'Various', city: 'New York', country: 'USA', role: 'CULINARY_CONSULTANT', stars: 0 },
    { name: 'Joël Robuchon', restaurant: 'Joël Robuchon', city: 'Paris', country: 'France', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Paul Bocuse', restaurant: 'Paul Bocuse', city: 'Lyon', country: 'France', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Pierre Gagnaire', restaurant: 'Pierre Gagnaire', city: 'Paris', country: 'France', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Charlie Trotter', restaurant: 'Charlie Trotter\'s', city: 'Chicago', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Marco Pierre White', restaurant: 'Various', city: 'London', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Carme Ruscalleda', restaurant: 'Sant Pau', city: 'Barcelona', country: 'Spain', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'José Andrés', restaurant: 'Minibar', city: 'Washington DC', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Noma Chefs', restaurant: 'Noma', city: 'Copenhagen', country: 'Denmark', role: 'HEAD_CHEF', stars: 3 },
    { name: 'Grant Achatz', restaurant: 'Alinea', city: 'Chicago', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Thomas Keller', restaurant: 'Ad Hoc', city: 'Napa Valley', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 1 },
    { name: 'Quique Dacosta', restaurant: 'Quique Dacosta', city: 'Valencia', country: 'Spain', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Albert Roux', restaurant: 'Le Gavroche', city: 'London', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Alain Passard', restaurant: 'L\'Arpège', city: 'Paris', country: 'France', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Eric Ripert', restaurant: 'Le Bernardin', city: 'New York', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Patrick Payton', restaurant: 'Aureole', city: 'New York', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Emeril Lagasse', restaurant: 'Emeril\'s', city: 'New Orleans', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 1 },
    { name: 'Bobby Flay', restaurant: 'Mesa Grill', city: 'Denver', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 1 },
    { name: 'Wolfgang Puck', restaurant: 'Postrio', city: 'San Francisco', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Michael Mina', restaurant: 'Michael Mina', city: 'San Francisco', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Roy Yamaguchi', restaurant: 'Roy\'s', city: 'Honolulu', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 1 },
    { name: 'Norman Van Aken', restaurant: 'Norman\'s', city: 'Miami', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'José García', restaurant: 'Punto MX', city: 'Mexico City', country: 'Mexico', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Virgilio Martínez', restaurant: 'Central', city: 'Lima', country: 'Peru', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Gastón Acurio', restaurant: 'Astrid y Gastón', city: 'Lima', country: 'Peru', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Elena Arzak', restaurant: 'Arzak', city: 'San Sebastián', country: 'Spain', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Aníbal Velásquez', restaurant: 'Maido', city: 'Lima', country: 'Peru', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Rene Redzepi', restaurant: 'Noma', city: 'Copenhagen', country: 'Denmark', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Poul Henningsen', restaurant: 'The Test Kitchen', city: 'Cape Town', country: 'South Africa', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Jun Tanaka', restaurant: 'Konsult', city: 'London', country: 'UK', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Shinobu Namae', restaurant: 'L\'Effervescence', city: 'Tokyo', country: 'Japan', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Yoshihiro Narisawa', restaurant: 'Narisawa', city: 'Tokyo', country: 'Japan', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Jiro Ono', restaurant: 'Sukiyabashi Jiro', city: 'Tokyo', country: 'Japan', role: 'EXECUTIVE_CHEF', stars: 3 },
    { name: 'Jeanne Kelley', restaurant: 'Benu', city: 'San Francisco', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Stephanie Izard', restaurant: 'The Publican', city: 'Chicago', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
    { name: 'Niki Nakayama', restaurant: 'n/naka', city: 'Los Angeles', country: 'USA', role: 'EXECUTIVE_CHEF', stars: 2 },
  ]

  const chefs = []
  for (const chefData of topChefs) {
    const user = await prisma.user.create({
      data: {
        email: `${chefData.name.toLowerCase().replace(/\s+/g, '.')}@1group-cuisine.pro`,
        name: chefData.name,
        password: 'hashed_password_placeholder',
      },
    })

    const chef = await prisma.chefProfile.create({
      data: {
        userId: user.id,
        currentRole: chefData.role,
        yearsExperience: Math.floor(Math.random() * 40) + 10,
        michaelinStars: chefData.stars,
        michaelinYear: chefData.stars > 0 ? new Date().getFullYear() : undefined,
      },
    })

    chefs.push({ chef, user, chefData })
  }

  // ============================================================================
  // CREATE RESTAURANTS
  // ============================================================================
  console.log('Creating restaurants...')

  const restaurants = []
  for (const { chef, chefData } of chefs.slice(0, 20)) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: chefData.restaurant,
        slug: chefData.restaurant.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        city: chefData.city,
        country: chefData.country,
        michaelinStars: chefData.stars,
        seatingCapacity: 50 + Math.floor(Math.random() * 80),
        currentChefs: {
          connect: [{ id: chef.id }],
        },
      },
    })

    // Add restaurant member
    await prisma.restaurantMember.create({
      data: {
        restaurantId: restaurant.id,
        chefProfileId: chef.id,
        role: chefData.role,
        joinDate: new Date(new Date().getFullYear() - Math.floor(Math.random() * 10), 0, 1),
      },
    })

    restaurants.push(restaurant)
  }

  // ============================================================================
  // CREATE RECIPES
  // ============================================================================
  console.log('Creating professional recipes...')

  const recipeDescriptions = [
    {
      title: 'Pan-Seared Turbot with Brown Butter and Capers',
      description: 'Delicate white fish with nutty brown butter sauce',
      cuisine: 'FRENCH',
      difficulty: 'PROFESSIONAL',
      prepTime: 10,
      cookTime: 12,
      yield: 4,
      course: 'main',
    },
    {
      title: 'Risotto ai Funghi Porcini',
      description: 'Creamy Arborio rice with wild mushrooms and truffle oil',
      cuisine: 'ITALIAN',
      difficulty: 'PROFESSIONAL',
      prepTime: 15,
      cookTime: 20,
      yield: 4,
      course: 'main',
    },
    {
      title: 'Sous Vide Beef Tenderloin with Root Vegetables',
      description: 'Precision-cooked beef with modernist vegetable accompaniments',
      cuisine: 'SPANISH',
      difficulty: 'ADVANCED_PROFESSIONAL',
      prepTime: 20,
      cookTime: 90,
      yield: 6,
      course: 'main',
    },
    {
      title: 'Foie Gras Torchon with Fig Compote',
      description: 'Terrine of foie gras with house-made fig preserves',
      cuisine: 'FRENCH',
      difficulty: 'ADVANCED_PROFESSIONAL',
      prepTime: 30,
      cookTime: 0,
      yield: 8,
      course: 'appetizer',
    },
    {
      title: 'Kaiseki Omakase - Seven Courses',
      description: 'Traditional Japanese multi-course dining experience',
      cuisine: 'JAPANESE',
      difficulty: 'ADVANCED_PROFESSIONAL',
      prepTime: 45,
      cookTime: 120,
      yield: 1,
      course: 'main',
    },
    {
      title: 'Spherified Balsamic Vinegar',
      description: 'Caviar-like pearls of aged balsamic using spherification technique',
      cuisine: 'SPANISH',
      difficulty: 'R_AND_D',
      prepTime: 15,
      cookTime: 0,
      yield: 100,
      course: 'garnish',
    },
    {
      title: 'Slow-Roasted Pigeon with Cherry Gastrique',
      description: 'Game bird with acidic cherry reduction',
      cuisine: 'FRENCH',
      difficulty: 'PROFESSIONAL',
      prepTime: 20,
      cookTime: 45,
      yield: 2,
      course: 'main',
    },
    {
      title: 'Tom Yum Goong',
      description: 'Thai spiced shrimp soup with lemongrass and galangal',
      cuisine: 'THAI',
      difficulty: 'PROFESSIONAL',
      prepTime: 20,
      cookTime: 15,
      yield: 4,
      course: 'soup',
    },
  ]

  for (let i = 0; i < 25; i++) {
    const recipeData = recipeDescriptions[i % recipeDescriptions.length]
    const chefIndex = Math.floor(Math.random() * chefs.length)
    const chef = chefs[chefIndex]

    const recipe = await prisma.recipe.create({
      data: {
        userId: chef.user.id,
        title: `${recipeData.title} (${i + 1})`,
        slug: `${recipeData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-v${i + 1}`,
        description: recipeData.description,
        shortDescription: recipeData.description,
        difficulty: recipeData.difficulty,
        recipeCourse: recipeData.course,
        yieldValue: recipeData.yield,
        yieldUnit: 'portions',
        prepTimeMinutes: recipeData.prepTime,
        cookTimeMinutes: recipeData.cookTime,
        totalTimeMinutes: recipeData.prepTime + recipeData.cookTime,
        servingsMin: 1,
        servingsMax: Math.max(4, recipeData.yield),
        foodCostValue: Math.random() * 40 + 20,
        foodCostPercentage: 28 + Math.random() * 7,
        visibility: 'PRO_ONLY',
        isPublished: true,
        publishedAt: new Date(),
        scalingType: 'LINEAR',
        sustainabilityScore: 60 + Math.random() * 40,
        carbonfootprint: Math.random() * 5 + 2,
      },
    })

    // Add ingredient groups and ingredients
    const igGroup1 = await prisma.ingredientGroup.create({
      data: {
        recipeId: recipe.id,
        name: 'Main Components',
        sequence: 1,
      },
    })

    const ingredients = [
      { name: 'Turbot Fillet', quantity: 180, unit: 'g', cost: 15.5 },
      { name: 'Butter', quantity: 50, unit: 'g', cost: 1.2 },
      { name: 'Capers', quantity: 15, unit: 'g', cost: 0.8 },
      { name: 'Lemon', quantity: 0.5, unit: 'pieces', cost: 0.3 },
      { name: 'Sea Salt', quantity: 3, unit: 'g', cost: 0.1 },
    ]

    for (let j = 0; j < 3; j++) {
      const ing = ingredients[j]
      await prisma.ingredient.create({
        data: {
          recipeId: recipe.id,
          ingredientGroupId: igGroup1.id,
          name: ing.name,
          sequence: j + 1,
          quantity: ing.quantity,
          unit: ing.unit,
          unitCost: ing.cost,
          totalCost: ing.cost,
          supplierId: j === 0 ? seafoodSupplier.id : fruitSupplier.id,
        },
      })
    }

    // Add step groups
    const stepGroup = await prisma.recipeStepGroup.create({
      data: {
        recipeId: recipe.id,
        name: 'Preparation & Cooking',
        sequence: 1,
      },
    })

    // Add steps
    await prisma.recipeStep.create({
      data: {
        recipeId: recipe.id,
        stepGroupId: stepGroup.id,
        sequence: 1,
        description: 'Pat the fish dry with paper towels and season generously with salt and white pepper',
        duration: 5,
        temperature: 20,
      },
    })

    await prisma.recipeStep.create({
      data: {
        recipeId: recipe.id,
        stepGroupId: stepGroup.id,
        sequence: 2,
        description: 'Heat clarified butter in a heavy-bottomed pan over medium-high heat until shimmering',
        duration: 3,
        temperature: 160,
      },
    })

    await prisma.recipeStep.create({
      data: {
        recipeId: recipe.id,
        stepGroupId: stepGroup.id,
        sequence: 3,
        description: 'Sear the fish skin-side down for 4-5 minutes until golden and crispy',
        duration: 5,
        temperature: 180,
        isPlatingStep: false,
      },
    })

    // Add allergens
    await prisma.allergenFlag.create({
      data: {
        recipeId: recipe.id,
        allergenType: 'FISH',
        severity: 'severe',
      },
    })

    await prisma.allergenFlag.create({
      data: {
        recipeId: recipe.id,
        allergenType: 'MILK',
        severity: 'moderate',
      },
    })
  }

  // ============================================================================
  // CREATE MASTERCLASSES
  // ============================================================================
  console.log('Creating masterclasses...')

  const masterclassTitles = [
    'Advanced Plating Techniques',
    'Sous Vide Mastery',
    'French Sauce Making',
    'Japanese Knife Skills',
    'Modernist Pastry',
  ]

  for (let i = 0; i < 5; i++) {
    const chefIndex = Math.floor(Math.random() * chefs.length)
    const chef = chefs[chefIndex]

    const mc = await prisma.masterclass.create({
      data: {
        chefProfileId: chef.chef.id,
        title: masterclassTitles[i],
        slug: masterclassTitles[i].toLowerCase().replace(/\s+/g, '-'),
        description: `Learn ${masterclassTitles[i].toLowerCase()} from a world-class chef`,
        topic: masterclassTitles[i],
        level: 'ADVANCED',
        durationMinutes: 180 + i * 30,
      },
    })

    // Add episodes
    for (let j = 0; j < 4; j++) {
      await prisma.episode.create({
        data: {
          masterclassId: mc.id,
          sequence: j + 1,
          title: `Episode ${j + 1}: ${['Foundations', 'Techniques', 'Application', 'Refinement'][j]}`,
          description: `In this episode we cover the fundamentals`,
          duration: 45 * 60, // 45 minutes in seconds
          techniqueTimestamps: [
            { time: 300, techniqueName: 'Knife Cut' },
            { time: 900, techniqueName: 'Searing' },
          ],
        },
      })
    }
  }

  // ============================================================================
  // CREATE JOB LISTINGS
  // ============================================================================
  console.log('Creating job listings...')

  const jobTitles = ['Executive Chef', 'Sous Chef', 'Chef de Partie', 'Pastry Chef', 'Commis Chef']

  for (let i = 0; i < 15; i++) {
    const restaurant = restaurants[i % restaurants.length]

    await prisma.jobListing.create({
      data: {
        title: jobTitles[i % jobTitles.length],
        slug: `${restaurant.slug}-${jobTitles[i % jobTitles.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
        restaurantName: restaurant.name,
        city: restaurant.city,
        country: restaurant.country,
        position: ['EXECUTIVE_CHEF', 'SOUS_CHEF', 'CHEF_DE_PARTIE', 'PASTRY_CHEF', 'COMMIS'][i % 5],
        experienceLevel: ['JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXECUTIVE'][Math.floor(i / 3) % 4],
        yearsExperienceMin: i % 3 === 0 ? 0 : 3 + i % 10,
        yearsExperienceMax: 5 + i % 20,
        salaryMin: 30000 + i * 2000,
        salaryMax: 50000 + i * 3000,
        jobType: 'FULL_TIME',
        isActive: true,
        description: `Seeking an experienced ${jobTitles[i % jobTitles.length]} to join our kitchen team`,
        expiresAt: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // ============================================================================
  // CREATE WASTE LOG ENTRIES
  // ============================================================================
  console.log('Creating waste log entries...')

  const wasteTypes = ['PREP_WASTE', 'PLATE_WASTE', 'SPOILAGE', 'OVERPRODUCTION']

  for (const restaurant of restaurants.slice(0, 10)) {
    for (let i = 0; i < 5; i++) {
      await prisma.wasteLogEntry.create({
        data: {
          restaurantId: restaurant.id,
          wasteType: wasteTypes[i % wasteTypes.length],
          ingredient: ['Vegetable scraps', 'Trim loss', 'Spoiled produce', 'Over-portioned dish'][i % 4],
          quantity: Math.random() * 5 + 1,
          unit: 'kg',
          estimatedCost: Math.random() * 50 + 10,
          reason: 'Normal production waste',
          loggedAt: new Date(new Date().getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  console.log('✅ Database seeding completed successfully!')
  console.log(`✅ Created ${chefs.length} chef profiles`)
  console.log(`✅ Created ${restaurants.length} restaurants`)
  console.log('✅ Populated cuisines, techniques, recipes, masterclasses, jobs, and waste logs')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
