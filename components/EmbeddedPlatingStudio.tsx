'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Download, Plus, Trash2, Copy, Layers, Eye, EyeOff } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   EMBEDDED PLATING STUDIO v4 — 3D Sketch Edition
   1-CUISINESG · Fine-Dining R&D Kitchen Tool
   ═══════════════════════════════════════════════════════════════════ */

const PX = 420, PY = 370, PR = 280;

/* ─── TYPE DETECTION ─── */
const KW: Record<string, string> = {
  sauce: 'sauce', jus: 'sauce', reduction: 'sauce', emulsion: 'sauce', coulis: 'sauce',
  puree: 'quenelle', purée: 'quenelle', mousse: 'quenelle', cream: 'quenelle', foam: 'quenelle',
  sorbet: 'quenelle', 'ice cream': 'quenelle', ice: 'quenelle', gelato: 'quenelle',
  berry: 'berries', currant: 'berries', strawberry: 'berries', raspberry: 'berries', blackberry: 'berries',
  crisp: 'chocolate shard', tuile: 'chocolate shard', shard: 'chocolate shard', chip: 'chocolate shard', wafer: 'chocolate shard',
  leaf: 'leaf garnish', herb: 'leaf garnish', micro: 'leaf garnish', flower: 'leaf garnish', cress: 'leaf garnish',
  crumble: 'crumb', crumb: 'crumb', soil: 'crumb', dust: 'crumb', powder: 'crumb',
  cookie: 'cookie', biscuit: 'cookie', shortbread: 'cookie', gable: 'cookie',
  glaze: 'glaze', gel: 'glaze', mirror: 'glaze',
  sugar: 'pulled sugar', caramel: 'pulled sugar', spun: 'pulled sugar', pulled: 'pulled sugar',
  scallop: 'dome', fish: 'dome', beef: 'dome', lamb: 'dome', duck: 'dome', pork: 'dome',
  chicken: 'dome', lobster: 'dome', fondant: 'dome', dome: 'dome', tart: 'dome', sphere: 'dome',
  paste: 'dome', meringue: 'dome', bombe: 'dome', pavlova: 'dome',
  potato: 'smear', rice: 'smear', risotto: 'smear', polenta: 'smear',
  dot: 'dots', pearls: 'dots',
  carrot: 'quenelle', pea: 'quenelle', leek: 'quenelle', mushroom: 'dome',
};

const COLORS_BY_KW: Record<string, string> = {
  sauce: '#7b2d3b', jus: '#8b4049', reduction: '#6b2030', coulis: '#c0394a', emulsion: '#d4a030',
  berry: '#c0392b', currant: '#c0392b', strawberry: '#e87a7a', raspberry: '#c0394a', blackberry: '#4a2040',
  chocolate: '#3d2215', cocoa: '#5c3d2e',
  cream: '#f0ead2', puree: '#e8dcc8', foam: '#f0ebe0',
  sorbet: '#e87a7a', gelato: '#e8dcc8',
  leaf: '#4a7a35', herb: '#4a7a35', micro: '#7db36a', flower: '#d4828a',
  sugar: '#f5deb3', caramel: '#c9a96e', gold: '#d4a017',
  cookie: '#c9a96e', biscuit: '#c9a96e',
  glaze: '#b53030', gel: '#b53030', mirror: '#b53030',
  crumb: '#a08060', soil: '#5c3d2e', dust: '#a08060',
  almond: '#d4c5a9', pistachio: '#7a9a50', vanilla: '#f0e6d0', mango: '#d4b060', lemon: '#e0d480',
  scallop: '#f0e0c0', fish: '#e8ddd0', lobster: '#d4806a',
  duck: '#b88070', beef: '#8b4049', lamb: '#a07060', pork: '#d4a089', chicken: '#d4b878',
  mushroom: '#8b7355', potato: '#e8dcc8', carrot: '#d4884a',
  white: '#f0e6d0', nori: '#2d5016', lime: '#a8d84e', olive: '#6b7a35',
};

function detectShape(name: string): string {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(KW)) { if (n.includes(k)) return v; }
  return 'dome';
}

function detectColor(name: string): string {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(COLORS_BY_KW)) { if (n.includes(k)) return v; }
  return '#c0b090';
}

function detectSize(shape: string): number {
  const m: Record<string, number> = {
    dome: 55, berries: 28, sauce: 48, quenelle: 28,
    'pulled sugar': 35, 'chocolate shard': 24, cookie: 24,
    glaze: 32, 'leaf garnish': 16, smear: 30, crumb: 18, dots: 14,
  };
  return m[shape] || 35;
}

/* ─── 3D RENDERERS ─── */
interface RProps { x: number; y: number; size: number; color: string; id: string }

