'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_RECIPES } from '@/lib/mockData';
import { slugify } from '@/lib/utils';

/* ────────────────────────────────────────
   Collect all recipes that have real images
   ──────────────────────────────────────── */
function getDishShowcaseItems() {
  return MOCK_RECIPES
    .filter((r) => r.image && r.image.trim() !== '')
    .map((r) => ({
      id: r.id,
      title: r.title,
      image: r.image,
      chefName: r.chef?.name ?? 'Unknown Chef',
      chefAvatar: r.chef?.avatar ?? '',
      venue: r.restaurant ?? r.chef?.restaurant ?? '',
      slug: slugify(r.title),
      cuisines: r.cuisines?.map((c: any) => c.name).slice(0, 2) ?? [],
    }));
}

/* ────────────────────────────────────────
   Single dish card
   ──────────────────────────────────────── */
function DishCard({
  dish,
  index,
  onHover,
  onLeave,
}: {
  dish: ReturnType<typeof getDishShowcaseItems>[0];
  index: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <Link
      href={`/recipes/${dish.slug}`}
      className="dish-showcase-card group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="dish-showcase-img-wrap">
        <img
          src={dish.image}
          alt={dish.title}
          loading="lazy"
          className="dish-showcase-img"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-50 group-hover:opacity-85 transition-opacity duration-500" />

        {/* Gold shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-out pointer-events-none" />

        {/* Chef avatar — top left */}
        {dish.chefAvatar && (
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-400 transform -translate-y-2 group-hover:translate-y-0">
            <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg">
              <img src={dish.chefAvatar} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Cuisine tags — top right */}
        {dish.cuisines.length > 0 && (
          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
            {dish.cuisines.map((c: string, i: number) => (
              <span key={i} className="text-[10px] tracking-wider uppercase font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Bottom text */}
        <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
          <p className="text-white text-base font-semibold leading-snug line-clamp-2 mb-1 drop-shadow-lg">
            {dish.title}
          </p>
          <div className="flex items-center gap-2 overflow-hidden">
            <p className="text-gold-400 text-xs font-medium tracking-wide uppercase truncate">
              {dish.chefName}
            </p>
            {dish.venue && (
              <>
                <span className="text-gray-400 text-[8px]">&bull;</span>
                <p className="text-gray-300 text-xs truncate">{dish.venue}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────
   Main component — single strip
   ──────────────────────────────────────── */
export function FeaturedDishShowcase() {
  const allDishes = useMemo(() => getDishShowcaseItems(), []);
  const [hovered, setHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Deterministic sort for consistent order
  const dishes = useMemo(() => {
    const items = [...allDishes];
    items.sort((a, b) => {
      const ha = a.title.charCodeAt(0) * 31 + a.title.length;
      const hb = b.title.charCodeAt(0) * 31 + b.title.length;
      return ha - hb;
    });
    return items;
  }, [allDishes]);

  // Intersection observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (allDishes.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`dish-showcase-section ${isVisible ? 'dish-showcase-visible' : ''}`}
    >
      {/* Header */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-8">
        <div className="dish-showcase-header">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold-600/30" />
            <span className="text-gold-700 text-[10px] font-semibold tracking-[0.25em] uppercase">
              From Our Kitchens
            </span>
            <div className="h-px w-8 bg-gold-600/30" />
          </div>
          <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold tracking-tight">
            Signature Dishes
          </h2>
          <p className="text-gray-500 text-sm mt-1.5 max-w-md">
            A curated showcase of creations from our chefs — including dishes reimagined through our Recipe Adaptation Engine.
          </p>
        </div>
      </div>

      {/* Single scrolling track */}
      <div
        className="dish-showcase-track-container"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setHoveredCard(null); }}
      >
        <div className={`dish-showcase-track dish-showcase-track-left ${hovered ? 'paused' : ''}`}>
          {[...dishes, ...dishes, ...dishes].map((dish, i) => (
            <DishCard
              key={`d-${i}`}
              dish={dish}
              index={i % dishes.length}
              onHover={() => setHoveredCard(dish.id)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 text-center pt-10 pb-14">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gold-700 hover:text-gold-800 text-sm font-medium tracking-wide transition-colors group"
        >
          <span>Explore All Recipes</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Edge fade masks — white */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />
    </section>
  );
}
