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
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gold-900/30"></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <Badge variant="secondary" size="sm" className="bg-gold-500/10 text-gold-400 border-gold-500/20 mb-6 inline-flex">
            Singapore&apos;s Premier Culinary Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Where culinary excellence meets community
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with world-class chefs, explore innovative recipes, and master culinary techniques with 1-Group Cuisine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recipes">
              <Button variant="primary" size="lg" className="bg-gold-600 hover:bg-gold-700 text-white">
                Explore Recipes <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/chefs">
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500">
                Browse Chefs <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-gold-200 transition-all duration-200"
            >
              <Icon className="w-6 h-6 text-gold-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 tracking-tight mb-0.5 tracking-tight">
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-14">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight">How It Works</h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">From discovery to creation, your culinary journey starts here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-50 mb-5">
                  <Icon className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured 1-Group Venues */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            1-Group Venues
          </h2>
          <Link href="/venues">
            <Button variant="ghost" className="text-gray-500 hover:text-gold-600">
              View All <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gold-200 transition-all duration-200"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {venue.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{venue.location}</p>
              <Badge variant="secondary" size="sm">{venue.cuisine}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recipes */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Featured Recipes
          </h2>
          <Link href="/recipes">
            <Button variant="ghost" className="text-gray-500 hover:text-gold-600">
              View All <ArrowRight size={16} className="ml-1.5" />
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Renowned Chefs
          </h2>
          <Link href="/chefs">
            <Button variant="ghost" className="text-gray-500 hover:text-gold-600">
              View All <ArrowRight size={16} className="ml-1.5" />
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
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Masterclasses
          </h2>
          <Link href="/masterclasses">
            <Button variant="ghost" className="text-gray-500 hover:text-gold-600">
              View All <ArrowRight size={16} className="ml-1.5" />
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
      <section className="bg-gray-950 rounded-2xl p-12 sm:p-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to elevate your culinary skills?</h2>
        <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
          Join thousands of professional chefs and culinary students on 1-Group Cuisine.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-gold-600 hover:bg-gold-700 text-white">
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  );
}
