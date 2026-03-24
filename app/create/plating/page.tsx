'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, Loader2, Sparkles } from 'lucide-react';

const STYLES = [
  { id: 'classic', label: 'Classic', desc: 'Elegant side-lighting, charcoal & graphite' },
  { id: 'dramatic', label: 'Dramatic', desc: 'Chiaroscuro, deep shadows, heavy charcoal' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean pen & wash, kaiseki restraint' },
  { id: 'warm', label: 'Warm', desc: 'Golden light, watercolour wash, Mediterranean' },
  { id: 'editorial', label: 'Editorial', desc: 'Overhead flat-lit, architectural precision' },
];

const VENUES = [
  { id: '', label: 'No venue', accent: '#2c2418' },
  { id: 'Kaarla', label: 'Kaarla', accent: '#D4602A' },
  { id: 'Oumi', label: 'Oumi', accent: '#1C2533' },
  { id: 'MONTI', label: 'MONTI', accent: '#2C5F8A' },
  { id: 'Sol & Luna', label: 'Sol & Luna', accent: '#B86A3A' },
  { id: 'UNA', label: 'UNA', accent: '#8B3A3A' },
  { id: 'Fire Restaurant', label: 'Fire', accent: '#C0392B' },
  { id: 'FLNT', label: 'FLNT', accent: '#2D6A4F' },
  { id: 'Camille', label: 'Camille', accent: '#6B4C8A' },
  { id: 'La Luna', label: 'La Luna', accent: '#5C3D6E' },
  { id: 'La Torre', label: 'La Torre', accent: '#A0522D' },
];

const EXAMPLES = [
  'Seared scallop with cauliflower purée, sea urchin emulsion, nori crisp, and finger lime caviar on a bone-white plate',
  'Vacherin dessert: almond paste dome, strawberry sorbet quenelle, red currants, wine jus, pulled sugar garnish',
  'Wagyu beef tenderloin, charred leek ash purée, bone marrow butter, pickled shallot rings, micro herbs, red wine jus',
  'Deconstructed tiramisu: coffee-soaked savoiardi crumble, mascarpone quenelle, cocoa dust, amaretto gel dots',
];

export default function PlatingStudioPage() {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('classic');
  const [venue, setVenue] = useState('');
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const venueAccent = VENUES.find(v => v.id === venue)?.accent || '#2c2418';

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setSvg(null);

    try {
      const res = await fetch('/api/chat/sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || description.split(',')[0].trim().slice(0, 50),
          venueName: venue,
          imagePrompt: description,
          components: description.split(',').map(s => ({ name: s.trim() })),
          assembly: [],
          venueAccent,
          style,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setSvg(data.svg);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'plating-sketch').toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = (ex: string) => {
    setDescription(ex);
    setTitle(ex.split(':')[0].split(',')[0].trim().slice(0, 40));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-screen-lg mx-auto flex items-center gap-4">
          <Link href="/create"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Creative Studio</span>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Plating Studio
            </h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">AI-Generated Sketch Diagrams</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Input Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Dish Title */}
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-1.5">Dish Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Truffle Risotto"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-1.5">
                Describe the Plating
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the dish, its components, positions, sauce work, garnishes, and vessel. Be specific about spatial arrangement — the more detail, the better the sketch."
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Style */}
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-2">Sketch Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={`px-3 py-2 rounded-lg text-left transition-all border ${
                      style === s.id
                        ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className={`text-xs font-semibold ${style === s.id ? 'text-gold-700' : 'text-gray-800'}`}>{s.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block mb-1.5">Venue (optional)</label>
              <div className="flex flex-wrap gap-1.5">
                {VENUES.map(v => (
                  <button key={v.id} onClick={() => setVenue(v.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all border ${
                      venue === v.id
                        ? 'border-gold-500 bg-gold-50 text-gold-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              onClick={generate}
              disabled={loading || !description.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? '#8a7e6b' : 'linear-gradient(135deg, #2c2418, #5a4e3a)' }}>
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating Sketch...</>
              ) : (
                <><Sparkles size={16} /> Generate Plating Sketch</>
              )}
            </button>

            {/* Examples */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Try an Example</div>
              <div className="space-y-1.5">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => loadExample(ex)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 bg-white text-xs text-gray-500 leading-relaxed hover:border-gold-300 hover:bg-gold-50/30 transition-all line-clamp-2">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="lg:col-span-3">
            {/* Error */}
            {error && (
              <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50">
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <button onClick={generate} className="mt-2 text-xs font-bold uppercase tracking-wide text-red-500 hover:text-red-700">
                  Try Again
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="border border-gray-200 rounded-xl bg-white p-16 text-center">
                <div className="flex justify-center gap-2 mb-5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">Claude is drawing your dish...</div>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Composing organic shapes, applying watercolour wash layers, cross-hatching shadows, and positioning annotation labels.
                </p>
              </div>
            )}

            {/* Empty state */}
            {!svg && !loading && !error && (
              <div className="border border-dashed border-gray-300 rounded-xl bg-white p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-1">Describe a dish to begin</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Claude will generate a bespoke hand-drawn plating diagram — every sketch is unique, with organic shapes, watercolour wash shading, and professional annotation.
                </p>
              </div>
            )}

            {/* Result */}
            {svg && !loading && (
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: venueAccent }}>AI Sketch</span>
                    <span className="text-[10px] text-gray-400">{STYLES.find(s => s.id === style)?.label} style</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={generate}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-gray-200 text-gray-500 hover:border-gray-400 transition-all">
                      <RefreshCw size={11} /> Regenerate
                    </button>
                    <button onClick={downloadSvg}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide transition-all"
                      style={{ background: `${venueAccent}15`, color: venueAccent, border: `1px solid ${venueAccent}40` }}>
                      <Download size={11} /> SVG
                    </button>
                  </div>
                </div>

                {/* SVG Render */}
                <div className="p-4 bg-[#FAF8F4]"
                  dangerouslySetInnerHTML={{ __html: svg }}
                  style={{ maxWidth: '100%' }} />

                {/* Style switcher for quick re-renders */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Re-render in different style</div>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.filter(s => s.id !== style).map(s => (
                      <button key={s.id} onClick={() => { setStyle(s.id); setTimeout(generate, 100); }}
                        className="px-2.5 py-1 rounded text-[11px] font-medium border border-gray-200 text-gray-500 hover:border-gold-400 hover:text-gold-700 transition-all">
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
