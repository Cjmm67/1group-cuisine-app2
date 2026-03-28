'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_RECIPES, MOCK_CHEFS } from '@/lib/mockData';
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
   Single dish card in the scroll track
   ──────────────────────────────────────── */
function DishCard({
  dish,
  index,
  isHovered,
  onHover,
  onLeave,
}: {
  dish: ReturnType<typeof getDishShowcaseItems>[0];
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <Link
      href={`/recipes/${dish.slug}`}
      className="dish-showcase-card group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image container */}
      <div className="dish-showcase-img-wrap">
        <img
          src={dish.image}
          alt={dish.title}
          loading="lazy"
          className="dish-showcase-img"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Gold shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/8 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-out pointer-events-none" />

        {/* Chef avatar badge — top left */}
        {dish.chefAvatar && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-400 transform -translate-y-2 group-hover:translate-y-0">
            <div className="w-8 h-8 rounded-full border-2 border-gold-500/60 overflow-hidden shadow-lg">
              <img src={dish.chefAvatar} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Cuisine tags — top right */}
        {dish.cuisines.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
            {dish.cuisines.map((c: string, i: number) => (
              <span key={i} className="text-[9px] tracking-wider uppercase font-semibold text-gold-300 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Bottom text info */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
          <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-0.5 drop-shadow-lg">
            {dish.title}
          </p>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <p className="text-gold-400 text-[10px] font-medium tracking-wide uppercase truncate">
              {dish.chefName}
            </p>
            {dish.venue && (
              <>
                <span className="text-gray-500 text-[8px]">•</span>
                <p className="text-gray-400 text-[10px] truncate">{dish.venue}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────
   Main component
   ──────────────────────────────────────── */
export function FeaturedDishShowcase() {
  const allDishes = useMemo(() => getDishShowcaseItems(), []);
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Split into two tracks — shuffle for variety
  const shuffled = useMemo(() => {
    const items = [...allDishes];
    // Deterministic shuffle based on title length so it's consistent
    items.sort((a, b) => {
      const ha = a.title.charCodeAt(0) * 31 + a.title.length;
      const hb = b.title.charCodeAt(0) * 31 + b.title.length;
      return ha - hb;
    });
    return items;
  }, [allDishes]);

  const mid = Math.ceil(shuffled.length / 2);
  const track1 = useMemo(() => shuffled.slice(0, mid), [shuffled, mid]);
  const track2 = useMemo(() => shuffled.slice(mid), [shuffled, mid]);

  // Intersection observer to trigger reveal
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
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-gold-500/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-gold-600/3 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-6">
        <div className="dish-showcase-header">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-gold-500/40" />
            <span className="text-gold-500 text-[10px] font-semibold tracking-[0.25em] uppercase">
              From Our Kitchens
            </span>
            <div className="h-px w-8 bg-gold-500/40" />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            Signature Dishes
          </h2>
          <p className="text-gray-500 text-sm mt-1.5 max-w-md">
            A curated showcase of creations from our chefs — including dishes reimagined through our Recipe Adaptation Engine.
          </p>
        </div>
      </div>

      {/* Track 1 — scrolls left */}
      <div
        className="dish-showcase-track-container"
        onMouseEnter={() => setHoveredTrack(1)}
        onMouseLeave={() => { setHoveredTrack(null); setHoveredCard(null); }}
      >
        <div className={`dish-showcase-track dish-showcase-track-left ${hoveredTrack === 1 ? 'paused' : ''}`}>
          {[...track1, ...track1, ...track1].map((dish, i) => (
            <DishCard
              key={`t1-${i}`}
              dish={dish}
              index={i % track1.length}
              isHovered={hoveredCard === `t1-${dish.id}`}
              onHover={() => setHoveredCard(`t1-${dish.id}`)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      </div>

      {/* Track 2 — scrolls right */}
      <div
        className="dish-showcase-track-container mt-3"
        onMouseEnter={() => setHoveredTrack(2)}
        onMouseLeave={() => { setHoveredTrack(null); setHoveredCard(null); }}
      >
        <div className={`dish-showcase-track dish-showcase-track-right ${hoveredTrack === 2 ? 'paused' : ''}`}>
          {[...track2, ...track2, ...track2].map((dish, i) => (
            <DishCard
              key={`t2-${i}`}
              dish={dish}
              index={i % track2.length}
              isHovered={hoveredCard === `t2-${dish.id}`}
              onHover={() => setHoveredCard(`t2-${dish.id}`)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 text-center pt-8 pb-12">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium tracking-wide transition-colors group"
        >
          <span>Explore All Recipes</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-gray-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-gray-950 to-transparent z-20 pointer-events-none" />

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden z-30">
        <div className="shimmer h-full" />
      </div>
    </section>
  );
}
