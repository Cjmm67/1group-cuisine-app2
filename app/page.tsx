'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChefCard } from '@/components/chef/ChefCard';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Badge } from '@/components/ui/Badge';
import { SchemaMarkup, websiteSchema, venueSchemas, buildFAQSchema } from '@/components/seo/SchemaMarkup';
import { MOCK_RECIPES, MOCK_CHEFS, MOCK_MASTERCLASSES } from '@/lib/mockData';
import { slugify } from '@/lib/utils';
import { ArrowRight, Sparkles, ChefHat, GraduationCap } from 'lucide-react';
import { MotionReveal, MotionStagger } from '@/components/motion/MotionReveal';

const homeFAQs = buildFAQSchema([
  {
    question: 'What restaurants does 1-Group operate in Singapore?',
    answer: '1-Group Singapore operates 24 venues across Singapore and Malaysia, including 1-Altitude (Singapore\'s highest rooftop bar at Level 63, One Raffles Place), Kaarla (modern Australian live-fire dining at CapitaSpring), Oumi (Japanese omakase at CapitaSpring), MONTI (award-winning Italian at 1-Pavilion), Sol & Luna (Spanish-Mediterranean), UNA at The Alkaff Mansion, Fire Restaurant, FLNT (Nikkei), and Camille (French bistro at 1-Flowerhill).',
  },
  {
    question: 'Where is 1-Altitude located in Singapore?',
    answer: '1-Altitude is located at Level 63 of One Raffles Place, 1 Raffles Place, Singapore 048616. Standing 282 metres above sea level, it is Singapore\'s highest al fresco rooftop bar, offering 360-degree panoramic views of Marina Bay, the CBD skyline, and Sentosa.',
  },
  {
    question: 'Does 1-Group cater for weddings and corporate events?',
    answer: '1-Group provides premium wedding and corporate event services across its venue portfolio. Venues accommodate 20 to 300+ guests, with full F&B by 1-Group\'s culinary teams, dedicated event management, and customisable menus for Western and Chinese-style celebrations. Popular wedding venues include 1-Altitude (skyline views), 1-Arden (sky garden), and 1-Flowerhill (botanical setting).',
  },
  {
    question: 'How do I make a reservation at 1-Group venues?',
    answer: 'Reservations at 1-Group venues can be made through the 1-Group website at 1-group.sg, via the SevenRooms reservation system, or by contacting individual venues directly. Advance booking is recommended for weekend evenings and special occasions.',
  },
  {
    question: 'What type of cuisine does Oumi serve?',
    answer: 'Oumi serves contemporary Japanese kappo cuisine at Level 51 of CapitaSpring, Singapore. Helmed by Executive Chef Lamley Chua, the restaurant offers seasonal omakase menus from SGD 180++ per person, featuring traditional Japanese techniques with premium produce sourced from Japan and Australia.',
  },
]);

