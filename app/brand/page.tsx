'use client';

import React, { useState, useEffect, useRef } from 'react';

/* ════════════════════════════════════════════════════════════════
   PAGE 11 — 1-GROUP 'HOUSE OF BRANDS': BRAND CAPITAL
   Art of Branding Lecture · NTU · Christopher Millar
   Brand-Academy Design System (black + gold + ivory)
   ════════════════════════════════════════════════════════════════ */

const BLK = '#1A1A1A';
const BLK2 = '#2A2A2A';
const GOLD = '#C9A96E';
const GOLD_L = '#E8D5A0';
const GOLD_D = '#A88B3D';
const IVORY = '#F5F0E8';
const IVORY_W = '#FDF8F0';
const CHAR = '#2C2C2C';
const STONE = '#8B8578';
const STONE_L = '#D4CFC7';
const SUCCESS = '#4A7C59';
const WINE = '#6b2d3b';

const VENUES = [
  { name: '1-Altitude', tag: 'Rooftop · Level 63', desc: '282m above sea level — Singapore\u2019s highest al fresco bar. Elevation IS the brand.', grad: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #2a5a8c 100%)', accent: '#4a9ae8' },
  { name: 'Kaarla', tag: 'Modern Australian · Live Fire', desc: 'Chef-led positioning. Australian coastal, live-fire precision, CapitaSpring.', grad: 'linear-gradient(135deg, #2a1a0a 0%, #5a3a1a 50%, #8a5a2a 100%)', accent: '#D4602A' },
  { name: 'Oumi', tag: 'Japanese Kappo · Omakase', desc: 'Seasonal Japanese kappo at Level 51. Restraint, precision, umami.', grad: 'linear-gradient(135deg, #0a0f1a 0%, #1a2a3a 50%, #2a3a4a 100%)', accent: '#6a8aaa' },
  { name: 'MONTI', tag: 'Italian · Fullerton Pavilion', desc: 'Award-winning Italian on the waterfront. First dates, anniversaries, celebrations.', grad: 'linear-gradient(135deg, #1a1a2a 0%, #2a3a5a 50%, #3a5a8a 100%)', accent: '#2C5F8A' },
  { name: 'Sol & Luna', tag: 'Mediterranean · Shared Plates', desc: 'Spanish-Mediterranean warmth. Sun and moon — day-to-night vibrancy.', grad: 'linear-gradient(135deg, #3a2a1a 0%, #6a4a2a 50%, #9a6a3a 100%)', accent: '#B86A3A' },
  { name: 'UNA', tag: 'Modern Italian · Alkaff Mansion', desc: 'Heritage mansion meets Italian soul. Architectural transformation as brand.', grad: 'linear-gradient(135deg, #2a1a1a 0%, #5a2a2a 50%, #8a3a3a 100%)', accent: '#8B3A3A' },
  { name: 'Fire Restaurant', tag: 'Live Fire · Argentine', desc: 'Elemental cooking. The flame is the technique, the theatre, the brand.', grad: 'linear-gradient(135deg, #2a0a0a 0%, #5a1a0a 50%, #8a2a0a 100%)', accent: '#C0392B' },
  { name: 'FLNT', tag: 'Nikkei · Contemporary', desc: 'Japanese-Peruvian fusion. Modern Asian through a progressive lens.', grad: 'linear-gradient(135deg, #0a2a1a 0%, #1a4a2a 50%, #2a6a4a 100%)', accent: '#2D6A4F' },
  { name: 'Camille', tag: 'French Bistro · 1-Flowerhill', desc: 'Parisian charm in a botanical setting. Wine bar soul, French bistro heart.', grad: 'linear-gradient(135deg, #2a1a3a 0%, #4a2a5a 50%, #6a4a7a 100%)', accent: '#6B4C8A' },
  { name: '1-Flowerhill', tag: 'Botanical Destination', desc: 'Singapore\u2019s first urban food forest. Nature IS the dining room.', grad: 'linear-gradient(135deg, #0a2a0a 0%, #1a4a1a 50%, #3a6a3a 100%)', accent: '#4A7C59' },
  { name: 'Botanico', tag: 'Garden Dining · Heritage', desc: 'At The Garage, Botanic Gardens. Heritage meets botanical elegance.', grad: 'linear-gradient(135deg, #1a2a1a 0%, #2a4a2a 50%, #4a6a4a 100%)', accent: '#5a8a5a' },
  { name: '1-Altitude Coast', tag: 'Beachfront · Day-to-Night', desc: 'Coastal energy. Beach club meets premium F&B destination.', grad: 'linear-gradient(135deg, #0a2a3a 0%, #1a4a5a 50%, #2a6a7a 100%)', accent: '#1A6B8A' },
];

const ease = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

function useCounter(target: number, duration: number, active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s: number | null = null;
    const step = (ts: number) => { if (!s) s = ts; const p = Math.min((ts - s) / duration, 1); setV(Math.round(ease(p) * target)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return v;
}

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis] as const;
}

function Reveal({ children, delay = 0, y = 30, duration = 0.8, style = {} }: { children: React.ReactNode; delay?: number; y?: number; duration?: number; style?: React.CSSProperties }) {
  const [ref, vis] = useInView(0.15);
  return (
    <div ref={ref} style={{
      transform: vis ? 'translateY(0)' : `translateY(${y}px)`,
      opacity: vis ? 1 : 0,
      transition: `all ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

function GoldLine({ width = '60px', delay = 0 }: { width?: string; delay?: number }) {
  const [ref, vis] = useInView(0.2);
  return (
    <div ref={ref} style={{
      width, height: 3, background: GOLD, borderRadius: 2,
      transformOrigin: 'left', transform: vis ? 'scaleX(1)' : 'scaleX(0)',
      transition: `transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }} />
  );
}

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.15em', color: GOLD,
    }}>{children}</div>
  );
}

