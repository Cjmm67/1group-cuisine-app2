'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, Plus, Trash2, Sparkles } from 'lucide-react';

/* ── Component types and their rough.js draw configs ── */
const SHAPE_TYPES = [
  'dome', 'sauce', 'quenelle', 'berries', 'crisp', 'leaf', 'crumble',
] as const;
type ShapeType = typeof SHAPE_TYPES[number];

const SHAPE_LABELS: Record<ShapeType, string> = {
  dome: 'Dome / Protein', sauce: 'Sauce / Jus', quenelle: 'Quenelle / Purée',
  berries: 'Berries / Pearls', crisp: 'Crisp / Shard', leaf: 'Leaf / Herb',
  crumble: 'Crumble / Crumb',
};

interface PlateComponent {
  id: number; name: string; shape: ShapeType;
  x: number; y: number; size: number; color: string;
}

const PLATE_CX = 380, PLATE_CY = 300, PLATE_R = 220;

const PRESETS = [
  {
    name: 'Seared Scallop', components: [
      { id: 1, name: 'Hokkaido Scallop', shape: 'dome' as ShapeType, x: 400, y: 280, size: 50, color: '#d4a574' },
      { id: 2, name: 'Cauliflower Purée', shape: 'quenelle' as ShapeType, x: 300, y: 330, size: 40, color: '#e8dcc0' },
      { id: 3, name: 'Sea Urchin Emulsion', shape: 'sauce' as ShapeType, x: 430, y: 370, size: 45, color: '#c4953a' },
      { id: 4, name: 'Nori Crisp', shape: 'crisp' as ShapeType, x: 460, y: 250, size: 30, color: '#2a3a2a' },
      { id: 5, name: 'Finger Lime', shape: 'berries' as ShapeType, x: 340, y: 260, size: 20, color: '#7a9a4a' },
      { id: 6, name: 'Micro Shiso', shape: 'leaf' as ShapeType, x: 380, y: 240, size: 15, color: '#4a7a5a' },
    ],
  },
  {
    name: 'Wagyu Tenderloin', components: [
      { id: 1, name: 'Wagyu A5', shape: 'dome' as ShapeType, x: 370, y: 290, size: 55, color: '#8a4a3a' },
      { id: 2, name: 'Bone Marrow Butter', shape: 'sauce' as ShapeType, x: 310, y: 360, size: 40, color: '#c4a060' },
      { id: 3, name: 'Charred Leek Purée', shape: 'quenelle' as ShapeType, x: 460, y: 310, size: 35, color: '#5a6a3a' },
      { id: 4, name: 'Red Wine Jus', shape: 'sauce' as ShapeType, x: 380, y: 380, size: 50, color: '#5a2030' },
      { id: 5, name: 'Pickled Shallot', shape: 'berries' as ShapeType, x: 430, y: 250, size: 18, color: '#b06a8a' },
      { id: 6, name: 'Micro Herbs', shape: 'leaf' as ShapeType, x: 350, y: 255, size: 12, color: '#3a7a3a' },
    ],
  },
  {
    name: 'Vacherin Dessert', components: [
      { id: 1, name: 'Almond Paste Shell', shape: 'dome' as ShapeType, x: 380, y: 300, size: 60, color: '#d4c5a9' },
      { id: 2, name: 'Strawberry Sorbet', shape: 'quenelle' as ShapeType, x: 380, y: 250, size: 30, color: '#c44a5a' },
      { id: 3, name: 'Red Currants', shape: 'berries' as ShapeType, x: 280, y: 310, size: 24, color: '#a03030' },
      { id: 4, name: 'Wine Jus', shape: 'sauce' as ShapeType, x: 440, y: 370, size: 45, color: '#6a2040' },
      { id: 5, name: 'White Choc Shard', shape: 'crisp' as ShapeType, x: 330, y: 260, size: 25, color: '#f0e6d0' },
      { id: 6, name: 'Crumble Base', shape: 'crumble' as ShapeType, x: 380, y: 360, size: 35, color: '#b8a070' },
    ],
  },
];

