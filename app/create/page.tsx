'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChefHat, Flame, UtensilsCrossed, BookOpen, RefreshCw, Palette, FlaskConical,
  Send, Loader2, ArrowLeft, Sparkles, X, Upload, FileText, Image as ImageIcon,
  ChevronRight, Check, Copy, CheckCheck, ArrowRight, Building2, AlertCircle, Download, Paintbrush,
} from 'lucide-react';
import { MOCK_CHEFS, MOCK_RECIPES } from '@/lib/mockData';
import Link from 'next/link';

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
// ─── INTERACTIVE PLATING STUDIO (embedded in adaptation results) ─────────────

// Shape auto-mapping from recipe component names
const SHAPE_KEYWORDS: Record<string, string[]> = {
  sauce: ['sauce', 'jus', 'reduction', 'emulsion', 'broth', 'coulis', 'velouté', 'dressing', 'vinaigrette', 'gravy'],
  quenelle: ['purée', 'puree', 'mousse', 'cream', 'ice cream', 'sorbet', 'quenelle', 'foam', 'espuma', 'parfait', 'custard', 'panna cotta'],
  berries: ['berry', 'berries', 'caviar', 'pearl', 'dot', 'gel', 'currant', 'olive', 'caper', 'pickled'],
  'chocolate shard': ['crisp', 'tuile', 'shard', 'chip', 'cracker', 'chocolate', 'bark', 'snap', 'brittle', 'wafer'],
  cookie: ['cookie', 'biscuit', 'crumble', 'crumb', 'streusel', 'shortbread', 'sablé', 'gablé', 'biscotti'],
  glaze: ['glaze', 'mirror', 'gel', 'aspic', 'consommé'],
  'leaf garnish': ['leaf', 'herb', 'garnish', 'micro', 'flower', 'cress', 'shoot', 'edible', 'petal', 'frond', 'sprig'],
  'pulled sugar': ['sugar', 'pulled', 'spun', 'caramel', 'isomalt', 'nougatine'],
};

