'use client';

import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';

/* ── Seeded random ── */
function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function jit(val: number, amt: number, r: () => number) { return val + (r() - 0.5) * amt * 2; }

/* ── Shape generators ── */
function wobbly(cx: number, cy: number, radius: number, r: () => number) {
  const d: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI * 2, jr = radius + (r() - 0.5) * radius * 0.18;
    const x = cx + Math.cos(a) * jr, y = cy + Math.sin(a) * jr;
    if (i === 0) d.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
    else d.push(`Q ${jit(cx + Math.cos(a - 0.35) * jr * 1.12, 1.5, r).toFixed(1)} ${jit(cy + Math.sin(a - 0.35) * jr * 1.12, 1.5, r).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  d.push('Z'); return d.join(' ');
}

function mound(cx: number, cy: number, w: number, h: number, r: () => number) {
  const l = cx - w / 2, ri = cx + w / 2, t = cy - h, b = cy;
  return `M ${jit(l, 2, r).toFixed(1)} ${b.toFixed(1)} Q ${jit(l - 5, 3, r).toFixed(1)} ${jit(t + h * 0.3, 3, r).toFixed(1)} ${jit(cx - w * 0.15, 2, r).toFixed(1)} ${jit(t, 3, r).toFixed(1)} Q ${jit(cx + w * 0.15, 2, r).toFixed(1)} ${jit(t - 5, 3, r).toFixed(1)} ${jit(ri + 5, 3, r).toFixed(1)} ${jit(t + h * 0.3, 3, r).toFixed(1)} Q ${jit(ri + 8, 3, r).toFixed(1)} ${jit(b - h * 0.2, 3, r).toFixed(1)} ${jit(ri, 2, r).toFixed(1)} ${b.toFixed(1)} Z`;
}

function swoosh(x1: number, y1: number, x2: number, y2: number, curve: number, w: number, r: () => number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${jit(mx, 4, r).toFixed(1)} ${jit(my - curve, 4, r).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 + 2).toFixed(1)} ${(y2 + 3).toFixed(1)} Q ${jit(mx, 4, r).toFixed(1)} ${jit(my - curve + w, 4, r).toFixed(1)} ${(x1 + 1).toFixed(1)} ${(y1 + 2).toFixed(1)} Z`;
}

function quen(cx: number, cy: number, w: number, h: number, r: () => number) {
  const hw = w / 2, hh = h / 2;
  return `M ${(cx - hw).toFixed(1)} ${cy.toFixed(1)} Q ${jit(cx - hw * 0.5, 2, r).toFixed(1)} ${jit(cy - hh, 2, r).toFixed(1)} ${cx.toFixed(1)} ${jit(cy - hh, 2, r).toFixed(1)} Q ${jit(cx + hw * 0.5, 2, r).toFixed(1)} ${jit(cy - hh, 2, r).toFixed(1)} ${(cx + hw).toFixed(1)} ${cy.toFixed(1)} Q ${jit(cx + hw * 0.5, 2, r).toFixed(1)} ${jit(cy + hh, 2, r).toFixed(1)} ${cx.toFixed(1)} ${jit(cy + hh, 2, r).toFixed(1)} Q ${jit(cx - hw * 0.5, 2, r).toFixed(1)} ${jit(cy + hh, 2, r).toFixed(1)} ${(cx - hw).toFixed(1)} ${cy.toFixed(1)} Z`;
}

/* ── Type/shape mapping ── */
const COLORS: Record<string, string> = {
  protein: '#d4a089', sauce: '#b85c4e', jus: '#8b4049', starch: '#e8dcc8',
  vegetable: '#8fa876', garnish: '#7db36a', dairy: '#f0ebe0', fruit: '#c47070',
  pastry: '#d4b878', glaze: 'rgba(180,60,60,0.3)', sugar_work: 'rgba(200,160,80,0.25)',
  ice_cream: '#f0ebe0', sorbet: '#d4828a', crumb: '#a08060',
};

const KW: Record<string, string> = {
  sauce: 'sauce', jus: 'jus', reduction: 'sauce', emulsion: 'sauce', coulis: 'sauce',
  puree: 'dairy', mousse: 'dairy', cream: 'dairy', foam: 'dairy',
  sorbet: 'sorbet', ice: 'ice_cream',
  berry: 'fruit', currant: 'fruit', strawberry: 'fruit', raspberry: 'fruit', lime: 'fruit',
  crisp: 'garnish', tuile: 'garnish', shard: 'garnish', chip: 'garnish',
  leaf: 'garnish', herb: 'garnish', micro: 'garnish', flower: 'garnish',
  crumble: 'crumb', crumb: 'crumb', soil: 'crumb', dust: 'crumb',
  cookie: 'pastry', biscuit: 'pastry',
  glaze: 'glaze', sugar: 'sugar_work', caramel: 'sugar_work',
  scallop: 'protein', fish: 'protein', beef: 'protein', lamb: 'protein',
  duck: 'protein', pork: 'protein', chicken: 'protein', lobster: 'protein',
  potato: 'starch', rice: 'starch', risotto: 'starch',
  carrot: 'vegetable', pea: 'vegetable', leek: 'vegetable', mushroom: 'vegetable',
};

function typeOf(name: string) {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(KW)) { if (n.includes(k)) return v; }
  return 'protein';
}
function shapeOf(type: string) {
  if (type === 'sauce' || type === 'jus') return 'swoosh';
  if (type === 'dairy' || type === 'ice_cream' || type === 'sorbet') return 'quenelle';
  if (type === 'fruit') return 'dots';
  if (type === 'garnish' || type === 'crumb') return 'scatter';
  if (type === 'sugar_work') return 'shard';
  return 'mound';
}

