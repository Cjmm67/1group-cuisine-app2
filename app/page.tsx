'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    { step: 1, title: 'Discover', description: 'Browse world-class recipes from renowned chefs and explore diverse cuisines.', icon: Sparkles },
    { step: 2, title: 'Learn', description: 'Master culinary techniques through detailed instructions and expert masterclasses.', icon: GraduationCap },
    { step: 3, title: 'Create', description: 'Apply your knowledge to create stunning dishes and elevate your culinary skills.', icon: ChefHat },
  ];

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gold-900/30"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative container-page py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            {/* 1-Group Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/1group-logo.png"
                alt="1-Group"
                width={80}
                height={80}
                className="rounded-xl opacity-90"
              />
            </div>
            <p className="inline-block text-gold-400 text-sm font-medium tracking-widest uppercase mb-6">
              Singapore&apos;s Premier Culinary Platform
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
              Where culinary excellence<br className="hidden sm:block" /> meets community
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with world-class chefs, explore innovative recipes, and master culinary techniques with 1-Group Cuisine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recipes">
                <Button variant="primary" size="lg" className="bg-gold-600 hover:bg-gold-700 text-white px-8">
                  Explore Recipes <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/chefs">
                <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8">
                  Browse Chefs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="container-page -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <Icon className="w-6 h-6 text-gold-500 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="container-page py-24">
        <div className="text-center mb-16">
          <p className="text-gold-600 text-sm font-medium tracking-widest uppercase mb-3">Getting Started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">How It Works</h2>
          <p className="mt-4 text-gray-500 max-w-lg mx-auto">From discovery to creation, your culinary journey starts here.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-50 border border-gold-100 mb-6">
                  <Icon className="w-8 h-8 text-gold-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Venues ─── */}
      <section className="bg-gray-50 py-20">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-gold-600 text-sm font-medium tracking-widest uppercase mb-2">Our Portfolio</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">1-Group Venues</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-gold-200 transition-all duration-200 text-center"
              >
                <h3 className="text-base font-semibold text-gray-900 mb-1">{venue.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{venue.location}</p>
                <Badge variant="secondary" size="sm">{venue.cuisine}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Recipes ─── */}
      <section className="container-page py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-600 text-sm font-medium tracking-widest uppercase mb-2">From Our Chefs</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Recipes</h2>
          </div>
          <Link href="/recipes" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* ─── Featured Chefs ─── */}
      <section className="bg-gray-50 py-24">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-gold-600 text-sm font-medium tracking-widest uppercase mb-2">World-Class Talent</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Renowned Chefs</h2>
            </div>
            <Link href="/chefs" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredChefs.map((chef) => (
              <ChefCard key={chef.id} chef={chef} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Masterclasses ─── */}
      <section className="container-page py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold-600 text-sm font-medium tracking-widest uppercase mb-2">Learn From The Best</p>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Masterclasses</h2>
          </div>
          <Link href="/masterclasses" className="text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredMasterclasses.map((masterclass) => (
            <MasterclassCard key={masterclass.id} masterclass={masterclass} />
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-gray-950">
        <div className="container-page py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Ready to elevate your culinary skills?</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Join thousands of professional chefs and culinary students on 1-Group Cuisine.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gold-600 hover:bg-gold-700 text-white px-10">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
