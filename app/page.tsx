'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChefCard } from '@/components/chef/ChefCard';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_RECIPES, MOCK_CHEFS, MOCK_MASTERCLASSES } from '@/lib/mockData';
import { ArrowRight, Flame, Users, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  const featuredRecipes = MOCK_RECIPES.slice(0, 3);
  const featuredChefs = MOCK_CHEFS.slice(0, 4);
  const featuredMasterclasses = MOCK_MASTERCLASSES.slice(0, 3);

  const stats = [
    { icon: BookOpen, label: 'Recipes', value: '500+' },
    { icon: Users, label: 'Chefs', value: '50+' },
    { icon: Flame, label: 'Masterclasses', value: '200+' },
    { icon: TrendingUp, label: 'Active Users', value: '10k+' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-charcoal-800 via-charcoal-700 to-gold-700 text-white">
        <div className="max-w-4xl">
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Professional Culinary Platform
          </h1>
          <p className="text-xl sm:text-2xl text-warm-100 mb-8 max-w-2xl">
            Connect with world-class chefs, explore innovative recipes, and master culinary techniques with 1-Group Cuisine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/recipes">
              <Button variant="primary" size="lg">
                Explore Recipes <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/chefs">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Browse Chefs <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center"
            >
              <Icon className="w-8 h-8 text-gold-500 mx-auto mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-charcoal-800 mb-1">
                {stat.value}
              </p>
              <p className="text-charcoal-600 text-sm font-medium">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* Featured Recipes */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-playfair text-4xl font-bold text-charcoal-800">
            Featured Recipes
          </h2>
          <Link href="/recipes">
            <Button variant="ghost">
              View All <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* Featured Chefs */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-playfair text-4xl font-bold text-charcoal-800">
            Renowned Chefs
          </h2>
          <Link href="/chefs">
            <Button variant="ghost">
              View All <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredChefs.map((chef) => (
            <ChefCard key={chef.id} chef={chef} />
          ))}
        </div>
      </section>

      {/* Featured Masterclasses */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-playfair text-4xl font-bold text-charcoal-800">
            Masterclasses
          </h2>
          <Link href="/masterclasses">
            <Button variant="ghost">
              View All <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMasterclasses.map((masterclass) => (
            <MasterclassCard key={masterclass.id} masterclass={masterclass} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-lg p-12 text-white text-center">
        <h2 className="font-playfair text-4xl font-bold mb-4">Ready to elevate your culinary skills?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of professional chefs and culinary students on 1-Group Cuisine.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-white text-gold-600 hover:bg-warm-100">
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  );
}