/* ── rough.js drawing functions ── */
function drawPlate(rc: any, ctx: CanvasRenderingContext2D) {
  // Shadow layers
  rc.ellipse(PLATE_CX + 4, PLATE_CY + 8, PLATE_R * 2 + 30, PLATE_R * 2 + 30, {
    fill: 'rgba(0,0,0,0.04)', fillStyle: 'solid', stroke: 'none', roughness: 0.3,
  });
  rc.ellipse(PLATE_CX + 2, PLATE_CY + 4, PLATE_R * 2 + 18, PLATE_R * 2 + 18, {
    fill: 'rgba(0,0,0,0.03)', fillStyle: 'solid', stroke: 'none', roughness: 0.3,
  });
  // Outer rim
  rc.ellipse(PLATE_CX, PLATE_CY, PLATE_R * 2 + 12, PLATE_R * 2 + 12, {
    stroke: '#b0a898', strokeWidth: 0.5, roughness: 0.4, fill: 'rgba(0,0,0,0)', fillStyle: 'solid',
  });
  // Main plate
  rc.ellipse(PLATE_CX, PLATE_CY, PLATE_R * 2, PLATE_R * 2, {
    stroke: '#706858', strokeWidth: 1.8, roughness: 0.6, fill: '#fefefe', fillStyle: 'solid',
  });
  // Inner rim detail
  rc.ellipse(PLATE_CX, PLATE_CY, (PLATE_R - 30) * 2, (PLATE_R - 30) * 2, {
    stroke: '#d5cfc0', strokeWidth: 0.4, roughness: 0.5,
    strokeLineDash: [4, 8],
  });
}

function drawDome(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  const w = s * 1.6, h = s * 1.2;
  // Shadow
  rc.ellipse(x + 2, y + h * 0.4, w * 1.3, h * 0.4, {
    fill: 'rgba(0,0,0,0.06)', fillStyle: 'solid', stroke: 'none', roughness: 0.3, seed,
  });
  // Base ellipse
  rc.ellipse(x, y + h * 0.15, w * 1.2, h * 0.35, {
    fill: c.color, fillStyle: 'cross-hatch', fillWeight: 0.4, hachureGap: 3,
    stroke: '#555', strokeWidth: 1.2, roughness: 0.8, seed,
  });
  // Dome body
  rc.path(`M${x - w * 0.55} ${y + h * 0.1} C${x - w * 0.55} ${y - h * 0.7}, ${x + w * 0.55} ${y - h * 0.7}, ${x + w * 0.55} ${y + h * 0.1}`, {
    fill: c.color, fillStyle: 'hachure', fillWeight: 0.5, hachureAngle: -40, hachureGap: 3.5,
    stroke: '#444', strokeWidth: 1.5, roughness: 0.7, seed,
  });
}

function drawSauce(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  // Outer wash
  rc.ellipse(x, y, s * 2.8, s * 1.6, {
    fill: c.color, fillStyle: 'solid', stroke: 'none', roughness: 1.5, seed,
    fillWeight: 0.3,
  });
  // Main pool
  rc.ellipse(x, y, s * 2.2, s * 1.3, {
    fill: c.color, fillStyle: 'hachure', fillWeight: 0.3, hachureAngle: 30, hachureGap: 2.5,
    stroke: '#666', strokeWidth: 0.8, roughness: 1.2, seed,
  });
  // Inner concentration
  rc.ellipse(x - s * 0.15, y + s * 0.1, s * 1.2, s * 0.7, {
    fill: c.color, fillStyle: 'solid', stroke: 'none', roughness: 1, seed,
  });
}