function guessShape(name: string): string {
  const lower = name.toLowerCase();
  for (const [shape, keywords] of Object.entries(SHAPE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return shape;
  }
  return 'dome';
}

function guessColor(name: string): string {
  const l = name.toLowerCase();
  if (/chocolate|cacao|cocoa/.test(l)) return '#5C3A1E';
  if (/berry|currant|red|strawberry|raspberry/.test(l)) return '#C0392B';
  if (/green|herb|leaf|pesto|spinach|matcha/.test(l)) return '#4A7C59';
  if (/citrus|lemon|yuzu|saffron|turmeric/.test(l)) return '#D4A030';
  if (/cream|vanilla|white|almond|coconut/.test(l)) return '#E8DCC8';
  if (/orange|carrot|pumpkin|sweet potato/.test(l)) return '#D4702A';
  if (/purple|beetroot|blueberry|lavender/.test(l)) return '#7B4D8A';
  if (/caramel|toffee|sugar|honey|maple/.test(l)) return '#C9A84C';
  if (/sauce|jus|reduction|wine/.test(l)) return '#7B2D3B';
  if (/seafood|fish|scallop|lobster|prawn/.test(l)) return '#F0E0C0';
  return '#B8A88A';
}

// Auto-position components in a pleasing arrangement on the plate
const POSITION_RINGS = [
  { x: 400, y: 345, label: 'center' },     // center (main protein / dome)
  { x: 340, y: 410, label: 'sw' },
  { x: 460, y: 410, label: 'se' },
  { x: 320, y: 310, label: 'w' },
  { x: 480, y: 310, label: 'e' },
  { x: 400, y: 270, label: 'n' },
  { x: 270, y: 365, label: 'far-w' },
  { x: 530, y: 365, label: 'far-e' },
  { x: 350, y: 450, label: 'ssw' },
  { x: 450, y: 450, label: 'sse' },
  { x: 400, y: 430, label: 's' },
  { x: 330, y: 270, label: 'nw' },
];

const STUDIO_PX = 400, STUDIO_PY = 360, STUDIO_PR = 280;

const STUDIO_LABELS = [
  { x: 45, y: 55, a: 'start' }, { x: 755, y: 55, a: 'end' },
  { x: 770, y: 195, a: 'end' }, { x: 775, y: 340, a: 'end' },
  { x: 755, y: 490, a: 'end' }, { x: 45, y: 490, a: 'start' },
  { x: 25, y: 340, a: 'start' }, { x: 25, y: 195, a: 'start' },
  { x: 400, y: 640, a: 'middle' }, { x: 400, y: 35, a: 'middle' },
  { x: 150, y: 610, a: 'start' }, { x: 650, y: 610, a: 'end' },
];

// ─── SVG SHAPE RENDERERS (3D sketch style) ──────────────────────────────────

function SkDome({ x, y, size, color, id }: any) {
  const w = size * 2.8, h = size * 2.2, baseY = y + h * 0.22;
  return (
    <g>
      <ellipse cx={x + 4} cy={baseY + h * 0.15} rx={w * 0.6} ry={h * 0.22} fill="#000" opacity="0.08" />
      <ellipse cx={x + 2} cy={baseY + h * 0.1} rx={w * 0.55} ry={h * 0.18} fill="#000" opacity="0.04" />
      <ellipse cx={x} cy={baseY} rx={w * 0.56} ry={h * 0.16} fill={`url(#dome-base-${id})`} stroke="#555" strokeWidth="1.3" />
      <path d={`M${x - w * 0.48},${baseY - h * 0.02} A${w * 0.5},${h * 0.14} 0 0,1 ${x + w * 0.48},${baseY - h * 0.02}`} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
      <path d={`M${x - w * 0.52},${baseY} C${x - w * 0.53},${y - h * 0.4} ${x - w * 0.2},${y - h * 0.82} ${x},${y - h * 0.85} C${x + w * 0.2},${y - h * 0.82} ${x + w * 0.53},${y - h * 0.4} ${x + w * 0.52},${baseY}`} fill={`url(#dome-body-${id})`} stroke="#444" strokeWidth="1.4" />
      {[0.12, 0.24, 0.36, 0.48, 0.62, 0.76].map((t, i) => {
        const ly = baseY - h * t * 0.95, spread = Math.sqrt(1 - t * t) * w * 0.5;
        return <path key={i} d={`M${x - spread * 0.92},${ly} Q${x},${ly - 2 - i * 0.5} ${x + spread * 0.92},${ly}`} fill="none" stroke="#888" strokeWidth={0.4 + (1 - t) * 0.3} strokeDasharray={i % 2 === 0 ? "6,4" : "4,5"} opacity={0.3 + t * 0.2} />;
      })}
      <ellipse cx={x} cy={baseY - h * 0.35} rx={w * 0.44} ry={h * 0.13} fill="none" stroke="#444" strokeWidth="1.1" strokeDasharray="7,5" opacity="0.6" />
      <path d={`M${x + w * 0.35},${baseY - h * 0.38} l5,-4 l-2,6`} fill="#444" opacity="0.5" />
      <path d={`M${x - w * 0.35},${baseY - h * 0.32} l-5,4 l2,-6`} fill="#444" opacity="0.5" />
      {[0,1,2,3,4,5,6,7].map(i => { const t=i*0.11, sx=x-w*0.48+t*w*0.15; return <line key={`sh-${i}`} x1={sx} y1={baseY-h*t*0.7} x2={sx+3} y2={baseY-h*0.05} stroke="#777" strokeWidth="0.4" opacity={0.15+(1-t)*0.15} />; })}
      {[0,1,2,3].map(i => { const t=i*0.15, sx=x+w*0.25+t*w*0.15; return <line key={`rh-${i}`} x1={sx} y1={baseY-h*0.5+i*8} x2={sx+4} y2={baseY} stroke="#999" strokeWidth="0.3" opacity="0.1" />; })}
      <path d={`M${x-w*0.12},${y-h*0.7} Q${x-w*0.02},${y-h*0.82} ${x+w*0.12},${y-h*0.65}`} fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      <path d={`M${x-w*0.08},${y-h*0.55} Q${x+w*0.02},${y-h*0.62} ${x+w*0.08},${y-h*0.5}`} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <defs>
        <radialGradient id={`dome-body-${id}`} cx="38%" cy="28%" r="62%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7" /><stop offset="35%" stopColor={color} stopOpacity="0.2" /><stop offset="70%" stopColor={color} stopOpacity="0.12" /><stop offset="100%" stopColor="#888" stopOpacity="0.15" /></radialGradient>
        <radialGradient id={`dome-base-${id}`} cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#fff" stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0.12" /></radialGradient>
      </defs>
    </g>
  );
}

function SkBerries({ x, y, size, color, id }: any) {
  const r = size * 0.35;
  const positions = [{dx:-size*1.1,dy:size*0.1,s:1.05},{dx:-size*0.6,dy:-size*0.15,s:1.0},{dx:-size*0.1,dy:size*0.08,s:1.1},{dx:size*0.4,dy:-size*0.1,s:0.95},{dx:size*0.9,dy:size*0.05,s:1.0},{dx:size*1.35,dy:-size*0.05,s:0.88},{dx:-size*0.85,dy:size*0.35,s:0.7}];
  return (<g>{positions.map((b,i)=>{const bx=x+b.dx,by=y+b.dy,br=r*b.s; return(<g key={i}>
    <ellipse cx={bx+1.5} cy={by+br*0.85} rx={br*0.9} ry={br*0.35} fill="#000" opacity="0.07" />
    <circle cx={bx} cy={by} r={br} fill={`url(#berry-g-${id}-${i})`} stroke="#555" strokeWidth="0.9" />
    <path d={`M${bx-br*0.7},${by+br*0.3} A${br*0.9},${br*0.9} 0 0,0 ${bx+br*0.7},${by+br*0.3}`} fill="#000" opacity="0.06" />
    {[0,1,2].map(j=>(<line key={j} x1={bx-br*0.6+j*2} y1={by-br*0.2+j*3} x2={bx-br*0.3+j*2} y2={by+br*0.5+j*2} stroke="#777" strokeWidth="0.3" opacity="0.15" />))}
    <ellipse cx={bx-br*0.2} cy={by-br*0.25} rx={br*0.3} ry={br*0.22} fill="#fff" opacity="0.55" />
    <circle cx={bx-br*0.15} cy={by-br*0.2} r={br*0.12} fill="#fff" opacity="0.8" />
    <text x={bx+br*0.05} y={by+br*0.15} textAnchor="middle" fontSize={br*0.7} fill="#555" opacity="0.35">✻</text>
    <defs><radialGradient id={`berry-g-${id}-${i}`} cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="40%" stopColor={color} stopOpacity="0.35" /><stop offset="80%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor="#555" stopOpacity="0.15" /></radialGradient></defs>
  </g>);})}</g>);
}

function SkSauce({ x, y, size, color, id }: any) {
  const s = size * 2;
  return (<g>
    <path d={`M${x-s*0.7},${y+s*0.1} C${x-s*0.5},${y-s*0.35} ${x-s*0.05},${y-s*0.38} ${x+s*0.35},${y-s*0.22} C${x+s*0.7},${y-s*0.05} ${x+s*0.8},${y+s*0.2} ${x+s*0.65},${y+s*0.38} C${x+s*0.45},${y+s*0.55} ${x+s*0.05},${y+s*0.5} ${x-s*0.2},${y+s*0.42} C${x-s*0.55},${y+s*0.35} ${x-s*0.75},${y+s*0.3} ${x-s*0.7},${y+s*0.1} Z`} fill={`url(#sauce-g-${id})`} stroke="#777" strokeWidth="0.7" opacity="0.85" />
    <path d={`M${x-s*0.3},${y+s*0.05} C${x-s*0.1},${y-s*0.15} ${x+s*0.2},${y-s*0.1} ${x+s*0.4},${y+s*0.05} C${x+s*0.5},${y+s*0.2} ${x+s*0.2},${y+s*0.3} ${x-s*0.05},${y+s*0.25} C${x-s*0.25},${y+s*0.2} ${x-s*0.35},${y+s*0.15} ${x-s*0.3},${y+s*0.05} Z`} fill={color} opacity="0.1" />
    {[0,1,2,3,4].map(i=>{const ox=(i-2)*s*0.15; return <path key={i} d={`M${x-s*0.4+ox},${y+s*0.15+i*3} Q${x+ox*0.5},${y-s*0.05+i*4} ${x+s*0.45+ox*0.3},${y+s*0.1+i*2}`} fill="none" stroke={color} strokeWidth={0.5+Math.random()*0.3} opacity={0.08+i*0.02} />;})}
    <path d={`M${x-s*0.65},${y+s*0.15} C${x-s*0.45},${y-s*0.28} ${x},${y-s*0.32} ${x+s*0.3},${y-s*0.18}`} fill="none" stroke="#666" strokeWidth="0.4" opacity="0.3" />
    <path d={`M${x-s*0.15},${y-s*0.12} C${x+s*0.1},${y-s*0.22} ${x+s*0.3},${y-s*0.12} ${x+s*0.4},${y-s*0.02}`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
    <path d={`M${x+s*0.1},${y+s*0.08} C${x+s*0.25},${y} ${x+s*0.4},${y+s*0.05} ${x+s*0.5},${y+s*0.12}`} fill="none" stroke="#fff" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
    <defs><radialGradient id={`sauce-g-${id}`} cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.25" /><stop offset="40%" stopColor={color} stopOpacity="0.2" /><stop offset="80%" stopColor={color} stopOpacity="0.12" /><stop offset="100%" stopColor={color} stopOpacity="0.06" /></radialGradient></defs>
  </g>);
}

function SkQuenelle({ x, y, size, color, id }: any) {
  const w = size * 2.2, h = size * 1.4;
  return (<g>
    <ellipse cx={x+2} cy={y+h*0.45} rx={w*0.42} ry={h*0.12} fill="#000" opacity="0.06" />
    <path d={`M${x-w*0.5},${y+h*0.15} Q${x-w*0.45},${y-h*0.65} ${x+w*0.1},${y-h*0.55} Q${x+w*0.5},${y-h*0.45} ${x+w*0.5},${y+h*0.1} Q${x+w*0.35},${y+h*0.45} ${x+w*0.05},${y+h*0.35} Q${x-w*0.3},${y+h*0.45} ${x-w*0.5},${y+h*0.15} Z`} fill={`url(#quen-g-${id})`} stroke="#555" strokeWidth="1.1" />
    {[0.15,0.3,0.45,0.6,0.75].map((t,i)=>(<path key={i} d={`M${x-w*0.35+t*w*0.35},${y-h*0.4+t*h*0.25} Q${x+t*w*0.15},${y+t*h*0.2} ${x+w*0.25+t*w*0.08},${y+t*h*0.15}`} fill="none" stroke="#999" strokeWidth="0.4" opacity={0.2+t*0.1} />))}
    <path d={`M${x-w*0.15},${y-h*0.4} Q${x},${y-h*0.55} ${x+w*0.12},${y-h*0.35}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
    {[0,1,2,3].map(i=>(<line key={i} x1={x-w*0.4+i*3} y1={y-h*0.1+i*4} x2={x-w*0.3+i*3} y2={y+h*0.3+i*2} stroke="#888" strokeWidth="0.3" opacity="0.12" />))}
    <defs><radialGradient id={`quen-g-${id}`} cx="35%" cy="28%" r="65%"><stop offset="0%" stopColor="#fff" stopOpacity="0.6" /><stop offset="45%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor="#777" stopOpacity="0.12" /></radialGradient></defs>
  </g>);
}

function SkPulledSugar({ x, y, size }: any) {
  const s = size * 1.8;
  return (<g>
    <path d={`M${x},${y} C${x+s*0.25},${y-s*0.6} ${x-s*0.25},${y-s*1.4} ${x+s*0.1},${y-s*2.2} C${x+s*0.3},${y-s*2.7} ${x+s*0.55},${y-s*2.5} ${x+s*0.35},${y-s*1.8}`} fill="none" stroke="#555" strokeWidth="1.8" opacity="0.65" strokeLinecap="round" />
    <path d={`M${x+3},${y-2} C${x+s*0.28},${y-s*0.58} ${x-s*0.22},${y-s*1.38} ${x+s*0.13},${y-s*2.18}`} fill="none" stroke="#999" strokeWidth="0.6" opacity="0.3" />
    <path d={`M${x+s*0.02},${y-s*0.8} C${x-s*0.08},${y-s*1.1} ${x-s*0.02},${y-s*1.5} ${x+s*0.08},${y-s*1.9}`} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
    <path d={`M${x+s*0.35},${y-s*1.8} C${x+s*0.4},${y-s*1.6} ${x+s*0.25},${y-s*1.55} ${x+s*0.2},${y-s*1.65}`} fill="none" stroke="#666" strokeWidth="0.8" opacity="0.4" />
  </g>);
}

function SkChocolateShard({ x, y, size, color, id }: any) {
  const s = size * 1.4;
  return (<g>
    <ellipse cx={x+1} cy={y+s*0.35} rx={s*0.4} ry={s*0.08} fill="#000" opacity="0.05" />
    <path d={`M${x-s*0.4},${y+s*0.3} L${x-s*0.35},${y-s*0.55} C${x-s*0.15},${y-s*0.75} ${x+s*0.2},${y-s*0.65} ${x+s*0.35},${y-s*0.4} L${x+s*0.5},${y+s*0.05} Q${x+s*0.35},${y+s*0.35} ${x+s*0.05},${y+s*0.32} Q${x-s*0.25},${y+s*0.38} ${x-s*0.4},${y+s*0.3} Z`} fill={`url(#choc-g-${id})`} stroke="#555" strokeWidth="0.9" />
    {[0,1,2,3].map(i=>(<line key={i} x1={x-s*0.2+i*s*0.12} y1={y-s*0.2+i*3} x2={x-s*0.1+i*s*0.12} y2={y+s*0.15+i*2} stroke="#999" strokeWidth="0.3" opacity="0.2" />))}
    <path d={`M${x-s*0.2},${y-s*0.3} L${x+s*0.15},${y-s*0.35}`} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
    <defs><linearGradient id={`choc-g-${id}`} x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0.18" /></linearGradient></defs>
  </g>);
}

function SkCookie({ x, y, size, color, id }: any) {
  const w = size * 1.8, h = size * 0.7, d = size * 0.35;
  return (<g>
    <ellipse cx={x+2} cy={y+h*0.5+d+3} rx={w*0.5} ry={h*0.18} fill="#000" opacity="0.06" />
    <path d={`M${x-w*0.5},${y+h*0.5} L${x-w*0.5},${y+h*0.5+d} L${x+w*0.5},${y+h*0.5+d} L${x+w*0.5},${y+h*0.5} Z`} fill={color} opacity="0.1" stroke="#666" strokeWidth="0.6" />
    <rect x={x-w*0.5} y={y-h*0.5} width={w} height={h} rx={3} fill={`url(#cook-g-${id})`} stroke="#555" strokeWidth="1" />
    {[-0.35,-0.15,0.05,0.25].map((t,i)=>(<g key={i}><line x1={x+w*t} y1={y-h*0.35} x2={x+w*t+5} y2={y+h*0.35} stroke="#999" strokeWidth="0.4" opacity="0.25" /><line x1={x+w*t+w*0.08} y1={y-h*0.35} x2={x+w*t-3} y2={y+h*0.35} stroke="#999" strokeWidth="0.3" opacity="0.15" /></g>))}
    <defs><linearGradient id={`cook-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.45" /><stop offset="100%" stopColor={color} stopOpacity="0.18" /></linearGradient></defs>
  </g>);
}

function SkGlaze({ x, y, size, color, id }: any) {
  const s = size * 1.6;
  return (<g>
    <path d={`M${x-s*0.55},${y} C${x-s*0.45},${y-s*0.35} ${x-s*0.05},${y-s*0.4} ${x+s*0.3},${y-s*0.2} C${x+s*0.55},${y-s*0.05} ${x+s*0.6},${y+s*0.22} ${x+s*0.35},${y+s*0.35} C${x+s*0.05},${y+s*0.45} ${x-s*0.35},${y+s*0.38} ${x-s*0.55},${y} Z`} fill={`url(#glaze-g-${id})`} stroke="#888" strokeWidth="0.6" opacity="0.85" />
    <path d={`M${x-s*0.15},${y-s*0.15} C${x+s*0.05},${y-s*0.25} ${x+s*0.25},${y-s*0.12} ${x+s*0.35},${y}`} fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.28" strokeLinecap="round" />
    <defs><radialGradient id={`glaze-g-${id}`} cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#fff" stopOpacity="0.3" /><stop offset="60%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0.08" /></radialGradient></defs>
  </g>);
}

function SkLeaf({ x, y, size, color, id }: any) {
  const s = size * 1.3;
  return (<g>
    <path d={`M${x},${y-s*0.95} C${x+s*0.5},${y-s*0.55} ${x+s*0.45},${y+s*0.4} ${x},${y+s*0.95} C${x-s*0.45},${y+s*0.4} ${x-s*0.5},${y-s*0.55} ${x},${y-s*0.95} Z`} fill={`url(#leaf-g-${id})`} stroke="#555" strokeWidth="0.8" />
    <path d={`M${x},${y-s*0.75} L${x},${y+s*0.75}`} fill="none" stroke="#777" strokeWidth="0.5" opacity="0.5" />
    {[-0.4,-0.15,0.1,0.35].map((t,i)=>(<path key={i} d={`M${x},${y+s*t} L${x+(i%2?-1:1)*s*0.28},${y+s*t-s*0.12}`} fill="none" stroke="#888" strokeWidth="0.35" opacity="0.35" />))}
    <defs><radialGradient id={`leaf-g-${id}`} cx="38%" cy="28%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.35" /><stop offset="100%" stopColor={color} stopOpacity="0.22" /></radialGradient></defs>
  </g>);
}

const SK_RENDERERS: Record<string, React.ComponentType<any>> = {
  dome: SkDome, berries: SkBerries, sauce: SkSauce, quenelle: SkQuenelle,
  'pulled sugar': SkPulledSugar, 'chocolate shard': SkChocolateShard, cookie: SkCookie,
  glaze: SkGlaze, 'leaf garnish': SkLeaf,
};
const SK_SHAPES = Object.keys(SK_RENDERERS);

function SkArrow({ fx, fy, tx, ty }: any) {
  const mx = fx + (tx - fx) * 0.35 + (ty - fy) * 0.08, my = fy + (ty - fy) * 0.5 - (tx - fx) * 0.05;
  const angle = Math.atan2(ty - my, tx - mx), al = 8;
  return (<g>
    <path d={`M${fx},${fy} Q${mx},${my} ${tx},${ty}`} fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55" />
    <path d={`M${tx-al*Math.cos(angle-0.35)},${ty-al*Math.sin(angle-0.35)} L${tx},${ty} L${tx-al*Math.cos(angle+0.35)},${ty-al*Math.sin(angle+0.35)}`} fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55" />
  </g>);
}

function SkDrag({ comp, children, sel, onSel, onDrag }: any) {
  const [d, setD] = useState(false);
  const off = useRef({ x: 0, y: 0 });
  const down = (e: any) => { e.stopPropagation(); onSel(comp.id); setD(true); const svg = e.currentTarget.closest('svg'); const pt = svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const sp = pt.matrixTransform(svg.getScreenCTM().inverse()); off.current = { x: sp.x - comp.x, y: sp.y - comp.y }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: any) => { if (!d) return; const svg = e.currentTarget.closest('svg'); const pt = svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const sp = pt.matrixTransform(svg.getScreenCTM().inverse()); onDrag(comp.id, sp.x - off.current.x, sp.y - off.current.y); };
  return (<g onPointerDown={down} onPointerMove={move} onPointerUp={()=>setD(false)} style={{ cursor: 'grab' }}>{children}{sel && <circle cx={comp.x} cy={comp.y} r={comp.size * 2 + 15} fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />}</g>);
}

// ─── THE MAIN PLATING SKETCH COMPONENT ──────────────────────────────────────

function PlatingSketch({ adaptation, venueName, venueAccent, onSvgGenerated }: {
  adaptation: VenueAdaptation; venueName: string; venueAccent: string; onSvgGenerated?: (svg: string) => void;
}) {
  // Auto-map adaptation components to plate elements
  const buildInitialComps = useCallback(() => {
    return (adaptation.components || []).map((c, i) => {
      const shape = guessShape(c.name);
      const pos = POSITION_RINGS[i % POSITION_RINGS.length];
      const baseSize = shape === 'dome' ? 50 : shape === 'sauce' ? 40 : shape === 'berries' ? 22 : shape === 'leaf garnish' ? 16 : shape === 'pulled sugar' ? 32 : 28;
      // First component (main) gets center, larger size
      const isMain = i === 0 && shape === 'dome';
      return {
        id: i + 1,
        name: c.name,
        shape,
        x: pos.x + (Math.random() - 0.5) * 20,
        y: pos.y + (Math.random() - 0.5) * 20,
        size: isMain ? 60 : baseSize,
        color: guessColor(c.name),
      };
    });
  }, [adaptation.components]);

  const [comps, setComps] = useState(buildInitialComps);
  const [sel, setSel] = useState<number | null>(null);
  const [edit, setEdit] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(100);

  const drag = useCallback((id: number, x: number, y: number) => setComps(p => p.map(c => c.id === id ? { ...c, x, y } : c)), []);
  const upd = (id: number, u: any) => setComps(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  const rm = (id: number) => { setComps(p => p.filter(c => c.id !== id)); if (sel === id) { setSel(null); setEdit(null); } };
  const add = () => { const id = nextId.current++; setComps(p => [...p, { id, name: 'New Component', shape: 'dome', x: STUDIO_PX + (Math.random() - 0.5) * 100, y: STUDIO_PY + (Math.random() - 0.5) * 100, size: 30, color: '#B8A88A' }]); setSel(id); setEdit(id); };

  const exportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    if (onSvgGenerated) onSvgGenerated(svgData);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${adaptation.title.toLowerCase().replace(/\s+/g, '-')}-plating.svg`;
    a.click(); URL.revokeObjectURL(url);
  };

  const captureForPdf = useCallback(() => {
    if (svgRef.current && onSvgGenerated) {
      onSvgGenerated(new XMLSerializer().serializeToString(svgRef.current));
    }
  }, [onSvgGenerated]);

  // Auto-capture SVG for PDF on first render and when components change
  React.useEffect(() => { const t = setTimeout(captureForPdf, 500); return () => clearTimeout(t); }, [comps, captureForPdf]);

  return (
    <div>
      <div className={`relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 ${zoomed ? 'fixed inset-4 z-50 shadow-2xl overflow-auto' : ''}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-white flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: venueAccent }}>Interactive Plating Studio</div>
            <span className="text-[10px] text-stone-400 italic hidden sm:inline">Drag components to position</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={add} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-all">
              + Add
            </button>
            <button onClick={() => setZoomed(z => !z)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all">
              {zoomed ? 'Close' : 'Expand'}
            </button>
            <button onClick={exportSvg} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all" style={{ background: `${venueAccent}18`, color: venueAccent, border: `1px solid ${venueAccent}40` }}>
              <Download size={11} /> SVG
            </button>
          </div>
        </div>

        <div className={`flex ${zoomed ? 'h-[calc(100%-44px)]' : ''}`}>
          {/* SVG Canvas */}
          <div className="flex-1 p-3" style={{ background: '#fdfcf8' }}>
            <svg ref={svgRef} viewBox="0 0 800 680" className="w-full" onClick={() => { setSel(null); setEdit(null); }}>
              <defs>
                <radialGradient id="skPShine" cx="36%" cy="30%" r="58%"><stop offset="0%" stopColor="#fff" stopOpacity="0.45" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
              </defs>
              {/* Plate */}
              <ellipse cx={STUDIO_PX + 5} cy={STUDIO_PY + 8} rx={STUDIO_PR + 16} ry={STUDIO_PR + 16} fill="#c0b8a8" opacity="0.1" />
              <ellipse cx={STUDIO_PX} cy={STUDIO_PY} rx={STUDIO_PR + 10} ry={STUDIO_PR + 10} fill="none" stroke="#b0a898" strokeWidth="0.5" />
              <ellipse cx={STUDIO_PX} cy={STUDIO_PY} rx={STUDIO_PR} ry={STUDIO_PR} fill="#fefefe" stroke="#807868" strokeWidth="1.5" />
              <ellipse cx={STUDIO_PX} cy={STUDIO_PY} rx={STUDIO_PR} ry={STUDIO_PR} fill="url(#skPShine)" />
              <ellipse cx={STUDIO_PX} cy={STUDIO_PY} rx={STUDIO_PR - 35} ry={STUDIO_PR - 35} fill="none" stroke="#ccc5b5" strokeWidth="0.3" strokeDasharray="1.5,6" opacity="0.35" />
              <path d={`M${STUDIO_PX - STUDIO_PR * 0.65},${STUDIO_PY - STUDIO_PR * 0.72} A${STUDIO_PR},${STUDIO_PR} 0 0,1 ${STUDIO_PX + STUDIO_PR * 0.72},${STUDIO_PY - STUDIO_PR * 0.6}`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />

              {/* Components */}
              {comps.map(c => { const R = SK_RENDERERS[c.shape] || SkDome; return (
                <SkDrag key={c.id} comp={c} sel={sel === c.id} onSel={(id: number) => { setSel(id); setEdit(id); }} onDrag={drag}>
                  <R x={c.x} y={c.y} size={c.size} color={c.color} id={c.id} />
                </SkDrag>
              ); })}

              {/* Labels */}
              {comps.map((c, i) => {
                const lp = STUDIO_LABELS[i % STUDIO_LABELS.length];
                const ax = lp.a === 'start' ? lp.x + c.name.length * 3 : lp.a === 'end' ? lp.x - c.name.length * 3 : lp.x;
                return (<g key={`l-${c.id}`}>
                  <SkArrow fx={ax} fy={lp.y + 4} tx={c.x} ty={c.y} />
                  <text x={lp.x} y={lp.y} textAnchor={lp.a} style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: '13px', fontStyle: 'italic', fill: '#3a3020' }}>{c.name}</text>
                </g>);
              })}

              {/* Title */}
              <text x={STUDIO_PX} y={660} textAnchor="middle" style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: 700, fill: '#2c2418', letterSpacing: '0.08em' }}>{adaptation.title.toUpperCase()}</text>
              <text x={STUDIO_PX} y={675} textAnchor="middle" style={{ fontFamily: 'Georgia, serif', fontSize: '10px', fill: '#8a7e6b', fontStyle: 'italic' }}>{venueName}</text>
            </svg>
          </div>

          {/* Side editor panel (visible when expanded or on desktop) */}
          {(zoomed || sel !== null) && (
            <div className={`border-l border-stone-100 bg-stone-50 overflow-y-auto p-3 ${zoomed ? 'w-[260px]' : 'w-[240px] hidden lg:block'}`} style={{ fontSize: '12px' }}>
              <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2">Components ({comps.length})</div>
              {comps.map(c => (
                <div key={c.id} onClick={() => { setSel(c.id); setEdit(c.id); }}
                  className={`p-2 mb-1 rounded cursor-pointer transition-all border ${sel === c.id ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-stone-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-700 truncate">{c.name}</span>
                    <button onClick={e => { e.stopPropagation(); rm(c.id); }} className="text-stone-300 hover:text-red-400 text-sm">×</button>
                  </div>
                  {edit === c.id && (
                    <div className="mt-2 space-y-2">
                      <input value={c.name} onChange={e => upd(c.id, { name: e.target.value })}
                        className="w-full px-2 py-1 text-[11px] border border-stone-200 rounded bg-white outline-none focus:border-[#C9A84C]" />
                      <div className="flex flex-wrap gap-1">
                        {SK_SHAPES.map(s => (
                          <button key={s} onClick={e => { e.stopPropagation(); upd(c.id, { shape: s }); }}
                            className={`px-1.5 py-0.5 text-[9px] rounded border capitalize ${c.shape === s ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200'}`}>{s}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-stone-400 font-semibold w-7">SIZE</span>
                        <input type="range" min={10} max={80} value={c.size} onChange={e => upd(c.id, { size: parseInt(e.target.value) })} className="flex-1 accent-[#C9A84C]" />
                        <span className="text-[10px] text-stone-500 w-5">{c.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-stone-400 font-semibold w-7">TINT</span>
                        <input type="color" value={c.color} onChange={e => upd(c.id, { color: e.target.value })} className="w-6 h-4 border border-stone-200 rounded cursor-pointer" />
                        <span className="text-[9px] text-stone-400 font-mono">{c.color}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {zoomed && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setZoomed(false)} />}
    </div>
  );
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function downloadAsPDF(result: AdaptationResult, chefName: string, originalTitle: string, venueAccent: string, svgSketch?: string | null) {
  const { menuAnalysis: m, adaptation: a } = result;

  const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = `${slug}-recipe-card.pdf`;
  const dateStr = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });

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

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:#FAF8F4;color:#2C2C2C;font-size:11px;line-height:1.6}
    .page{max-width:760px;margin:0 auto;padding:36px 44px;background:#FAF8F4}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2px solid ${venueAccent};margin-bottom:24px}
    .brand{font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${venueAccent};margin-bottom:5px}
    .venue-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#1B3A2D}
    .header-right{text-align:right;font-size:9px;color:#8B8578;line-height:1.8}
    .dish-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#1B3A2D;margin-bottom:5px}
    .dish-sub{font-size:11px;color:#8B8578;margin-bottom:14px}
    .philosophy{border-left:4px solid ${venueAccent};padding:11px 15px;background:${venueAccent}18;border-radius:0 6px 6px 0;margin-bottom:18px;font-size:11px;line-height:1.7}
    .block-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${venueAccent};margin-bottom:5px}
    .meta-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:10px 18px;padding:12px 0;border-top:1px solid #E5E0D8;border-bottom:1px solid #E5E0D8;margin-bottom:20px}
    .meta-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B8578;margin-bottom:2px}
    .meta-val{font-size:11px;font-weight:600;color:#1B3A2D}
    .allergen-val{color:#C44536!important}
    .sketch-box{border:1px solid #E0DDD8;border-radius:8px;padding:12px;background:#FAF8F4;margin-bottom:20px}
    .sketch-box svg{width:100%;height:auto;display:block}
    .analysis-box{background:#1B3A2D;border-radius:8px;padding:14px 18px;margin-bottom:20px}
    .analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;margin-top:8px}
    .analysis-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C9A84C;margin-bottom:3px}
    .analysis-val{font-size:10px;color:#D4CFC7;line-height:1.5}
    .analysis-title{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:#fff;margin-bottom:2px}
    .analysis-identity{font-size:10px;color:#A0A098;font-style:italic;margin-bottom:8px}
    .hero-tags{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}
    .hero-tag{background:#2D5A45;color:#C9A84C;font-size:8px;font-weight:600;padding:2px 6px;border-radius:20px}
    .component{margin-bottom:18px;padding-left:12px;border-left:2px solid ${venueAccent}}
    .component-title{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${venueAccent};margin-bottom:8px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .section-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B8578;margin-bottom:5px}
    .ingredient{padding:1.5px 0;font-size:10px;color:#3C3C3C}
    .make-ahead{margin-top:6px;background:#F0EDE8;padding:5px 8px;border-radius:4px;font-size:9.5px;color:#5C5C5C}
    .step{display:flex;gap:7px;margin-bottom:4px;font-size:10px;line-height:1.5}
    .step-num{color:${venueAccent};font-weight:700;min-width:14px;flex-shrink:0}
    .assembly-step{display:flex;gap:9px;padding:4px 0;border-bottom:1px solid #ECEAE6;font-size:10px}
    .assembly-step:last-child{border-bottom:none}
    .assembly-num{color:${venueAccent};font-weight:700;min-width:14px;flex-shrink:0}
    .plating-ref{font-size:9.5px;color:#8B8578;font-style:italic;margin-top:6px;line-height:1.5}
    .note{display:flex;gap:9px;padding:6px 0;border-bottom:1px solid #ECEAE6;font-size:10px;line-height:1.5}
    .note:last-child{border-bottom:none}
    .note-dash{color:${venueAccent};font-weight:700;flex-shrink:0}
    h2{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2C2C2C;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #E5E0D8}
    .footer{margin-top:28px;padding-top:14px;border-top:1px solid #E5E0D8;display:flex;justify-content:space-between;font-size:9px;color:#8B8578}
  `;

  const bodyHtml = `
    <div class="header">
      <div>
        <div class="brand">ChefOS by 1-Group \u00b7 Recipe Adaptation</div>
        <div class="venue-name">${m.venueName}</div>
      </div>
      <div class="header-right">Adapted from <em>${originalTitle}</em><br>Chef ${chefName}<br>${dateStr}</div>
    </div>
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
      ${a.allergens?.length > 0 ? `<div class="meta-item"><div class="meta-label">Allergens</div><div class="meta-val allergen-val">${a.allergens.join(' \u00b7 ')}</div></div>` : ''}
    </div>
    ${svgSketch ? `<h2>Plating Sketch</h2><div class="sketch-box">${svgSketch}</div>` : ''}
    <div class="analysis-box">
      <div class="analysis-label">Menu Analysis</div>
      <div class="analysis-title">${m.venueName}</div>
      <div class="analysis-identity">${m.cuisineIdentity}</div>
      <div class="analysis-grid">
        <div><div class="analysis-label">Flavour Register</div><div class="analysis-val">${m.flavourRegister}</div></div>
        <div><div class="analysis-label">Technique Fingerprint</div><div class="analysis-val">${m.techniqueFingerprint}</div></div>
        <div><div class="analysis-label">Hero Ingredients</div><div class="hero-tags">${(m.heroIngredients || []).map(i => `<span class="hero-tag">${i}</span>`).join('')}</div></div>
        <div><div class="analysis-label">Plating Philosophy</div><div class="analysis-val">${m.platingPhilosophy}</div></div>
      </div>
    </div>
    <h2>Recipe Components</h2>${componentHtml}
    <h2>Assembly &amp; Plating</h2>
    <div style="margin-bottom:20px">
      ${(a.assembly || []).map((s, i) => `<div class="assembly-step"><span class="assembly-num">${i + 1}.</span><span>${s}</span></div>`).join('')}
      ${a.platingRef ? `<div class="plating-ref">${a.platingRef}</div>` : ''}
    </div>
    <h2>Chef's Notes</h2>
    <div style="margin-bottom:20px">
      ${(a.chefNotes || []).map(n => `<div class="note"><span class="note-dash">\u2014</span><span>${n}</span></div>`).join('')}
    </div>
    <div class="footer">
      <span>ChefOS by 1-Group Singapore \u00b7 1-groupculinary.com</span>
      <span>Generated ${dateStr}</span>
    </div>
  `;

  const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<title>${a.title}</title>
<style>${styles}</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
</head>
<body>
<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#FAF8F4;font-family:Inter,sans-serif;flex-direction:column;gap:12px" id="loading">
  <div style="display:flex;gap:8px">
    <div style="width:8px;height:8px;border-radius:50%;background:${venueAccent};animation:b 1.2s ease-in-out infinite"></div>
    <div style="width:8px;height:8px;border-radius:50%;background:${venueAccent};animation:b 1.2s ease-in-out .2s infinite"></div>
    <div style="width:8px;height:8px;border-radius:50%;background:${venueAccent};animation:b 1.2s ease-in-out .4s infinite"></div>
  </div>
  <div style="font-size:13px;font-weight:600;color:#2C2C2C">Generating PDF\u2026</div>
  <div style="font-size:11px;color:#8B8578">This will download automatically</div>
  <style>@keyframes b{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}</style>
</div>
<div class="page" id="recipe" style="position:absolute;left:-9999px;top:0">${bodyHtml}</div>
<script>
window.addEventListener('load', async function() {
  try {
    const { jsPDF } = window.jspdf;
    const el = document.getElementById('recipe');
    el.style.left = '0';
    el.style.position = 'static';
    await new Promise(r => setTimeout(r, 400));
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FAF8F4',
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth + 100,
    });
    el.style.display = 'none';
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pageW = 210, pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;
    let remaining = imgH, yOffset = 0, page = 0;
    while (remaining > 0) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pageW, imgH, '', 'FAST');
      yOffset += pageH;
      remaining -= pageH;
      page++;
    }
    pdf.save('${filename}');
    document.getElementById('loading').innerHTML = '<div style="text-align:center"><div style="font-size:22px;margin-bottom:8px">\u2713</div><div style="font-size:13px;font-weight:600;color:#1B3A2D">PDF downloaded</div><div style="font-size:11px;color:#8B8578;margin-top:4px">Check your downloads folder</div><button onclick="window.close()" style="margin-top:16px;padding:8px 20px;background:${venueAccent};color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer">Close</button></div>';
  } catch(e) {
    document.getElementById('loading').innerHTML = '<div style="text-align:center"><div style="font-size:13px;color:#C44536;font-weight:600">PDF generation failed</div><div style="font-size:11px;color:#8B8578;margin-top:4px">' + e.message + '</div><button onclick="window.close()" style="margin-top:12px;padding:8px 20px;border:1px solid #ddd;border-radius:6px;font-size:12px;cursor:pointer">Close</button></div>';
  }
});
<\/script>
</body></html>`;

  const w = window.open('', '_blank', 'width=500,height=300,menubar=no,toolbar=no,location=no,status=no');
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

          {/* Plating Studio — standalone interactive tool */}
          <Link href="/create/plating"
            className="bg-white rounded-xl border border-gray-200 hover:border-gold-300 p-5 sm:p-6 text-left hover:shadow-lg transition-all duration-200 active:scale-[0.98] group relative">
            <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-stone-100 text-stone-500">Interactive</div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Paintbrush size={22} className="text-white" /></div>
            <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-gold-700 transition-colors">Plating Studio</h3>
            <p className="text-xs font-medium text-gold-600 mb-2">Drag · Position · Annotate · Export SVG</p>
            <p className="text-sm text-gray-500 leading-relaxed">Interactive 3D plating diagram tool. Build dish compositions with domes, quenelles, sauce swooshes, berries, garnishes — drag to position, annotate with labels, export production-ready SVG sketches.</p>
          </Link>
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