/* ── Main component ── */
export default function EmbeddedPlatingStudio({ components, title, venueName, venueAccent }: {
  components: { name: string }[];
  title: string;
  venueName: string;
  venueAccent: string;
}) {
  const [colour, setColour] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = selected || hovered;
  const hl = (id: string) => active === id;

  const PX = 300, PY = 260, PR = 180;

  const safe = useMemo(() => (components || []).filter(c => c && c.name), [components]);

  const mapped = useMemo(() => {
    if (!safe.length) return [];
    return safe.map((c, i) => {
      const type = typeOf(c.name);
      const shape = shapeOf(type);
      const angle = -Math.PI * 0.5 + (i / Math.max(safe.length - 1, 1)) * Math.PI * 1.6;
      const dist = PR * (0.3 + (i % 3) * 0.15);
      return { id: `p-${i}`, name: c.name, type, shape, cx: PX + Math.cos(angle) * dist * (i === 0 ? 0.15 : 0.8), cy: PY + Math.sin(angle) * dist * 0.6 };
    });
  }, [safe]);

  const shapes = useMemo(() => {
    return mapped.map(c => {
      const r = rng(hash(c.id + c.name) + 42);
      const paths: { d: string; type: string }[] = [];
      const extras: string[] = [];
      try {
        if (c.shape === 'mound') {
          const w = 65 + (c.id === 'p-0' ? 20 : 0), h = 32 + (c.id === 'p-0' ? 10 : 0);
          paths.push({ d: mound(c.cx, c.cy, w, h, r), type: c.type });
          for (let j = 1; j <= 3; j++) {
            const yo = c.cy - h + j * (h * 0.25), xs = w * (1 - j * 0.22) / 2;
            extras.push(`M ${(c.cx - xs).toFixed(1)} ${yo.toFixed(1)} Q ${c.cx.toFixed(1)} ${(yo - 6).toFixed(1)} ${(c.cx + xs).toFixed(1)} ${yo.toFixed(1)}`);
          }
        } else if (c.shape === 'quenelle') {
          paths.push({ d: quen(c.cx, c.cy, 45, 22, r), type: c.type });
        } else if (c.shape === 'swoosh') {
          paths.push({ d: swoosh(c.cx - 35, c.cy, c.cx + 35, c.cy + 8, 14, 11, r), type: c.type });
        } else if (c.shape === 'dots') {
          for (let j = 0; j < 5; j++) {
            const a = (j / 5) * Math.PI * 0.8 + Math.PI * 0.6, dd = 35 * (0.3 + (j / 5) * 0.7);
            paths.push({ d: wobbly(c.cx + Math.cos(a) * dd, c.cy + Math.sin(a) * dd * 0.5, 6 + (r() - 0.5) * 2, r), type: c.type });
          }
        } else if (c.shape === 'shard') {
          const s = 18;
          paths.push({ d: `M ${jit(c.cx - s * 0.3, 2, r).toFixed(1)} ${(c.cy + s * 0.4).toFixed(1)} L ${jit(c.cx - s * 0.5, 2, r).toFixed(1)} ${jit(c.cy - s * 0.6, 2, r).toFixed(1)} L ${jit(c.cx + s * 0.1, 2, r).toFixed(1)} ${jit(c.cy - s * 0.9, 2, r).toFixed(1)} L ${jit(c.cx + s * 0.5, 2, r).toFixed(1)} ${jit(c.cy - s * 0.1, 2, r).toFixed(1)} L ${jit(c.cx + s * 0.3, 2, r).toFixed(1)} ${(c.cy + s * 0.3).toFixed(1)} Z`, type: c.type });
        } else {
          for (let j = 0; j < 5; j++) {
            paths.push({ d: wobbly(c.cx + (r() - 0.5) * 28, c.cy + (r() - 0.5) * 18, 3 + r() * 2, r), type: c.type });
          }
        }
      } catch { /* skip */ }
      return { id: c.id, paths, extras };
    });
  }, [mapped]);

  const left = useMemo(() => mapped.filter(c => c.cx <= PX).sort((a, b) => a.cy - b.cy), [mapped]);
  const right = useMemo(() => mapped.filter(c => c.cx > PX).sort((a, b) => a.cy - b.cy), [mapped]);

  const fill = (type: string) => colour ? (COLORS[type] || '#ccc') : '#f5f5f0';
  const op = (type: string) => colour ? 0.6 : (type === 'glaze' || type === 'sugar_work' ? 0.15 : 0.3);

  if (!mapped.length) return null;

  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex-wrap gap-2">
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: venueAccent }}>Plating Studio</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setColour(!colour)}
            className="px-2 py-1 text-[10px] font-semibold rounded border transition-all"
            style={{ borderColor: colour ? venueAccent : '#d4cfc4', background: colour ? `${venueAccent}15` : 'transparent', color: colour ? venueAccent : '#6b5e4a' }}>
            {colour ? 'Sketch' : 'Colour'}
          </button>
          <button onClick={() => {
            const el = document.getElementById('embed-plate');
            if (!el) return;
            const d = new XMLSerializer().serializeToString(el);
            const u = URL.createObjectURL(new Blob([d], { type: 'image/svg+xml' }));
            const a = document.createElement('a'); a.href = u; a.download = `${(title || 'plating').replace(/\s+/g, '_')}.svg`; a.click(); URL.revokeObjectURL(u);
          }}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all"
            style={{ background: `${venueAccent}15`, color: venueAccent, border: `1px solid ${venueAccent}40` }}>
            <Download size={10} /> SVG
          </button>
        </div>
      </div>

      <svg id="embed-plate" viewBox="0 0 600 500" style={{ width: '100%', display: 'block', background: '#fdfcf8' }}>
        <text x={PX} y="30" textAnchor="middle" style={{ fontSize: 15, fontStyle: 'italic', fill: '#222', fontFamily: 'Georgia, serif' }}>{title}</text>
        <text x={PX} y="46" textAnchor="middle" style={{ fontSize: 10, fill: '#888', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{venueName}</text>

        <ellipse cx={PX + 2} cy={PY + 5} rx={PR + 8} ry={PR + 6} fill="rgba(0,0,0,0.05)" />
        <circle cx={PX} cy={PY} r={PR} fill="#f5f5f0" stroke="#d4d0c8" strokeWidth="2" />
        <circle cx={PX} cy={PY} r={PR - 18} fill="none" stroke="#eae6de" strokeWidth="0.5" strokeDasharray="4,6" />

        {shapes.map(s => (
          <g key={s.id}
            onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(selected === s.id ? null : s.id)}
            style={{ cursor: 'pointer' }} filter={hl(s.id) ? 'url(#eg)' : 'none'}>
            {s.paths.map((p, i) => (
              <path key={i} d={p.d} fill={fill(p.type)} fillOpacity={op(p.type)}
                stroke={hl(s.id) ? '#333' : '#777'} strokeWidth={hl(s.id) ? 2.2 : 1.5}
                strokeDasharray={p.type === 'glaze' ? '4,3' : 'none'} />
            ))}
            {s.extras.map((d, i) => (
              <path key={`e${i}`} d={d} fill="none" stroke={hl(s.id) ? '#555' : '#bbb'} strokeWidth={0.7} strokeDasharray="5,4" />
            ))}
          </g>
        ))}

        {left.map((c, i) => {
          const ly = 95 + i * 34;
          return (<g key={`l${c.id}`}>
            <path d={`M 52 ${ly + 3} Q ${52 + (c.cx - 52) * 0.3} ${ly - 6} ${c.cx} ${c.cy}`} fill="none" stroke={hl(c.id) ? '#333' : '#555'} strokeWidth={hl(c.id) ? 1.1 : 0.8} />
            <text x={48} y={ly} textAnchor="end" onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{ fontSize: 11, fontStyle: 'italic', fill: hl(c.id) ? '#111' : '#333', fontWeight: hl(c.id) ? 700 : 400, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{c.name}</text>
          </g>);
        })}

        {right.map((c, i) => {
          const ly = 95 + i * 34;
          return (<g key={`r${c.id}`}>
            <path d={`M 548 ${ly + 3} Q ${548 - (548 - c.cx) * 0.3} ${ly - 6} ${c.cx} ${c.cy}`} fill="none" stroke={hl(c.id) ? '#333' : '#555'} strokeWidth={hl(c.id) ? 1.1 : 0.8} />
            <text x={552} y={ly} textAnchor="start" onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
              style={{ fontSize: 11, fontStyle: 'italic', fill: hl(c.id) ? '#111' : '#333', fontWeight: hl(c.id) ? 700 : 400, cursor: 'pointer', fontFamily: 'Georgia, serif' }}>{c.name}</text>
          </g>);
        })}

        <line x1={PX - 45} y1="485" x2={PX + 45} y2="485" stroke={venueAccent} strokeWidth="0.5" opacity="0.4" />
        <defs>
          <filter id="eg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 text-center">
        <span className="text-[10px] text-stone-400 italic">Hover to highlight components. Toggle colour mode for watercolour fills. Download SVG for Midjourney.</span>
      </div>
    </div>
  );
}