export default function Home() {
  const featuredRecipes = MOCK_RECIPES.slice(0, 6);
  const featuredChefs = MOCK_CHEFS.slice(0, 4);
  const featuredMasterclasses = MOCK_MASTERCLASSES.slice(0, 3);
  const heroRecipe = MOCK_RECIPES[0];

  const venues = [
    { name: '1-Arden', desc: 'Rooftop Bar, CapitaSpring', url: 'https://www.1-group.sg/1arden' },
    { name: '1-Altitude Coast', desc: 'Beachfront Bar & Dining', url: 'https://www.1-group.sg/1altitudecoast' },
    { name: '1-Altitude Melaka', desc: 'Rooftop Lounge, Malaysia', url: 'https://www.1-group.sg/1altitudemelaka' },
    { name: '1-Atico', desc: 'Sky Lounge, CapitaSpring', url: 'https://www.1-group.sg/1atico' },
    { name: '1-Flowerhill', desc: 'Garden Dining & Events', url: 'https://www.1-group.sg/1flowerhill' },
    { name: '1-Alfaro', desc: 'Heritage Bar & Kitchen', url: 'https://www.1-group.sg/1alfaro' },
    { name: 'MONTI', desc: 'Italian, Fullerton Pavilion', url: 'https://www.monti.sg' },
    { name: 'The Riverhouse', desc: 'Clarke Quay Heritage', url: 'https://www.1-group.sg/theriverhouse' },
    { name: 'The Summerhouse', desc: 'Seletar Aerospace Park', url: 'https://www.1-group.sg/thesummerhouse' },
    { name: 'The Garage', desc: 'Botanic Gardens', url: 'https://www.1-group.sg/thegarage' },
    { name: 'Alkaff Mansion', desc: 'Heritage Estate, Telok Blangah', url: 'https://www.1-group.sg/alkaff' },
  ];

  return (
    <div>
      {/* ── JSON-LD Schema Markup for SEO/GEO ── */}
      <SchemaMarkup data={websiteSchema} />
      <SchemaMarkup data={homeFAQs} />
      {venueSchemas.map((schema, i) => (
        <SchemaMarkup key={i} data={schema} />
      ))}

      {/* ── Hero — Staggered Text Cascade + Grain ── */}
      <section className="bg-gray-950 text-white relative overflow-hidden grain-overlay">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 text-center relative z-10">
          <div className="hero-text-line" style={{ animationDelay: '100ms' }}>
            <p className="text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">1-Group Singapore&apos;s Culinary Platform</p>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">
            <span className="hero-text-line inline-block" style={{ animationDelay: '250ms' }}>Recipes &amp; Chefs from</span>
            <br className="hidden sm:block" />
            <span className="hero-text-line inline-block" style={{ animationDelay: '400ms' }}>Singapore&apos;s Leading Hospitality Group</span>
          </h1>
          <div className="hero-text-line" style={{ animationDelay: '550ms' }}>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Connect with world-class chefs, explore innovative recipes, and master culinary techniques.
            </p>
          </div>
          <div className="hero-text-line" style={{ animationDelay: '700ms' }}>
            <div className="flex gap-3 justify-center">
              <Link href="/recipes" className="bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors btn-magnetic">
                Explore Recipes
              </Link>
              <Link href="/chefs" className="border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-semibold px-6 py-3 rounded-full transition-colors">
                Browse Chefs
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden"><div className="shimmer h-full" /></div>
      </section>

      {/* ── Featured Recipe Hero — Scale In ── */}
      {heroRecipe && heroRecipe.image && (
        <MotionReveal animation="scale-in" duration={900} delay={200}>
          <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 -mt-8 relative z-10">
            <Link href={`/recipes/${slugify(heroRecipe.title)}`} className="block">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-gray-200 image-zoom-hover group">
                <img src={heroRecipe.image} alt={heroRecipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <Badge variant="primary" size="sm" className="bg-gold-600 text-white border-0 mb-2">Featured Recipe</Badge>
                  <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{heroRecipe.title}</h2>
                  <p className="text-gray-300 text-sm">by {heroRecipe.chef.name}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out pointer-events-none" />
              </div>
            </Link>
          </section>
        </MotionReveal>
      )}

      {/* ── How It Works — Staggered ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <MotionStagger animation="fade-up" staggerDelay={120} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'Discover', desc: 'Browse world-class recipes from renowned chefs and explore diverse cuisines.', href: '/recipes' },
            { icon: GraduationCap, title: 'Learn', desc: 'Master culinary techniques through detailed instructions and expert video content.', href: '/masterclasses' },
            { icon: ChefHat, title: 'Create', desc: 'Apply your knowledge to create stunning dishes and elevate your culinary skills.', href: '/create' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="flex gap-4 items-start p-5 bg-gray-50 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all duration-300 active:scale-[0.98] group card-hover-glow">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-200 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-5 h-5 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gold-700 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </MotionStagger>
      </section>

      {/* ── Venue Marquee — Infinite Scroll ── */}
      <section className="border-y border-gray-200 bg-gray-50 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-2">
          <MotionReveal animation="fade-up" duration={600}>
            <h2 className="text-lg font-bold text-gray-900 mb-5 text-center">Our Venues</h2>
          </MotionReveal>
        </div>
        <div className="relative py-4">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="marquee-track">
            {[...venues, ...venues].map((v, i) => (
              <a key={`v-${i}`} href={v.url} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-center hover:border-gold-400 hover:shadow-md transition-all flex-shrink-0 mx-2 min-w-[170px] group">
                <p className="font-semibold text-sm text-gray-900 group-hover:text-gold-700 transition-colors whitespace-nowrap">{v.name}</p>
                <p className="text-xs text-gray-500 whitespace-nowrap">{v.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Recipes — Staggered Grid ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <MotionReveal animation="fade-up" duration={600}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Latest Recipes</h2>
            <Link href="/recipes" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </MotionReveal>
        <MotionStagger animation="fade-up" staggerDelay={100} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </MotionStagger>
      </section>

      {/* ── Chefs — Scale In ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <MotionReveal animation="fade-up" duration={600}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Renowned Chefs</h2>
              <Link href="/chefs" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 group">
                View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </MotionReveal>
          <MotionStagger animation="scale-in" staggerDelay={120} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* ── Masterclasses — Blur In ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <MotionReveal animation="blur-in" duration={700}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">1-Cheflix</h2>
            <Link href="/masterclasses" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </MotionReveal>
        <MotionStagger animation="fade-up" staggerDelay={150} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredMasterclasses.map((mc) => (
            <MasterclassCard key={mc.id} masterclass={mc} />
          ))}
        </MotionStagger>
      </section>

      {/* ── CTA — Reveal + Pulse Glow ── */}
      <section className="bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14 text-center relative z-10">
          <MotionReveal animation="fade-up" duration={800}>
            <h2 className="text-2xl font-bold mb-3">Ready to elevate your culinary skills?</h2>
          </MotionReveal>
          <MotionReveal animation="fade-up" duration={800} delay={150}>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">Join thousands of professional chefs and culinary students on 1-CUISINESG.</p>
          </MotionReveal>
          <MotionReveal animation="scale-in" duration={600} delay={300}>
            <Link href="/register" className="inline-block bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors btn-magnetic pulse-glow">
              Get Started Free
            </Link>
          </MotionReveal>
        </div>
      </section>
    </div>
  );
}
