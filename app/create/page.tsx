'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChefHat, Flame, UtensilsCrossed, BookOpen, RefreshCw, Palette, FlaskConical,
  Send, Loader2, ArrowLeft, Sparkles, X, Upload, FileText, Image as ImageIcon,
  ChevronRight, Check, Copy, CheckCheck, ArrowRight, Building2, AlertCircle, Download, Paintbrush,
} from 'lucide-react';
import { MOCK_CHEFS, MOCK_RECIPES } from '@/lib/mockData';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; fileName?: string; }
interface AttachedFile { name: string; type: 'pdf' | 'image' | 'text'; textContent?: string; base64?: string; mediaType?: string; }

interface VenueAdaptation {
  title: string; philosophy: string; yield: string; prepTime: string; cookTime: string;
  estimatedFoodCost: string; allergens: string[]; menuPlacement: string; pricePoint: string;
  components: Array<{ name: string; ingredients: string[]; method: string[]; makeAhead: string }>;
  assembly: string[]; platingRef: string; chefNotes: string[]; imagePrompt: string;
}

interface MenuAnalysis {
  venueName: string; cuisineIdentity: string; flavourRegister: string;
  techniqueFingerprint: string; heroIngredients: string[];
  platingPhilosophy: string; adaptationApproach: string;
}