function drawQuenelle(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  // Shadow
  rc.ellipse(x + 1, y + s * 0.5, s * 2.2, s * 0.4, {
    fill: 'rgba(0,0,0,0.05)', fillStyle: 'solid', stroke: 'none', roughness: 0.3, seed,
  });
  // Quenelle body — elongated tapered shape
  rc.path(`M${x - s * 1.1} ${y + s * 0.15} Q${x - s * 0.9} ${y - s * 0.7}, ${x + s * 0.2} ${y - s * 0.6} Q${x + s * 1.1} ${y - s * 0.5}, ${x + s * 1.1} ${y + s * 0.1} Q${x + s * 0.7} ${y + s * 0.45}, ${x} ${y + s * 0.35} Q${x - s * 0.7} ${y + s * 0.45}, ${x - s * 1.1} ${y + s * 0.15} Z`, {
    fill: c.color, fillStyle: 'hachure', fillWeight: 0.4, hachureAngle: 15, hachureGap: 3,
    stroke: '#555', strokeWidth: 1.3, roughness: 0.6, seed,
  });
  // Ridge lines
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.15;
    const rx = x - s * 0.8 + t * s * 1.8;
    rc.line(rx, y - s * 0.3 + i * 2, rx + s * 0.3, y + s * 0.2 + i * 1, {
      stroke: '#999', strokeWidth: 0.4, roughness: 0.5, seed: seed + i,
    });
  }
}

function drawBerries(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  const positions = [
    { dx: -s * 0.6, dy: 0, r: s * 0.45 },
    { dx: s * 0.1, dy: -s * 0.35, r: s * 0.4 },
    { dx: s * 0.7, dy: s * 0.1, r: s * 0.42 },
    { dx: 0, dy: s * 0.4, r: s * 0.35 },
    { dx: -s * 0.3, dy: -s * 0.5, r: s * 0.3 },
    { dx: s * 0.45, dy: -s * 0.3, r: s * 0.32 },
  ];
  positions.forEach((p, i) => {
    rc.circle(x + p.dx, y + p.dy, p.r * 2, {
      fill: c.color, fillStyle: 'hachure', fillWeight: 0.3, hachureGap: 2, hachureAngle: 45 + i * 15,
      stroke: '#555', strokeWidth: 0.9, roughness: 0.5, seed: seed + i,
    });
  });
}

function drawCrisp(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  // Irregular angular shape standing at angle
  rc.path(`M${x - s * 0.4} ${y + s * 0.5} L${x - s * 0.6} ${y - s * 0.8} L${x - s * 0.1} ${y - s * 1.1} L${x + s * 0.5} ${y - s * 0.6} L${x + s * 0.4} ${y + s * 0.2} Z`, {
    fill: c.color, fillStyle: 'cross-hatch', fillWeight: 0.3, hachureGap: 3.5, hachureAngle: 60,
    stroke: '#555', strokeWidth: 1.1, roughness: 0.8, seed,
  });
  // Fracture line
  rc.line(x - s * 0.3, y - s * 0.6, x + s * 0.3, y - s * 0.2, {
    stroke: '#888', strokeWidth: 0.5, roughness: 0.6, seed,
  });
}

function drawLeaf(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  // Leaf shape
  rc.path(`M${x} ${y - s * 1.2} C${x + s * 0.8} ${y - s * 0.6}, ${x + s * 0.7} ${y + s * 0.5}, ${x} ${y + s * 1.2} C${x - s * 0.7} ${y + s * 0.5}, ${x - s * 0.8} ${y - s * 0.6}, ${x} ${y - s * 1.2} Z`, {
    fill: c.color, fillStyle: 'hachure', fillWeight: 0.3, hachureAngle: 70, hachureGap: 2.5,
    stroke: '#4a6a4a', strokeWidth: 1, roughness: 0.7, seed,
  });
  // Centre vein
  rc.line(x, y - s * 0.9, x, y + s * 0.9, {
    stroke: '#3a5a3a', strokeWidth: 0.6, roughness: 0.5, seed,
  });
  // Side veins
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const vy = y + i * s * 0.35;
    rc.line(x, vy, x + (i % 2 ? 1 : -1) * s * 0.45, vy - s * 0.15, {
      stroke: '#4a6a4a', strokeWidth: 0.35, roughness: 0.4, seed: seed + i,
    });
  }
}