function Pill({ n }: { n: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: '50%', background: BLK, color: GOLD,
      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
    }}>{n}</span>
  );
}

function VenueCard({ venue, delay = 0, compact = false }: { venue: typeof VENUES[0]; delay?: number; compact?: boolean }) {
  const [ref, vis] = useInView(0.15);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: venue.grad, borderRadius: 8,
        border: `1px solid ${hov ? GOLD : STONE_L}33`,
        overflow: 'hidden', cursor: 'default',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
        transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, border-color 0.3s`,
        minWidth: compact ? 180 : 220,
        flex: compact ? '0 0 180px' : '1 1 220px',
      }}>
      <div style={{ padding: compact ? '16px 14px' : '20px 18px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '30%', left: '30%', width: '40%', height: '40%',
          background: `radial-gradient(circle, ${venue.accent}20 0%, transparent 70%)`,
          borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none',
        }} />
        <div style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 600,
          fontSize: compact ? '0.95rem' : '1.1rem', color: '#fff',
          marginBottom: 4, position: 'relative',
        }}>{venue.name}</div>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: venue.accent, marginBottom: compact ? 6 : 10,
        }}>{venue.tag}</div>
        {!compact && (
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
          }}>{venue.desc}</div>
        )}
      </div>
    </div>
  );
}

function VenueStrip({ venues, delay = 0 }: { venues: typeof VENUES; delay?: number }) {
  return (
    <Reveal delay={delay} style={{ width: '100%' }}>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto',
        padding: '4px 0 12px', scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
      }}>
        {venues.map((v, i) => (
          <VenueCard key={v.name} venue={v} delay={delay + i * 0.08} compact />
        ))}
      </div>
    </Reveal>
  );
}

function Metric({ value, suffix = '', prefix = '', label, delay = 0 }: { value: number; suffix?: string; prefix?: string; label: string; delay?: number }) {
  const [ref, vis] = useInView(0.3);
  const count = useCounter(value, 2200, vis);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '24px 12px',
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 700, color: GOLD, lineHeight: 1,
      }}>{prefix}{count}{suffix}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.6875rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: STONE, marginTop: 10,
      }}>{label}</div>
    </div>
  );
}

function RevenueChart() {
  const [ref, vis] = useInView(0.3);
  const data = [
    { yr: "'16", v: 24 }, { yr: "'17", v: 30 }, { yr: "'18", v: 38 },
    { yr: "'19", v: 45 }, { yr: "'20", v: 32 }, { yr: "'21", v: 48 },
    { yr: "'22", v: 62 }, { yr: "'23", v: 76 }, { yr: "'24", v: 88 },
  ];
  return (
    <div ref={ref} style={{ maxWidth: 480, width: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
        {data.map((d, i) => {
          const h = (d.v / 95) * 140;
          const covid = d.yr === "'20";
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.5625rem', fontWeight: 600,
                color: GOLD, opacity: vis ? 1 : 0, transition: `opacity 0.5s ${0.8 + i * 0.08}s`,
              }}>S${d.v}M</div>
              <div style={{
                width: '100%', maxWidth: 32, borderRadius: '3px 3px 0 0',
                background: covid
                  ? `linear-gradient(to top, ${WINE}, ${WINE}88)`
                  : `linear-gradient(to top, ${GOLD}20, ${GOLD}90)`,
                height: vis ? h : 0,
                transition: `height 1.2s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s`,
                border: `1px solid ${covid ? WINE : GOLD}44`,
                borderBottom: 'none',
              }} />
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: '0.5625rem', color: STONE,
                opacity: vis ? 1 : 0, transition: `opacity 0.5s ${0.4 + i * 0.08}s`,
              }}>{d.yr}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EquityPillar({ num, title, subtitle, desc, barH, color, delay }: { num: number; title: string; subtitle: string; desc: string; barH: number; color: string; delay: number }) {
  const [ref, vis] = useInView(0.15);
  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      flex: '1 1 180px', maxWidth: 220, minWidth: 150,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(40px)',
      transition: `all 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      <Pill n={num} />
      <div style={{
        width: 3, background: `linear-gradient(to top, transparent, ${color})`,
        height: vis ? barH : 0, margin: '12px 0 16px',
        transition: `height 1.4s cubic-bezier(0.16,1,0.3,1) ${delay + 0.3}s`,
        borderRadius: 2,
      }} />
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600,
        color: IVORY, textAlign: 'center', marginBottom: 4,
      }}>{title}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.625rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: GOLD, marginBottom: 10,
      }}>{subtitle}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem',
        color: STONE, lineHeight: 1.6, textAlign: 'center',
      }}>{desc}</div>
    </div>
  );
}