interface AdaptationResult { menuAnalysis: MenuAnalysis; adaptation: VenueAdaptation; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ALL_VENUES = [
  { id: 'kaarla', name: 'Kaarla', concept: 'Modern Australian · Live Fire · Rooftop', accent: '#D4602A' },
  { id: 'oumi', name: 'Oumi', concept: 'Japanese-Influenced · Omakase', accent: '#1C2533' },
  { id: 'monti', name: 'MONTI', concept: 'Italian · Waterfront', accent: '#2C5F8A' },
  { id: 'sol-luna', name: 'Sol & Luna', concept: 'Mediterranean · Shared Plates', accent: '#B86A3A' },
  { id: 'sol-ora', name: 'Sol & Ora', concept: 'Mediterranean · Rooftop Bar', accent: '#C9842A' },
  { id: 'una', name: 'UNA', concept: 'Modern Italian · Robertson Quay', accent: '#8B3A3A' },
  { id: 'fire', name: 'Fire Restaurant', concept: 'Live Fire · Argentine-influenced', accent: '#C0392B' },
  { id: 'flnt', name: 'FLNT', concept: 'Modern Asian · Contemporary', accent: '#2D6A4F' },
  { id: 'camille', name: 'Camille', concept: 'French Bistro · Wine Bar', accent: '#6B4C8A' },
  { id: 'wildseed-cafe', name: 'Wildseed Café', concept: 'Botanical · All-Day Dining', accent: '#4A7C59' },
  { id: 'wildseed-bar', name: 'Wildseed Bar & Grill', concept: 'Botanical Garden · Grill', accent: '#3D6B47' },
  { id: '1-altitude', name: '1-Altitude', concept: 'Rooftop Bar · City Views', accent: '#1B3A2D' },
  { id: '1-altitude-coast', name: '1-Altitude Coast', concept: 'Coastal · Beach Club', accent: '#1A6B8A' },
  { id: '1-flowerhill', name: '1-Flowerhill', concept: 'Garden · Events', accent: '#7A6A2E' },
  { id: '1-arden', name: '1-Arden', concept: 'Events · 50–200 pax', accent: '#2C3E50' },
  { id: '1-atico', name: '1-Atico', concept: 'Private Dining · Rooftop', accent: '#8B6914' },
  { id: 'botanico', name: 'Botanico', concept: 'Garden Bistro · Botanical', accent: '#4A6741' },
  { id: 'custom', name: 'Other / External Venue', concept: 'Upload any restaurant menu', accent: '#8B8578' },
];

const LOADING_MESSAGES = [
  'Reading the menu…',
  'Mapping the venue\'s culinary identity…',
  'Translating the recipe through this kitchen\'s lens…',
  'Writing the full production recipe…',
  'Almost there — finalising chef\'s notes…',
];

const MODES = [
  { id: 'recipe-adapt', title: 'Recipe Adaptation Engine', subtitle: 'Choose Venue · Upload Menu · Get Adaptation', description: 'Select a chef\'s recipe from the platform, choose a 1-Group venue, upload their current menu PDF, and receive a single full production-ready adaptation written specifically for that restaurant\'s identity.', icon: RefreshCw, colour: 'from-[#1B3A2D] to-[#2D5A45]', isStructured: true },
  { id: 'menu-intelligence', title: 'Menu Intelligence', subtitle: 'Upload Menu → Brand DNA & Benchmarking', description: 'Upload or paste your menu for instant Brand DNA analysis, competitive benchmarking against Singapore and international restaurants, gap identification, and dish concepts inspired by the world\'s best.', icon: BookOpen, colour: 'from-gold-500 to-gold-700', prompt: 'I want to analyse a menu. I\'ll paste or describe the menu contents now. Run the full Brand DNA Analysis, competitive benchmarking, and opportunity map.', mode: 'Menu Intelligence Engine', isStructured: false },
  { id: 'dish-builder', title: 'Dish Builder', subtitle: 'Idea → Complete Recipe', description: 'Turn a spark — an ingredient, a memory, a technique — into a fully developed, production-ready dish with costing, allergens, and plating.', icon: Flame, colour: 'from-orange-500 to-red-600', prompt: 'I want to create a new dish. Help me develop it from concept to a complete kitchen recipe card with global restaurant references.', mode: 'Dish Builder', isStructured: false },
  { id: 'flavour-explorer', title: 'Flavour Explorer', subtitle: 'Ingredient → Pairing Ideas', description: 'Explore what works with a given ingredient through molecular science, classical tradition, and progressive combinations.', icon: Sparkles, colour: 'from-amber-500 to-yellow-600', prompt: 'I want to explore flavour pairings for an ingredient. Give me molecular, classical, and progressive pairing ideas with real restaurant references.', mode: 'Flavour Explorer', isStructured: false },
  { id: 'menu-architect', title: 'Menu Architect', subtitle: 'Brief → Complete Menu', description: 'Build a tasting menu, à la carte section, banquet set, or seasonal rotation — benchmarked against comparable restaurants.', icon: UtensilsCrossed, colour: 'from-emerald-500 to-teal-600', prompt: 'I need to build a menu. Help me design the full sequence benchmarked against comparable restaurants globally.', mode: 'Menu Architect', isStructured: false },
  { id: 'plating-coach', title: 'Plating Coach', subtitle: 'Description → Actionable Feedback', description: 'Get specific, actionable plating feedback — composition, colour, height, sauce work, garnish, vessel.', icon: Palette, colour: 'from-purple-500 to-pink-600', prompt: 'I want feedback on a dish presentation. I\'ll describe the plating or share what I have.', mode: 'Plating & Presentation Coach', isStructured: false },
  { id: 'rd-lab', title: 'R&D Lab', subtitle: 'Technique → Test Protocol', description: 'Experiment with fermentation, smoking, curing, hydrocolloids — with food science, test protocols, and HACCP notes.', icon: FlaskConical, colour: 'from-cyan-500 to-blue-600', prompt: 'I want to experiment with a technique or process. Help me design a test protocol with food science and references.', mode: 'R&D Lab', isStructured: false },
];

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n'); const elements: React.ReactNode[] = []; let listItems: string[] = []; let listType: 'ul' | 'ol' | null = null;
  const flushList = () => { if (listItems.length > 0 && listType) { const Tag = listType; elements.push(<Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 my-2 space-y-1`}>{listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed">{formatInline(item)}</li>)}</Tag>); listItems = []; listType = null; } };
  const formatInline = (str: string): React.ReactNode => { const parts = str.split(/(\*\*[^*]+\*\*)/g); return parts.map((part, i) => { if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-gray-900">{part.slice(2,-2)}</strong>; return part; }); };
  for (let i = 0; i < lines.length; i++) { const line = lines[i]; const trimmed = line.trim(); if (/^[-•]\s/.test(trimmed)) { if (listType !== 'ul') flushList(); listType = 'ul'; listItems.push(trimmed.replace(/^[-•]\s+/,'')); continue; } if (/^\d+[.)]\s/.test(trimmed)) { if (listType !== 'ol') flushList(); listType = 'ol'; listItems.push(trimmed.replace(/^\d+[.)]\s+/,'')); continue; } flushList(); if (!trimmed) { if (elements.length > 0) elements.push(<div key={`br-${i}`} className="h-2" />); continue; } elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(trimmed)}</p>); }
  flushList(); return elements;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border transition-all ${copied ? 'border-green-400 text-green-600 bg-green-50' : 'border-stone-200 text-stone-400 hover:border-[#C9A84C] hover:text-[#A88B3D]'}`}>
      {copied ? <><CheckCheck size={11} /> Copied</> : <><Copy size={11} /> {label}</>}
    </button>
  );
}

// ─── MENU ANALYSIS PANEL ──────────────────────────────────────────────────────
function MenuAnalysisPanel({ analysis }: { analysis: MenuAnalysis }) {
  return (
    <div className="bg-[#1B3A2D] rounded-xl p-5 mb-6">
      <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-3">Menu Analysis</div>
      <div className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>{analysis.venueName}</div>
      <p className="text-sm text-stone-300 mb-4 leading-relaxed italic">{analysis.cuisineIdentity}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1.5">Flavour Register</div>
          <p className="text-xs text-stone-300 leading-relaxed">{analysis.flavourRegister}</p>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1.5">Technique Fingerprint</div>
          <p className="text-xs text-stone-300 leading-relaxed">{analysis.techniqueFingerprint}</p>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1.5">Hero Ingredients</div>
          <div className="flex flex-wrap gap-1.5">
            {(analysis.heroIngredients || []).map((ing, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2D5A45] text-[#C9A84C]">{ing}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1.5">Plating Philosophy</div>
          <p className="text-xs text-stone-300 leading-relaxed">{analysis.platingPhilosophy}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#2D5A45]">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1.5">Adaptation Approach</div>
        <p className="text-xs text-stone-300 leading-relaxed">{analysis.adaptationApproach}</p>
      </div>
    </div>
  );
}

// ─── ADAPTATION RESULT PANEL ──────────────────────────────────────────────────
// ─── PLATING SKETCH COMPONENT ────────────────────────────────────────────────
function PlatingSketch({ adaptation, venueName, venueAccent, onSvgGenerated }: {
  adaptation: VenueAdaptation; venueName: string; venueAccent: string; onSvgGenerated?: (svg: string) => void;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/chat/sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adaptation.title, venueName,
          imagePrompt: adaptation.imagePrompt,
          components: adaptation.components,
          assembly: adaptation.assembly,
          venueAccent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sketch generation failed');
      setSvg(data.svg);
      if (onSvgGenerated) onSvgGenerated(data.svg);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${adaptation.title.toLowerCase().replace(/\s+/g, '-')}-plating-sketch.svg`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!svg && !loading) return (
    <div className="border border-dashed border-stone-200 rounded-xl p-6 text-center">
      <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${venueAccent}15` }}>
        <Paintbrush size={22} style={{ color: venueAccent }} />
      </div>
      <div className="font-semibold text-stone-700 mb-1 text-sm">Plating Sketch</div>
      <p className="text-xs text-stone-400 mb-4 max-w-xs mx-auto leading-relaxed">Generate an SVG plating diagram showing vessel, component placement, sauce work, and garnish positions.</p>
      <button onClick={generate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all active:scale-97 text-white" style={{ background: venueAccent }}>
        <Paintbrush size={14} /> Generate Sketch
      </button>
    </div>
  );

  if (loading) return (
    <div className="border border-stone-200 rounded-xl p-10 text-center">
      <div className="flex justify-center gap-2 mb-4">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: venueAccent, animationDelay: `${i*0.15}s` }} />)}
      </div>
      <div className="text-sm font-semibold text-stone-600 mb-1">Drawing the plating diagram...</div>
      <p className="text-xs text-stone-400">Composing vessel, elements, and labels</p>
    </div>
  );

  if (error) return (
    <div className="border border-red-100 rounded-xl p-6 text-center">
      <p className="text-sm text-red-500 mb-3">{error}</p>
      <button onClick={generate} className="text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-lg border border-stone-200 hover:border-stone-400 transition-colors">Try again</button>
    </div>
  );

  return (
    <div>
      <div className={`relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 ${zoomed ? 'fixed inset-4 z-50 shadow-2xl overflow-auto' : ''}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-white">
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: venueAccent }}>Plating Sketch</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoomed(z => !z)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all">
              {zoomed ? 'Close' : 'Expand'}
            </button>
            <button onClick={downloadSvg} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all" style={{ background: `${venueAccent}18`, color: venueAccent, border: `1px solid ${venueAccent}40` }}>
              <Download size={11} /> SVG
            </button>
            <button onClick={() => { setSvg(null); generate(); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all">
              <Paintbrush size={11} /> Redo
            </button>
          </div>
        </div>
        <div className="p-4" dangerouslySetInnerHTML={{ __html: svg || '' }} style={{ maxWidth: '100%' }} />
      </div>
      {zoomed && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setZoomed(false)} />}
    </div>
  );
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function downloadAsPDF(result: AdaptationResult, chefName: string, originalTitle: string, venueAccent: string, svgSketch?: string | null) {
  const { menuAnalysis: m, adaptation: a } = result;
  const componentHtml = (a.components || []).map((comp, ci) => `
    <div class="component">
      <div class="component-title">Component ${ci + 1} \u2014 ${comp.name}</div>
      <div class="two-col">
        <div>
          <div class="section-label">Ingredients</div>
          ${(comp.ingredients || []).map(i => `<div class="ingredient">\u00b7 ${i}</div>`).join('')}
          ${comp.makeAhead ? `<div class="make-ahead"><strong>Make-ahead:</strong> ${comp.makeAhead}</div>` : ''}
        </div>
        <div>
          <div class="section-label">Method</div>
          ${(comp.method || []).map((s, si) => `<div class="step"><span class="step-num">${si + 1}.</span><span>${s}</span></div>`).join('')}
        </div>
      </div>
    </div>`).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${a.title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#FAF8F4;color:#2C2C2C;font-size:11px;line-height:1.6}.page{max-width:800px;margin:0 auto;padding:40px 48px}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid ${venueAccent};margin-bottom:28px}
.brand{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${venueAccent};margin-bottom:6px}
.venue-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#1B3A2D}
.header-right{text-align:right;font-size:9px;color:#8B8578;line-height:1.8}
.dish-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#1B3A2D;margin-bottom:6px}
.dish-sub{font-size:11px;color:#8B8578;margin-bottom:16px}
.philosophy{border-left:4px solid ${venueAccent};padding:12px 16px;background:${venueAccent}18;border-radius:0 6px 6px 0;margin-bottom:20px;font-size:11.5px;line-height:1.7}
.block-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${venueAccent};margin-bottom:6px}
.meta-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:12px 20px;padding:14px 0;border-top:1px solid #E5E0D8;border-bottom:1px solid #E5E0D8;margin-bottom:24px}
.meta-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B8578;margin-bottom:2px}
.meta-val{font-size:12px;font-weight:600;color:#1B3A2D}.allergen-val{color:#C44536!important}
.sketch-box{border:1px solid #E0DDD8;border-radius:10px;padding:16px;background:#FAF8F4;margin-bottom:24px}
.sketch-box svg{width:100%;height:auto;display:block}
.analysis-box{background:#1B3A2D;border-radius:10px;padding:16px 20px;margin-bottom:24px}
.analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;margin-top:10px}
.analysis-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C9A84C;margin-bottom:3px}
.analysis-val{font-size:10px;color:#D4CFC7;line-height:1.5}
.analysis-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#fff;margin-bottom:2px}
.analysis-identity{font-size:10px;color:#A0A098;font-style:italic;margin-bottom:10px}
.hero-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.hero-tag{background:#2D5A45;color:#C9A84C;font-size:9px;font-weight:600;padding:2px 7px;border-radius:20px}
.component{margin-bottom:20px;padding-left:14px;border-left:2px solid ${venueAccent}}
.component-title{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${venueAccent};margin-bottom:10px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.section-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B8578;margin-bottom:6px}
.ingredient{padding:1.5px 0;font-size:10.5px;color:#3C3C3C}
.make-ahead{margin-top:8px;background:#F0EDE8;padding:6px 10px;border-radius:4px;font-size:10px;color:#5C5C5C}
.step{display:flex;gap:8px;margin-bottom:5px;font-size:10.5px;line-height:1.55}
.step-num{color:${venueAccent};font-weight:700;min-width:16px;flex-shrink:0}
.assembly-step{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #ECEAE6;font-size:10.5px}
.assembly-step:last-child{border-bottom:none}
.assembly-num{color:${venueAccent};font-weight:700;min-width:16px;flex-shrink:0}
.plating-ref{font-size:10px;color:#8B8578;font-style:italic;margin-top:8px;line-height:1.5}
.note{display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #ECEAE6;font-size:10.5px;line-height:1.55}
.note:last-child{border-bottom:none}
.note-dash{color:${venueAccent};font-weight:700;flex-shrink:0}
h2{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2C2C2C;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #E5E0D8}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E5E0D8;display:flex;justify-content:space-between;font-size:9px;color:#8B8578}
@media print{body{background:white}.page{padding:24px 32px}@page{margin:0;size:A4 portrait}}
</style></head><body><div class="page">
<div class="header"><div><div class="brand">ChefOS by 1-Group \u00b7 Recipe Adaptation</div><div class="venue-name">${m.venueName}</div></div><div class="header-right">Adapted from <em>${originalTitle}</em><br>Chef ${chefName}<br>${new Date().toLocaleDateString('en-SG',{day:'numeric',month:'long',year:'numeric'})}</div></div>
<div class="dish-title">${a.title}</div>
<div class="dish-sub">Adapted from <em>${originalTitle}</em> by Chef ${chefName} \u00b7 ${m.venueName}</div>
<div class="block-label">Adaptation Philosophy</div>
<div class="philosophy">${a.philosophy}</div>
<div class="meta-row">
<div class="meta-item"><div class="meta-label">Yield</div><div class="meta-val">${a.yield}</div></div>
<div class="meta-item"><div class="meta-label">Prep</div><div class="meta-val">${a.prepTime}</div></div>
<div class="meta-item"><div class="meta-label">Cook</div><div class="meta-val">${a.cookTime}</div></div>
<div class="meta-item"><div class="meta-label">Food Cost</div><div class="meta-val">${a.estimatedFoodCost}</div></div>
<div class="meta-item"><div class="meta-label">Menu Price</div><div class="meta-val">${a.pricePoint}</div></div>
<div class="meta-item"><div class="meta-label">Placement</div><div class="meta-val">${a.menuPlacement}</div></div>
${a.allergens?.length>0?`<div class="meta-item"><div class="meta-label">Allergens</div><div class="meta-val allergen-val">${a.allergens.join(' \u00b7 ')}</div></div>`:''}
</div>
${svgSketch?`<h2>Plating Sketch</h2><div class="sketch-box">${svgSketch}</div>`:''}
<div class="analysis-box"><div class="analysis-label">Menu Analysis</div><div class="analysis-title">${m.venueName}</div><div class="analysis-identity">${m.cuisineIdentity}</div><div class="analysis-grid"><div><div class="analysis-label">Flavour Register</div><div class="analysis-val">${m.flavourRegister}</div></div><div><div class="analysis-label">Technique Fingerprint</div><div class="analysis-val">${m.techniqueFingerprint}</div></div><div><div class="analysis-label">Hero Ingredients</div><div class="hero-tags">${(m.heroIngredients||[]).map(i=>`<span class="hero-tag">${i}</span>`).join('')}</div></div><div><div class="analysis-label">Plating Philosophy</div><div class="analysis-val">${m.platingPhilosophy}</div></div></div></div>
<h2>Recipe Components</h2>${componentHtml}
<h2>Assembly &amp; Plating</h2><div style="margin-bottom:24px">${(a.assembly||[]).map((s,i)=>`<div class="assembly-step"><span class="assembly-num">${i+1}.</span><span>${s}</span></div>`).join('')}${a.platingRef?`<div class="plating-ref">${a.platingRef}</div>`:''}</div>
<h2>Chef's Notes</h2><div style="margin-bottom:24px">${(a.chefNotes||[]).map(n=>`<div class="note"><span class="note-dash">\u2014</span><span>${n}</span></div>`).join('')}</div>
<div class="footer"><span>ChefOS by 1-Group Singapore \u00b7 1-groupculinary.com</span><span>Generated ${new Date().toLocaleDateString('en-SG',{day:'numeric',month:'long',year:'numeric'})}</span></div>
</div><script>window.onload=function(){window.print();}</script></body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}


function AdaptationResultPanel({ result, chefName, originalTitle, venueAccent }: {
  result: AdaptationResult; chefName: string; originalTitle: string; venueAccent: string;
}) {
  const { menuAnalysis, adaptation: a } = result;
  const [svgSketch, setSvgSketch] = useState<string | null>(null);

  const fullText = [
    `${menuAnalysis.venueName} — Recipe Adaptation`,
    `\n${a.title}`,
    `Adapted from "${originalTitle}" by Chef ${chefName}`,
    `\n${a.philosophy}`,
    `\nYield: ${a.yield} | Prep: ${a.prepTime} | Cook: ${a.cookTime}`,
    `Food Cost: ${a.estimatedFoodCost} | Menu Price: ${a.pricePoint}`,
    `Placement: ${a.menuPlacement}`,
    `Allergens: ${(a.allergens||[]).join(', ')||'None'}`,
    ...(a.components||[]).flatMap(c => [
      `\n─── ${c.name} ───`,
      `Ingredients:\n${(c.ingredients||[]).map(i => `  · ${i}`).join('\n')}`,
      `Method:\n${(c.method||[]).map((s,i) => `  ${i+1}. ${s}`).join('\n')}`,
      c.makeAhead ? `Make-ahead: ${c.makeAhead}` : '',
    ]),
    `\n─── Assembly & Plating ───\n${(a.assembly||[]).map((s,i) => `${i+1}. ${s}`).join('\n')}`,
    `Plating ref: ${a.platingRef}`,
    `\n─── Chef's Notes ───\n${(a.chefNotes||[]).map(n => `· ${n}`).join('\n')}`,
    `\nImage Prompt:\n${a.imagePrompt}`,
  ].join('\n');

  return (
    <div>
      <MenuAnalysisPanel analysis={menuAnalysis} />

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Title band */}
        <div className="px-5 sm:px-7 py-5 border-b border-stone-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: venueAccent }}>
                Adapted Recipe · {menuAnalysis.venueName}
              </div>
              <h3 className="text-2xl font-bold text-stone-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{a.title}</h3>
              <p className="text-xs text-stone-400 mt-1.5">Adapted from <em>{originalTitle}</em> — Chef {chefName}</p>
            </div>
            <CopyButton text={fullText} label="Copy full recipe" />
          </div>
          {/* Action bar */}
          <div className="px-5 sm:px-7 py-3 bg-stone-50 border-t border-stone-100 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => downloadAsPDF(result, chefName, originalTitle, venueAccent, svgSketch)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all active:scale-97 text-white shadow-sm"
              style={{ background: venueAccent }}>
              <Download size={14} /> Download PDF
            </button>
            <div className="text-xs text-stone-400 hidden sm:block">·</div>
            <div className="text-xs text-stone-400 hidden sm:block leading-tight">
              {svgSketch ? 'Sketch will be embedded in the PDF.' : 'Generate a plating sketch below to embed it in the PDF.'}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-6">
          {/* Philosophy */}
          <div className="rounded-r-lg border-l-4 p-4" style={{ borderColor: venueAccent, background: `${venueAccent}12` }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: venueAccent }}>Adaptation Philosophy</div>
            <p className="text-sm text-stone-700 leading-relaxed">{a.philosophy}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 py-3 border-t border-b border-stone-100">
            {[
              { label: 'Yield', val: a.yield },
              { label: 'Prep', val: a.prepTime },
              { label: 'Cook', val: a.cookTime },
              { label: 'Food Cost', val: a.estimatedFoodCost },
              { label: 'Menu Price', val: a.pricePoint },
              { label: 'Placement', val: a.menuPlacement },
            ].map(m => (
              <div key={m.label}>
                <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{m.label}</div>
                <div className="text-sm font-semibold text-stone-800 mt-0.5">{m.val}</div>
              </div>
            ))}
            {a.allergens?.length > 0 && (
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Allergens</div>
                <div className="text-xs font-semibold text-red-600 mt-0.5">{a.allergens.join(' · ')}</div>
              </div>
            )}
          </div>

          {/* Components */}
          {(a.components||[]).map((comp, ci) => (
            <div key={ci} className="pl-4 border-l-2" style={{ borderColor: venueAccent }}>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: venueAccent }}>
                Component {ci + 1} — {comp.name}
              </div>
              <div className="mb-3">
                <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 mb-2">Ingredients</div>
                {(comp.ingredients||[]).map((ing, ii) => (
                  <div key={ii} className="flex gap-2 items-baseline mb-1">
                    <span className="font-bold text-sm flex-shrink-0" style={{ color: venueAccent }}>·</span>
                    <span className="text-sm text-stone-700 leading-relaxed">{ing}</span>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 mb-2">Method</div>
                {(comp.method||[]).map((step, si) => (
                  <div key={si} className="flex gap-3 mb-2">
                    <span className="font-bold text-xs flex-shrink-0 mt-0.5" style={{ color: venueAccent }}>{si + 1}.</span>
                    <span className="text-sm text-stone-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
              {comp.makeAhead && (
                <div className="bg-stone-50 rounded px-3 py-2 text-sm text-stone-600">
                  <span className="font-semibold text-stone-500">Make-ahead: </span>{comp.makeAhead}
                </div>
              )}
            </div>
          ))}

          {/* Assembly */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-3">Assembly & Plating</div>
            <div className="divide-y divide-stone-100">
              {(a.assembly||[]).map((step, si) => (
                <div key={si} className="flex gap-3 py-2">
                  <span className="font-bold text-xs flex-shrink-0 mt-0.5" style={{ color: venueAccent }}>{si + 1}.</span>
                  <span className="text-sm text-stone-700 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
            {a.platingRef && <p className="text-xs text-stone-400 italic mt-3 leading-relaxed">{a.platingRef}</p>}
          </div>

          {/* Chef's Notes */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-3">Chef's Notes</div>
            <div className="divide-y divide-stone-100">
              {(a.chefNotes||[]).map((note, ni) => (
                <div key={ni} className="flex gap-3 py-2.5">
                  <span className="flex-shrink-0 font-bold text-base leading-none mt-0.5" style={{ color: venueAccent }}>—</span>
                  <span className="text-sm text-stone-700 leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Prompt */}
          {a.imagePrompt && (
            <div className="bg-stone-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C]">Reference Image Prompt</div>
                <CopyButton text={a.imagePrompt} label="Copy prompt" />
              </div>
              <p className="text-sm text-stone-300 italic leading-relaxed">{a.imagePrompt}</p>
            </div>
          )}

          {/* Plating Sketch */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-3">Plating Diagram</div>
            <PlatingSketch
              adaptation={a}
              venueName={menuAnalysis.venueName}
              venueAccent={venueAccent}
              onSvgGenerated={(svg) => setSvgSketch(svg)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE ADAPTATION ENGINE ─────────────────────────────────────────────────
function RecipeAdaptationEngine({ onExit }: { onExit: () => void }) {
  const [adaptStep, setAdaptStep] = useState<1|2|3|4>(1);
  const [chefFilter, setChefFilter] = useState<'All'|'International'|'Resident'>('All');
  const [selectedChef, setSelectedChef] = useState<typeof MOCK_CHEFS[0]|null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof MOCK_RECIPES[0]|null>(null);
  const [selectedVenue, setSelectedVenue] = useState<typeof ALL_VENUES[0]|null>(null);
  const [customVenueName, setCustomVenueName] = useState('');
  const [menuPdf, setMenuPdf] = useState<{ name: string; base64: string }|null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AdaptationResult|null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string|null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const RESIDENT_IDS = ['chef-11','chef-12','chef-13','chef-14','chef-15'];
  const chefRecipes = selectedChef ? MOCK_RECIPES.filter(r => r.chef?.id === selectedChef.id) : [];
  const filteredChefs = MOCK_CHEFS.filter(c => {
    if (chefFilter === 'All') return true;
    const res = RESIDENT_IDS.includes(c.id);
    return chefFilter === 'Resident' ? res : !res;
  });

  const handlePdfFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') { alert('Please upload a PDF file.'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('PDF too large — max 20MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setMenuPdf({ name: file.name, base64 });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfFile(file);
  }, [handlePdfFile]);

  const handleGenerate = async () => {
    if (!selectedChef || !selectedRecipe || !selectedVenue || !menuPdf) return;
    setIsGenerating(true); setGenerateError(null); setResult(null); setAdaptStep(4); setLoadingMsgIdx(0);
    const interval = setInterval(() => setLoadingMsgIdx(p => Math.min(p + 1, LOADING_MESSAGES.length - 1)), 3500);
    try {
      const venueName = selectedVenue.id === 'custom' && customVenueName
        ? customVenueName : selectedVenue.name;
      const res = await fetch('/api/chat/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: {
            title: selectedRecipe.title,
            chef_name: selectedChef.name,
            chef_venue: selectedChef.restaurant,
            cuisine_tags: selectedChef.cuisine,
            description: selectedRecipe.description,
            allergens: (selectedRecipe as any).allergens || [],
            yield: '4 portions',
          },
          venueName,
          menuPdfBase64: menuPdf.base64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Adaptation failed');
      setResult(data.result);
    } catch (err: any) {
      setGenerateError(err.message || 'Something went wrong. Please try again.');
    } finally {
      clearInterval(interval); setIsGenerating(false);
    }
  };

  const STEPS = ['Select Chef', 'Choose Recipe', 'Choose Venue', 'Adaptation'];

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B3A2D] to-[#2D5A45] flex items-center justify-center">
              <RefreshCw size={15} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Recipe Adaptation Engine</h2>
              <p className="text-xs text-gray-500">Select recipe · choose venue · upload menu PDF · get full adaptation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-7 flex-wrap">
            {STEPS.map((label, i) => {
              const n = i + 1; const done = adaptStep > n; const active = adaptStep === n;
              return (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${done ? 'bg-[#1B3A2D] text-[#C9A84C]' : active ? 'bg-[#C9A84C] text-[#1B3A2D]' : 'bg-stone-200 text-stone-400'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${active ? 'text-stone-800' : done ? 'text-stone-500' : 'text-stone-300'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight size={12} className="text-stone-300 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: CHEF ── */}
          {adaptStep === 1 && (
            <div>
              <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Select a Chef</h3>
                  <p className="text-sm text-stone-500 mt-0.5">Choose from {MOCK_CHEFS.length} chefs on the platform</p>
                </div>
                <div className="flex gap-2">
                  {(['All', 'International', 'Resident'] as const).map(f => (
                    <button key={f} onClick={() => setChefFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chefFilter === f ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredChefs.map(chef => {
                  const recipeCount = MOCK_RECIPES.filter(r => r.chef?.id === chef.id).length;
                  const isRes = RESIDENT_IDS.includes(chef.id);
                  return (
                    <button key={chef.id}
                      onClick={() => { setSelectedChef(chef); setSelectedRecipe(null); setAdaptStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`text-left p-3 rounded-xl border transition-all ${selectedChef?.id === chef.id ? 'border-[#C9A84C] border-2 bg-[#FFFDF5] shadow-sm' : 'border-stone-200 bg-white hover:border-[#C9A84C] hover:shadow-sm'}`}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 mb-2.5">
                        {chef.avatar ? <img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover object-top" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div className="w-full h-full flex items-center justify-center text-lg">👨‍🍳</div>}
                      </div>
                      <div className="text-sm font-bold text-stone-800 leading-tight mb-0.5">{chef.name}</div>
                      <div className="text-[11px] text-stone-400 mb-1.5 leading-tight">{chef.restaurant}</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRes ? 'bg-[#1B3A2D] text-[#C9A84C]' : 'bg-stone-100 text-stone-500'}`}>{isRes ? '1-Group' : 'Intl'}</span>
                        <span className="text-[10px] text-stone-300">{recipeCount} recipe{recipeCount !== 1 ? 's' : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: RECIPE ── */}
          {adaptStep === 2 && selectedChef && (
            <div>
              <button onClick={() => setAdaptStep(1)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-5 transition-colors">
                <ArrowLeft size={14} /> Back to chefs
              </button>
              <div className="bg-[#1B3A2D] rounded-xl p-4 mb-6 flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#2D5A45] flex-shrink-0">
                  {selectedChef.avatar ? <img src={selectedChef.avatar} alt={selectedChef.name} className="w-full h-full object-cover object-top" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div className="w-full h-full flex items-center justify-center text-2xl">👨‍🍳</div>}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#C9A84C] font-bold tracking-widest uppercase mb-1">Selected Chef</div>
                  <div className="text-xl font-bold text-white">{selectedChef.name}</div>
                  <div className="text-sm text-stone-400 mt-0.5">{selectedChef.restaurant}</div>
                </div>
                <div className="text-sm text-stone-400">{chefRecipes.length} recipe{chefRecipes.length !== 1 ? 's' : ''} available</div>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-stone-800">Choose a Recipe</h3>
                <p className="text-sm text-stone-500 mt-0.5">Select the dish to adapt</p>
              </div>
              {chefRecipes.length === 0 ? (
                <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
                  <div className="text-3xl mb-3">🍽️</div>
                  <p className="text-stone-500 text-sm">No recipes found for this chef yet.</p>
                  <button onClick={() => setAdaptStep(1)} className="mt-4 text-sm text-[#1B3A2D] font-semibold hover:underline">Choose a different chef</button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {chefRecipes.map(recipe => {
                    const isSel = selectedRecipe?.id === recipe.id;
                    return (
                      <button key={recipe.id} onClick={() => setSelectedRecipe(recipe)}
                        className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all ${isSel ? 'border-[#C9A84C] border-2 bg-[#FFFDF5] shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-bold text-stone-800 text-base leading-tight mb-1">{recipe.title}</div>
                            {recipe.description && <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{recipe.description}</p>}
                          </div>
                          {isSel && <div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#1B3A2D]" strokeWidth={3} /></div>}
                        </div>
                        {recipe.cuisines && recipe.cuisines.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {recipe.cuisines.map((c) => <span key={c.id} className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[#E8D5A0] text-[#A88B3D]">{c.name}</span>)}
                            {(recipe as any).allergens?.length > 0 && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-red-50 text-red-500">⚠ {recipe.allergens.map(a => a.name).join(', ')}</span>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedRecipe && (
                <div className="sticky bottom-4 bg-white rounded-xl shadow-xl border border-stone-200 p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">Selected:</div>
                    <div className="font-bold text-stone-800 text-sm">{selectedRecipe.title}</div>
                  </div>
                  <button onClick={() => { setAdaptStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B3A2D] hover:bg-[#2D5A45] text-[#C9A84C] font-bold text-sm tracking-wide uppercase transition-all active:scale-[0.97]">
                    Choose venue <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: VENUE + MENU PDF ── */}
          {adaptStep === 3 && selectedRecipe && (
            <div>
              <button onClick={() => setAdaptStep(2)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-5 transition-colors">
                <ArrowLeft size={14} /> Back to recipes
              </button>

              {/* Recipe summary bar */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
                {selectedChef?.avatar && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                    <img src={selectedChef.avatar} alt="" className="w-full h-full object-cover object-top" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-xs text-stone-400 uppercase font-semibold tracking-wide">Adapting</div>
                  <div className="font-bold text-stone-800">{selectedRecipe.title}</div>
                  <div className="text-xs text-stone-400">Chef {selectedChef?.name}</div>
                </div>
              </div>

              {/* Venue selector */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-stone-800 mb-1">Choose a Venue</h3>
                <p className="text-sm text-stone-500 mb-4">Select which 1-Group restaurant this dish is being adapted for</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ALL_VENUES.map(venue => {
                    const isSel = selectedVenue?.id === venue.id;
                    return (
                      <button key={venue.id} onClick={() => setSelectedVenue(venue)}
                        className={`text-left p-3 rounded-xl border transition-all ${isSel ? 'border-2 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'}`}
                        style={isSel ? { borderColor: venue.accent, background: `${venue.accent}0D` } : {}}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-stone-800 text-sm leading-tight">{venue.name}</div>
                            <div className="text-[11px] text-stone-400 mt-0.5 leading-tight">{venue.concept}</div>
                          </div>
                          {isSel && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: venue.accent }}>
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        {isSel && <div className="mt-1.5 h-0.5 rounded-full" style={{ background: venue.accent }} />}
                      </button>
                    );
                  })}
                </div>
                {/* Custom venue name input */}
                {selectedVenue?.id === 'custom' && (
                  <div className="mt-3">
                    <input type="text" placeholder="Enter venue or restaurant name…" value={customVenueName} onChange={e => setCustomVenueName(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] placeholder:text-stone-400" />
                  </div>
                )}
              </div>

              {/* PDF Upload */}
              {selectedVenue && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-stone-800 mb-1">Upload the Menu PDF</h3>
                  <p className="text-sm text-stone-500 mb-4">
                    Upload the current menu for <strong>{selectedVenue.id === 'custom' ? (customVenueName || 'this venue') : selectedVenue.name}</strong>.
                    The tool will read the menu's culinary identity and adapt the recipe to match it exactly.
                  </p>

                  {!menuPdf ? (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-[#C9A84C] bg-[#FFFDF5]' : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'}`}>
                      <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} className="text-stone-400" />
                      </div>
                      <div className="font-semibold text-stone-700 mb-1">Drop the menu PDF here</div>
                      <div className="text-sm text-stone-400 mb-3">or click to browse</div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B3A2D] text-[#C9A84C] text-sm font-semibold">
                        <Upload size={14} /> Browse PDF
                      </div>
                      <div className="text-[11px] text-stone-300 mt-3">PDF only · max 20MB · the menu will be read and discarded</div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-[#C9A84C] border-2 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E8D5A0] flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-[#A88B3D]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-stone-800 text-sm">{menuPdf.name}</div>
                          <div className="text-xs text-[#4A7C59] font-semibold mt-0.5">✓ Ready to analyse</div>
                        </div>
                        <button onClick={() => setMenuPdf(null)} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                          <X size={16} className="text-stone-400" />
                        </button>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); e.target.value = ''; }} />
                </div>
              )}

              {/* Generate CTA */}
              {selectedVenue && menuPdf && (
                <div className="bg-[#1B3A2D] rounded-xl p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-1">Ready to adapt</div>
                      <div className="text-white font-bold">{selectedRecipe.title}</div>
                      <div className="text-stone-400 text-sm mt-0.5">
                        for {selectedVenue.id === 'custom' ? (customVenueName || 'the selected venue') : selectedVenue.name} · using {menuPdf.name}
                      </div>
                    </div>
                    <button onClick={handleGenerate}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C9A84C] hover:bg-[#A88B3D] text-[#1B3A2D] font-bold text-sm tracking-wide uppercase transition-all active:scale-[0.97] shadow-lg">
                      Generate Adaptation <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: RESULT ── */}
          {adaptStep === 4 && (
            <div>
              <button onClick={() => { setAdaptStep(3); setResult(null); setGenerateError(null); }}
                className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-5 transition-colors">
                <ArrowLeft size={14} /> Change venue or menu
              </button>

              {isGenerating && (
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                  <div className="flex justify-center gap-2 mb-5">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#C9A84C] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                  <div className="text-base font-semibold text-stone-700 mb-2">{LOADING_MESSAGES[loadingMsgIdx]}</div>
                  <p className="text-sm text-stone-400 mb-6">Reading the menu PDF, mapping the culinary identity, writing the full recipe. This takes 20–35 seconds.</p>
                  <div className="bg-stone-50 rounded-xl p-4 max-w-sm mx-auto text-left">
                    <div className="flex items-center gap-3 mb-3">
                      {selectedChef?.avatar && <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-200"><img src={selectedChef.avatar} alt="" className="w-full h-full object-cover object-top" /></div>}
                      <div>
                        <div className="font-bold text-stone-700 text-sm">{selectedRecipe?.title}</div>
                        <div className="text-xs text-stone-400">Chef {selectedChef?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <ArrowRight size={12} />
                      <span>Adapting for <strong>{selectedVenue?.id === 'custom' ? (customVenueName || 'custom venue') : selectedVenue?.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <FileText size={12} />
                      <span className="truncate">{menuPdf?.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {generateError && !isGenerating && (
                <div className="bg-white rounded-xl border border-red-100 p-10 text-center">
                  <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                  <div className="font-bold text-stone-800 mb-2">Something went wrong</div>
                  <p className="text-sm text-stone-500 mb-5">{generateError}</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={handleGenerate} className="px-5 py-2.5 rounded-lg bg-[#1B3A2D] text-[#C9A84C] font-bold text-sm uppercase tracking-wide hover:bg-[#2D5A45] transition-colors">Try again</button>
                    <button onClick={() => { setAdaptStep(3); setGenerateError(null); }} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-bold text-sm uppercase tracking-wide hover:border-stone-400 transition-colors">Change menu</button>
                  </div>
                </div>
              )}

              {result && !isGenerating && selectedChef && selectedRecipe && selectedVenue && (
                <AdaptationResultPanel
                  result={result}
                  chefName={selectedChef.name}
                  originalTitle={selectedRecipe.title}
                  venueAccent={selectedVenue.id === 'custom' ? '#8B8578' : selectedVenue.accent}
                />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── MAIN CREATE PAGE ─────────────────────────────────────────────────────────
export default function CreatePage() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<typeof MODES[number]|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile|null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (activeMode && inputRef.current) setTimeout(() => inputRef.current?.focus(), 200); }, [activeMode]);

  const startMode = async (mode: typeof MODES[number]) => {
    if (mode.isStructured) { setActiveMode(mode); return; }
    setActiveMode(mode); setMessages([]); setIsLoading(true);
    try {
      const res = await fetch('/api/chat/creative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: (mode as any).prompt }], mode: (mode as any).mode }) });
      const data = await res.json();
      if (data.message) setMessages([{ role: 'user', content: (mode as any).prompt }, { role: 'assistant', content: data.message }]);
    } catch { setMessages([{ role: 'user', content: (mode as any).prompt }, { role: 'assistant', content: 'Sorry, there was an error. Please try again.' }]); }
    setIsLoading(false);
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('File too large — max 10MB'); return; }
    if (file.type === 'application/pdf') { const r = new FileReader(); r.onload = () => { const b = (r.result as string).split(',')[1]; setAttachedFile({ name: file.name, type: 'pdf', base64: b, mediaType: 'application/pdf' }); }; r.readAsDataURL(file); }
    else if (file.type.startsWith('image/')) { const r = new FileReader(); r.onload = () => { const b = (r.result as string).split(',')[1]; setAttachedFile({ name: file.name, type: 'image', base64: b, mediaType: file.type }); }; r.readAsDataURL(file); }
    else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) { const t = await file.text(); setAttachedFile({ name: file.name, type: 'text', textContent: t }); }
    else alert('Supported: PDF, images, or text files');
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    const userMsg = input.trim(); setInput(''); const cf = attachedFile; setAttachedFile(null);
    const displayText = cf ? (userMsg ? `📎 ${cf.name}\n\n${userMsg}` : `📎 ${cf.name}\n\nAnalyse this menu.`) : userMsg;
    let apiContent: any;
    if (cf) { const blocks: any[] = []; if (cf.type === 'pdf' && cf.base64) blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: cf.base64 } }); else if (cf.type === 'image' && cf.base64) blocks.push({ type: 'image', source: { type: 'base64', media_type: cf.mediaType, data: cf.base64 } }); else if (cf.type === 'text' && cf.textContent) blocks.push({ type: 'text', text: `[UPLOADED: ${cf.name}]\n\n${cf.textContent}` }); blocks.push({ type: 'text', text: userMsg || 'Run full Menu Intelligence Engine analysis.' }); apiContent = blocks; } else apiContent = userMsg;
    const prev = messages.map(m => ({ role: m.role, content: m.content }));
    const newMsgs: Message[] = [...messages, { role: 'user', content: displayText, fileName: cf?.name }];
    setMessages(newMsgs); setIsLoading(true);
    try { const res = await fetch('/api/chat/creative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...prev, { role: 'user', content: apiContent }], mode: activeMode?.mode }) }); const data = await res.json(); if (data.message) setMessages([...newMsgs, { role: 'assistant', content: data.message }]); }
    catch { setMessages([...newMsgs, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]); }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const exitMode = () => { setActiveMode(null); setMessages([]); setInput(''); setAttachedFile(null); };

  if (activeMode?.isStructured) return <RecipeAdaptationEngine onExit={exitMode} />;

  if (!activeMode) return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-950 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-5"><ChefHat size={16} className="text-gold-400" /><span className="text-gold-300 text-xs font-semibold tracking-wide uppercase">AI Creative Studio</span></div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">Create Stunning Dishes</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Select a recipe, choose a venue, upload their menu — receive a full adaptation written for that kitchen's identity. Or use any of the AI creative tools below.</p>
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 -mt-8 relative z-10 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {MODES.map(mode => {
            const Icon = mode.icon; const isNew = mode.id === 'recipe-adapt';
            return (
              <button key={mode.id} onClick={() => startMode(mode)}
                className={`bg-white rounded-xl border p-5 sm:p-6 text-left hover:shadow-lg transition-all duration-200 active:scale-[0.98] group relative ${isNew ? 'border-[#C9A84C] ring-1 ring-[#C9A84C]/30' : 'border-gray-200 hover:border-gold-300'}`}>
                {isNew && <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#1B3A2D] text-[#C9A84C]">New</div>}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mode.colour} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><Icon size={22} className="text-white" /></div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-gold-700 transition-colors">{mode.title}</h3>
                <p className="text-xs font-medium text-gold-600 mb-2">{mode.subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{mode.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Or start with a freeform idea — the studio will detect the right mode automatically.</p>
          <button onClick={() => setActiveMode({ id: 'freeform', title: 'Creative Studio', subtitle: 'Freeform', description: '', icon: ChefHat, colour: 'from-gold-500 to-gold-700', isStructured: false } as any)}
            className="inline-flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors active:scale-[0.97]"><UtensilsCrossed size={16} />Start Freeform Session</button>
        </div>
      </section>
    </div>
  );

  const ModeIcon = activeMode.icon;
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={exitMode} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"><ArrowLeft size={18} className="text-gray-600" /></button>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center`}><ModeIcon size={16} className="text-white" /></div>
            <div><h2 className="text-sm font-bold text-gray-900 leading-tight">{activeMode.title}</h2><p className="text-xs text-gray-500">{activeMode.subtitle}</p></div>
          </div>
          <button onClick={exitMode} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-400" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-screen-lg mx-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center mx-auto mb-4`}><ModeIcon size={28} className="text-white" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Creative Studio</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Paste a menu for instant Brand DNA analysis, describe a dish idea, share an ingredient, or tell me what you're working on.</p>
              <div className="flex flex-wrap gap-2 justify-center">{['I want to do something with crab', 'Analyse our current Kaarla menu', 'Build a 7-course tasting menu', 'Explore pairings for yuzu', 'Make my lobster dish gluten-free', "What are Singapore's top fire restaurants doing?"].map(q => <button key={q} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 100); }} className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gold-300 hover:text-gold-700 transition-all">{q}</button>)}</div>
            </div>
          )}
          {messages.map((msg, idx) => { if (idx === 0 && msg.role === 'user' && (activeMode as any).prompt && msg.content === (activeMode as any).prompt) return null; return (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}><ModeIcon size={14} className="text-white" /></div>}<div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-md' : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-md'}`}>{msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="text-sm leading-relaxed">{msg.content}</p>}</div></div>); })}
          {isLoading && <div className="flex justify-start"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}><ModeIcon size={14} className="text-white" /></div><div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2"><Loader2 size={14} className="animate-spin text-gold-500" /><span className="text-sm text-gray-400">Creating...</span></div></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('bg-gold-50'); }} onDragLeave={e => { e.currentTarget.classList.remove('bg-gold-50'); }} onDrop={e => { e.currentTarget.classList.remove('bg-gold-50'); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); e.preventDefault(); }}>
        <div className="max-w-screen-lg mx-auto">
          {attachedFile && <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg text-sm">{attachedFile.type === 'pdf' ? <FileText size={16} className="text-gold-600 flex-shrink-0" /> : <ImageIcon size={16} className="text-gold-600 flex-shrink-0" />}<span className="text-gold-800 font-medium truncate flex-1">{attachedFile.name}</span><button onClick={() => setAttachedFile(null)} className="text-gold-400 hover:text-gold-600"><X size={14} /></button></div>}
          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 flex-shrink-0 border border-gray-200 transition-all"><Upload size={18} className="text-gray-500" /></button>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }} />
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={attachedFile ? 'Add notes (optional)...' : 'Describe your idea, paste a menu, or drop a file...'} disabled={isLoading} rows={1} className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 disabled:opacity-50 placeholder:text-gray-400 resize-none" style={{ minHeight: '44px', maxHeight: '120px' }} onInput={e => { const el = e.target as HTMLTextAreaElement; el.style.height = '44px'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }} />
            <button onClick={sendMessage} disabled={(!input.trim() && !attachedFile) || isLoading} className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-30 hover:opacity-90 active:scale-95 flex-shrink-0 bg-gray-900 hover:bg-gray-800 transition-all"><Send size={16} className="text-white ml-0.5" /></button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Drop a PDF or image of your menu, or paste the text directly</p>
        </div>
      </div>
    </div>
  );
}
