'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Palette, List, Printer, Plus, Trash2 } from 'lucide-react';

/* ── Seeded random for consistent hand-drawn feel ── */
function createRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function jitter(val: number, amount: number, rng: () => number) {
  return val + (rng() - 0.5) * amount * 2;
}

/* ── Shape generators ── */
function wobblyCircle(cx: number, cy: number, r: number, rng: () => number, pts = 8) {
  const d: string[] = [];
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const jr = r + (rng() - 0.5) * r * 0.18;
    const x = cx + Math.cos(a) * jr, y = cy + Math.sin(a) * jr;
    if (i === 0) d.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    else {
      const cpx = cx + Math.cos(a - 0.35) * jr * 1.12;
      const cpy = cy + Math.sin(a - 0.35) * jr * 1.12;
      d.push(`Q ${jitter(cpx, 1.5, rng).toFixed(1)} ${jitter(cpy, 1.5, rng).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  d.push('Z');
  return d.join(' ');
}

function moundShape(cx: number, cy: number, w: number, h: number, rng: () => number) {
  const l = cx - w / 2, r = cx + w / 2, t = cy - h, b = cy;
  return `M ${jitter(l, 2, rng).toFixed(1)} ${b.toFixed(1)} Q ${jitter(l - 5, 3, rng).toFixed(1)} ${jitter(t + h * 0.3, 3, rng).toFixed(1)} ${jitter(cx - w * 0.15, 2, rng).toFixed(1)} ${jitter(t, 3, rng).toFixed(1)} Q ${jitter(cx + w * 0.15, 2, rng).toFixed(1)} ${jitter(t - 5, 3, rng).toFixed(1)} ${jitter(r + 5, 3, rng).toFixed(1)} ${jitter(t + h * 0.3, 3, rng).toFixed(1)} Q ${jitter(r + 8, 3, rng).toFixed(1)} ${jitter(b - h * 0.2, 3, rng).toFixed(1)} ${jitter(r, 2, rng).toFixed(1)} ${b.toFixed(1)} Z`;
}

function sauceSwoosh(x1: number, y1: number, x2: number, y2: number, curve: number, widthVal: number, rng: () => number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${jitter(mx, 4, rng).toFixed(1)} ${jitter(my - curve, 4, rng).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 + 2).toFixed(1)} ${(y2 + 3).toFixed(1)} Q ${jitter(mx, 4, rng).toFixed(1)} ${jitter(my - curve + widthVal, 4, rng).toFixed(1)} ${(x1 + 1).toFixed(1)} ${(y1 + 2).toFixed(1)} Z`;
}

function quenelleShape(cx: number, cy: number, w: number, h: number, rng: () => number) {
  const hw = w / 2, hh = h / 2;
  return `M ${(cx - hw).toFixed(1)} ${cy.toFixed(1)} Q ${jitter(cx - hw * 0.5, 2, rng).toFixed(1)} ${jitter(cy - hh, 2, rng).toFixed(1)} ${cx.toFixed(1)} ${jitter(cy - hh, 2, rng).toFixed(1)} Q ${jitter(cx + hw * 0.5, 2, rng).toFixed(1)} ${jitter(cy - hh, 2, rng).toFixed(1)} ${(cx + hw).toFixed(1)} ${cy.toFixed(1)} Q ${jitter(cx + hw * 0.5, 2, rng).toFixed(1)} ${jitter(cy + hh, 2, rng).toFixed(1)} ${cx.toFixed(1)} ${jitter(cy + hh, 2, rng).toFixed(1)} Q ${jitter(cx - hw * 0.5, 2, rng).toFixed(1)} ${jitter(cy + hh, 2, rng).toFixed(1)} ${(cx - hw).toFixed(1)} ${cy.toFixed(1)} Z`;
}

/* ── Types ── */
type CompType = 'protein' | 'sauce' | 'starch' | 'vegetable' | 'garnish' | 'dairy' | 'fruit' | 'pastry' | 'glaze' | 'sugar_work' | 'jus' | 'ice_cream' | 'sorbet' | 'crumb';
type ShapeKind = 'mound' | 'quenelle' | 'swoosh' | 'dots' | 'berry' | 'shard' | 'scatter';

interface PlateComp {
  id: string; name: string; type: CompType; cx: number; cy: number;
  shape: ShapeKind; w?: number; h?: number; r?: number; count?: number; spread?: number;
  x1?: number; y1?: number; x2?: number; y2?: number; curve?: number; width?: number;
}

const TYPE_COLORS: Record<string, string> = {
  protein: '#d4a089', sauce: '#b85c4e', jus: '#8b4049', starch: '#e8dcc8',
  vegetable: '#8fa876', garnish: '#7db36a', dairy: '#f0ebe0', fruit: '#c47070',
  pastry: '#d4b878', glaze: 'rgba(180,60,60,0.3)', sugar_work: 'rgba(200,160,80,0.25)',
  ice_cream: '#f0ebe0', sorbet: '#d4828a', crumb: '#a08060',
};

const TYPE_LABELS: Record<string, string> = {
  protein: 'Protein', sauce: 'Sauce', jus: 'Jus', starch: 'Starch / Base',
  vegetable: 'Vegetable', garnish: 'Garnish', dairy: 'Dairy', fruit: 'Fruit',
  pastry: 'Pastry', glaze: 'Glaze', sugar_work: 'Sugar Work',
  ice_cream: 'Ice Cream', sorbet: 'Sorbet', crumb: 'Crumb',
};

const COMP_TYPES: CompType[] = ['protein', 'sauce', 'starch', 'vegetable', 'garnish', 'dairy', 'fruit', 'pastry', 'glaze', 'sugar_work', 'jus', 'ice_cream', 'sorbet', 'crumb'];

/* ── Presets ── */
const PRESETS: { name: string; subtitle: string; comps: PlateComp[] }[] = [
  {
    name: 'Almond & Red Currant Vacherin', subtitle: 'Strawberry Sorbet · Almond Ice Cream · Pulled Sugar',
    comps: [
      { id: 'almond-paste', name: 'Almond Paste', type: 'starch', cx: 370, cy: 370, shape: 'mound', w: 110, h: 55 },
      { id: 'sorbet', name: 'Strawberry Sorbet', type: 'sorbet', cx: 370, cy: 330, shape: 'quenelle', w: 50, h: 30 },
      { id: 'glaze', name: 'Red Clear Glaze', type: 'glaze', cx: 340, cy: 340, shape: 'quenelle', w: 100, h: 50 },
      { id: 'cookie', name: 'Gabl\u00e9 Cookie', type: 'pastry', cx: 430, cy: 400, shape: 'quenelle', w: 35, h: 18 },
      { id: 'fraise', name: 'Fraise des Bois', type: 'fruit', cx: 365, cy: 290, shape: 'berry', r: 8 },
      { id: 'choc', name: 'White Chocolate Garnish', type: 'garnish', cx: 310, cy: 290, shape: 'shard', w: 25, h: 35 },
      { id: 'currants', name: 'Red Currants', type: 'fruit', cx: 210, cy: 340, shape: 'dots', count: 6, r: 9, spread: 55 },
      { id: 'jus', name: 'Red Currant & Wine Jus', type: 'jus', cx: 230, cy: 420, shape: 'swoosh', x1: 180, y1: 400, x2: 290, y2: 440, curve: 15, width: 14 },
      { id: 'jus-dots', name: 'Jus Dots', type: 'jus', cx: 400, cy: 470, shape: 'dots', count: 4, r: 11, spread: 60 },
      { id: 'almond-ice', name: 'Almond Ice Cream', type: 'ice_cream', cx: 470, cy: 350, shape: 'quenelle', w: 40, h: 22 },
    ],
  },
  {
    name: 'Seared Hokkaido Scallop', subtitle: 'Cauliflower Pur\u00e9e · Sea Urchin · Nori',
    comps: [
      { id: 'scallop', name: 'Hokkaido Scallop', type: 'protein', cx: 390, cy: 320, shape: 'mound', w: 70, h: 35 },
      { id: 'puree', name: 'Cauliflower Pur\u00e9e', type: 'dairy', cx: 300, cy: 370, shape: 'swoosh', x1: 240, y1: 360, x2: 360, y2: 380, curve: 20, width: 16 },
      { id: 'uni', name: 'Sea Urchin Emulsion', type: 'sauce', cx: 420, cy: 400, shape: 'swoosh', x1: 380, y1: 390, x2: 460, y2: 410, curve: 12, width: 10 },
      { id: 'nori', name: 'Nori Crisp', type: 'garnish', cx: 440, cy: 280, shape: 'shard', w: 30, h: 40 },
      { id: 'lime', name: 'Finger Lime', type: 'fruit', cx: 340, cy: 280, shape: 'dots', count: 5, r: 5, spread: 35 },
      { id: 'shiso', name: 'Micro Shiso', type: 'garnish', cx: 370, cy: 270, shape: 'scatter' },
    ],
  },
];

/* ── LeaderLine ── */
function LeaderLine({ fromX, fromY, toX, toY, highlighted }: { fromX: number; fromY: number; toX: number; toY: number; highlighted: boolean }) {
  const mx = (fromX + toX) / 2, my = (fromY + toY) / 2;
  const cpx = mx + (fromX > 350 ? 15 : -15), cpy = my - 15;
  const angle = Math.atan2(toY - cpy, toX - cpx) * 180 / Math.PI;
  return (
    <g opacity={highlighted ? 1 : 0.7}>
      <path d={`M ${fromX} ${fromY} Q ${cpx} ${cpy} ${toX} ${toY}`} stroke={highlighted ? '#333' : '#555'} strokeWidth={highlighted ? 1.3 : 1} fill="none" />
      <polygon points="0,-2.5 5,0 0,2.5" fill={highlighted ? '#333' : '#555'} transform={`translate(${toX},${toY}) rotate(${angle})`} />
    </g>
  );
}

/* ── Label positions (auto-generated around plate) ── */
function autoLabels(comps: PlateComp[]) {
  const left: { comp: PlateComp; ly: number }[] = [];
  const right: { comp: PlateComp; ly: number }[] = [];
  comps.forEach(c => {
    if (c.cx <= 350) left.push({ comp: c, ly: 0 });
    else right.push({ comp: c, ly: 0 });
  });
  left.sort((a, b) => a.comp.cy - b.comp.cy);
  right.sort((a, b) => a.comp.cy - b.comp.cy);
  const startY = 140, gap = 42;
  left.forEach((l, i) => { l.ly = startY + i * gap; });
  right.forEach((l, i) => { l.ly = startY + i * gap; });
  return { left, right };
}

/* ── Main Component ── */
export default function PlatingStudioPage() {
  const [comps, setComps] = useState<PlateComp[]>(PRESETS[0].comps.map(c => ({ ...c })));
  const [dishName, setDishName] = useState(PRESETS[0].name);
  const [subtitle, setSubtitle] = useState(PRESETS[0].subtitle);
  const [colourMode, setColourMode] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const activeId = selectedId || hoveredId;
  const isHighlighted = (id: string) => activeId === id;
  const nextId = React.useRef(100);

  const getCompFill = (type: string) => colourMode ? (TYPE_COLORS[type] || '#ccc') : '#f5f5f0';
  const getFillOpacity = (type: string) => colourMode ? 0.6 : (type === 'glaze' || type === 'sugar_work' ? 0.15 : 0.3);

  const shapes = useMemo(() => {
    return comps.map(c => {
      const rng = createRng(hashStr(c.id) + 42);
      const paths: { d: string; type: string; strokeOnly?: boolean }[] = [];
      const extras: string[] = [];

      if (c.shape === 'mound') {
        paths.push({ d: moundShape(c.cx, c.cy, c.w || 80, c.h || 40, rng), type: c.type });
        for (let i = 1; i <= 3; i++) {
          const yOff = c.cy - (c.h || 40) + i * ((c.h || 40) * 0.25);
          const xShrink = (c.w || 80) * (1 - i * 0.22) / 2;
          extras.push(`M ${(c.cx - xShrink).toFixed(1)} ${yOff.toFixed(1)} Q ${c.cx.toFixed(1)} ${(yOff - 8).toFixed(1)} ${(c.cx + xShrink).toFixed(1)} ${yOff.toFixed(1)}`);
        }
      } else if (c.shape === 'quenelle') {
        paths.push({ d: quenelleShape(c.cx, c.cy, c.w || 50, c.h || 28, rng), type: c.type });
      } else if (c.shape === 'berry') {
        paths.push({ d: wobblyCircle(c.cx, c.cy, c.r || 8, rng), type: c.type });
      } else if (c.shape === 'dots') {
        for (let i = 0; i < (c.count || 4); i++) {
          const angle = (i / (c.count || 4)) * Math.PI * 0.8 + Math.PI * 0.6;
          const dist = (c.spread || 40) * (0.3 + (i / (c.count || 4)) * 0.7);
          const dx = c.cx + Math.cos(angle) * dist, dy = c.cy + Math.sin(angle) * dist * 0.5;
          paths.push({ d: wobblyCircle(dx, dy, (c.r || 8) + (rng() - 0.5) * 3, rng), type: c.type });
        }
      } else if (c.shape === 'swoosh') {
        paths.push({ d: sauceSwoosh(c.x1 || c.cx - 40, c.y1 || c.cy, c.x2 || c.cx + 40, c.y2 || c.cy + 10, c.curve || 15, c.width || 12, rng), type: c.type });
      } else if (c.shape === 'shard') {
        const w = c.w || 20, h = c.h || 30;
        paths.push({ d: `M ${jitter(c.cx - w * 0.3, 2, rng).toFixed(1)} ${(c.cy + h * 0.4).toFixed(1)} L ${jitter(c.cx - w * 0.5, 2, rng).toFixed(1)} ${jitter(c.cy - h * 0.3, 2, rng).toFixed(1)} L ${jitter(c.cx + w * 0.1, 2, rng).toFixed(1)} ${jitter(c.cy - h * 0.5, 2, rng).toFixed(1)} L ${jitter(c.cx + w * 0.5, 2, rng).toFixed(1)} ${jitter(c.cy - h * 0.1, 2, rng).toFixed(1)} L ${jitter(c.cx + w * 0.3, 2, rng).toFixed(1)} ${(c.cy + h * 0.3).toFixed(1)} Z`, type: c.type });
      } else if (c.shape === 'scatter') {
        for (let i = 0; i < 5; i++) {
          const dx = c.cx + (rng() - 0.5) * 30, dy = c.cy + (rng() - 0.5) * 20;
          paths.push({ d: wobblyCircle(dx, dy, 3 + rng() * 2, rng), type: c.type });
        }
      }
      return { id: c.id, paths, extras };
    });
  }, [comps]);

  const labels = useMemo(() => autoLabels(comps), [comps]);

  const loadPreset = (p: typeof PRESETS[number]) => {
    setComps(p.comps.map(c => ({ ...c })));
    setDishName(p.name);
    setSubtitle(p.subtitle);
    setSelectedId(null);
    setEditId(null);
  };

  const addComp = () => {
    const id = `comp-${nextId.current++}`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    setComps(prev => [...prev, {
      id, name: 'New Component', type: 'garnish', shape: 'berry',
      cx: 350 + Math.cos(angle) * dist, cy: 330 + Math.sin(angle) * dist, r: 8,
    }]);
    setEditId(id);
    setSelectedId(id);
  };

  const removeComp = (id: string) => {
    setComps(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) { setSelectedId(null); setEditId(null); }
  };

  const updateComp = (id: string, upd: Partial<PlateComp>) => {
    setComps(prev => prev.map(c => c.id === id ? { ...c, ...upd } : c));
  };

  const exportSvg = () => {
    const svgEl = document.getElementById('plating-svg');
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${dishName.replace(/\s+/g, '_')}_plating.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  const editComp = comps.find(c => c.id === editId);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f4', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #e0dcd4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/create" style={{ color: '#8a7e6b', textDecoration: 'none', fontSize: 18 }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2c2418' }}>Plating Studio</span>
            <span style={{ fontSize: 11, color: '#8a7e6b', fontStyle: 'italic', marginLeft: 8 }}>Interactive Sketch — 1-CUISINESG</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => loadPreset(p)} style={{
              padding: '4px 12px', fontSize: 11, border: '1px solid #c9c0b0', borderRadius: 3,
              background: dishName === p.name ? '#2c2418' : 'transparent',
              color: dishName === p.name ? '#faf8f4' : '#5a4e3a',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{p.name.split(' ').slice(0, 3).join(' ')}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 50px)' }}>
        {/* SVG Diagram */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px' }}>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setColourMode(!colourMode)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', fontSize: 11, border: '1px solid #c9c0b0', borderRadius: 3, background: colourMode ? '#2c2418' : 'transparent', color: colourMode ? '#faf8f4' : '#5a4e3a', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Palette size={13} /> {colourMode ? 'Sketch Mode' : 'Colour Mode'}
            </button>
            <button onClick={() => setShowLegend(!showLegend)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', fontSize: 11, border: '1px solid #c9c0b0', borderRadius: 3, background: 'transparent', color: '#5a4e3a', cursor: 'pointer', fontFamily: 'inherit' }}>
              <List size={13} /> Legend
            </button>
            <button onClick={addComp} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', fontSize: 11, border: '1px solid #b8860b', borderRadius: 3, background: '#2c2418', color: '#faf8f4', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={13} /> Add
            </button>
            <button onClick={exportSvg} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', fontSize: 11, border: '1px solid #c9c0b0', borderRadius: 3, background: 'transparent', color: '#5a4e3a', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={13} /> SVG
            </button>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', fontSize: 11, border: '1px solid #c9c0b0', borderRadius: 3, background: 'transparent', color: '#5a4e3a', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Printer size={13} /> Print
            </button>
          </div>

          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', maxWidth: 900, width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg id="plating-svg" viewBox="0 0 700 620" style={{ width: '100%', maxWidth: 700, display: 'block', margin: '0 auto', background: '#fdfcf8', borderRadius: 4, border: '1px solid #e5e0d6' }}>
                {/* Title */}
                <text x="350" y="42" textAnchor="middle" style={{ fontSize: 19, fontStyle: 'italic', fill: '#222', fontFamily: "'Georgia', serif" }}>{dishName}</text>
                <text x="350" y="62" textAnchor="middle" style={{ fontSize: 11, fill: '#888', fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>{subtitle}</text>

                {/* Plate */}
                <ellipse cx="352" cy="340" rx="232" ry="228" fill="rgba(0,0,0,0.05)" />
                <circle cx="350" cy="330" r="225" fill="#f5f5f0" stroke="#d4d0c8" strokeWidth="2.5" />
                <circle cx="350" cy="330" r="195" fill="none" stroke="#eae6de" strokeWidth="0.6" strokeDasharray="5,7" />

                {/* Components */}
                {shapes.map(s => (
                  <g key={s.id}
                    onMouseEnter={() => setHoveredId(s.id)} onMouseLeave={() => setHoveredId(null)}
                    onClick={() => { setSelectedId(selectedId === s.id ? null : s.id); setEditId(selectedId === s.id ? null : s.id); }}
                    style={{ cursor: 'pointer', transition: 'filter 0.2s' }}
                    filter={isHighlighted(s.id) ? 'url(#glow)' : 'none'}>
                    {s.paths.map((p, i) => (
                      <path key={i} d={p.d}
                        fill={p.strokeOnly ? 'none' : getCompFill(p.type)}
                        fillOpacity={p.strokeOnly ? 0 : getFillOpacity(p.type)}
                        stroke={isHighlighted(s.id) ? '#333' : (p.type === 'glaze' || p.type === 'sugar_work' ? '#999' : '#777')}
                        strokeWidth={isHighlighted(s.id) ? 2.5 : (p.type === 'garnish' || p.type === 'crumb' ? 1 : 1.5)}
                        strokeDasharray={p.type === 'glaze' ? '4,3' : 'none'} />
                    ))}
                    {s.extras.map((d, i) => (
                      <path key={`e-${i}`} d={d} fill="none" stroke={isHighlighted(s.id) ? '#555' : '#bbb'} strokeWidth={0.8} strokeDasharray="5,4" />
                    ))}
                  </g>
                ))}

                {/* Leader lines + Labels */}
                {labels.left.map(({ comp: c, ly }) => (
                  <g key={`ll-${c.id}`}>
                    <LeaderLine fromX={80} fromY={ly + 5} toX={c.cx} toY={c.cy} highlighted={isHighlighted(c.id)} />
                    <text x={75} y={ly} textAnchor="end"
                      onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
                      onClick={() => { setSelectedId(selectedId === c.id ? null : c.id); setEditId(selectedId === c.id ? null : c.id); }}
                      style={{ fontSize: 13, fontStyle: 'italic', fill: isHighlighted(c.id) ? '#111' : '#333', fontWeight: isHighlighted(c.id) ? 700 : 400, cursor: 'pointer', fontFamily: "'Georgia', serif" }}>
                      {c.name}
                    </text>
                  </g>
                ))}
                {labels.right.map(({ comp: c, ly }) => (
                  <g key={`lr-${c.id}`}>
                    <LeaderLine fromX={620} fromY={ly + 5} toX={c.cx} toY={c.cy} highlighted={isHighlighted(c.id)} />
                    <text x={625} y={ly} textAnchor="start"
                      onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
                      onClick={() => { setSelectedId(selectedId === c.id ? null : c.id); setEditId(selectedId === c.id ? null : c.id); }}
                      style={{ fontSize: 13, fontStyle: 'italic', fill: isHighlighted(c.id) ? '#111' : '#333', fontWeight: isHighlighted(c.id) ? 700 : 400, cursor: 'pointer', fontFamily: "'Georgia', serif" }}>
                      {c.name}
                    </text>
                  </g>
                ))}

                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Chef notes */}
              <div style={{ textAlign: 'center', padding: '8px 24px 16px', fontStyle: 'italic', fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                <span style={{ color: '#aaa' }}>—</span>&nbsp; Click components or labels to highlight &nbsp;·&nbsp; Toggle colour mode for watercolour fills &nbsp;<span style={{ color: '#aaa' }}>—</span>
              </div>
            </div>

            {/* Legend sidebar */}
            {showLegend && (
              <div style={{ width: 180, padding: '12px 14px', borderLeft: '1px solid #e8e4dc', fontSize: 12, color: '#444', lineHeight: 1.7, flexShrink: 0, background: '#fdfcf8' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#333', borderBottom: '1px solid #e8e4dc', paddingBottom: 6 }}>Components</div>
                {comps.map(c => (
                  <div key={c.id}
                    onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
                    onClick={() => { setSelectedId(selectedId === c.id ? null : c.id); setEditId(selectedId === c.id ? null : c.id); }}
                    style={{ cursor: 'pointer', padding: '3px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, background: isHighlighted(c.id) ? '#f5f0e8' : 'transparent', fontWeight: isHighlighted(c.id) ? 600 : 400, transition: 'all 0.15s' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: colourMode ? (TYPE_COLORS[c.type] || '#ccc') : '#e0dcd4', border: '1px solid #bbb', flexShrink: 0 }} />
                    <span style={{ fontStyle: 'italic', fontSize: 11 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit panel for selected component */}
          {editComp && (
            <div style={{ maxWidth: 600, width: '100%', marginTop: 12, padding: 16, background: '#fff', border: '1px solid #e0dcd4', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2c2418' }}>Edit: {editComp.name}</span>
                <button onClick={() => removeComp(editComp.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', fontSize: 10, border: '1px solid #e8a0a0', borderRadius: 3, background: '#fff5f5', color: '#c44', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Trash2 size={11} /> Remove
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8a7e6b' }}>Name</label>
                  <input value={editComp.name} onChange={e => updateComp(editComp.id, { name: e.target.value })} style={{ width: '100%', padding: '4px 8px', fontSize: 12, border: '1px solid #d4cfc4', borderRadius: 3, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8a7e6b' }}>Type</label>
                  <select value={editComp.type} onChange={e => updateComp(editComp.id, { type: e.target.value as CompType })} style={{ padding: '4px 6px', fontSize: 11, border: '1px solid #d4cfc4', borderRadius: 3, fontFamily: 'inherit' }}>
                    {COMP_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8a7e6b' }}>Shape</label>
                  <select value={editComp.shape} onChange={e => updateComp(editComp.id, { shape: e.target.value as ShapeKind })} style={{ padding: '4px 6px', fontSize: 11, border: '1px solid #d4cfc4', borderRadius: 3, fontFamily: 'inherit' }}>
                    {['mound', 'quenelle', 'swoosh', 'dots', 'berry', 'shard', 'scatter'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@media print { button, [style*="borderLeft"] { display: none !important; } }`}</style>
    </div>
  );
}
