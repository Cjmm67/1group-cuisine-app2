'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChefCard } from '@/components/chef/ChefCard';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_RECIPES, MOCK_CHEFS, MOCK_MASTERCLASSES } from '@/lib/mockData';
import { ArrowRight, Flame, Users, BookOpen, TrendingUp, Sparkles, ChefHat, GraduationCap } from 'lucide-react';

export default function Home() {
  const featuredRecipes = MOCK_RECIPES.slice(0, 3);
  const featuredChefs = MOCK_CHEFS.slice(0, 4);
  const featuredMasterclasses = MOCK_MASTERCLASSES.slice(0, 3);

  const stats = [
    { icon: BookOpen, label: 'Recipes', value: '15+' },
    { icon: Users, label: 'Chefs', value: '10+' },
    { icon: Flame, label: 'Masterclasses', value: '5+' },
    { icon: TrendingUp, label: 'Active Users', value: '10k+' },
  ];

  const venues = [
    { id: 1, name: '1-Altitude', location: 'Marina Bay', cuisine: 'French Contemporary' },
    { id: 2, name: 'Oumi', location: 'CBD', cuisine: 'Nordic' },
    { id: 3, name: 'Kaarla', location: 'East Coast', cuisine: 'Contemporary Asian' },
    { id: 4, name: 'Sol & Luna', location: 'Sentosa', cuisine: 'Mediterranean' },
    { id: 5, name: 'Camille', location: 'West Coast', cuisine: 'Global' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Discover',
      description: 'Browse world-class recipes from renowned chefs and explore diverse cuisines.',
      icon: Sparkles,
    },
    {
      step: 2,
      title: 'Learn',
      description: 'Master culinary techniques through detailed instructions and expert masterclasses.',
      icon: GraduationCap,
    },
    {
      step: 3,
      title: 'Create',
      description: 'Apply your knowledge to create stunning dishes and elevate your culinary skills.',
      icon: ChefHat,
    },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-charcoal-800 via-charcoal-700 to-gold-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMzBjMzMgMCA2MCAtMjcgNjAgLTYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] bg-repeat"></div>
        <div className="relative max-w-4xl">
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Professional Culinary Platform
          </h1>
          <p className="text-xl sm:text-2xl text-warm-100 mb-8 max-w-2xl">
            Connect with world-class chefs, explore innovative recipes, and master culinary techniques with 1-Group Cuisine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/recipes">
              <Button variant="primary" size="lg" className="hover:shadow-lg transition-shadow">
                Explore Recipes <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/chefs">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 transition-all">
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
              className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-gold-200 transition-all duration-300"
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

      {/* How It Works Section */}
      <section className="border-t border-b border-gray-200 py-16 px-0">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-playfair text-4xl font-bold text-charcoal-800 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-100 mb-4">
                    <Icon className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="font-playfair text-2xl font-semibold text-charcoal-800 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured 1-Group Venues */}
      <section className="border-t border-gray-200 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-playfair text-4xl font-bold text-charcoal-800">
            Featured 1-Group Venues
          </h2>
          <Link href="/venues">
            <Button variant="ghost">
              View All <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gold-200 transition-all duration-300"
            >
              <h3 className="font-playfair text-lg font-semibold text-charcoal-800 mb-2">
                {venue.name}
              </h3>
              <p className="text-xs text-charcoal-600 mb-1">{venue.location}</p>
              <Badge variant="secondary" size="sm">{venue.cuisine}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="border-t border-gray-200 pt-16">
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
      <section className="border-t border-gray-200 pt-16">
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
      <section className="border-t border-gray-200 pt-16">
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
      <section className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-lg p-12 text-white text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-t border-gray-200 mt-16">
        <h2 className="font-playfair text-4xl font-bold mb-4">Ready to elevate your culinary skills?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of professional chefs and culinary students on 1-Group Cuisine.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-white text-gold-600 hover:bg-warm-100 transition-colors">
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  );
}
