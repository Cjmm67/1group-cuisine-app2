import React from 'react';

interface SchemaMarkupProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

/* ── Organization schema (site-wide) ── */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '1-Group Singapore',
  alternateName: '1-CUISINESG',
  url: 'https://1-groupculinary.com',
  logo: 'https://1-groupculinary.com/1group-logo.png',
  description:
    '1-Group is Singapore\'s leading premium hospitality group, operating 24 award-winning restaurants, rooftop bars, and event venues across Singapore and Malaysia. From the iconic 1-Altitude at Level 63 to the sky garden dining of 1-Arden at CapitaSpring, 1-Group creates extraordinary dining experiences in landmark locations.',
  foundingDate: '2006',
  numberOfEmployees: { '@type': 'QuantitativeValue', value: 800 },
  areaServed: {
    '@type': 'Country',
    name: 'Singapore',
  },
  sameAs: [
    'https://www.1-group.sg',
    'https://www.instagram.com/1groupsg/',
    'https://www.facebook.com/1groupsg/',
    'https://www.linkedin.com/company/1-group/',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'reservations',
    url: 'https://www.1-group.sg',
    areaServed: 'SG',
    availableLanguage: ['English', 'Chinese'],
  },
  parentOrganization: {
    '@type': 'Organization',
    name: '1-Group Singapore',
  },
};

/* ── WebSite schema (home page) ── */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '1-CUISINESG',
  url: 'https://1-groupculinary.com',
  description:
    'Professional culinary platform for 1-Group Singapore — featuring recipes, chef profiles, and masterclasses from Singapore\'s leading hospitality group operating venues including 1-Altitude, Kaarla, Oumi, MONTI, and Sol & Luna.',
  publisher: {
    '@type': 'Organization',
    name: '1-Group Singapore',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://1-groupculinary.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

/* ── Restaurant schemas for 1-Group venues ── */
export const venueSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: '1-Altitude Gallery & Bar',
    description:
      "1-Altitude is Singapore's highest al fresco rooftop bar, situated at Level 63 of One Raffles Place, 282 metres above sea level, offering 360-degree panoramic views of Marina Bay and the CBD skyline.",
    url: 'https://www.1-group.sg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Level 63, One Raffles Place, 1 Raffles Place',
      addressLocality: 'Singapore',
      postalCode: '048616',
      addressCountry: 'SG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 1.2839, longitude: 103.8515 },
    servesCuisine: 'Craft cocktails, sharing plates',
    priceRange: 'SGD 22++ – SGD 80++',
    hasMap: 'https://maps.google.com/?q=1-Altitude+Singapore',
    image: 'https://www.1-group.sg/s/1-Altitude.jpg',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'rooftop bar Singapore, highest bar Singapore, sky bar CBD, Raffles Place bar, panoramic view bar',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Kaarla',
    description:
      "Kaarla is Singapore's premier modern Australian live-fire restaurant at CapitaSpring, specialising in wood-grilled premium cuts and produce-driven seasonal menus crafted by the 1-Group culinary team.",
    url: 'https://kaarla-oumi.sg/kaarla/',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Level 51, CapitaSpring, 88 Market Street',
      addressLocality: 'Singapore',
      postalCode: '048948',
      addressCountry: 'SG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 1.2833, longitude: 103.8498 },
    servesCuisine: 'Modern Australian, live-fire, wood grill',
    priceRange: 'SGD 45++ – SGD 200++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'modern Australian restaurant Singapore, live fire restaurant Singapore, wood grill Singapore',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Oumi',
    description:
      "Oumi is a contemporary Japanese restaurant in Singapore's CBD at CapitaSpring, serving seasonal omakase menus from SGD 180++ that reflect traditional Japanese kappo techniques with premium imported produce.",
    url: 'https://kaarla-oumi.sg/oumi/',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Level 51, CapitaSpring, 88 Market Street',
      addressLocality: 'Singapore',
      postalCode: '048948',
      addressCountry: 'SG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 1.2833, longitude: 103.8498 },
    servesCuisine: 'Japanese, omakase, kappo',
    priceRange: 'SGD 180++ per person',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Japanese omakase Singapore, contemporary Japanese restaurant Singapore, omakase CBD',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'MONTI',
    description:
      'MONTI is an award-winning Italian restaurant at 1-Pavilion in Fullerton, Singapore, helmed by Culinary Associate Director Chef Felix Chong. Recognised by the Italian Chamber of Commerce with the Ospitalita Italiana certification and two Temples by the Accademia Italiana Della Cucina.',
    url: 'https://www.monti.sg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 Fullerton Road, #02-02, 1-Pavilion',
      addressLocality: 'Singapore',
      postalCode: '049213',
      addressCountry: 'SG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 1.2862, longitude: 103.8545 },
    servesCuisine: 'Italian, modern European',
    priceRange: 'SGD 60++ – SGD 200++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Italian restaurant Singapore, fine dining Italian Singapore, Marina Bay restaurant',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Sol & Luna',
    description:
      'Sol & Luna is a Spanish-Mediterranean restaurant in Singapore, serving authentic tapas, paella, and sangria in an elevated setting as part of the 1-Group hospitality portfolio.',
    url: 'https://www.1-group.sg',
    servesCuisine: 'Spanish, Mediterranean',
    priceRange: 'SGD 40++ – SGD 120++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Spanish restaurant Singapore, tapas Singapore, Mediterranean restaurant CBD, paella Singapore',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'UNA at The Alkaff Mansion',
    description:
      "UNA is a Spanish restaurant at The Alkaff Mansion, Singapore, helmed by Chef Tom Kung and advised by Barcelona-based chefs Soledad Nardelli and Diego Grimbery. UNA holds the 'Restaurants from Spain' ICEX certification.",
    url: 'https://www.una.sg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '10 Telok Blangah Green, The Alkaff Mansion',
      addressLocality: 'Singapore',
      postalCode: '109178',
      addressCountry: 'SG',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 1.2729, longitude: 103.8153 },
    servesCuisine: 'Spanish, parrilla, tapas',
    priceRange: 'SGD 50++ – SGD 200++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Spanish restaurant Singapore, Alkaff Mansion restaurant, parrilla Singapore',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Fire Restaurant',
    description:
      'Fire Restaurant at 1-Atico is an Argentine-inspired open-flame dining concept in Singapore, featuring Culinary Advisor Soledad Nardelli — named Chef of the Future 2009 and Argentine Cuisine Ambassador.',
    url: 'https://firerestaurant.sg',
    servesCuisine: 'Argentine, open-fire, asado',
    priceRange: 'SGD 60++ – SGD 250++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Argentine restaurant Singapore, asado Singapore, fire cooking Singapore',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'FLNT',
    description:
      "FLNT is Singapore's sole Nikkei-influenced restaurant and bar at 1-Atico, serving a progressive union of Japanese culinary traditions with Peruvian ingredients, helmed by Executive Chef Lamley Chua.",
    url: 'https://www.flnt.sg',
    servesCuisine: 'Nikkei, Japanese-Peruvian',
    priceRange: 'SGD 50++ – SGD 180++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'Nikkei restaurant Singapore, Japanese Peruvian Singapore, fusion restaurant Singapore',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Camille',
    description:
      'Camille is a modern French bistro at 1-Flowerhill, Sentosa, offering all-day dining from breakfast through dinner in a botanical garden setting as part of the 1-Group hospitality portfolio.',
    url: 'https://camillerestaurant.sg',
    servesCuisine: 'French bistro, all-day dining',
    priceRange: 'SGD 30++ – SGD 120++',
    parentOrganization: { '@type': 'Organization', name: '1-Group Singapore' },
    keywords: 'French restaurant Singapore, French bistro Singapore, all-day dining Singapore',
  },
];

