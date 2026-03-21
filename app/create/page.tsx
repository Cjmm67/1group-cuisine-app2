'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChefHat, Flame, UtensilsCrossed, BookOpen, RefreshCw, Palette, FlaskConical,
  Send, Loader2, ArrowLeft, Sparkles, X, Upload, FileText, Image as ImageIcon,
  ChevronRight, Check, Copy, CheckCheck, ArrowRight,
} from 'lucide-react';
import { MOCK_CHEFS, MOCK_RECIPES } from '@/lib/mockData';

interface Message { role: 'user' | 'assistant'; content: string; fileName?: string; }
interface AttachedFile { name: string; type: 'pdf' | 'image' | 'text'; textContent?: string; base64?: string; mediaType?: string; }
interface VenueAdaptation {
  title: string; philosophy: string; yield: string; prepTime: string; cookTime: string;
  estimatedFoodCost: string; allergens: string[];
  components: Array<{ name: string; ingredients: string[]; method: string[]; makeAhead: string; }>;
  assembly: string[]; platingRef: string; chefNotes: string[]; imagePrompt: string;
}
interface Adaptations { kaarla: VenueAdaptation; sol_luna: VenueAdaptation; oumi: VenueAdaptation; }

const VENUE_KEYS = ['kaarla', 'sol_luna', 'oumi'] as const;
const VENUES = {
  kaarla: { key: 'kaarla' as const, name: 'KAARLA', sub: 'Rooftop · Live Fire · Mediterranean-meets-Asia', accent: '#D4602A', accentBg: '#FDF0EA', icon: '🔥' },
  sol_luna: { key: 'sol_luna' as const, name: 'SOL & LUNA', sub: 'Mediterranean Soul · Sun-Drenched · Shared', accent: '#B86A3A', accentBg: '#FBF0E9', icon: '☀️' },
  oumi: { key: 'oumi' as const, name: 'OUMI', sub: 'Japanese-Influenced · Precision · Umami Depth', accent: '#C9A84C', accentBg: '#FBF6EC', icon: '🌿' },
};
const LOADING_MESSAGES = ['Translating this dish across three 1-Group kitchens…','Passing through Kaarla\'s ember…','Laying it on Sol & Luna\'s table…','Arriving at Oumi with precision…','Writing full production recipes…'];

const MODES = [
  { id: 'recipe-adapt', title: 'Recipe Adaptation Engine', subtitle: 'Platform Recipe → 3 Venue Translations', description: 'Select any chef\'s recipe from the platform and instantly receive three full, production-ready adaptations — one each for Kaarla, Sol & Luna, and Oumi — with components, plating, chef\'s notes, and image prompts.', icon: RefreshCw, colour: 'from-[#1B3A2D] to-[#2D5A45]', isStructured: true },
  { id: 'menu-intelligence', title: 'Menu Intelligence', subtitle: 'Upload Menu → Brand DNA & Benchmarking', description: 'Upload or paste your menu for instant Brand DNA analysis, competitive benchmarking against Singapore and international restaurants, gap identification, and dish concepts inspired by the world\'s best.', icon: BookOpen, colour: 'from-gold-500 to-gold-700', prompt: 'I want to analyse a menu. I\'ll paste or describe the menu contents now. Run the full Brand DNA Analysis, competitive benchmarking, and opportunity map.', mode: 'Menu Intelligence Engine', isStructured: false },
  { id: 'dish-builder', title: 'Dish Builder', subtitle: 'Idea → Complete Recipe', description: 'Turn a spark — an ingredient, a memory, a technique — into a fully developed, production-ready dish with costing, allergens, and plating.', icon: Flame, colour: 'from-orange-500 to-red-600', prompt: 'I want to create a new dish. Help me develop it from concept to a complete kitchen recipe card with global restaurant references.', mode: 'Dish Builder', isStructured: false },
  { id: 'flavour-explorer', title: 'Flavour Explorer', subtitle: 'Ingredient → Pairing Ideas', description: 'Explore what works with a given ingredient through molecular science, classical tradition, and progressive combinations.', icon: Sparkles, colour: 'from-amber-500 to-yellow-600', prompt: 'I want to explore flavour pairings for an ingredient. Give me molecular, classical, and progressive pairing ideas with real restaurant references.', mode: 'Flavour Explorer', isStructured: false },
  { id: 'menu-architect', title: 'Menu Architect', subtitle: 'Brief → Complete Menu', description: 'Build a tasting menu, à la carte section, banquet set, or seasonal rotation — benchmarked against comparable restaurants.', icon: UtensilsCrossed, colour: 'from-emerald-500 to-teal-600', prompt: 'I need to build a menu. Help me design the full sequence benchmarked against comparable restaurants globally.', mode: 'Menu Architect', isStructured: false },
  { id: 'plating-coach', title: 'Plating Coach', subtitle: 'Description → Actionable Feedback', description: 'Get specific, actionable plating feedback — composition, colour, height, sauce work, garnish, vessel.', icon: Palette, colour: 'from-purple-500 to-pink-600', prompt: 'I want feedback on a dish presentation. I\'ll describe the plating or share what I have.', mode: 'Plating & Presentation Coach', isStructured: false },
  { id: 'rd-lab', title: 'R&D Lab', subtitle: 'Technique → Test Protocol', description: 'Experiment with fermentation, smoking, curing, hydrocolloids — with food science, test protocols, and HACCP notes.', icon: FlaskConical, colour: 'from-cyan-500 to-blue-600', prompt: 'I want to experiment with a technique or process. Help me design a test protocol with food science and references.', mode: 'R&D Lab', isStructured: false },
];