function drawCrumble(rc: any, c: PlateComponent, seed: number) {
  const { x, y, size: s } = c;
  // Scatter irregular small pieces
  for (let i = 0; i < 10; i++) {
    const dx = (Math.sin(seed + i * 7.3) * 0.5) * s * 1.5;
    const dy = (Math.cos(seed + i * 4.1) * 0.5) * s * 0.8;
    const ps = s * (0.15 + Math.abs(Math.sin(seed + i * 2.7)) * 0.2);
    rc.rectangle(x + dx - ps, y + dy - ps * 0.5, ps * 2, ps, {
      fill: c.color, fillStyle: 'hachure', fillWeight: 0.3, hachureGap: 2, hachureAngle: 20 + i * 25,
      stroke: '#888', strokeWidth: 0.6, roughness: 1.2, seed: seed + i,
    });
  }
}

const DRAW_FNS: Record<ShapeType, (rc: any, c: PlateComponent, seed: number) => void> = {
  dome: drawDome, sauce: drawSauce, quenelle: drawQuenelle,
  berries: drawBerries, crisp: drawCrisp, leaf: drawLeaf, crumble: drawCrumble,
};

/* ── Label positioning ── */
function computeLabels(comps: PlateComponent[]) {
  const slots = [
    { x: 720, y: 130, anchor: 'left' as const },
    { x: 720, y: 200, anchor: 'left' as const },
    { x: 720, y: 270, anchor: 'left' as const },
    { x: 720, y: 340, anchor: 'left' as const },
    { x: 720, y: 410, anchor: 'left' as const },
    { x: 40, y: 150, anchor: 'right' as const },
    { x: 40, y: 240, anchor: 'right' as const },
    { x: 40, y: 330, anchor: 'right' as const },
    { x: 40, y: 420, anchor: 'right' as const },
  ];
  return comps.map((c, i) => ({
    comp: c, slot: slots[i % slots.length],
  }));
}

function drawLabels(ctx: CanvasRenderingContext2D, rc: any, comps: PlateComponent[], seed: number) {
  const labels = computeLabels(comps);
  ctx.save();
  ctx.font = 'italic 13px Georgia, serif';
  labels.forEach(({ comp, slot }, i) => {
    // Leader line
    rc.line(comp.x, comp.y, slot.x + (slot.anchor === 'left' ? -10 : 10), slot.y, {
      stroke: '#888', strokeWidth: 0.5, roughness: 0.4, seed: seed + 100 + i,
    });
    // Small dot at component end
    rc.circle(comp.x, comp.y, 4, {
      fill: '#666', fillStyle: 'solid', stroke: 'none', roughness: 0.3, seed: seed + 200 + i,
    });
    // Text
    ctx.fillStyle = '#3a3020';
    ctx.textAlign = slot.anchor === 'left' ? 'left' : 'right';
    ctx.fillText(comp.name, slot.x, slot.y + 4);
  });
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, name: string, venue: string) {
  ctx.save();
  ctx.textAlign = 'center';
  // Title
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillStyle = '#2c2418';
  ctx.letterSpacing = '2px';
  ctx.fillText(name.toUpperCase(), PLATE_CX, 560);
  // Venue
  if (venue) {
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillStyle = '#8a7e6b';
    ctx.fillText(venue, PLATE_CX, 578);
  }
  // Decorative line
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(PLATE_CX - 60, 586);
  ctx.lineTo(PLATE_CX + 60, 586);
  ctx.stroke();
  ctx.restore();
}