function Dome({ x, y, size, color, id }: RProps) {
  const w = size * 2.8, h = size * 2.2, baseY = y + h * 0.22;
  return (<g>
    <ellipse cx={x+4} cy={baseY+h*0.15} rx={w*0.6} ry={h*0.22} fill="#000" opacity="0.08"/>
    <ellipse cx={x+2} cy={baseY+h*0.1} rx={w*0.55} ry={h*0.18} fill="#000" opacity="0.04"/>
    <ellipse cx={x} cy={baseY} rx={w*0.56} ry={h*0.16} fill={`url(#db-${id})`} stroke="#555" strokeWidth="1.3"/>
    <path d={`M${x-w*0.48},${baseY-h*0.02} A${w*0.5},${h*0.14} 0 0,1 ${x+w*0.48},${baseY-h*0.02}`} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3"/>
    <path d={`M${x-w*0.52},${baseY} C${x-w*0.53},${y-h*0.4} ${x-w*0.2},${y-h*0.82} ${x},${y-h*0.85} C${x+w*0.2},${y-h*0.82} ${x+w*0.53},${y-h*0.4} ${x+w*0.52},${baseY}`} fill={`url(#dd-${id})`} stroke="#444" strokeWidth="1.4"/>
    {[0.12,0.24,0.36,0.48,0.62,0.76].map((t,i)=>{const ly=baseY-h*t*0.95,sp=Math.sqrt(1-t*t)*w*0.5;return <path key={i} d={`M${x-sp*0.92},${ly} Q${x},${ly-2-i*0.5} ${x+sp*0.92},${ly}`} fill="none" stroke="#888" strokeWidth={0.4+(1-t)*0.3} strokeDasharray={i%2===0?"6,4":"4,5"} opacity={0.3+t*0.2}/>})}
    <ellipse cx={x} cy={baseY-h*0.35} rx={w*0.44} ry={h*0.13} fill="none" stroke="#444" strokeWidth="1.1" strokeDasharray="7,5" opacity="0.6"/>
    <path d={`M${x+w*0.35},${baseY-h*0.38} l5,-4 l-2,6`} fill="#444" opacity="0.5"/>
    <path d={`M${x-w*0.35},${baseY-h*0.32} l-5,4 l2,-6`} fill="#444" opacity="0.5"/>
    {[0,1,2,3,4,5,6,7].map(i=>{const t=i*0.11,sx=x-w*0.48+t*w*0.15;return <line key={`s${i}`} x1={sx} y1={baseY-h*t*0.7} x2={sx+3} y2={baseY-h*0.05} stroke="#777" strokeWidth="0.4" opacity={0.15+(1-t)*0.15}/>})}
    <path d={`M${x-w*0.12},${y-h*0.7} Q${x-w*0.02},${y-h*0.82} ${x+w*0.12},${y-h*0.65}`} fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" strokeLinecap="round"/>
    <path d={`M${x-w*0.08},${y-h*0.55} Q${x+w*0.02},${y-h*0.62} ${x+w*0.08},${y-h*0.5}`} fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
    <defs>
      <radialGradient id={`dd-${id}`} cx="38%" cy="28%" r="62%"><stop offset="0%" stopColor="#fff" stopOpacity="0.7"/><stop offset="35%" stopColor={color} stopOpacity="0.2"/><stop offset="70%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor="#888" stopOpacity="0.15"/></radialGradient>
      <radialGradient id={`db-${id}`} cx="50%" cy="40%" r="55%"><stop offset="0%" stopColor="#fff" stopOpacity="0.4"/><stop offset="100%" stopColor={color} stopOpacity="0.12"/></radialGradient>
    </defs>
  </g>);
}

function Berries({ x, y, size, color, id }: RProps) {
  const r = size*0.35;
  const pos = [{dx:-size*1.1,dy:size*0.1,s:1.05},{dx:-size*0.6,dy:-size*0.15,s:1},{dx:-size*0.1,dy:size*0.08,s:1.1},{dx:size*0.4,dy:-size*0.1,s:0.95},{dx:size*0.9,dy:size*0.05,s:1},{dx:size*1.35,dy:-size*0.05,s:0.88},{dx:-size*0.85,dy:size*0.35,s:0.7}];
  return (<g>{pos.map((b,i)=>{const bx=x+b.dx,by=y+b.dy,br=r*b.s;return(<g key={i}>
    <ellipse cx={bx+1.5} cy={by+br*0.85} rx={br*0.9} ry={br*0.35} fill="#000" opacity="0.07"/>
    <circle cx={bx} cy={by} r={br} fill={`url(#bg-${id}-${i})`} stroke="#555" strokeWidth="0.9"/>
    {[0,1,2].map(j=><line key={j} x1={bx-br*0.6+j*2} y1={by-br*0.2+j*3} x2={bx-br*0.3+j*2} y2={by+br*0.5+j*2} stroke="#777" strokeWidth="0.3" opacity="0.15"/>)}
    <ellipse cx={bx-br*0.2} cy={by-br*0.25} rx={br*0.3} ry={br*0.22} fill="#fff" opacity="0.55"/>
    <circle cx={bx-br*0.15} cy={by-br*0.2} r={br*0.12} fill="#fff" opacity="0.8"/>
    <text x={bx+br*0.05} y={by+br*0.15} textAnchor="middle" fontSize={br*0.7} fill="#555" opacity="0.35">✻</text>
    <defs><radialGradient id={`bg-${id}-${i}`} cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5"/><stop offset="40%" stopColor={color} stopOpacity="0.35"/><stop offset="80%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor="#555" stopOpacity="0.15"/></radialGradient></defs>
  </g>)})}</g>);
}