/* ── FAQ schema generator ── */
export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/* ── Recipe schema generator ── */
export function buildRecipeSchema(recipe: {
  title: string;
  description: string;
  chef: string;
  restaurant?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  cuisines?: string[];
  ingredients?: Array<{ name: string; weight?: number; unit?: string }>;
  steps?: Array<{ instruction: string }>;
  rating?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    author: {
      '@type': 'Person',
      name: recipe.chef,
      worksFor: {
        '@type': 'Organization',
        name: '1-Group Singapore',
      },
    },
    ...(recipe.image && { image: recipe.image }),
    ...(recipe.prepTime && { prepTime: `PT${recipe.prepTime}M` }),
    ...(recipe.cookTime && { cookTime: `PT${recipe.cookTime}M` }),
    ...(recipe.servings && { recipeYield: `${recipe.servings} servings` }),
    ...(recipe.cuisines && { recipeCuisine: recipe.cuisines.map((c) => c) }),
    ...(recipe.ingredients && {
      recipeIngredient: recipe.ingredients.map(
        (i) => `${i.weight || ''} ${i.unit || ''} ${i.name}`.trim()
      ),
    }),
    ...(recipe.steps && {
      recipeInstructions: recipe.steps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        text: s.instruction,
      })),
    }),
    ...(recipe.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: recipe.rating,
        bestRating: 5,
        ratingCount: 100,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: '1-Group Singapore',
      url: 'https://1-groupculinary.com',
    },
  };
}

/* ── Person/Chef schema generator ── */
export function buildChefSchema(chef: {
  name: string;
  bio: string;
  avatar?: string;
  restaurant?: string;
  cuisine?: string[];
  accolades?: Array<{ title: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: chef.name,
    description: chef.bio,
    ...(chef.avatar && { image: chef.avatar }),
    jobTitle: 'Chef',
    worksFor: {
      '@type': 'Organization',
      name: '1-Group Singapore',
    },
    ...(chef.restaurant && {
      workLocation: {
        '@type': 'Restaurant',
        name: chef.restaurant,
      },
    }),
    ...(chef.cuisine && { knowsAbout: chef.cuisine }),
  };
}