export default function BrandCapitalPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: BLK, color: IVORY, minHeight: '100vh' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { 0% { opacity:0; transform:translateY(30px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px clamp(20px, 5vw, 80px)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 'clamp(300px, 50vw, 500px)', height: 'clamp(300px, 50vw, 500px)',
          background: `radial-gradient(circle, ${GOLD}08 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 700 }}>
          <div style={{ animation: 'fadeUp 0.8s ease-out 0.2s both' }}>
            <span style={{ color: GOLD, fontSize: '2rem', display: 'block', marginBottom: 8 }}>{'\u265B'}</span>
          </div>
          <div style={{ animation: 'fadeUp 0.8s ease-out 0.4s both' }}><Overline>The Art of Branding · Page 11</Overline></div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 700,
            fontSize: 'clamp(2rem, 6vw, 3.5rem)', lineHeight: 1.1,
            color: IVORY, margin: '20px 0 8px', animation: 'fadeUp 1s ease-out 0.6s both',
          }}>1-GROUP</h1>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 500,
            fontSize: 'clamp(1.25rem, 3vw, 2.25rem)', fontStyle: 'italic', color: GOLD,
            animation: 'fadeUp 1s ease-out 0.8s both',
          }}>{'\u2018'}House of Brands{'\u2019'}</div>
          <div style={{ width: 60, height: 3, background: GOLD, margin: '24px auto', animation: 'fadeUp 0.8s ease-out 1.2s both' }} />
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
            fontWeight: 500, letterSpacing: '0.06em', color: `${IVORY}cc`,
            animation: 'fadeUp 0.8s ease-out 1.4s both',
          }}>BRAND CAPITAL</div>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem',
            color: STONE, marginTop: 32, fontWeight: 300, lineHeight: 1.6,
            animation: 'fadeUp 0.8s ease-out 1.7s both', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
          }}>The accumulated intangible value that lives in consumers&apos; minds — not on a balance sheet</p>
        </div>
      </section>

      {/* ═══════ VENUE STRIP 1 ═══════ */}
      <section style={{ padding: '0 clamp(16px, 4vw, 48px) 48px' }}>
        <VenueStrip venues={VENUES.slice(0, 4)} delay={0.1} />
      </section>

      {/* ═══════ WHAT IS BRAND CAPITAL ═══════ */}
      <section style={{ background: IVORY, color: CHAR, padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <Reveal><GoldLine /></Reveal>
          <Reveal delay={0.1} style={{ marginTop: 24 }}><Overline>The Concept</Overline></Reveal>
          <Reveal delay={0.2}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              fontWeight: 600, color: CHAR, lineHeight: 1.2, margin: '12px 0 24px',
            }}>What is Brand Capital?</h2>
          </Reveal>
          <Reveal delay={0.35}>
            <div style={{
              position: 'relative', padding: '24px 24px 24px 48px',
              background: IVORY_W, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 8px 8px 0', marginBottom: 24,
            }}>
              <span style={{
                position: 'absolute', left: 12, top: 4,
                fontFamily: "'Playfair Display', serif", fontSize: '3rem',
                color: GOLD, lineHeight: 1, opacity: 0.5,
              }}>{'\u201C'}</span>
              <p style={{
                fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
                fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)', lineHeight: 1.7, color: CHAR,
              }}>
                The accumulated intangible value a company builds through reputation, consumer perception, emotional associations, and market influence — extending beyond what can be captured on a balance sheet.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: STONE }}>
              Think of it as the compounding interest on every positive interaction, every consistent delivery of promise, every memory created. For restaurant groups, brand capital operates at two levels: the individual venue brand and the group-level &lsquo;house&rsquo; brand.
            </p>
          </Reveal>
          <Reveal delay={0.65} style={{ marginTop: 24 }}>
            <div style={{
              display: 'inline-block', padding: '12px 24px',
              border: `1px solid ${GOLD}44`, borderRadius: 6, background: `${GOLD}08`,
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9375rem', fontWeight: 600, color: CHAR }}>Brand Capital = Balance Sheet Asset</span>
              <br />
              <span style={{ fontSize: '0.75rem', color: STONE }}>that happens to live in consumers&apos; heads</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Reveal><Overline>1-Group at a Glance</Overline></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 20 }}>
            <Metric value={88} prefix="S$" suffix="M" label="Revenue 2024" delay={0.15} />
            <Metric value={24} suffix="+" label="Venues Portfolio" delay={0.3} />
            <Metric value={30} suffix="+" label="F&B Concepts" delay={0.45} />
            <Metric value={267} suffix="%" label="Growth '16–'24" delay={0.6} />
          </div>
        </div>
      </section>

      {/* ═══════ VENUE STRIP 2 ═══════ */}
      <section style={{ padding: '0 clamp(16px, 4vw, 48px) 48px' }}>
        <VenueStrip venues={VENUES.slice(4, 8)} delay={0.1} />
      </section>

      {/* ═══════ WHY IT MATTERS ═══════ */}
      <section style={{ background: IVORY, color: CHAR, padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal><GoldLine /></Reveal>
          <Reveal delay={0.1} style={{ marginTop: 24 }}><Overline>Why It Matters</Overline></Reveal>
          <Reveal delay={0.2}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 600, color: CHAR, lineHeight: 1.2, margin: '12px 0 36px',
            }}>Brand Capital in Premium F&B</h2>
          </Reveal>
          {[
            { n: 1, title: 'Experience as the Product', desc: 'In F&B the brand IS the experience. Every cover served, every cocktail shaken, every event hosted is a brand-building — or brand-eroding — moment. Prestige is a critical component: brand association is the potential value a brand\u2019s name and image have to the consumer.' },
            { n: 2, title: 'Premium Pricing Power', desc: '30\u201350% higher average check vs. competitors without brand capital. A 5% increase in customer retention can drive a 25\u201395% increase in profit. Repeat customers spend roughly 67% more than new ones.' },
            { n: 3, title: 'House of Brands Dynamics', desc: 'Brand equity operates at two levels: the individual venue brand and the group-level \u2018house\u2019 brand. Architecture decisions determine where equity resides — master brand versus sub-brands — and the key challenge is avoiding equity dilution.' },
            { n: 4, title: 'Intangible Asset Valuation', desc: 'There is often a discrepancy between market value and book value, due to the valuation of intangible assets. Investments in training, R&D, and operational systems all contribute to the market premium. Brand capital is the single biggest driver of what a PE firm or acquirer pays above EBITDA multiples.' },
            { n: 5, title: 'Crisis Resilience', desc: 'Companies with strong brands performed better during the financial crash and pandemic, bouncing back faster. In Singapore\u2019s F&B landscape, groups that survived COVID were those with deep emotional connections and strong venue-level identity.' },
          ].map((item, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1} y={20}>
              <div style={{
                display: 'flex', gap: 'clamp(12px, 2vw, 24px)',
                alignItems: 'flex-start', padding: '16px 0',
                borderBottom: `1px solid ${STONE_L}66`,
              }}>
                <Pill n={item.n} />
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                    fontWeight: 600, color: CHAR, marginBottom: 6,
                  }}>{item.title}</div>
                  <div style={{ fontSize: '0.875rem', color: STONE, lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════ VENUE STRIP 3 ═══════ */}
      <section style={{ padding: '48px clamp(16px, 4vw, 48px)' }}>
        <VenueStrip venues={VENUES.slice(8, 12)} delay={0.1} />
      </section>

      {/* ═══════ FOUR PILLARS ═══════ */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Reveal><Overline>1-Group&apos;s Brand Equity</Overline></Reveal>
          <Reveal delay={0.1}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 600, color: IVORY, lineHeight: 1.2, margin: '12px 0 48px',
            }}>Four Pillars of Brand Capital</h2>
          </Reveal>
          <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 28px)', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <EquityPillar num={1} title="Salience" subtitle="Do people know you?" desc="24+ venues spanning rooftop bars, heritage mansions, and urban food forests. Multi-segment awareness from first dates to corporate events." barH={100} color={GOLD} delay={0.2} />
            <EquityPillar num={2} title="Meaning" subtitle="What do you stand for?" desc="The venue-as-story model — transforming underutilised heritage properties into experiential destinations. S$24M to S$88M proves commercial resonance." barH={130} color={GOLD_L} delay={0.35} />
            <EquityPillar num={3} title="Response" subtitle="Do people trust you?" desc="Chef-led positioning, 1-Host as Singapore's largest wedding planner, and peak-end memories from celebrations that shape future preference." barH={120} color={WINE} delay={0.5} />
            <EquityPillar num={4} title="Resonance" subtitle="Instinctive choice?" desc="Engagement at MONTI → wedding via 1-Host → corporate dinner at Kaarla → anniversary at Botanico. One ecosystem, earned loyalty." barH={150} color={SUCCESS} delay={0.65} />
          </div>
        </div>
      </section>

      {/* ═══════ REVENUE GROWTH ═══════ */}
      <section style={{ background: IVORY, color: CHAR, padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Reveal><GoldLine width="40px" /></Reveal>
          <Reveal delay={0.1} style={{ marginTop: 20 }}><Overline>Brand Capital in Action</Overline></Reveal>
          <Reveal delay={0.2}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 600, color: CHAR, lineHeight: 1.2, margin: '12px 0 8px',
            }}>Revenue Growth 2016–2024</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{ fontSize: '0.8125rem', color: STONE, fontStyle: 'italic', marginBottom: 36 }}>S$24M → S$88M — proof that meaning resonates commercially</p>
          </Reveal>
          <RevenueChart />
          <Reveal delay={0.5} style={{ marginTop: 28 }}>
            <div style={{ display: 'inline-flex', gap: 20, alignItems: 'center', padding: '10px 20px', border: `1px solid ${STONE_L}66`, borderRadius: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: `${GOLD}66` }} />
                <span style={{ fontSize: '0.6875rem', color: STONE }}>Growth</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: `${WINE}88` }} />
                <span style={{ fontSize: '0.6875rem', color: STONE }}>COVID</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ RESONANCE / GUEST JOURNEY ═══════ */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Reveal><Overline>The Ultimate Test</Overline></Reveal>
          <Reveal delay={0.1}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 600, color: IVORY, lineHeight: 1.2, margin: '12px 0 36px',
            }}>Brand Resonance:<br /><span style={{ fontStyle: 'italic', fontWeight: 400, color: GOLD }}>The Loyalty Ecosystem</span></h2>
          </Reveal>
          {[
            { venue: VENUES[3], moment: 'Engagement celebration' },
            { venue: VENUES[0], moment: 'Wedding at 1-Altitude via 1-Host' },
            { venue: VENUES[1], moment: 'Corporate dinner at Kaarla' },
            { venue: VENUES[10], moment: 'Anniversary at Botanico' },
          ].map((step, i) => (
            <Reveal key={i} delay={0.25 + i * 0.15} y={15}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 4 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 8, background: step.venue.grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${step.venue.accent}44`, flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.5rem', fontWeight: 600, color: '#fff', textAlign: 'center', padding: 4, lineHeight: 1.2 }}>{step.venue.name}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', fontWeight: 600, color: IVORY }}>{step.venue.name}</div>
                  <div style={{ fontSize: '0.75rem', color: STONE, fontStyle: 'italic' }}>{step.moment}</div>
                </div>
              </div>
              {i < 3 && <div style={{ width: 1, height: 24, background: `${GOLD}33`, margin: '0 auto' }} />}
            </Reveal>
          ))}
          <Reveal delay={1.0} style={{ marginTop: 36 }}>
            <p style={{ fontSize: '0.8125rem', color: `${IVORY}88`, fontStyle: 'italic', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
              One guest, one ecosystem, earned loyalty — choosing without ever consciously &lsquo;choosing&rsquo; because the group has already earned the right to their loyalty.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FULL VENUE GRID ═══════ */}
      <section style={{ background: IVORY, color: CHAR, padding: 'clamp(48px, 8vw, 64px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal><GoldLine /></Reveal>
          <Reveal delay={0.1} style={{ marginTop: 20 }}><Overline>The Portfolio</Overline></Reveal>
          <Reveal delay={0.2}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              fontWeight: 600, color: CHAR, margin: '12px 0 28px',
            }}>24+ Venues. 30+ Concepts. One House of Brands.</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {VENUES.map((v, i) => (
              <VenueCard key={v.name} venue={v} delay={0.1 + i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STRATEGIC IMPERATIVE ═══════ */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 80px) clamp(80px, 12vw, 120px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Reveal><Overline>The Strategic Imperative</Overline></Reveal>
          <Reveal delay={0.15}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.25rem, 3vw, 2rem)',
              fontWeight: 600, color: IVORY, lineHeight: 1.25, margin: '16px 0 24px',
            }}>Brand capital isn&apos;t a marketing metric — it&apos;s a balance sheet asset</h2>
          </Reveal>
          <Reveal delay={0.3}><GoldLine width="40px" delay={0.5} /></Reveal>
          <Reveal delay={0.4} style={{ marginTop: 24 }}>
            <p style={{ fontSize: '0.9375rem', color: `${IVORY}cc`, lineHeight: 1.7 }}>
              With S$88M revenue, 24+ venues, and the heritage transformation model, 1-Group&apos;s brand capital is likely worth multiples of the physical asset base.
            </p>
          </Reveal>
          <Reveal delay={0.55} style={{ marginTop: 20 }}>
            <p style={{ fontSize: '0.9375rem', color: `${IVORY}cc`, lineHeight: 1.7 }}>
              Framing it explicitly as <strong style={{ color: GOLD, fontWeight: 600 }}>&ldquo;brand capital building&rdquo;</strong> enables better trade-off decisions between short-term revenue extraction and long-term value creation.
            </p>
          </Reveal>
          <Reveal delay={0.7} style={{ marginTop: 36 }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', gap: 8,
              padding: '20px 36px', background: BLK2, borderRadius: 8, border: `1px solid ${GOLD}22`,
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
                fontWeight: 500, color: GOLD, fontStyle: 'italic',
              }}>&ldquo;Hosting Great Memories&rdquo;</div>
              <div style={{ fontSize: '0.6875rem', color: STONE, letterSpacing: '0.08em' }}>The brand hallmark that compounds</div>
            </div>
          </Reveal>
          <Reveal delay={0.9} style={{ marginTop: 48 }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 600, color: STONE, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              1-GROUP · HOUSE OF BRANDS · BRAND CAPITAL
            </div>
            <div style={{ width: 40, height: 2, background: GOLD, margin: '12px auto 0', opacity: 0.4 }} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