/* ── Main Component ── */
export default function PlatingStudioPage() {
  const [comps, setComps] = useState<PlateComponent[]>(PRESETS[0].components);
  const [name, setName] = useState(PRESETS[0].name);
  const [venue, setVenue] = useState('');
  const [sel, setSel] = useState<number | null>(null);
  const [seed, setSeed] = useState(42);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughRef = useRef<any>(null);
  const nextId = useRef(100);

  // Dynamic import of rough.js (client-only)
  const [roughLoaded, setRoughLoaded] = useState(false);
  useEffect(() => {
    import('roughjs').then((mod) => {
      (window as any).__rough = mod.default || mod;
      setRoughLoaded(true);
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const rough = (window as any).__rough;
    if (!canvas || !rough) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set paper background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FAF8F4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paper grain texture
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 4000; i++) {
      const gx = Math.random() * canvas.width;
      const gy = Math.random() * canvas.height;
      const gs = Math.random() * 1.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#8a7a6a';
      ctx.fillRect(gx, gy, gs, gs);
    }
    ctx.restore();

    const rc = rough.canvas(canvas);
    roughRef.current = rc;

    // Draw plate
    drawPlate(rc, ctx);

    // Draw components (back to front by y-position)
    const sorted = [...comps].sort((a, b) => a.y - b.y);
    sorted.forEach(c => {
      const fn = DRAW_FNS[c.shape];
      if (fn) fn(rc, c, seed + c.id);
    });

    // Draw labels
    drawLabels(ctx, rc, comps, seed);

    // Draw title
    drawTitle(ctx, name, venue);

    // Selection ring
    if (sel !== null) {
      const sc = comps.find(c => c.id === sel);
      if (sc) {
        rc.ellipse(sc.x, sc.y, sc.size * 3.5, sc.size * 3.5, {
          stroke: '#b8860b', strokeWidth: 1, roughness: 0.3,
          strokeLineDash: [6, 4],
        });
      }
    }
  }, [comps, name, venue, seed, sel, roughLoaded]);

  useEffect(() => { if (roughLoaded) draw(); }, [draw, roughLoaded]);

  // Canvas click to select/deselect
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const clicked = comps.find(c => {
      const dx = mx - c.x, dy = my - c.y;
      return Math.sqrt(dx * dx + dy * dy) < c.size * 1.5;
    });
    setSel(clicked ? clicked.id : null);
  };

  // Drag
  const dragging = useRef<number | null>(null);
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const hit = comps.find(c => Math.sqrt((mx - c.x) ** 2 + (my - c.y) ** 2) < c.size * 1.5);
    if (hit) {
      dragging.current = hit.id;
      setSel(hit.id);
      canvas.setPointerCapture(e.pointerId);
    } else {
      setSel(null);
    }
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragging.current === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    setComps(prev => prev.map(c => c.id === dragging.current ? { ...c, x: mx, y: my } : c));
  };
  const handlePointerUp = () => { dragging.current = null; };

  // Actions
  const addComp = () => {
    const id = nextId.current++;
    setComps(prev => [...prev, {
      id, name: 'New Component', shape: 'dome',
      x: PLATE_CX + (Math.random() - 0.5) * 150,
      y: PLATE_CY + (Math.random() - 0.5) * 150,
      size: 30, color: '#b8a080',
    }]);
    setSel(id);
  };
  const removeComp = (id: number) => {
    setComps(prev => prev.filter(c => c.id !== id));
    if (sel === id) setSel(null);
  };
  const updateComp = (id: number, upd: Partial<PlateComponent>) => {
    setComps(prev => prev.map(c => c.id === id ? { ...c, ...upd } : c));
  };
  const loadPreset = (p: typeof PRESETS[number]) => {
    setComps(p.components.map(c => ({ ...c })));
    setName(p.name);
    setSel(null);
    nextId.current = Math.max(...p.components.map(c => c.id)) + 100;
  };
  const regenerate = () => setSeed(Math.floor(Math.random() * 10000));
  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-plating.png`;
    a.click();
  };

  const selComp = comps.find(c => c.id === sel);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-4 sm:px-6 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/create" className="text-stone-400 hover:text-stone-700 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>Plating Studio</h1>
              <p className="text-[10px] text-stone-400 -mt-0.5">Hand-Drawn Sketch · rough.js</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => loadPreset(p)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded border transition-all ${
                  name === p.name ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-500 hover:border-stone-400'
                }`}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex gap-6" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center">
          <input value={name} onChange={e => setName(e.target.value)}
            className="text-center text-xl font-bold text-stone-800 bg-transparent border-none outline-none mb-3 w-80"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.04em' }} />

          <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
            <canvas ref={canvasRef} width={760} height={600}
              className="cursor-grab active:cursor-grabbing"
              style={{ width: '100%', maxWidth: 760, height: 'auto' }}
              onClick={handleCanvasClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp} />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button onClick={addComp}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded bg-stone-900 text-white hover:bg-stone-700 transition-all">
              <Plus size={13} /> Add Component
            </button>
            <button onClick={regenerate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded border border-stone-300 text-stone-600 hover:border-stone-500 transition-all">
              <RefreshCw size={13} /> Redraw
            </button>
            <button onClick={exportPNG}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all">
              <Download size={13} /> Export PNG
            </button>
            {sel !== null && (
              <button onClick={() => removeComp(sel)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <div className="text-[10px] font-bold tracking-widest uppercase text-stone-400">Components</div>
          {comps.length === 0 && (
            <p className="text-xs text-stone-400 italic">Click &quot;+ Add Component&quot; to start.</p>
          )}
          {comps.map(c => (
            <div key={c.id} onClick={() => setSel(c.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                sel === c.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/20' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-800">{c.name}</span>
                <button onClick={e => { e.stopPropagation(); removeComp(c.id); }}
                  className="text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              {sel === c.id && (
                <div className="space-y-2 mt-2 pt-2 border-t border-stone-100">
                  <input value={c.name} onChange={e => updateComp(c.id, { name: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-stone-200 rounded bg-white outline-none focus:border-amber-400" />

                  <div className="text-[9px] font-bold tracking-wider uppercase text-stone-400">Shape</div>
                  <div className="flex flex-wrap gap-1">
                    {SHAPE_TYPES.map(s => (
                      <button key={s} onClick={e => { e.stopPropagation(); updateComp(c.id, { shape: s }); }}
                        className={`px-2 py-0.5 text-[9px] rounded border capitalize ${
                          c.shape === s ? 'border-amber-500 bg-stone-900 text-white' : 'border-stone-200 text-stone-500'
                        }`}>{s}</button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-wider uppercase text-stone-400 w-8">Size</span>
                    <input type="range" min={10} max={80} value={c.size}
                      onChange={e => updateComp(c.id, { size: parseInt(e.target.value) })}
                      className="flex-1" style={{ accentColor: '#b8860b' }} />
                    <span className="text-[10px] text-stone-500 w-5 text-right">{c.size}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-wider uppercase text-stone-400 w-8">Tint</span>
                    <input type="color" value={c.color}
                      onChange={e => updateComp(c.id, { color: e.target.value })}
                      className="w-6 h-5 border border-stone-200 rounded cursor-pointer p-0" />
                    <span className="text-[9px] text-stone-400">{c.color}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Venue */}
          <div className="pt-3 border-t border-stone-200">
            <div className="text-[9px] font-bold tracking-wider uppercase text-stone-400 mb-1.5">Venue Label</div>
            <input value={venue} onChange={e => setVenue(e.target.value)}
              placeholder="e.g. Kaarla"
              className="w-full px-2 py-1.5 text-xs border border-stone-200 rounded bg-white outline-none focus:border-amber-400" />
          </div>

          <div className="text-[10px] text-stone-400 leading-relaxed pt-3 border-t border-stone-200">
            <strong>Tip:</strong> Drag components on the canvas to reposition. Click &quot;Redraw&quot; for a fresh hand-drawn variation — each render is unique.
          </div>
        </div>
      </div>
    </div>
  );
}