function renderMarkdown(text: string) {
  const lines = text.split('\n'); const elements: React.ReactNode[] = []; let listItems: string[] = []; let listType: 'ul' | 'ol' | null = null;
  const flushList = () => { if (listItems.length > 0 && listType) { const Tag = listType; elements.push(<Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 my-2 space-y-1`}>{listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed">{formatInline(item)}</li>)}</Tag>); listItems = []; listType = null; } };
  const formatInline = (str: string): React.ReactNode => { const parts = str.split(/(\*\*[^*]+\*\*)/g); return parts.map((part, i) => { if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-gray-900">{part.slice(2,-2)}</strong>; return part; }); };
  for (let i = 0; i < lines.length; i++) { const line = lines[i]; const trimmed = line.trim(); if (/^[-•]\s/.test(trimmed)) { if (listType !== 'ul') flushList(); listType = 'ul'; listItems.push(trimmed.replace(/^[-•]\s+/,'')); continue; } if (/^\d+[.)]\s/.test(trimmed)) { if (listType !== 'ol') flushList(); listType = 'ol'; listItems.push(trimmed.replace(/^\d+[.)]\s+/,'')); continue; } flushList(); if (!trimmed) { if (elements.length > 0) elements.push(<div key={`br-${i}`} className="h-2" />); continue; } elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(trimmed)}</p>); }
  flushList(); return elements;
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  return <button onClick={handleCopy} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border transition-all ${copied ? 'border-green-400 text-green-600 bg-green-50' : 'border-stone-200 text-stone-400 hover:border-[#C9A84C] hover:text-[#A88B3D]'}`}>{copied ? <><CheckCheck size={11} /> Copied</> : <><Copy size={11} /> {label}</>}</button>;
}

function VenueAdaptationView({ data, venueKey, chefName, originalTitle }: { data: VenueAdaptation; venueKey: typeof VENUE_KEYS[number]; chefName: string; originalTitle: string; }) {
  const venue = VENUES[venueKey];
  const fullText = [`${venue.name} ADAPTATION`,`\n${data.title}`,`Adapted from "${originalTitle}" by Chef ${chefName}`,`\n${data.philosophy}`,`\nYield: ${data.yield} | Prep: ${data.prepTime} | Cook: ${data.cookTime}`,`Food Cost: ${data.estimatedFoodCost}`,`Allergens: ${(data.allergens||[]).join(', ')||'None'}`, ...(data.components||[]).flatMap(c=>[`\n─── ${c.name} ───`,`Ingredients:\n${(c.ingredients||[]).map(i=>`  · ${i}`).join('\n')}`,`Method:\n${(c.method||[]).map((s,i)=>`  ${i+1}. ${s}`).join('\n')}`,c.makeAhead?`Make-ahead: ${c.makeAhead}`:'']),`\n─── Assembly ───\n${(data.assembly||[]).map((s,i)=>`${i+1}. ${s}`).join('\n')}`,`Plating ref: ${data.platingRef}`,`\nChef's Notes:\n${(data.chefNotes||[]).map(n=>`· ${n}`).join('\n')}`,`\nImage Prompt:\n${data.imagePrompt}`].join('\n');
  return (
    <div className="py-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: venue.accent }}>{venue.icon} {venue.name} · {venue.sub}</div>
          <h3 className="text-2xl font-bold text-stone-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{data.title}</h3>
          <p className="text-xs text-stone-400 mt-1">Adapted from <em>{originalTitle}</em> — Chef {chefName}</p>
        </div>
        <CopyButton text={fullText} label="Copy recipe" />
      </div>
      <div className="rounded-r-lg border-l-4 p-4 mb-5" style={{ borderColor: venue.accent, background: venue.accentBg }}>
        <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: venue.accent }}>Adaptation Philosophy</div>
        <p className="text-sm text-stone-700 leading-relaxed">{data.philosophy}</p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 py-3 border-t border-b border-stone-100 mb-5">
        {[{label:'Yield',val:data.yield},{label:'Prep',val:data.prepTime},{label:'Cook',val:data.cookTime},{label:'Food Cost',val:data.estimatedFoodCost}].map(m=>(
          <div key={m.label}><div className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{m.label}</div><div className="text-sm font-semibold text-stone-800 mt-0.5">{m.val}</div></div>
        ))}
        {data.allergens?.length>0&&<div><div className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Allergens</div><div className="text-xs font-semibold text-red-600 mt-0.5">{data.allergens.join(' · ')}</div></div>}
      </div>
      {(data.components||[]).map((comp,ci)=>(
        <div key={ci} className="mb-5 pl-4 border-l-2" style={{ borderColor: venue.accent }}>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: venue.accent }}>Component {ci+1} — {comp.name}</div>
          <div className="mb-3"><div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 mb-2">Ingredients</div>{(comp.ingredients||[]).map((ing,ii)=><div key={ii} className="flex gap-2 items-baseline"><span className="font-bold text-sm flex-shrink-0" style={{ color: venue.accent }}>·</span><span className="text-sm text-stone-700 leading-relaxed">{ing}</span></div>)}</div>
          <div className="mb-3"><div className="text-[10px] font-bold tracking-wider uppercase text-stone-400 mb-2">Method</div>{(comp.method||[]).map((step,si)=><div key={si} className="flex gap-3 mb-1.5"><span className="font-bold text-xs flex-shrink-0 mt-0.5" style={{ color: venue.accent }}>{si+1}.</span><span className="text-sm text-stone-700 leading-relaxed">{step}</span></div>)}</div>
          {comp.makeAhead&&<div className="bg-stone-50 rounded px-3 py-2 text-sm text-stone-600"><span className="font-semibold text-stone-500">Make-ahead: </span>{comp.makeAhead}</div>}
        </div>
      ))}
      <div className="mb-5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-3">Assembly & Plating</div>
        <div className="divide-y divide-stone-100">{(data.assembly||[]).map((step,si)=><div key={si} className="flex gap-3 py-2"><span className="font-bold text-xs flex-shrink-0 mt-0.5" style={{ color: venue.accent }}>{si+1}.</span><span className="text-sm text-stone-700 leading-relaxed">{step}</span></div>)}</div>
        {data.platingRef&&<p className="text-xs text-stone-400 italic mt-3 leading-relaxed">{data.platingRef}</p>}
      </div>
      <div className="mb-5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-3">Chef's Notes</div>
        <div className="divide-y divide-stone-100">{(data.chefNotes||[]).map((note,ni)=><div key={ni} className="flex gap-3 py-2.5"><span className="flex-shrink-0 font-bold text-base leading-none mt-0.5" style={{ color: venue.accent }}>—</span><span className="text-sm text-stone-700 leading-relaxed">{note}</span></div>)}</div>
      </div>
      {data.imagePrompt&&(
        <div className="bg-stone-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2"><div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C]">Reference Image Prompt</div><CopyButton text={data.imagePrompt} label="Copy prompt" /></div>
          <p className="text-sm text-stone-300 italic leading-relaxed">{data.imagePrompt}</p>
        </div>
      )}
    </div>
  );
}