function SauceR({ x, y, size, color, id }: RProps) {
  const s = size*2;
  return (<g>
    <path d={`M${x-s*0.7},${y+s*0.1} C${x-s*0.5},${y-s*0.35} ${x-s*0.05},${y-s*0.38} ${x+s*0.35},${y-s*0.22} C${x+s*0.7},${y-s*0.05} ${x+s*0.8},${y+s*0.2} ${x+s*0.65},${y+s*0.38} C${x+s*0.45},${y+s*0.55} ${x+s*0.05},${y+s*0.5} ${x-s*0.2},${y+s*0.42} C${x-s*0.55},${y+s*0.35} ${x-s*0.75},${y+s*0.3} ${x-s*0.7},${y+s*0.1} Z`} fill={`url(#sg-${id})`} stroke="#777" strokeWidth="0.7" opacity="0.85"/>
    <path d={`M${x-s*0.3},${y+s*0.05} C${x-s*0.1},${y-s*0.15} ${x+s*0.2},${y-s*0.1} ${x+s*0.4},${y+s*0.05} C${x+s*0.5},${y+s*0.2} ${x+s*0.2},${y+s*0.3} ${x-s*0.05},${y+s*0.25} C${x-s*0.25},${y+s*0.2} ${x-s*0.35},${y+s*0.15} ${x-s*0.3},${y+s*0.05} Z`} fill={color} opacity="0.1"/>
    {[0,1,2,3].map(i=><path key={i} d={`M${x-s*0.4+(i-1.5)*s*0.15},${y+s*0.15+i*3} Q${x+(i-1.5)*s*0.075},${y-s*0.05+i*4} ${x+s*0.45+(i-1.5)*s*0.05},${y+s*0.1+i*2}`} fill="none" stroke={color} strokeWidth="0.5" opacity={0.08+i*0.02}/>)}
    <path d={`M${x-s*0.15},${y-s*0.12} C${x+s*0.1},${y-s*0.22} ${x+s*0.3},${y-s*0.12} ${x+s*0.4},${y-s*0.02}`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round"/>
    <defs><radialGradient id={`sg-${id}`} cx="40%" cy="35%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.25"/><stop offset="40%" stopColor={color} stopOpacity="0.2"/><stop offset="80%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor={color} stopOpacity="0.06"/></radialGradient></defs>
  </g>);
}

function QuenelleR({ x, y, size, color, id }: RProps) {
  const w = size*2.2, h = size*1.4;
  return (<g>
    <ellipse cx={x+2} cy={y+h*0.45} rx={w*0.42} ry={h*0.12} fill="#000" opacity="0.06"/>
    <path d={`M${x-w*0.5},${y+h*0.15} Q${x-w*0.45},${y-h*0.65} ${x+w*0.1},${y-h*0.55} Q${x+w*0.5},${y-h*0.45} ${x+w*0.5},${y+h*0.1} Q${x+w*0.35},${y+h*0.45} ${x+w*0.05},${y+h*0.35} Q${x-w*0.3},${y+h*0.45} ${x-w*0.5},${y+h*0.15} Z`} fill={`url(#qg-${id})`} stroke="#555" strokeWidth="1.1"/>
    {[0.15,0.3,0.45,0.6,0.75].map((t,i)=><path key={i} d={`M${x-w*0.35+t*w*0.35},${y-h*0.4+t*h*0.25} Q${x+t*w*0.15},${y+t*h*0.2} ${x+w*0.25+t*w*0.08},${y+t*h*0.15}`} fill="none" stroke="#999" strokeWidth="0.4" opacity={0.2+t*0.1}/>)}
    <path d={`M${x-w*0.15},${y-h*0.4} Q${x},${y-h*0.55} ${x+w*0.12},${y-h*0.35}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
    <defs><radialGradient id={`qg-${id}`} cx="35%" cy="28%" r="65%"><stop offset="0%" stopColor="#fff" stopOpacity="0.6"/><stop offset="45%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor="#777" stopOpacity="0.12"/></radialGradient></defs>
  </g>);
}

function PulledSugarR({ x, y, size }: RProps) {
  const s = size*1.8;
  return (<g>
    <path d={`M${x},${y} C${x+s*0.25},${y-s*0.6} ${x-s*0.25},${y-s*1.4} ${x+s*0.1},${y-s*2.2} C${x+s*0.3},${y-s*2.7} ${x+s*0.55},${y-s*2.5} ${x+s*0.35},${y-s*1.8}`} fill="none" stroke="#555" strokeWidth="1.8" opacity="0.65" strokeLinecap="round"/>
    <path d={`M${x+3},${y-2} C${x+s*0.28},${y-s*0.58} ${x-s*0.22},${y-s*1.38} ${x+s*0.13},${y-s*2.18}`} fill="none" stroke="#999" strokeWidth="0.6" opacity="0.3"/>
    <path d={`M${x+s*0.02},${y-s*0.8} C${x-s*0.08},${y-s*1.1} ${x-s*0.02},${y-s*1.5} ${x+s*0.08},${y-s*1.9}`} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round"/>
    <path d={`M${x+s*0.35},${y-s*1.8} C${x+s*0.4},${y-s*1.6} ${x+s*0.25},${y-s*1.55} ${x+s*0.2},${y-s*1.65}`} fill="none" stroke="#666" strokeWidth="0.8" opacity="0.4"/>
  </g>);
}

function ChocShard({ x, y, size, color, id }: RProps) {
  const s = size*1.4;
  return (<g>
    <ellipse cx={x+1} cy={y+s*0.35} rx={s*0.4} ry={s*0.08} fill="#000" opacity="0.05"/>
    <path d={`M${x-s*0.4},${y+s*0.3} L${x-s*0.35},${y-s*0.55} C${x-s*0.15},${y-s*0.75} ${x+s*0.2},${y-s*0.65} ${x+s*0.35},${y-s*0.4} L${x+s*0.5},${y+s*0.05} Q${x+s*0.35},${y+s*0.35} ${x+s*0.05},${y+s*0.32} Q${x-s*0.25},${y+s*0.38} ${x-s*0.4},${y+s*0.3} Z`} fill={`url(#cg-${id})`} stroke="#555" strokeWidth="0.9"/>
    {[0,1,2,3].map(i=><line key={i} x1={x-s*0.2+i*s*0.12} y1={y-s*0.2+i*3} x2={x-s*0.1+i*s*0.12} y2={y+s*0.15+i*2} stroke="#999" strokeWidth="0.3" opacity="0.2"/>)}
    <path d={`M${x-s*0.2},${y-s*0.3} L${x+s*0.15},${y-s*0.35}`} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round"/>
    <defs><linearGradient id={`cg-${id}`} x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.4"/><stop offset="100%" stopColor={color} stopOpacity="0.18"/></linearGradient></defs>
  </g>);
}

function CookieR({ x, y, size, color, id }: RProps) {
  const w = size*1.8, h = size*0.7, d = size*0.35;
  return (<g>
    <ellipse cx={x+2} cy={y+h*0.5+d+3} rx={w*0.5} ry={h*0.18} fill="#000" opacity="0.06"/>
    <path d={`M${x-w*0.5},${y+h*0.5} L${x-w*0.5},${y+h*0.5+d} L${x+w*0.5},${y+h*0.5+d} L${x+w*0.5},${y+h*0.5} Z`} fill={color} opacity="0.1" stroke="#666" strokeWidth="0.6"/>
    <rect x={x-w*0.5} y={y-h*0.5} width={w} height={h} rx={3} fill={`url(#ck-${id})`} stroke="#555" strokeWidth="1"/>
    {[-0.35,-0.15,0.05,0.25].map((t,i)=><line key={i} x1={x+w*t} y1={y-h*0.35} x2={x+w*t+5} y2={y+h*0.35} stroke="#999" strokeWidth="0.4" opacity="0.25"/>)}
    <defs><linearGradient id={`ck-${id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.45"/><stop offset="100%" stopColor={color} stopOpacity="0.18"/></linearGradient></defs>
  </g>);
}

function GlazeR({ x, y, size, color, id }: RProps) {
  const s = size*1.6;
  return (<g>
    <path d={`M${x-s*0.55},${y} C${x-s*0.45},${y-s*0.35} ${x-s*0.05},${y-s*0.4} ${x+s*0.3},${y-s*0.2} C${x+s*0.55},${y-s*0.05} ${x+s*0.6},${y+s*0.22} ${x+s*0.35},${y+s*0.35} C${x+s*0.05},${y+s*0.45} ${x-s*0.35},${y+s*0.38} ${x-s*0.55},${y} Z`} fill={`url(#gl-${id})`} stroke="#888" strokeWidth="0.6" opacity="0.85"/>
    <path d={`M${x-s*0.15},${y-s*0.15} C${x+s*0.05},${y-s*0.25} ${x+s*0.25},${y-s*0.12} ${x+s*0.35},${y}`} fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.28" strokeLinecap="round"/>
    <defs><radialGradient id={`gl-${id}`} cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#fff" stopOpacity="0.3"/><stop offset="60%" stopColor={color} stopOpacity="0.22"/><stop offset="100%" stopColor={color} stopOpacity="0.08"/></radialGradient></defs>
  </g>);
}

function LeafR({ x, y, size, color, id }: RProps) {
  const s = size*1.3;
  return (<g>
    <path d={`M${x},${y-s*0.95} C${x+s*0.5},${y-s*0.55} ${x+s*0.45},${y+s*0.4} ${x},${y+s*0.95} C${x-s*0.45},${y+s*0.4} ${x-s*0.5},${y-s*0.55} ${x},${y-s*0.95} Z`} fill={`url(#lf-${id})`} stroke="#555" strokeWidth="0.8"/>
    <path d={`M${x},${y-s*0.75} L${x},${y+s*0.75}`} fill="none" stroke="#777" strokeWidth="0.5" opacity="0.5"/>
    {[-0.4,-0.15,0.1,0.35].map((t,i)=><path key={i} d={`M${x},${y+s*t} L${x+(i%2?-1:1)*s*0.28},${y+s*t-s*0.12}`} fill="none" stroke="#888" strokeWidth="0.35" opacity="0.35"/>)}
    <defs><radialGradient id={`lf-${id}`} cx="38%" cy="28%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0.22"/></radialGradient></defs>
  </g>);
}

function SmearR({ x, y, size, color, id }: RProps) {
  const s = size*2.5;
  return (<g>
    <path d={`M${x-s*0.6},${y+s*0.05} C${x-s*0.35},${y-s*0.18} ${x-s*0.05},${y-s*0.22} ${x+s*0.25},${y-s*0.15} C${x+s*0.5},${y-s*0.08} ${x+s*0.55},${y+s*0.02} ${x+s*0.6},${y+s*0.08} C${x+s*0.5},${y+s*0.18} ${x+s*0.15},${y+s*0.22} ${x-s*0.15},${y+s*0.2} C${x-s*0.4},${y+s*0.18} ${x-s*0.55},${y+s*0.12} ${x-s*0.6},${y+s*0.05} Z`} fill={`url(#sm-${id})`} stroke="#888" strokeWidth="0.5" opacity="0.7"/>
    <path d={`M${x-s*0.35},${y-s*0.04} C${x},${y-s*0.12} ${x+s*0.2},${y-s*0.06} ${x+s*0.45},${y+s*0.02}`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" strokeLinecap="round"/>
    <defs><radialGradient id={`sm-${id}`} cx="35%" cy="40%" r="60%"><stop offset="0%" stopColor="#fff" stopOpacity="0.2"/><stop offset="50%" stopColor={color} stopOpacity="0.15"/><stop offset="100%" stopColor={color} stopOpacity="0.06"/></radialGradient></defs>
  </g>);
}

function CrumbR({ x, y, size, color }: RProps) {
  const spread = size*2;
  const dots = [];
  for (let i=0; i<16; i++) dots.push({dx:(Math.sin(i*7.3+1.2)*0.5)*spread,dy:(Math.cos(i*4.1+2.7)*0.5)*spread*0.5,r:1.2+Math.sin(i*3.7)*0.8,op:0.15+Math.cos(i*2.3)*0.1});
  return (<g>{dots.map((d,i)=><g key={i}><ellipse cx={x+d.dx+0.5} cy={y+d.dy+0.5} rx={d.r+0.3} ry={d.r*0.5} fill="#000" opacity="0.04"/><circle cx={x+d.dx} cy={y+d.dy} r={d.r} fill={color} opacity={d.op} stroke="#888" strokeWidth="0.3"/></g>)}</g>);
}

function DotsR({ x, y, size, color, id }: RProps) {
  const n=4, sp=size*1.4;
  return (<g>{Array.from({length:n}).map((_,i)=>{const dx=x+(i-(n-1)/2)*sp,r=size*0.5+Math.sin(i*2.1)*size*0.08;return(<g key={i}>
    <ellipse cx={dx+1} cy={y+r*0.7} rx={r*0.85} ry={r*0.3} fill="#000" opacity="0.06"/>
    <circle cx={dx} cy={y} r={r} fill={`url(#dt-${id}-${i})`} stroke="#666" strokeWidth="0.7"/>
    <ellipse cx={dx-r*0.2} cy={y-r*0.2} rx={r*0.3} ry={r*0.2} fill="#fff" opacity="0.5"/>
    <defs><radialGradient id={`dt-${id}-${i}`} cx="38%" cy="32%" r="55%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5"/><stop offset="50%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0.1"/></radialGradient></defs>
  </g>)})}</g>);
}

const RENDERERS: Record<string, React.FC<RProps>> = {
  dome: Dome, berries: Berries, sauce: SauceR, quenelle: QuenelleR,
  'pulled sugar': PulledSugarR, 'chocolate shard': ChocShard, cookie: CookieR,
  glaze: GlazeR, 'leaf garnish': LeafR, smear: SmearR, crumb: CrumbR, dots: DotsR,
};
const SHAPES = Object.keys(RENDERERS);

/* ─── LABELS ─── */
const LABEL_SLOTS = [
  {x:45,y:75,a:'start'},{x:780,y:75,a:'end'},{x:790,y:195,a:'end'},{x:795,y:320,a:'end'},
  {x:775,y:445,a:'end'},{x:45,y:445,a:'start'},{x:25,y:320,a:'start'},{x:25,y:195,a:'start'},
  {x:420,y:660,a:'middle'},{x:420,y:45,a:'middle'},{x:150,y:640,a:'start'},{x:690,y:640,a:'end'},
  {x:45,y:570,a:'start'},{x:780,y:570,a:'end'},{x:790,y:140,a:'end'},{x:25,y:140,a:'start'},
];

function LeaderLine({ fx, fy, tx, ty }: { fx:number;fy:number;tx:number;ty:number }) {
  const mx=fx+(tx-fx)*0.35+(ty-fy)*0.08, my=fy+(ty-fy)*0.5-(tx-fx)*0.05;
  const angle=Math.atan2(ty-my,tx-mx), al=8;
  return (<g>
    <path d={`M${fx},${fy} Q${mx},${my} ${tx},${ty}`} fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55"/>
    <path d={`M${tx-al*Math.cos(angle-0.35)},${ty-al*Math.sin(angle-0.35)} L${tx},${ty} L${tx-al*Math.cos(angle+0.35)},${ty-al*Math.sin(angle+0.35)}`} fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55"/>
  </g>);
}

/* ─── DRAG ─── */
interface CompState { id:number; name:string; shape:string; x:number; y:number; size:number; color:string }

function DragWrap({ comp, children, selected, onSelect, onDrag }: {
  comp:CompState; children:React.ReactNode; selected:boolean;
  onSelect:(id:number)=>void; onDrag:(id:number,x:number,y:number)=>void;
}) {
  const [dragging, setDragging] = useState(false);
  const off = useRef({ x:0, y:0 });
  const down = (e: React.PointerEvent) => {
    e.stopPropagation(); onSelect(comp.id); setDragging(true);
    const svg = (e.currentTarget as SVGElement).closest('svg')!;
    const pt = svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    off.current = { x:sp.x-comp.x, y:sp.y-comp.y };
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!dragging) return;
    const svg = (e.currentTarget as SVGElement).closest('svg')!;
    const pt = svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    onDrag(comp.id, sp.x-off.current.x, sp.y-off.current.y);
  };
  return (
    <g onPointerDown={down} onPointerMove={move} onPointerUp={()=>setDragging(false)} style={{cursor:'grab'}}>
      {children}
      {selected && <circle cx={comp.x} cy={comp.y} r={comp.size*2+15} fill="none" stroke="#b8860b" strokeWidth="1" strokeDasharray="6,4" opacity="0.4"/>}
    </g>
  );
}

/* ─── MAIN ─── */
export default function EmbeddedPlatingStudio({ components, title, venueName, venueAccent }: {
  components: { name: string }[];
  title: string;
  venueName: string;
  venueAccent: string;
}) {
  const initialComps = useMemo(() => {
    const safe = (components||[]).filter(c=>c&&c.name);
    if (!safe.length) return [];
    return safe.map((c,i) => {
      const shape=detectShape(c.name), color=detectColor(c.name), size=detectSize(shape);
      const angle=-Math.PI*0.55+(i/Math.max(safe.length-1,1))*Math.PI*1.6;
      const dist=PR*(0.25+(i%3)*0.2);
      return { id:i+1, name:c.name, shape, x:i===0?PX:PX+Math.cos(angle)*dist*0.85, y:i===0?PY:PY+Math.sin(angle)*dist*0.6, size:i===0?size*1.15:size, color };
    });
  }, []);

  const [comps, setComps] = useState<CompState[]>(initialComps);
  const [sel, setSel] = useState<number|null>(null);
  const [edit, setEdit] = useState<number|null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [panel, setPanel] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const nid = useRef(200);

  const drag = useCallback((id:number,x:number,y:number)=>setComps(p=>p.map(c=>c.id===id?{...c,x,y}:c)),[]);
  const add = (shape='dome') => { const id=nid.current++; setComps(p=>[...p,{id,name:'New Component',shape,x:PX+(Math.sin(id*1.7)*80),y:PY+(Math.cos(id*1.3)*60),size:detectSize(shape),color:'#c0b090'}]); setSel(id); setEdit(id); setPanel(true); };
  const rm = (id:number) => { setComps(p=>p.filter(c=>c.id!==id)); if(sel===id){setSel(null);setEdit(null);} };
  const dup = (id:number) => { const src=comps.find(c=>c.id===id); if(!src)return; const nId=nid.current++; setComps(p=>[...p,{...src,id:nId,x:src.x+25,y:src.y+15,name:src.name+' (copy)'}]); setSel(nId); setEdit(nId); };
  const upd = (id:number,u:Partial<CompState>) => setComps(p=>p.map(c=>c.id===id?{...c,...u}:c));

  const exportSVG = () => { if(!svgRef.current)return; const d=new XMLSerializer().serializeToString(svgRef.current); const u=URL.createObjectURL(new Blob([d],{type:'image/svg+xml'})); const a=document.createElement('a'); a.href=u; a.download=`${(title||'plating').replace(/\s+/g,'_')}.svg`; a.click(); URL.revokeObjectURL(u); };
  const exportPNG = () => {
    if(!svgRef.current)return;
    const svgData=new XMLSerializer().serializeToString(svgRef.current);
    const canvas=document.createElement('canvas'); canvas.width=2520; canvas.height=2160;
    const ctx=canvas.getContext('2d'); const img=new Image();
    img.onload=()=>{ ctx!.fillStyle='#fdfcf8'; ctx!.fillRect(0,0,2520,2160); ctx!.drawImage(img,0,0,2520,2160);
      const a=document.createElement('a'); a.download=`${(title||'plating').replace(/\s+/g,'_')}.png`; a.href=canvas.toDataURL('image/png'); a.click(); };
    img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!comps.length) return null;
  const accent = venueAccent || '#8B8578';

  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden bg-[#f9f7f2]">
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-stone-50/80 border-b border-stone-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{color:accent}}>Plating Studio</span>
          <span className="text-[9px] text-stone-400 italic">3D Sketch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setShowLabels(!showLabels)} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border transition-all" style={{borderColor:showLabels?accent:'#d4cfc4',background:showLabels?`${accent}15`:'transparent',color:showLabels?accent:'#6b5e4a'}}>
            {showLabels?<Eye size={10}/>:<EyeOff size={10}/>} Labels
          </button>
          <button onClick={()=>setPanel(!panel)} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border transition-all" style={{borderColor:panel?accent:'#d4cfc4',background:panel?`${accent}15`:'transparent',color:panel?accent:'#6b5e4a'}}>
            <Layers size={10}/> Edit
          </button>
          <button onClick={exportSVG} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all" style={{background:`${accent}15`,color:accent,border:`1px solid ${accent}40`}}>
            <Download size={10}/> SVG
          </button>
          <button onClick={exportPNG} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded transition-all" style={{background:`${accent}15`,color:accent,border:`1px solid ${accent}40`}}>
            <Download size={10}/> PNG
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 min-w-0">
          <svg ref={svgRef} viewBox="0 0 840 720" style={{width:'100%',display:'block',background:'#fdfcf8'}} onClick={()=>{setSel(null);setEdit(null);}}>
            <defs><radialGradient id="pS" cx="36%" cy="30%" r="58%"><stop offset="0%" stopColor="#fff" stopOpacity="0.45"/><stop offset="100%" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
            <text x={PX} y="30" textAnchor="middle" style={{fontSize:16,fontStyle:'italic',fill:'#222',fontFamily:"'Playfair Display',Georgia,serif",fontWeight:700}}>{title}</text>
            <text x={PX} y="48" textAnchor="middle" style={{fontSize:10,fill:'#888',fontFamily:"'Crimson Pro',Georgia,serif",fontStyle:'italic'}}>{venueName}</text>
            <ellipse cx={PX+6} cy={PY+10} rx={PR+18} ry={PR+18} fill="#c0b8a8" opacity="0.1"/>
            <ellipse cx={PX} cy={PY} rx={PR+12} ry={PR+12} fill="none" stroke="#b0a898" strokeWidth="0.5"/>
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="#fefefe" stroke="#807868" strokeWidth="1.5"/>
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="url(#pS)"/>
            <ellipse cx={PX} cy={PY} rx={PR-38} ry={PR-38} fill="none" stroke="#ccc5b5" strokeWidth="0.3" strokeDasharray="1.5,6" opacity="0.35"/>
            <path d={`M${PX-PR*0.65},${PY-PR*0.72} A${PR},${PR} 0 0,1 ${PX+PR*0.72},${PY-PR*0.6}`} fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.22" strokeLinecap="round"/>
            {comps.map(c=>{const R=RENDERERS[c.shape]||Dome;return(
              <DragWrap key={c.id} comp={c} selected={sel===c.id} onSelect={id=>{setSel(id);setEdit(id);if(!panel)setPanel(true);}} onDrag={drag}>
                <R x={c.x} y={c.y} size={c.size} color={c.color} id={`e-${c.id}`}/>
              </DragWrap>
            );})}
            {showLabels && comps.map((c,i)=>{const lp=LABEL_SLOTS[i%LABEL_SLOTS.length];const ax=lp.a==='start'?lp.x+c.name.length*2.5:lp.a==='end'?lp.x-c.name.length*2.5:lp.x;return(
              <g key={`l-${c.id}`} opacity={sel===c.id?1:0.85}>
                <LeaderLine fx={ax} fy={lp.y+4} tx={c.x} ty={c.y}/>
                <text x={lp.x} y={lp.y} textAnchor={lp.a as any} style={{fontFamily:"'Crimson Pro',Georgia,serif",fontSize:'13px',fontStyle:'italic',fill:sel===c.id?'#111':'#3a3020',fontWeight:sel===c.id?600:400,cursor:'pointer'}}
                  onClick={(e)=>{e.stopPropagation();setSel(c.id);setEdit(c.id);setPanel(true);}}>{c.name}</text>
              </g>
            );})}
            <text x={PX} y={700} textAnchor="middle" style={{fontFamily:"'Playfair Display',serif",fontSize:'13px',fontWeight:700,fill:'#2c2418',letterSpacing:'0.1em'}}>{(title||'').toUpperCase()}</text>
            <line x1={PX-75} y1={708} x2={PX+75} y2={708} stroke={accent} strokeWidth="0.5" opacity="0.35"/>
          </svg>
        </div>

        {panel && (
          <div className="w-[250px] border-l border-stone-200 bg-stone-50/50 overflow-y-auto" style={{fontSize:'11px',maxHeight:'600px'}}>
            <div className="p-3 border-b border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700" style={{fontFamily:"'Playfair Display',serif"}}>Components</span>
                <span className="text-[10px] text-stone-400">{comps.length}</span>
              </div>
              <button onClick={()=>add('dome')} className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold rounded border transition-all" style={{borderColor:accent,color:accent,background:`${accent}10`}}>
                <Plus size={10}/> Add Component
              </button>
            </div>
            <div className="p-2">
              {comps.map(c=>(
                <div key={c.id} onClick={()=>{setSel(c.id);setEdit(c.id);}} className="mb-1 rounded border transition-all cursor-pointer" style={{borderColor:sel===c.id?accent:'#e5e0d6',background:sel===c.id?'#faf6ed':'#fdfcf9',padding:'6px 8px'}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c.color,border:'1px solid #ccc'}}/>
                      <span className="text-[11px] font-semibold text-stone-700 truncate">{c.name}</span>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <button onClick={e=>{e.stopPropagation();dup(c.id);}} title="Duplicate" className="p-0.5 text-stone-400 hover:text-stone-600"><Copy size={10}/></button>
                      <button onClick={e=>{e.stopPropagation();rm(c.id);}} title="Remove" className="p-0.5 text-red-300 hover:text-red-500"><Trash2 size={10}/></button>
                    </div>
                  </div>
                  {edit===c.id && (
                    <div className="mt-2 space-y-2" onClick={e=>e.stopPropagation()}>
                      <input value={c.name} onChange={e=>upd(c.id,{name:e.target.value})} className="w-full px-2 py-1 text-[10px] border border-stone-200 rounded bg-white text-stone-700 outline-none focus:border-amber-600" style={{fontFamily:"'Crimson Pro',serif"}}/>
                      <div>
                        <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wider mb-1">Shape</div>
                        <div className="flex flex-wrap gap-0.5">
                          {SHAPES.map(s=><button key={s} onClick={()=>upd(c.id,{shape:s,size:detectSize(s)})} className="px-1.5 py-0.5 text-[8px] rounded capitalize transition-all" style={{border:`1px solid ${c.shape===s?accent:'#d4cfc4'}`,background:c.shape===s?'#2c2418':'transparent',color:c.shape===s?'#faf8f4':'#6b5e4a',fontFamily:"'Crimson Pro',serif"}}>{s}</button>)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-stone-400 uppercase w-6">Size</span>
                        <input type="range" min="8" max="90" value={c.size} onChange={e=>upd(c.id,{size:parseInt(e.target.value)})} className="flex-1" style={{accentColor:accent}}/>
                        <span className="text-[9px] text-stone-500 w-5 text-right">{c.size}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-stone-400 uppercase w-6">Tint</span>
                        <input type="color" value={c.color} onChange={e=>upd(c.id,{color:e.target.value})} className="w-5 h-4 border border-stone-200 rounded cursor-pointer p-0"/>
                        <div className="flex gap-0.5 ml-auto">
                          {['#d4c5a9','#c0392b','#7b2d3b','#e8dcc8','#4a7a35','#3d2215','#f0e6d0'].map(col=><button key={col} onClick={()=>upd(c.id,{color:col})} className="w-3 h-3 rounded-full cursor-pointer p-0" style={{background:col,border:c.color===col?`2px solid ${accent}`:'1px solid #ccc'}}/>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-stone-100">
              <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Quick Add</div>
              <div className="flex flex-wrap gap-0.5">
                {SHAPES.map(s=><button key={s} onClick={()=>add(s)} className="px-1.5 py-0.5 text-[8px] rounded border border-stone-200 text-stone-500 hover:text-stone-700 capitalize transition-all" style={{fontFamily:"'Crimson Pro',serif"}}>+ {s}</button>)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-100 text-center">
        <span className="text-[9px] text-stone-400 italic">Drag to reposition · Click to edit · Toggle Edit panel for full control</span>
      </div>
    </div>
  );
}
