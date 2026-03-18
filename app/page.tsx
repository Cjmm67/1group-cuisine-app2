'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChefCard } from '@/components/chef/ChefCard';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Badge } from '@/components/ui/Badge';
import { MOCK_RECIPES, MOCK_CHEFS, MOCK_MASTERCLASSES } from '@/lib/mockData';
import { ArrowRight, Sparkles, ChefHat, GraduationCap } from 'lucide-react';

export default function Home() {
  const featuredRecipes = MOCK_RECIPES.slice(0, 6);
  const featuredChefs = MOCK_CHEFS.slice(0, 4);
  const featuredMasterclasses = MOCK_MASTERCLASSES.slice(0, 3);
  const heroRecipe = MOCK_RECIPES[0];

  const venues = [
    { name: '1-Altitude', cuisine: 'French Contemporary' },
    { name: 'Oumi', cuisine: 'Nordic' },
    { name: 'Kaarla', cuisine: 'Contemporary Asian' },
    { name: 'Sol & Luna', cuisine: 'Mediterranean' },
    { name: 'Camille', cuisine: 'Global' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 text-center">
          <p className="text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Singapore&apos;s Premier Culinary Platform</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">
            Where Culinary Excellence<br className="hidden sm:block" /> Meets Community
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Connect with world-class chefs, explore innovative recipes, and master culinary techniques.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/recipes" className="bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Explore Recipes
            </Link>
            <Link href="/chefs" className="border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm font-semibold px-6 py-3 rounded-full transition-colors">
              Browse Chefs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Recipe Hero ── */}
      {heroRecipe && heroRecipe.image && (
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 -mt-8 relative z-10">
          <Link href={`/recipes/${heroRecipe.title.toLowerCase().replace(/\s+/g, '-')}`} className="block">
            <div className="relative rounded-xl overflow-hidden aspect-[21/9] bg-gray-200 image-zoom-hover">
              <img src={heroRecipe.image} alt={heroRecipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <Badge variant="primary" size="sm" className="bg-gold-600 text-white border-0 mb-2">Featured Recipe</Badge>
                <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{heroRecipe.title}</h2>
                <p className="text-gray-300 text-sm">by {heroRecipe.chef.name}</p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: 'Discover', desc: 'Browse world-class recipes from renowned chefs and explore diverse cuisines.' },
            { icon: GraduationCap, title: 'Learn', desc: 'Master culinary techniques through detailed instructions and expert masterclasses.' },
            { icon: ChefHat, title: 'Create', desc: 'Apply your knowledge to create stunning dishes and elevate your culinary skills.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4 items-start p-5 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 1-Group Venues ── */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <h2 className="text-lg font-bold text-gray-900 mb-5 text-center">1-Group Venues</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {venues.map((v) => (
              <div key={v.name} className="bg-white border border-gray-200 rounded-lg px-5 py-3 text-center hover:border-gold-300 hover:shadow-sm transition-all">
                <p className="font-semibold text-sm text-gray-900">{v.name}</p>
                <p className="text-xs text-gray-500">{v.cuisine}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Recipes ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Latest Recipes</h2>
          <Link href="/recipes" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* ── Chefs ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Renowned Chefs</h2>
            <Link href="/chefs" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Masterclasses ── */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Masterclasses</h2>
          <Link href="/masterclasses" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredMasterclasses.map((mc) => (
            <MasterclassCard key={mc.id} masterclass={mc} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to elevate your culinary skills?</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">Join thousands of professional chefs and culinary students on 1-Group Cuisine.</p>
          <Link href="/register" className="inline-block bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