function RecipeAdaptationEngine({ onExit }: { onExit: () => void }) {
  const [adaptStep, setAdaptStep] = useState<1|2|3>(1);
  const [chefFilter, setChefFilter] = useState<'All'|'International'|'Resident'>('All');
  const [selectedChef, setSelectedChef] = useState<typeof MOCK_CHEFS[0]|null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof MOCK_RECIPES[0]|null>(null);
  const [adaptations, setAdaptations] = useState<Adaptations|null>(null);
  const [activeVenue, setActiveVenue] = useState<typeof VENUE_KEYS[number]>('kaarla');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string|null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const RESIDENT_IDS = ['chef-11','chef-12','chef-13','chef-14','chef-15'];
  const chefRecipes = selectedChef ? MOCK_RECIPES.filter(r => r.chef?.id === selectedChef.id) : [];
  const filteredChefs = MOCK_CHEFS.filter(c => { if (chefFilter==='All') return true; const res = RESIDENT_IDS.includes(c.id); return chefFilter==='Resident' ? res : !res; });

  const handleSelectChef = (chef: typeof MOCK_CHEFS[0]) => { setSelectedChef(chef); setSelectedRecipe(null); setAdaptations(null); setGenerateError(null); setAdaptStep(2); window.scrollTo({top:0,behavior:'smooth'}); };

  const handleGenerate = async () => {
    if (!selectedChef || !selectedRecipe) return;
    setIsGenerating(true); setGenerateError(null); setAdaptations(null); setAdaptStep(3); setLoadingMsgIdx(0);
    const interval = setInterval(() => setLoadingMsgIdx(p => Math.min(p+1, LOADING_MESSAGES.length-1)), 3000);
    try {
      const res = await fetch('/api/chat/adapt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ recipe: { title: selectedRecipe.title, chef_name: selectedChef.name, chef_venue: selectedChef.restaurant, cuisine_tags: selectedChef.cuisine, description: selectedRecipe.description, allergens: (selectedRecipe as any).allergens || [], yield: '4 portions' } }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Adaptation failed');
      setAdaptations(data.adaptations); setActiveVenue('kaarla');
    } catch (err: any) { setGenerateError(err.message||'Something went wrong. Please try again.'); }
    finally { clearInterval(interval); setIsGenerating(false); }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={18} className="text-gray-600" /></button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B3A2D] to-[#2D5A45] flex items-center justify-center"><RefreshCw size={15} className="text-[#C9A84C]" /></div>
            <div><h2 className="text-sm font-bold text-gray-900 leading-tight">Recipe Adaptation Engine</h2><p className="text-xs text-gray-500">Translate any platform recipe to Kaarla · Sol & Luna · Oumi</p></div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {VENUE_KEYS.map(k=><span key={k} className="text-xs font-bold px-2 py-1 rounded" style={{background:VENUES[k].accentBg,color:VENUES[k].accent}}>{VENUES[k].icon} {VENUES[k].name}</span>)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            {['Select Chef','Choose Recipe','Adaptations'].map((label,i)=>{
              const n=i+1; const done=adaptStep>n; const active=adaptStep===n;
              return <React.Fragment key={i}><div className="flex items-center gap-1.5"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${done?'bg-[#1B3A2D] text-[#C9A84C]':active?'bg-[#C9A84C] text-[#1B3A2D]':'bg-stone-200 text-stone-400'}`}>{done?'✓':n}</div><span className={`text-xs font-semibold uppercase tracking-wide ${active?'text-stone-800':done?'text-stone-500':'text-stone-300'}`}>{label}</span></div>{i<2&&<ChevronRight size={12} className="text-stone-300 flex-shrink-0" />}</React.Fragment>;
            })}
          </div>

          {/* STEP 1 */}
          {adaptStep===1&&(
            <div>
              <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
                <div><h3 className="text-xl font-bold text-stone-800">Select a Chef</h3><p className="text-sm text-stone-500 mt-0.5">Choose from {MOCK_CHEFS.length} chefs on the platform</p></div>
                <div className="flex gap-2">{(['All','International','Resident'] as const).map(f=><button key={f} onClick={()=>setChefFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chefFilter===f?'bg-[#1B3A2D] text-white border-[#1B3A2D]':'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}>{f}</button>)}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredChefs.map(chef=>{
                  const recipeCount = MOCK_RECIPES.filter(r=>r.chef?.id===chef.id).length;
                  const isRes = RESIDENT_IDS.includes(chef.id);
                  return (
                    <button key={chef.id} onClick={()=>handleSelectChef(chef)} className={`text-left p-3 rounded-xl border transition-all group ${selectedChef?.id===chef.id?'border-[#C9A84C] border-2 bg-[#FFFDF5] shadow-sm':'border-stone-200 bg-white hover:border-[#C9A84C] hover:shadow-sm'}`}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 mb-2.5">{chef.avatar?<img src={chef.avatar} alt={chef.name} className="w-full h-full object-cover object-top" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />:<div className="w-full h-full flex items-center justify-center text-lg">👨‍🍳</div>}</div>
                      <div className="text-sm font-bold text-stone-800 leading-tight mb-0.5">{chef.name}</div>
                      <div className="text-[11px] text-stone-400 mb-1.5 leading-tight">{chef.restaurant}</div>
                      <div className="flex items-center justify-between"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isRes?'bg-[#1B3A2D] text-[#C9A84C]':'bg-stone-100 text-stone-500'}`}>{isRes?'1-Group':'Intl'}</span><span className="text-[10px] text-stone-300">{recipeCount} recipe{recipeCount!==1?'s':''}</span></div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {adaptStep===2&&selectedChef&&(
            <div>
              <button onClick={()=>setAdaptStep(1)} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-5 transition-colors"><ArrowLeft size={14}/> Back to chefs</button>
              <div className="bg-[#1B3A2D] rounded-xl p-4 mb-6 flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#2D5A45] flex-shrink-0">{selectedChef.avatar?<img src={selectedChef.avatar} alt={selectedChef.name} className="w-full h-full object-cover object-top" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />:<div className="w-full h-full flex items-center justify-center text-2xl">👨‍🍳</div>}</div>
                <div className="flex-1"><div className="text-xs text-[#C9A84C] font-bold tracking-widest uppercase mb-1">Selected Chef</div><div className="text-xl font-bold text-white leading-tight">{selectedChef.name}</div><div className="text-sm text-stone-400 mt-0.5">{selectedChef.restaurant}</div></div>
                <div className="text-sm text-stone-400">{chefRecipes.length} recipe{chefRecipes.length!==1?'s':''} available</div>
              </div>
              <div className="mb-4"><h3 className="text-xl font-bold text-stone-800">Choose a Recipe</h3><p className="text-sm text-stone-500 mt-0.5">Select the dish to adapt across three venues</p></div>
              {chefRecipes.length===0?(
                <div className="bg-white rounded-xl border border-stone-200 p-8 text-center"><div className="text-3xl mb-3">🍽️</div><p className="text-stone-500 text-sm">No recipes found for this chef yet.</p><button onClick={()=>setAdaptStep(1)} className="mt-4 text-sm text-[#1B3A2D] font-semibold hover:underline">Choose a different chef</button></div>
              ):(
                <div className="space-y-3 mb-6">
                  {chefRecipes.map(recipe=>{
                    const isSel = selectedRecipe?.id===recipe.id;
                    return (
                      <button key={recipe.id} onClick={()=>setSelectedRecipe(recipe)} className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all ${isSel?'border-[#C9A84C] border-2 bg-[#FFFDF5] shadow-sm':'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1"><div className="font-bold text-stone-800 text-base leading-tight mb-1">{recipe.title}</div>{recipe.description&&<p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{recipe.description}</p>}</div>
                          {isSel&&<div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} className="text-[#1B3A2D] font-bold" strokeWidth={3} /></div>}
                        </div>
                        {recipe.cuisine&&recipe.cuisine.length>0&&<div className="flex flex-wrap gap-1.5 mt-3">{recipe.cuisine.map((tag:string)=><span key={tag} className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[#E8D5A0] text-[#A88B3D]">{tag}</span>)}{(recipe as any).allergens&&(recipe as any).allergens.length>0&&<span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-red-50 text-red-500">⚠ {(recipe as any).allergens.join(', ')}</span>}</div>}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedRecipe&&(
                <div className="sticky bottom-4 bg-white rounded-xl shadow-xl border border-stone-200 p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div><div className="text-xs text-stone-400 mb-0.5">Ready to adapt:</div><div className="font-bold text-stone-800 text-sm">{selectedRecipe.title}</div></div>
                  <div className="flex items-center gap-3"><div className="hidden sm:flex gap-2">{VENUE_KEYS.map(k=><span key={k} className="text-xs font-bold" style={{color:VENUES[k].accent}}>{VENUES[k].icon}</span>)}</div><button onClick={handleGenerate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B3A2D] hover:bg-[#2D5A45] text-[#C9A84C] font-bold text-sm tracking-wide uppercase transition-all active:scale-[0.97]">Adapt to 1-Group <ArrowRight size={14}/></button></div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {adaptStep===3&&(
            <div>
              <button onClick={()=>{setAdaptStep(2);setAdaptations(null);setGenerateError(null);}} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-5 transition-colors"><ArrowLeft size={14}/> Choose a different recipe</button>
              <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex items-center gap-4 flex-wrap">
                {selectedChef?.avatar&&<div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0"><img src={selectedChef.avatar} alt={selectedChef.name} className="w-full h-full object-cover object-top" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} /></div>}
                <div className="flex-1"><div className="text-xs text-stone-400 font-semibold uppercase tracking-wide">Adapting</div><div className="font-bold text-stone-800">{selectedRecipe?.title}</div><div className="text-xs text-stone-400">Chef {selectedChef?.name} · {selectedChef?.restaurant}</div></div>
                <div className="text-xs text-stone-400">→ Kaarla · Sol & Luna · Oumi</div>
              </div>

              {isGenerating&&(
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
                  <div className="flex justify-center gap-2 mb-5">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-[#C9A84C] animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</div>
                  <div className="text-base font-semibold text-stone-700 mb-2">{LOADING_MESSAGES[loadingMsgIdx]}</div>
                  <p className="text-sm text-stone-400">Generating three full venue adaptations — this takes 15–25 seconds</p>
                  <div className="flex justify-center gap-8 mt-8">{VENUE_KEYS.map(k=><div key={k} className="text-center"><div className="text-2xl mb-1">{VENUES[k].icon}</div><div className="text-[10px] font-bold tracking-widest uppercase" style={{color:VENUES[k].accent}}>{VENUES[k].name}</div></div>)}</div>
                </div>
              )}

              {generateError&&!isGenerating&&(
                <div className="bg-white rounded-xl border border-red-100 p-10 text-center"><div className="text-3xl mb-3">⚠</div><div className="font-bold text-stone-800 mb-2">Something went wrong</div><p className="text-sm text-stone-500 mb-5">{generateError}</p><button onClick={handleGenerate} className="px-5 py-2.5 rounded-lg bg-[#1B3A2D] text-[#C9A84C] font-bold text-sm uppercase tracking-wide hover:bg-[#2D5A45] transition-colors">Try again</button></div>
              )}

              {adaptations&&!isGenerating&&(
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="flex border-b border-stone-100">
                    {VENUE_KEYS.map(k=>(
                      <button key={k} onClick={()=>setActiveVenue(k)} className={`flex-1 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-[3px] ${activeVenue===k?'':'border-transparent text-stone-400 hover:text-stone-600'}`} style={activeVenue===k?{borderColor:VENUES[k].accent,color:VENUES[k].accent}:{}}>
                        <span className="hidden sm:inline">{VENUES[k].icon} </span>{VENUES[k].name}
                      </button>
                    ))}
                  </div>
                  <div className="px-5 sm:px-7">
                    {adaptations[activeVenue]&&selectedChef&&selectedRecipe&&<VenueAdaptationView data={adaptations[activeVenue]} venueKey={activeVenue} chefName={selectedChef.name} originalTitle={selectedRecipe.title} />}
                  </div>
                  <div className="bg-stone-900 p-5">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-[#C9A84C] mb-3">Three Translations — Quick View</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {VENUE_KEYS.map(k=>{ const a=adaptations[k]; return a?(<button key={k} onClick={()=>setActiveVenue(k)} className="text-left p-3.5 rounded-lg border transition-all" style={{borderColor:activeVenue===k?VENUES[k].accent:'rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)'}}><div className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{color:VENUES[k].accent}}>{VENUES[k].icon} {VENUES[k].name}</div><div className="text-sm font-bold text-white leading-tight">{a.title}</div><p className="text-xs text-stone-400 mt-1.5 leading-relaxed line-clamp-2">{a.philosophy}</p></button>):null; })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      const res = await fetch('/api/chat/creative', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages:[{role:'user',content:(mode as any).prompt}], mode:(mode as any).mode }) });
      const data = await res.json();
      if (data.message) setMessages([{role:'user',content:(mode as any).prompt},{role:'assistant',content:data.message}]);
    } catch { setMessages([{role:'user',content:(mode as any).prompt},{role:'assistant',content:'Sorry, there was an error. Please try again.'}]); }
    setIsLoading(false);
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 10*1024*1024) { alert('File too large — max 10MB'); return; }
    if (file.type==='application/pdf') { const r=new FileReader(); r.onload=()=>{ const b=(r.result as string).split(',')[1]; setAttachedFile({name:file.name,type:'pdf',base64:b,mediaType:'application/pdf'}); }; r.readAsDataURL(file); }
    else if (file.type.startsWith('image/')) { const r=new FileReader(); r.onload=()=>{ const b=(r.result as string).split(',')[1]; setAttachedFile({name:file.name,type:'image',base64:b,mediaType:file.type}); }; r.readAsDataURL(file); }
    else if (file.type==='text/plain'||file.name.endsWith('.txt')||file.name.endsWith('.csv')) { const t=await file.text(); setAttachedFile({name:file.name,type:'text',textContent:t}); }
    else alert('Supported: PDF, images, or text files');
  };

  const sendMessage = async () => {
    if ((!input.trim()&&!attachedFile)||isLoading) return;
    const userMsg=input.trim(); setInput(''); const cf=attachedFile; setAttachedFile(null);
    const displayText=cf?(userMsg?`📎 ${cf.name}\n\n${userMsg}`:`📎 ${cf.name}\n\nAnalyse this menu.`):userMsg;
    let apiContent: any;
    if (cf) { const blocks: any[]=[]; if (cf.type==='pdf'&&cf.base64) blocks.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:cf.base64}}); else if (cf.type==='image'&&cf.base64) blocks.push({type:'image',source:{type:'base64',media_type:cf.mediaType,data:cf.base64}}); else if (cf.type==='text'&&cf.textContent) blocks.push({type:'text',text:`[UPLOADED: ${cf.name}]\n\n${cf.textContent}`}); blocks.push({type:'text',text:userMsg||'Run full Menu Intelligence Engine analysis.'}); apiContent=blocks; } else apiContent=userMsg;
    const prev=messages.map(m=>({role:m.role,content:m.content}));
    const newMsgs: Message[]=[...messages,{role:'user',content:displayText,fileName:cf?.name}];
    setMessages(newMsgs); setIsLoading(true);
    try { const res=await fetch('/api/chat/creative',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...prev,{role:'user',content:apiContent}],mode:activeMode?.mode})}); const data=await res.json(); if (data.message) setMessages([...newMsgs,{role:'assistant',content:data.message}]); }
    catch { setMessages([...newMsgs,{role:'assistant',content:'Sorry, something went wrong. Please try again.'}]); }
    setIsLoading(false);
  };

  const handleKeyDown=(e:React.KeyboardEvent)=>{ if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const exitMode=()=>{ setActiveMode(null); setMessages([]); setInput(''); setAttachedFile(null); };

  if (activeMode?.isStructured) return <RecipeAdaptationEngine onExit={exitMode} />;

  if (!activeMode) return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-950 text-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-5"><ChefHat size={16} className="text-gold-400" /><span className="text-gold-300 text-xs font-semibold tracking-wide uppercase">AI Creative Studio</span></div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">Create Stunning Dishes</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Adapt any platform recipe across three 1-Group venues, upload your menu for Brand DNA analysis, or dive into dish development, flavour exploration, and culinary R&D.</p>
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 -mt-8 relative z-10 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {MODES.map(mode=>{ const Icon=mode.icon; const isNew=mode.id==='recipe-adapt'; return (
            <button key={mode.id} onClick={()=>startMode(mode)} className={`bg-white rounded-xl border p-5 sm:p-6 text-left hover:shadow-lg transition-all duration-200 active:scale-[0.98] group relative ${isNew?'border-[#C9A84C] ring-1 ring-[#C9A84C]/30':'border-gray-200 hover:border-gold-300'}`}>
              {isNew&&<div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#1B3A2D] text-[#C9A84C]">New</div>}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mode.colour} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><Icon size={22} className="text-white" /></div>
              <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-gold-700 transition-colors">{mode.title}</h3>
              <p className="text-xs font-medium text-gold-600 mb-2">{mode.subtitle}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{mode.description}</p>
            </button>
          ); })}
        </div>
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Or start with a freeform idea — the studio will detect the right mode automatically.</p>
          <button onClick={()=>setActiveMode({id:'freeform',title:'Creative Studio',subtitle:'Freeform',description:'',icon:ChefHat,colour:'from-gold-500 to-gold-700',isStructured:false} as any)} className="inline-flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors active:scale-[0.97]"><UtensilsCrossed size={16} />Start Freeform Session</button>
        </div>
      </section>
    </div>
  );

  const ModeIcon=activeMode.icon;
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
          {messages.length===0&&!isLoading&&(
            <div className="text-center py-12">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center mx-auto mb-4`}><ModeIcon size={28} className="text-white" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Creative Studio</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Paste a menu for instant Brand DNA analysis, describe a dish idea, share an ingredient, or tell me what you're working on.</p>
              <div className="flex flex-wrap gap-2 justify-center">{['I want to do something with crab','Analyse our current Kaarla menu','Build a 7-course tasting menu','Explore pairings for yuzu','Make my lobster dish gluten-free',"What are Singapore's top fire restaurants doing?"].map(q=><button key={q} onClick={()=>{setInput(q);setTimeout(()=>inputRef.current?.focus(),100);}} className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gold-300 hover:text-gold-700 transition-all">{q}</button>)}</div>
            </div>
          )}
          {messages.map((msg,idx)=>{ if (idx===0&&msg.role==='user'&&(activeMode as any).prompt&&msg.content===(activeMode as any).prompt) return null; return (<div key={idx} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`}>{msg.role==='assistant'&&<div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}><ModeIcon size={14} className="text-white" /></div>}<div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${msg.role==='user'?'bg-gray-900 text-white rounded-br-md':'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-md'}`}>{msg.role==='assistant'?renderMarkdown(msg.content):<p className="text-sm leading-relaxed">{msg.content}</p>}</div></div>); })}
          {isLoading&&<div className="flex justify-start"><div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${(activeMode as any).colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}><ModeIcon size={14} className="text-white" /></div><div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2"><Loader2 size={14} className="animate-spin text-gold-500" /><span className="text-sm text-gray-400">Creating...</span></div></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onDragOver={e=>{e.preventDefault();e.currentTarget.classList.add('bg-gold-50');}} onDragLeave={e=>{e.currentTarget.classList.remove('bg-gold-50');}} onDrop={e=>{e.currentTarget.classList.remove('bg-gold-50');const f=e.dataTransfer.files[0];if(f)handleFileSelect(f);e.preventDefault();}}>
        <div className="max-w-screen-lg mx-auto">
          {attachedFile&&<div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg text-sm">{attachedFile.type==='pdf'?<FileText size={16} className="text-gold-600 flex-shrink-0" />:<ImageIcon size={16} className="text-gold-600 flex-shrink-0" />}<span className="text-gold-800 font-medium truncate flex-1">{attachedFile.name}</span><button onClick={()=>setAttachedFile(null)} className="text-gold-400 hover:text-gold-600"><X size={14} /></button></div>}
          <div className="flex items-end gap-2">
            <button onClick={()=>fileInputRef.current?.click()} disabled={isLoading} className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 flex-shrink-0 border border-gray-200 transition-all"><Upload size={18} className="text-gray-500" /></button>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFileSelect(f);e.target.value='';}} />
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={attachedFile?'Add notes (optional)...':'Describe your idea, paste a menu, or drop a file...'} disabled={isLoading} rows={1} className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 disabled:opacity-50 placeholder:text-gray-400 resize-none" style={{minHeight:'44px',maxHeight:'120px'}} onInput={e=>{const el=e.target as HTMLTextAreaElement;el.style.height='44px';el.style.height=Math.min(el.scrollHeight,120)+'px';}} />
            <button onClick={sendMessage} disabled={(!input.trim()&&!attachedFile)||isLoading} className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-30 hover:opacity-90 active:scale-95 flex-shrink-0 bg-gray-900 hover:bg-gray-800 transition-all"><Send size={16} className="text-white ml-0.5" /></button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Drop a PDF or image of your menu, or paste the text directly</p>
        </div>
      </div>
    </div>
  );
}
