'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   EMBEDDED PLATING STUDIO v4 — 3D Sketch Edition
   1-CUISINESG · Renders inside the Adaptations tool on Create page.
   Same props interface: { components, title, venueName, venueAccent }
   ═══════════════════════════════════════════════════════════════════ */

const PX = 420;
const PY = 370;
const PR = 280;

/* ── Renderer prop types ── */
interface RProps {
  x: number;
  y: number;
  size: number;
  color: string;
  id: string;
}

/* ── Component state ── */
interface CompState {
  id: number;
  name: string;
  shape: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

/* ═══════════════════════════════════════════
   3D COMPONENT RENDERERS — from plating-studio-v3
   ═══════════════════════════════════════════ */

function Dome({ x, y, size, color, id }: RProps) {
  const w = size * 2.8;
  const h = size * 2.2;
  const baseY = y + h * 0.22;
  return (
    <g>
      <ellipse cx={x + 4} cy={baseY + h * 0.15} rx={w * 0.6} ry={h * 0.22} fill="#000" opacity="0.08" />
      <ellipse cx={x + 2} cy={baseY + h * 0.1} rx={w * 0.55} ry={h * 0.18} fill="#000" opacity="0.04" />
      <ellipse cx={x} cy={baseY} rx={w * 0.56} ry={h * 0.16}
        fill={`url(#dome-base-${id})`} stroke="#555" strokeWidth="1.3" />
      <path d={`M${x - w * 0.48},${baseY - h * 0.02} A${w * 0.5},${h * 0.14} 0 0,1 ${x + w * 0.48},${baseY - h * 0.02}`}
        fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
      <path d={`M${x - w * 0.52},${baseY} C${x - w * 0.53},${y - h * 0.4} ${x - w * 0.2},${y - h * 0.82} ${x},${y - h * 0.85} C${x + w * 0.2},${y - h * 0.82} ${x + w * 0.53},${y - h * 0.4} ${x + w * 0.52},${baseY}`}
        fill={`url(#dome-body-${id})`} stroke="#444" strokeWidth="1.4" />
      {[0.12, 0.24, 0.36, 0.48, 0.62, 0.76].map((t, i) => {
        const ly = baseY - h * t * 0.95;
        const spread = Math.sqrt(1 - t * t) * w * 0.5;
        return (
          <path key={i}
            d={`M${x - spread * 0.92},${ly} Q${x},${ly - 2 - i * 0.5} ${x + spread * 0.92},${ly}`}
            fill="none" stroke="#888" strokeWidth={0.4 + (1 - t) * 0.3}
            strokeDasharray={i % 2 === 0 ? "6,4" : "4,5"} opacity={0.3 + t * 0.2} />
        );
      })}
      <ellipse cx={x} cy={baseY - h * 0.35} rx={w * 0.44} ry={h * 0.13}
        fill="none" stroke="#444" strokeWidth="1.1" strokeDasharray="7,5" opacity="0.6" />
      <path d={`M${x + w * 0.35},${baseY - h * 0.38} l5,-4 l-2,6`} fill="#444" opacity="0.5" />
      <path d={`M${x - w * 0.35},${baseY - h * 0.32} l-5,4 l2,-6`} fill="#444" opacity="0.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const t = i * 0.11;
        const sx = x - w * 0.48 + t * w * 0.15;
        return (
          <line key={`sh-${i}`} x1={sx} y1={baseY - h * t * 0.7} x2={sx + 3} y2={baseY - h * 0.05}
            stroke="#777" strokeWidth="0.4" opacity={0.15 + (1 - t) * 0.15} />
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const t = i * 0.15;
        const sx = x + w * 0.25 + t * w * 0.15;
        return (
          <line key={`rh-${i}`} x1={sx} y1={baseY - h * 0.5 + i * 8} x2={sx + 4} y2={baseY}
            stroke="#999" strokeWidth="0.3" opacity="0.1" />
        );
      })}
      <path d={`M${x - w * 0.12},${y - h * 0.7} Q${x - w * 0.02},${y - h * 0.82} ${x + w * 0.12},${y - h * 0.65}`}
        fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      <path d={`M${x - w * 0.08},${y - h * 0.55} Q${x + w * 0.02},${y - h * 0.62} ${x + w * 0.08},${y - h * 0.5}`}
        fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <defs>
        <radialGradient id={`dome-body-${id}`} cx="38%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="35%" stopColor={color} stopOpacity="0.2" />
          <stop offset="70%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#888" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id={`dome-base-${id}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

function Berries({ x, y, size, color, id }: RProps) {
  const r = size * 0.35;
  const positions = [
    { dx: -size * 1.1, dy: size * 0.1, s: 1.05 },
    { dx: -size * 0.6, dy: -size * 0.15, s: 1.0 },
    { dx: -size * 0.1, dy: size * 0.08, s: 1.1 },
    { dx: size * 0.4, dy: -size * 0.1, s: 0.95 },
    { dx: size * 0.9, dy: size * 0.05, s: 1.0 },
    { dx: size * 1.35, dy: -size * 0.05, s: 0.88 },
    { dx: -size * 0.85, dy: size * 0.35, s: 0.7 },
  ];
  return (
    <g>
      {positions.map((b, i) => {
        const bx = x + b.dx, by = y + b.dy, br = r * b.s;
        return (
          <g key={i}>
            <ellipse cx={bx + 1.5} cy={by + br * 0.85} rx={br * 0.9} ry={br * 0.35} fill="#000" opacity="0.07" />
            <circle cx={bx} cy={by} r={br} fill={`url(#berry-g-${id}-${i})`} stroke="#555" strokeWidth="0.9" />
            <path d={`M${bx - br * 0.7},${by + br * 0.3} A${br * 0.9},${br * 0.9} 0 0,0 ${bx + br * 0.7},${by + br * 0.3}`} fill="#000" opacity="0.06" />
            {[0, 1, 2].map(j => (
              <line key={j} x1={bx - br * 0.6 + j * 2} y1={by - br * 0.2 + j * 3}
                x2={bx - br * 0.3 + j * 2} y2={by + br * 0.5 + j * 2}
                stroke="#777" strokeWidth="0.3" opacity="0.15" />
            ))}
            <ellipse cx={bx - br * 0.2} cy={by - br * 0.25} rx={br * 0.3} ry={br * 0.22} fill="#fff" opacity="0.55" />
            <circle cx={bx - br * 0.15} cy={by - br * 0.2} r={br * 0.12} fill="#fff" opacity="0.8" />
            <defs>
              <radialGradient id={`berry-g-${id}-${i}`} cx="35%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="40%" stopColor={color} stopOpacity="0.35" />
                <stop offset="80%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor="#555" stopOpacity="0.15" />
              </radialGradient>
            </defs>
          </g>
        );
      })}
    </g>
  );
}

function SauceShape({ x, y, size, color, id }: RProps) {
  const s = size * 2;
  return (
    <g>
      <path d={`M${x - s * 0.7},${y + s * 0.1} C${x - s * 0.5},${y - s * 0.35} ${x - s * 0.05},${y - s * 0.38} ${x + s * 0.35},${y - s * 0.22} C${x + s * 0.7},${y - s * 0.05} ${x + s * 0.8},${y + s * 0.2} ${x + s * 0.65},${y + s * 0.38} C${x + s * 0.45},${y + s * 0.55} ${x + s * 0.05},${y + s * 0.5} ${x - s * 0.2},${y + s * 0.42} C${x - s * 0.55},${y + s * 0.35} ${x - s * 0.75},${y + s * 0.3} ${x - s * 0.7},${y + s * 0.1} Z`}
        fill={`url(#sauce-g-${id})`} stroke="#777" strokeWidth="0.7" opacity="0.85" />
      <path d={`M${x - s * 0.3},${y + s * 0.05} C${x - s * 0.1},${y - s * 0.15} ${x + s * 0.2},${y - s * 0.1} ${x + s * 0.4},${y + s * 0.05} C${x + s * 0.5},${y + s * 0.2} ${x + s * 0.2},${y + s * 0.3} ${x - s * 0.05},${y + s * 0.25} C${x - s * 0.25},${y + s * 0.2} ${x - s * 0.35},${y + s * 0.15} ${x - s * 0.3},${y + s * 0.05} Z`}
        fill={color} opacity="0.1" />
      {[0, 1, 2, 3, 4].map(i => {
        const ox = (i - 2) * s * 0.15;
        return (
          <path key={i}
            d={`M${x - s * 0.4 + ox},${y + s * 0.15 + i * 3} Q${x + ox * 0.5},${y - s * 0.05 + i * 4} ${x + s * 0.45 + ox * 0.3},${y + s * 0.1 + i * 2}`}
            fill="none" stroke={color} strokeWidth={0.5 + i * 0.05} opacity={0.08 + i * 0.02} />
        );
      })}
      <path d={`M${x - s * 0.65},${y + s * 0.15} C${x - s * 0.45},${y - s * 0.28} ${x},${y - s * 0.32} ${x + s * 0.3},${y - s * 0.18}`}
        fill="none" stroke="#666" strokeWidth="0.4" opacity="0.3" />
      <path d={`M${x - s * 0.15},${y - s * 0.12} C${x + s * 0.1},${y - s * 0.22} ${x + s * 0.3},${y - s * 0.12} ${x + s * 0.4},${y - s * 0.02}`}
        fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      <path d={`M${x + s * 0.1},${y + s * 0.08} C${x + s * 0.25},${y} ${x + s * 0.4},${y + s * 0.05} ${x + s * 0.5},${y + s * 0.12}`}
        fill="none" stroke="#fff" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
      <defs>
        <radialGradient id={`sauce-g-${id}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="40%" stopColor={color} stopOpacity="0.2" />
          <stop offset="80%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </radialGradient>
      </defs>
    </g>
  );
}

function Quenelle({ x, y, size, color, id }: RProps) {
  const w = size * 2.2, h = size * 1.4;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.45} rx={w * 0.42} ry={h * 0.12} fill="#000" opacity="0.06" />
      <path d={`M${x - w * 0.5},${y + h * 0.15} Q${x - w * 0.45},${y - h * 0.65} ${x + w * 0.1},${y - h * 0.55} Q${x + w * 0.5},${y - h * 0.45} ${x + w * 0.5},${y + h * 0.1} Q${x + w * 0.35},${y + h * 0.45} ${x + w * 0.05},${y + h * 0.35} Q${x - w * 0.3},${y + h * 0.45} ${x - w * 0.5},${y + h * 0.15} Z`}
        fill={`url(#quen-g-${id})`} stroke="#555" strokeWidth="1.1" />
      {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => (
        <path key={i}
          d={`M${x - w * 0.35 + t * w * 0.35},${y - h * 0.4 + t * h * 0.25} Q${x + t * w * 0.15},${y + t * h * 0.2} ${x + w * 0.25 + t * w * 0.08},${y + t * h * 0.15}`}
          fill="none" stroke="#999" strokeWidth="0.4" opacity={0.2 + t * 0.1} />
      ))}
      <path d={`M${x - w * 0.15},${y - h * 0.4} Q${x},${y - h * 0.55} ${x + w * 0.12},${y - h * 0.35}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={x - w * 0.4 + i * 3} y1={y - h * 0.1 + i * 4}
          x2={x - w * 0.3 + i * 3} y2={y + h * 0.3 + i * 2}
          stroke="#888" strokeWidth="0.3" opacity="0.12" />
      ))}
      <defs>
        <radialGradient id={`quen-g-${id}`} cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="45%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#777" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

function PulledSugar({ x, y, size }: RProps) {
  const s = size * 1.8;
  return (
    <g>
      <path d={`M${x},${y} C${x + s * 0.25},${y - s * 0.6} ${x - s * 0.25},${y - s * 1.4} ${x + s * 0.1},${y - s * 2.2} C${x + s * 0.3},${y - s * 2.7} ${x + s * 0.55},${y - s * 2.5} ${x + s * 0.35},${y - s * 1.8}`}
        fill="none" stroke="#555" strokeWidth="1.8" opacity="0.65" strokeLinecap="round" />
      <path d={`M${x + 3},${y - 2} C${x + s * 0.28},${y - s * 0.58} ${x - s * 0.22},${y - s * 1.38} ${x + s * 0.13},${y - s * 2.18}`}
        fill="none" stroke="#999" strokeWidth="0.6" opacity="0.3" />
      <path d={`M${x + s * 0.02},${y - s * 0.8} C${x - s * 0.08},${y - s * 1.1} ${x - s * 0.02},${y - s * 1.5} ${x + s * 0.08},${y - s * 1.9}`}
        fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
      <path d={`M${x + s * 0.35},${y - s * 1.8} C${x + s * 0.4},${y - s * 1.6} ${x + s * 0.25},${y - s * 1.55} ${x + s * 0.2},${y - s * 1.65}`}
        fill="none" stroke="#666" strokeWidth="0.8" opacity="0.4" />
    </g>
  );
}

function ChocolateShard({ x, y, size, color, id }: RProps) {
  const s = size * 1.4;
  return (
    <g>
      <ellipse cx={x + 1} cy={y + s * 0.35} rx={s * 0.4} ry={s * 0.08} fill="#000" opacity="0.05" />
      <path d={`M${x - s * 0.4},${y + s * 0.3} L${x - s * 0.35},${y - s * 0.55} C${x - s * 0.15},${y - s * 0.75} ${x + s * 0.2},${y - s * 0.65} ${x + s * 0.35},${y - s * 0.4} L${x + s * 0.5},${y + s * 0.05} Q${x + s * 0.35},${y + s * 0.35} ${x + s * 0.05},${y + s * 0.32} Q${x - s * 0.25},${y + s * 0.38} ${x - s * 0.4},${y + s * 0.3} Z`}
        fill={`url(#choc-g-${id})`} stroke="#555" strokeWidth="0.9" />
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={x - s * 0.2 + i * s * 0.12} y1={y - s * 0.2 + i * 3}
          x2={x - s * 0.1 + i * s * 0.12} y2={y + s * 0.15 + i * 2}
          stroke="#999" strokeWidth="0.3" opacity="0.2" />
      ))}
      <path d={`M${x - s * 0.2},${y - s * 0.3} L${x + s * 0.15},${y - s * 0.35}`}
        fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
      <defs>
        <linearGradient id={`choc-g-${id}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </g>
  );
}

function CookieShape({ x, y, size, color, id }: RProps) {
  const w = size * 1.8, h = size * 0.7, d = size * 0.35;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.5 + d + 3} rx={w * 0.5} ry={h * 0.18} fill="#000" opacity="0.06" />
      <path d={`M${x - w * 0.5},${y + h * 0.5} L${x - w * 0.5},${y + h * 0.5 + d} L${x + w * 0.5},${y + h * 0.5 + d} L${x + w * 0.5},${y + h * 0.5} Z`}
        fill={color} opacity="0.1" stroke="#666" strokeWidth="0.6" />
      <rect x={x - w * 0.5} y={y - h * 0.5} width={w} height={h} rx={3}
        fill={`url(#cook-g-${id})`} stroke="#555" strokeWidth="1" />
      {[-0.35, -0.15, 0.05, 0.25].map((t, i) => (
        <g key={i}>
          <line x1={x + w * t} y1={y - h * 0.35} x2={x + w * t + 5} y2={y + h * 0.35}
            stroke="#999" strokeWidth="0.4" opacity="0.25" />
          <line x1={x + w * t + w * 0.08} y1={y - h * 0.35} x2={x + w * t - 3} y2={y + h * 0.35}
            stroke="#999" strokeWidth="0.3" opacity="0.15" />
        </g>
      ))}
      <defs>
        <linearGradient id={`cook-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </g>
  );
}

function GlazeShape({ x, y, size, color, id }: RProps) {
  const s = size * 1.6;
  return (
    <g>
      <path d={`M${x - s * 0.55},${y} C${x - s * 0.45},${y - s * 0.35} ${x - s * 0.05},${y - s * 0.4} ${x + s * 0.3},${y - s * 0.2} C${x + s * 0.55},${y - s * 0.05} ${x + s * 0.6},${y + s * 0.22} ${x + s * 0.35},${y + s * 0.35} C${x + s * 0.05},${y + s * 0.45} ${x - s * 0.35},${y + s * 0.38} ${x - s * 0.55},${y} Z`}
        fill={`url(#glaze-g-${id})`} stroke="#888" strokeWidth="0.6" opacity="0.85" />
      <path d={`M${x - s * 0.15},${y - s * 0.15} C${x + s * 0.05},${y - s * 0.25} ${x + s * 0.25},${y - s * 0.12} ${x + s * 0.35},${y}`}
        fill="none" stroke="#fff" strokeWidth="1.8" opacity="0.28" strokeLinecap="round" />
      <defs>
        <radialGradient id={`glaze-g-${id}`} cx="38%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="60%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
      </defs>
    </g>
  );
}

function LeafGarnish({ x, y, size, color, id }: RProps) {
  const s = size * 1.3;
  return (
    <g>
      <path d={`M${x},${y - s * 0.95} C${x + s * 0.5},${y - s * 0.55} ${x + s * 0.45},${y + s * 0.4} ${x},${y + s * 0.95} C${x - s * 0.45},${y + s * 0.4} ${x - s * 0.5},${y - s * 0.55} ${x},${y - s * 0.95} Z`}
        fill={`url(#leaf-g-${id})`} stroke="#555" strokeWidth="0.8" />
      <path d={`M${x},${y - s * 0.75} L${x},${y + s * 0.75}`}
        fill="none" stroke="#777" strokeWidth="0.5" opacity="0.5" />
      {[-0.4, -0.15, 0.1, 0.35].map((t, i) => (
        <path key={i}
          d={`M${x},${y + s * t} L${x + (i % 2 ? -1 : 1) * s * 0.28},${y + s * t - s * 0.12}`}
          fill="none" stroke="#888" strokeWidth="0.35" opacity="0.35" />
      ))}
      <defs>
        <radialGradient id={`leaf-g-${id}`} cx="38%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.22" />
        </radialGradient>
      </defs>
    </g>
  );
}

function SmearShape({ x, y, size, color, id }: RProps) {
  const s = size * 2.5;
  return (
    <g>
      <path d={`M${x - s * 0.6},${y + s * 0.05} C${x - s * 0.35},${y - s * 0.18} ${x - s * 0.05},${y - s * 0.22} ${x + s * 0.25},${y - s * 0.15} C${x + s * 0.5},${y - s * 0.08} ${x + s * 0.55},${y + s * 0.02} ${x + s * 0.6},${y + s * 0.08} C${x + s * 0.5},${y + s * 0.18} ${x + s * 0.15},${y + s * 0.22} ${x - s * 0.15},${y + s * 0.2} C${x - s * 0.4},${y + s * 0.18} ${x - s * 0.55},${y + s * 0.12} ${x - s * 0.6},${y + s * 0.05} Z`}
        fill={`url(#smear-g-${id})`} stroke="#888" strokeWidth="0.5" opacity="0.7" />
      <path d={`M${x - s * 0.35},${y - s * 0.04} C${x},${y - s * 0.12} ${x + s * 0.2},${y - s * 0.06} ${x + s * 0.45},${y + s * 0.02}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
      <defs>
        <radialGradient id={`smear-g-${id}`} cx="35%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="50%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </radialGradient>
      </defs>
    </g>
  );
}

function CrumbShape({ x, y, size, color }: RProps) {
  const spread = size * 2;
  const dots: Array<{ dx: number; dy: number; r: number; op: number }> = [];
  for (let i = 0; i < 16; i++) {
    dots.push({
      dx: (Math.sin(i * 7.3 + 1.2) * 0.5) * spread,
      dy: (Math.cos(i * 4.1 + 2.7) * 0.5) * spread * 0.5,
      r: 1.2 + Math.sin(i * 3.7) * 0.8,
      op: 0.15 + Math.cos(i * 2.3) * 0.1,
    });
  }
  return (
    <g>
      {dots.map((d, i) => (
        <g key={i}>
          <ellipse cx={x + d.dx + 0.5} cy={y + d.dy + 0.5} rx={d.r + 0.3} ry={d.r * 0.5} fill="#000" opacity="0.04" />
          <circle cx={x + d.dx} cy={y + d.dy} r={d.r} fill={color} opacity={d.op} stroke="#888" strokeWidth="0.3" />
        </g>
      ))}
    </g>
  );
}

function DotsShape({ x, y, size, color, id }: RProps) {
  const count = 4;
  const spacing = size * 1.4;
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const dx = x + (i - (count - 1) / 2) * spacing;
        const r = size * 0.5 + Math.sin(i * 2.1) * size * 0.08;
        return (
          <g key={i}>
            <ellipse cx={dx + 1} cy={y + r * 0.7} rx={r * 0.85} ry={r * 0.3} fill="#000" opacity="0.06" />
            <circle cx={dx} cy={y} r={r} fill={`url(#dot-g-${id}-${i})`} stroke="#666" strokeWidth="0.7" />
            <ellipse cx={dx - r * 0.2} cy={y - r * 0.2} rx={r * 0.3} ry={r * 0.2} fill="#fff" opacity="0.5" />
            <defs>
              <radialGradient id={`dot-g-${id}-${i}`} cx="38%" cy="32%" r="55%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="50%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </radialGradient>
            </defs>
          </g>
        );
      })}
    </g>
  );
}

/* ═══════════════════════════════════════════
   FOOD-SPECIFIC 3D RENDERERS
   ═══════════════════════════════════════════ */

function FishFillet({ x, y, size, color, id }: RProps) {
  const w = size * 3.2, h = size * 1.6;
  const baseY = y + h * 0.1;
  return (
    <g>
      <ellipse cx={x + 3} cy={baseY + h * 0.35} rx={w * 0.48} ry={h * 0.14} fill="#000" opacity="0.07" />
      {/* Main fillet body — tapered left to right */}
      <path d={`M${x - w * 0.48},${baseY + h * 0.08}
        C${x - w * 0.45},${baseY - h * 0.35} ${x - w * 0.15},${baseY - h * 0.48} ${x + w * 0.1},${baseY - h * 0.45}
        C${x + w * 0.35},${baseY - h * 0.4} ${x + w * 0.48},${baseY - h * 0.2} ${x + w * 0.5},${baseY + h * 0.05}
        C${x + w * 0.48},${baseY + h * 0.25} ${x + w * 0.3},${baseY + h * 0.32} ${x + w * 0.05},${baseY + h * 0.3}
        C${x - w * 0.2},${baseY + h * 0.28} ${x - w * 0.45},${baseY + h * 0.2} ${x - w * 0.48},${baseY + h * 0.08} Z`}
        fill={`url(#fish-g-${id})`} stroke="#555" strokeWidth="1.2" />
      {/* Skin scoring lines */}
      {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => {
        const lx = x - w * 0.35 + t * w * 0.7;
        return (
          <line key={i} x1={lx} y1={baseY - h * 0.32 + t * h * 0.08}
            x2={lx + w * 0.04} y2={baseY + h * 0.2 - t * h * 0.05}
            stroke="#999" strokeWidth="0.5" opacity={0.25 + t * 0.1} strokeDasharray="3,3" />
        );
      })}
      {/* Sear crust band along top edge */}
      <path d={`M${x - w * 0.4},${baseY - h * 0.25}
        C${x - w * 0.15},${baseY - h * 0.42} ${x + w * 0.2},${baseY - h * 0.4} ${x + w * 0.45},${baseY - h * 0.15}`}
        fill="none" stroke="#b8956a" strokeWidth="2.5" opacity="0.2" strokeLinecap="round" />
      {/* Centre line — spine */}
      <path d={`M${x - w * 0.38},${baseY - h * 0.05}
        C${x - w * 0.1},${baseY - h * 0.12} ${x + w * 0.15},${baseY - h * 0.1} ${x + w * 0.42},${baseY + h * 0.02}`}
        fill="none" stroke="#aaa" strokeWidth="0.5" opacity="0.3" strokeDasharray="6,4" />
      {/* Highlight */}
      <path d={`M${x - w * 0.2},${baseY - h * 0.35}
        C${x},${baseY - h * 0.42} ${x + w * 0.2},${baseY - h * 0.35} ${x + w * 0.35},${baseY - h * 0.2}`}
        fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
      {/* Left-side pencil hatching */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`h-${i}`} x1={x - w * 0.42 + i * 3} y1={baseY - h * 0.15 + i * 3}
          x2={x - w * 0.38 + i * 3} y2={baseY + h * 0.18 + i * 2}
          stroke="#888" strokeWidth="0.3" opacity="0.12" />
      ))}
      <defs>
        <radialGradient id={`fish-g-${id}`} cx="38%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="40%" stopColor={color} stopOpacity="0.2" />
          <stop offset="75%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#888" stopOpacity="0.1" />
        </radialGradient>
      </defs>
    </g>
  );
}

function SearScallop({ x, y, size, color, id }: RProps) {
  const r = size * 1.1;
  const baseY = y + r * 0.08;
  return (
    <g>
      <ellipse cx={x + 2} cy={baseY + r * 0.55} rx={r * 0.9} ry={r * 0.22} fill="#000" opacity="0.07" />
      {/* Scallop cylinder — side visible */}
      <path d={`M${x - r},${baseY + r * 0.15}
        L${x - r},${baseY - r * 0.15}
        A${r},${r * 0.3} 0 0,1 ${x + r},${baseY - r * 0.15}
        L${x + r},${baseY + r * 0.15}
        A${r},${r * 0.3} 0 0,1 ${x - r},${baseY + r * 0.15} Z`}
        fill={`url(#scal-side-${id})`} stroke="#666" strokeWidth="0.8" />
      {/* Top seared face — golden ellipse */}
      <ellipse cx={x} cy={baseY - r * 0.15} rx={r} ry={r * 0.3}
        fill={`url(#scal-top-${id})`} stroke="#555" strokeWidth="1.1" />
      {/* Sear crust marks — golden brown arcs */}
      {[-0.4, -0.15, 0.1, 0.35].map((t, i) => (
        <path key={i}
          d={`M${x - r * 0.7 + i * r * 0.15},${baseY - r * 0.2 + t * r * 0.15}
            Q${x + t * r * 0.3},${baseY - r * 0.25 + t * r * 0.1} ${x + r * 0.7 - i * r * 0.1},${baseY - r * 0.18 + t * r * 0.12}`}
          fill="none" stroke="#b8860b" strokeWidth="1.2" opacity={0.15 + i * 0.05} strokeLinecap="round" />
      ))}
      {/* Highlight on seared top */}
      <ellipse cx={x - r * 0.2} cy={baseY - r * 0.22} rx={r * 0.35} ry={r * 0.12}
        fill="#fff" opacity="0.35" />
      <ellipse cx={x - r * 0.15} cy={baseY - r * 0.2} rx={r * 0.15} ry={r * 0.06}
        fill="#fff" opacity="0.5" />
      {/* Side texture lines */}
      {[0, 1, 2].map(i => (
        <line key={`st-${i}`} x1={x - r * 0.6 + i * r * 0.5} y1={baseY - r * 0.05}
          x2={x - r * 0.55 + i * r * 0.5} y2={baseY + r * 0.12}
          stroke="#999" strokeWidth="0.3" opacity="0.15" />
      ))}
      <defs>
        <radialGradient id={`scal-top-${id}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#d4a860" stopOpacity="0.25" />
          <stop offset="70%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor="#a08050" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id={`scal-side-${id}`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

function SlicedProtein({ x, y, size, color, id }: RProps) {
  const w = size * 2.5, h = size * 1.8;
  const slices = 5;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.35} rx={w * 0.45} ry={h * 0.12} fill="#000" opacity="0.06" />
      {Array.from({ length: slices }).map((_, i) => {
        const sx = x - w * 0.3 + i * w * 0.15;
        const sy = y - h * 0.1 + i * h * 0.05;
        const sw = w * 0.28, sh = h * 0.55;
        const lean = i * 2;
        return (
          <g key={i}>
            <path d={`M${sx + lean},${sy - sh * 0.5}
              C${sx + sw * 0.3 + lean},${sy - sh * 0.55} ${sx + sw * 0.7 + lean},${sy - sh * 0.4} ${sx + sw + lean},${sy - sh * 0.15}
              C${sx + sw + lean * 0.5},${sy + sh * 0.2} ${sx + sw * 0.7},${sy + sh * 0.45} ${sx + sw * 0.4},${sy + sh * 0.5}
              C${sx + sw * 0.1},${sy + sh * 0.45} ${sx - sw * 0.05},${sy + sh * 0.15} ${sx + lean},${sy - sh * 0.5} Z`}
              fill={`url(#slice-g-${id}-${i})`} stroke="#666" strokeWidth={i === slices - 1 ? 1.1 : 0.6} opacity={0.6 + i * 0.08} />
            {/* Skin scoring on top edge */}
            {i >= slices - 2 && (
              <path d={`M${sx + sw * 0.15 + lean},${sy - sh * 0.4}
                L${sx + sw * 0.2 + lean},${sy - sh * 0.1}`}
                fill="none" stroke="#999" strokeWidth="0.4" opacity="0.3" />
            )}
            <defs>
              <linearGradient id={`slice-g-${id}-${i}`} x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.5 - i * 0.05} />
                <stop offset="50%" stopColor={color} stopOpacity={0.15 + i * 0.03} />
                <stop offset="100%" stopColor="#888" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </g>
        );
      })}
      {/* Top highlight on front slice */}
      <path d={`M${x + w * 0.1},${y - h * 0.3}
        C${x + w * 0.2},${y - h * 0.38} ${x + w * 0.35},${y - h * 0.3} ${x + w * 0.4},${y - h * 0.15}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
    </g>
  );
}

function LobsterTail({ x, y, size, color, id }: RProps) {
  const w = size * 2.5, h = size * 2;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.3} rx={w * 0.4} ry={h * 0.1} fill="#000" opacity="0.06" />
      {/* Fan segments — 5 shell plates spreading outward */}
      {[0, 1, 2, 3, 4].map(i => {
        const angle = -0.5 + i * 0.25;
        const segW = w * (0.18 + i * 0.04);
        const segH = h * (0.3 + i * 0.08);
        const cx = x + Math.sin(angle) * w * 0.12;
        const cy = y - i * h * 0.06;
        return (
          <path key={i}
            d={`M${cx},${cy + segH * 0.4}
              C${cx - segW * 0.4},${cy + segH * 0.1} ${cx - segW * 0.45},${cy - segH * 0.3} ${cx},${cy - segH * 0.45}
              C${cx + segW * 0.45},${cy - segH * 0.3} ${cx + segW * 0.4},${cy + segH * 0.1} ${cx},${cy + segH * 0.4} Z`}
            fill={`url(#lob-seg-${id}-${i})`} stroke="#777" strokeWidth={0.6 + i * 0.1} opacity={0.5 + i * 0.1} />
        );
      })}
      {/* Shell ridges */}
      {[0.2, 0.4, 0.6].map((t, i) => (
        <path key={`r-${i}`}
          d={`M${x - w * 0.25},${y - h * t * 0.4} Q${x},${y - h * t * 0.5} ${x + w * 0.25},${y - h * t * 0.38}`}
          fill="none" stroke="#999" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.3" />
      ))}
      {/* Meat highlight */}
      <path d={`M${x - w * 0.08},${y - h * 0.15} Q${x},${y - h * 0.25} ${x + w * 0.1},${y - h * 0.12}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
      <defs>
        {[0, 1, 2, 3, 4].map(i => (
          <radialGradient key={i} id={`lob-seg-${id}-${i}`} cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.5 - i * 0.05} />
            <stop offset="50%" stopColor={color} stopOpacity={0.15 + i * 0.03} />
            <stop offset="100%" stopColor="#888" stopOpacity="0.1" />
          </radialGradient>
        ))}
      </defs>
    </g>
  );
}

function Steak({ x, y, size, color, id }: RProps) {
  const w = size * 2.6, h = size * 2;
  const baseY = y + h * 0.1;
  return (
    <g>
      <ellipse cx={x + 3} cy={baseY + h * 0.3} rx={w * 0.45} ry={h * 0.12} fill="#000" opacity="0.07" />
      {/* Thick steak body — irregular rectangle with rounded corners */}
      <path d={`M${x - w * 0.4},${baseY + h * 0.15}
        L${x - w * 0.42},${baseY - h * 0.15}
        C${x - w * 0.4},${baseY - h * 0.35} ${x - w * 0.2},${baseY - h * 0.42} ${x},${baseY - h * 0.4}
        C${x + w * 0.2},${baseY - h * 0.38} ${x + w * 0.4},${baseY - h * 0.3} ${x + w * 0.42},${baseY - h * 0.1}
        L${x + w * 0.4},${baseY + h * 0.18}
        C${x + w * 0.35},${baseY + h * 0.28} ${x + w * 0.1},${baseY + h * 0.3} ${x - w * 0.1},${baseY + h * 0.28}
        C${x - w * 0.3},${baseY + h * 0.26} ${x - w * 0.38},${baseY + h * 0.22} ${x - w * 0.4},${baseY + h * 0.15} Z`}
        fill={`url(#stk-g-${id})`} stroke="#555" strokeWidth="1.3" />
      {/* Grill marks — diagonal crosshatch */}
      {[-0.25, -0.05, 0.15, 0.35].map((t, i) => (
        <g key={i}>
          <line x1={x - w * 0.3 + i * w * 0.08} y1={baseY - h * 0.35 + i * h * 0.05}
            x2={x + w * 0.2 + i * w * 0.08} y2={baseY + h * 0.1 + i * h * 0.05}
            stroke="#5a3020" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />
          <line x1={x + w * 0.3 - i * w * 0.08} y1={baseY - h * 0.35 + i * h * 0.05}
            x2={x - w * 0.2 - i * w * 0.08} y2={baseY + h * 0.1 + i * h * 0.05}
            stroke="#5a3020" strokeWidth="1" opacity="0.1" strokeLinecap="round" />
        </g>
      ))}
      {/* Fat cap along one edge */}
      <path d={`M${x - w * 0.38},${baseY - h * 0.1}
        C${x - w * 0.42},${baseY - h * 0.25} ${x - w * 0.35},${baseY - h * 0.35} ${x - w * 0.2},${baseY - h * 0.38}`}
        fill="none" stroke="#e8d8c0" strokeWidth="3" opacity="0.3" strokeLinecap="round" />
      {/* Highlight */}
      <path d={`M${x - w * 0.15},${baseY - h * 0.32}
        Q${x + w * 0.05},${baseY - h * 0.38} ${x + w * 0.25},${baseY - h * 0.28}`}
        fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.35" strokeLinecap="round" />
      {/* Side thickness indication */}
      <path d={`M${x + w * 0.42},${baseY - h * 0.1} L${x + w * 0.4},${baseY + h * 0.18}`}
        fill="none" stroke="#888" strokeWidth="0.8" opacity="0.25" />
      <defs>
        <radialGradient id={`stk-g-${id}`} cx="38%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="35%" stopColor={color} stopOpacity="0.22" />
          <stop offset="70%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor="#666" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

function Prawn({ x, y, size, color, id }: RProps) {
  const s = size * 1.8;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + s * 0.35} rx={s * 0.4} ry={s * 0.1} fill="#000" opacity="0.05" />
      {/* C-curved body */}
      <path d={`M${x + s * 0.4},${y - s * 0.3}
        C${x + s * 0.5},${y - s * 0.1} ${x + s * 0.45},${y + s * 0.15} ${x + s * 0.25},${y + s * 0.3}
        C${x + s * 0.1},${y + s * 0.38} ${x - s * 0.1},${y + s * 0.35} ${x - s * 0.25},${y + s * 0.25}
        C${x - s * 0.15},${y + s * 0.3} ${x + s * 0.05},${y + s * 0.28} ${x + s * 0.15},${y + s * 0.2}
        C${x + s * 0.35},${y + s * 0.08} ${x + s * 0.4},${y - s * 0.08} ${x + s * 0.3},${y - s * 0.25}
        Z`}
        fill={`url(#prw-g-${id})`} stroke="#666" strokeWidth="1" />
      {/* Segment lines */}
      {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => {
        const cx = x + s * 0.35 - t * s * 0.3;
        const cy = y - s * 0.2 + t * s * 0.45;
        return (
          <path key={i}
            d={`M${cx - s * 0.08},${cy - s * 0.05} Q${cx},${cy + s * 0.02} ${cx + s * 0.12},${cy - s * 0.03}`}
            fill="none" stroke="#999" strokeWidth="0.4" opacity="0.3" />
        );
      })}
      {/* Tail fan */}
      <path d={`M${x - s * 0.25},${y + s * 0.25}
        C${x - s * 0.4},${y + s * 0.15} ${x - s * 0.45},${y + s * 0.25} ${x - s * 0.35},${y + s * 0.35}
        C${x - s * 0.25},${y + s * 0.32} ${x - s * 0.2},${y + s * 0.28} ${x - s * 0.25},${y + s * 0.25} Z`}
        fill={`url(#prw-g-${id})`} stroke="#777" strokeWidth="0.6" />
      {/* Highlight */}
      <path d={`M${x + s * 0.32},${y - s * 0.2}
        C${x + s * 0.4},${y - s * 0.05} ${x + s * 0.38},${y + s * 0.08} ${x + s * 0.28},${y + s * 0.15}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      <defs>
        <radialGradient id={`prw-g-${id}`} cx="45%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor="#888" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

function RisottoBed({ x, y, size, color, id }: RProps) {
  const w = size * 3.5, h = size * 1.2;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.4} rx={w * 0.5} ry={h * 0.3} fill="#000" opacity="0.05" />
      {/* Wide oval bed — low dome */}
      <ellipse cx={x} cy={y} rx={w * 0.5} ry={h * 0.65}
        fill={`url(#ris-g-${id})`} stroke="#888" strokeWidth="0.8" />
      {/* Surface texture — small grain dots */}
      {Array.from({ length: 20 }).map((_, i) => {
        const dx = (Math.sin(i * 4.7 + 0.5) * 0.4) * w;
        const dy = (Math.cos(i * 3.1 + 1.2) * 0.35) * h;
        return (
          <circle key={i} cx={x + dx} cy={y + dy} r={1 + Math.sin(i * 2.3) * 0.5}
            fill={color} opacity={0.08 + Math.cos(i * 1.7) * 0.04} />
        );
      })}
      {/* Soft height contour */}
      <ellipse cx={x} cy={y - h * 0.15} rx={w * 0.35} ry={h * 0.35}
        fill="none" stroke="#bbb" strokeWidth="0.4" strokeDasharray="4,5" opacity="0.25" />
      {/* Highlight */}
      <ellipse cx={x - w * 0.1} cy={y - h * 0.25} rx={w * 0.2} ry={h * 0.18}
        fill="#fff" opacity="0.2" />
      <defs>
        <radialGradient id={`ris-g-${id}`} cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
      </defs>
    </g>
  );
}

function AsparagusBundle({ x, y, size, color, id }: RProps) {
  const len = size * 3, w = size * 0.3;
  const stalks = 4;
  return (
    <g>
      {Array.from({ length: stalks }).map((_, i) => {
        const ox = (i - (stalks - 1) / 2) * w * 1.8;
        const tipY = y - len * 0.45 + Math.abs(i - 1.5) * len * 0.04;
        return (
          <g key={i}>
            <ellipse cx={x + ox + 1} cy={y + len * 0.35} rx={w * 0.6} ry={w * 0.2} fill="#000" opacity="0.04" />
            {/* Stalk */}
            <line x1={x + ox} y1={tipY + len * 0.15} x2={x + ox} y2={y + len * 0.3}
              stroke={color} strokeWidth={w * 1.5} opacity="0.15" strokeLinecap="round" />
            <line x1={x + ox} y1={tipY + len * 0.15} x2={x + ox} y2={y + len * 0.3}
              stroke="#666" strokeWidth={w * 0.5} opacity="0.3" strokeLinecap="round" />
            {/* Tip — pointed bud */}
            <path d={`M${x + ox - w * 0.4},${tipY + len * 0.15}
              C${x + ox - w * 0.3},${tipY + len * 0.05} ${x + ox},${tipY} ${x + ox},${tipY - len * 0.02}
              C${x + ox},${tipY} ${x + ox + w * 0.3},${tipY + len * 0.05} ${x + ox + w * 0.4},${tipY + len * 0.15} Z`}
              fill={`url(#asp-g-${id})`} stroke="#555" strokeWidth="0.6" />
            {/* Scale marks on tip */}
            {[0.03, 0.06, 0.09].map((t, j) => (
              <path key={j}
                d={`M${x + ox - w * 0.25},${tipY + len * (0.08 + t)} Q${x + ox},${tipY + len * (0.06 + t)} ${x + ox + w * 0.25},${tipY + len * (0.08 + t)}`}
                fill="none" stroke="#888" strokeWidth="0.3" opacity="0.25" />
            ))}
          </g>
        );
      })}
      <defs>
        <radialGradient id={`asp-g-${id}`} cx="40%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </radialGradient>
      </defs>
    </g>
  );
}

function FoamDollop({ x, y, size, color, id }: RProps) {
  const s = size * 1.4;
  const bubbles = [
    { dx: 0, dy: 0, r: s * 0.6 },
    { dx: -s * 0.35, dy: s * 0.15, r: s * 0.4 },
    { dx: s * 0.3, dy: s * 0.2, r: s * 0.35 },
    { dx: s * 0.1, dy: -s * 0.3, r: s * 0.3 },
    { dx: -s * 0.2, dy: -s * 0.25, r: s * 0.25 },
    { dx: s * 0.35, dy: -s * 0.15, r: s * 0.2 },
    { dx: -s * 0.4, dy: -s * 0.1, r: s * 0.18 },
  ];
  return (
    <g>
      <ellipse cx={x + 1} cy={y + s * 0.45} rx={s * 0.7} ry={s * 0.15} fill="#000" opacity="0.04" />
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={x + b.dx} cy={y + b.dy} r={b.r}
            fill={`url(#foam-b-${id}-${i})`} stroke="#ccc" strokeWidth="0.3" opacity="0.7" />
          <ellipse cx={x + b.dx - b.r * 0.2} cy={y + b.dy - b.r * 0.2}
            rx={b.r * 0.25} ry={b.r * 0.18} fill="#fff" opacity="0.6" />
          <defs>
            <radialGradient id={`foam-b-${id}-${i}`} cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="60%" stopColor={color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={color} stopOpacity="0.03" />
            </radialGradient>
          </defs>
        </g>
      ))}
    </g>
  );
}

function MushroomCap({ x, y, size, color, id }: RProps) {
  const w = size * 2, h = size * 1.5;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.25} rx={w * 0.35} ry={h * 0.08} fill="#000" opacity="0.06" />
      {/* Stem hint */}
      <rect x={x - w * 0.08} y={y + h * 0.05} width={w * 0.16} height={h * 0.2} rx={2}
        fill="#f0ead8" opacity="0.15" stroke="#aaa" strokeWidth="0.4" />
      {/* Cap — domed from above */}
      <path d={`M${x - w * 0.45},${y + h * 0.08}
        C${x - w * 0.48},${y - h * 0.25} ${x - w * 0.2},${y - h * 0.5} ${x},${y - h * 0.52}
        C${x + w * 0.2},${y - h * 0.5} ${x + w * 0.48},${y - h * 0.25} ${x + w * 0.45},${y + h * 0.08}
        C${x + w * 0.35},${y + h * 0.15} ${x + w * 0.15},${y + h * 0.18} ${x},${y + h * 0.17}
        C${x - w * 0.15},${y + h * 0.18} ${x - w * 0.35},${y + h * 0.15} ${x - w * 0.45},${y + h * 0.08} Z`}
        fill={`url(#mush-g-${id})`} stroke="#666" strokeWidth="1" />
      {/* Radial gill lines */}
      {[-0.35, -0.2, -0.05, 0.1, 0.25].map((t, i) => (
        <path key={i}
          d={`M${x + w * t},${y + h * 0.1} L${x + w * t * 0.3},${y - h * 0.1}`}
          fill="none" stroke="#999" strokeWidth="0.3" opacity="0.2" />
      ))}
      {/* Highlight */}
      <path d={`M${x - w * 0.15},${y - h * 0.4}
        Q${x},${y - h * 0.5} ${x + w * 0.18},${y - h * 0.35}`}
        fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
      <defs>
        <radialGradient id={`mush-g-${id}`} cx="38%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="40%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor="#888" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </g>
  );
}

/* ─── RENDERERS MAP ─── */
const RENDERERS: Record<string, React.FC<RProps>> = {
  dome: Dome,
  'fish fillet': FishFillet,
  'seared scallop': SearScallop,
  'sliced protein': SlicedProtein,
  steak: Steak,
  'lobster tail': LobsterTail,
  prawn: Prawn,
  mushroom: MushroomCap,
  berries: Berries,
  sauce: SauceShape,
  quenelle: Quenelle,
  'risotto bed': RisottoBed,
  asparagus: AsparagusBundle,
  foam: FoamDollop,
  'pulled sugar': PulledSugar,
  'chocolate shard': ChocolateShard,
  cookie: CookieShape,
  glaze: GlazeShape,
  'leaf garnish': LeafGarnish,
  smear: SmearShape,
  crumb: CrumbShape,
  dots: DotsShape,
};
const SHAPES = Object.keys(RENDERERS);

/* ─── TYPE DETECTION ─── */
const KW: Record<string, string> = {
  // Specific proteins — match before generic
  branzino: 'fish fillet', cod: 'fish fillet', snapper: 'fish fillet', salmon: 'fish fillet',
  barramundi: 'fish fillet', halibut: 'fish fillet', seabass: 'fish fillet', 'sea bass': 'fish fillet',
  trout: 'fish fillet', sole: 'fish fillet', turbot: 'fish fillet', grouper: 'fish fillet',
  bream: 'fish fillet', 'john dory': 'fish fillet', monkfish: 'fish fillet', fillet: 'fish fillet',
  hamachi: 'fish fillet', kingfish: 'fish fillet', tuna: 'fish fillet', swordfish: 'fish fillet',
  fish: 'fish fillet',
  scallop: 'seared scallop',
  duck: 'sliced protein', 'pork belly': 'sliced protein', terrine: 'sliced protein',
  beef: 'steak', wagyu: 'steak', ribeye: 'steak', sirloin: 'steak', tenderloin: 'steak',
  'strip loin': 'steak', tomahawk: 'steak', 'rib eye': 'steak',
  lobster: 'lobster tail', crayfish: 'lobster tail',
  prawn: 'prawn', shrimp: 'prawn', langoustine: 'prawn', 'king prawn': 'prawn', crab: 'prawn',
  lamb: 'sliced protein', rack: 'sliced protein',
  chicken: 'dome', pork: 'dome',
  mushroom: 'mushroom', truffle: 'mushroom', shiitake: 'mushroom', porcini: 'mushroom',
  morel: 'mushroom', chanterelle: 'mushroom', enoki: 'mushroom',
  // Bases & starches
  risotto: 'risotto bed', rice: 'risotto bed', polenta: 'risotto bed', potato: 'smear',
  mash: 'smear', 'pomme': 'smear',
  asparagus: 'asparagus', broccolini: 'asparagus', leek: 'asparagus',
  // Sauces & liquids
  sauce: 'sauce', jus: 'sauce', reduction: 'sauce', emulsion: 'sauce', coulis: 'sauce',
  foam: 'foam', espuma: 'foam', air: 'foam',
  puree: 'quenelle', mousse: 'quenelle', cream: 'quenelle',
  sorbet: 'quenelle', 'ice cream': 'quenelle', ice: 'quenelle', gelato: 'quenelle',
  // Fruits & berries
  berry: 'berries', currant: 'berries', strawberry: 'berries', raspberry: 'berries', blackberry: 'berries',
  blueberry: 'berries', cherry: 'berries', grape: 'berries', olive: 'berries',
  // Garnishes & decorations
  crisp: 'chocolate shard', tuile: 'chocolate shard', shard: 'chocolate shard', chip: 'chocolate shard',
  wafer: 'chocolate shard',
  leaf: 'leaf garnish', herb: 'leaf garnish', micro: 'leaf garnish', flower: 'leaf garnish',
  cress: 'leaf garnish',
  crumble: 'crumb', crumb: 'crumb', soil: 'crumb', dust: 'crumb', powder: 'crumb',
  cookie: 'cookie', biscuit: 'cookie', shortbread: 'cookie', gable: 'cookie',
  glaze: 'glaze', gel: 'glaze', mirror: 'glaze',
  sugar: 'pulled sugar', caramel: 'pulled sugar', spun: 'pulled sugar', pulled: 'pulled sugar',
  // Pastry & desserts
  fondant: 'dome', dome: 'dome', tart: 'dome', sphere: 'dome',
  paste: 'dome', meringue: 'dome', pavlova: 'dome',
  // Misc
  dot: 'dots', pearls: 'dots',
  carrot: 'quenelle', pea: 'quenelle',
};

const COLOR_MAP: Record<string, string> = {
  sauce: '#7b2d3b', jus: '#8b4049', reduction: '#6b2030', coulis: '#c0394a', emulsion: '#d4a030',
  berry: '#c0392b', currant: '#c0392b', strawberry: '#e87a7a', raspberry: '#c0394a', blackberry: '#4a2040',
  chocolate: '#3d2215', cocoa: '#5c3d2e', cream: '#f0ead2', puree: '#e8dcc8', foam: '#f0ebe0',
  sorbet: '#e87a7a', gelato: '#e8dcc8', leaf: '#4a7a35', herb: '#4a7a35', micro: '#7db36a',
  flower: '#d4828a', sugar: '#f5deb3', caramel: '#c9a96e', gold: '#d4a017', cookie: '#c9a96e',
  glaze: '#b53030', gel: '#b53030', crumb: '#a08060', soil: '#5c3d2e', almond: '#d4c5a9',
  pistachio: '#7a9a50', vanilla: '#f0e6d0', mango: '#d4b060', lemon: '#e0d480',
  scallop: '#f0e0c0', fish: '#e8ddd0', lobster: '#d4806a', duck: '#b88070', beef: '#8b4049',
  lamb: '#a07060', pork: '#d4a089', chicken: '#d4b878', mushroom: '#8b7355', potato: '#e8dcc8',
  carrot: '#d4884a', white: '#f0e6d0', nori: '#2d5016', lime: '#a8d84e', olive: '#6b7a35',
  branzino: '#e0d5c5', cod: '#e8ddd0', salmon: '#d4907a', snapper: '#d4907a',
  barramundi: '#e0d5c8', halibut: '#e8e0d0', trout: '#d4988a', tuna: '#c08080',
  prawn: '#e0a088', shrimp: '#e0a088', langoustine: '#d4906a', crab: '#d4906a',
  wagyu: '#7a3040', tenderloin: '#8b4049', risotto: '#e8dcc8', polenta: '#e0d8a8',
  asparagus: '#5a8a40', truffle: '#3d3025', chanterelle: '#d4a040',
  foam: '#f5f0e8', espuma: '#f5f0e8',
};

const SIZE_MAP: Record<string, number> = {
  dome: 55, 'fish fillet': 42, 'seared scallop': 35, 'sliced protein': 40,
  steak: 45, 'lobster tail': 35, prawn: 28, mushroom: 30,
  berries: 28, sauce: 48, quenelle: 28, 'risotto bed': 38,
  asparagus: 20, foam: 22,
  'pulled sugar': 35, 'chocolate shard': 24, cookie: 24,
  glaze: 32, 'leaf garnish': 16, smear: 30, crumb: 18, dots: 14,
};

function detectShape(name: string): string {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(KW)) { if (n.includes(k)) return v; }
  return 'dome';
}

function detectColor(name: string): string {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(COLOR_MAP)) { if (n.includes(k)) return v; }
  return '#c0b090';
}

/* ─── LABEL SLOTS ─── */
const LABEL_SLOTS = [
  { x: 45, y: 75, a: 'start' as const },
  { x: 780, y: 75, a: 'end' as const },
  { x: 790, y: 195, a: 'end' as const },
  { x: 795, y: 320, a: 'end' as const },
  { x: 775, y: 445, a: 'end' as const },
  { x: 45, y: 445, a: 'start' as const },
  { x: 25, y: 320, a: 'start' as const },
  { x: 25, y: 195, a: 'start' as const },
  { x: 420, y: 660, a: 'middle' as const },
  { x: 420, y: 45, a: 'middle' as const },
  { x: 150, y: 640, a: 'start' as const },
  { x: 690, y: 640, a: 'end' as const },
  { x: 45, y: 570, a: 'start' as const },
  { x: 780, y: 570, a: 'end' as const },
  { x: 790, y: 140, a: 'end' as const },
  { x: 25, y: 140, a: 'start' as const },
];

/* ─── LEADER LINE ─── */
function Arrow({ fx, fy, tx, ty }: { fx: number; fy: number; tx: number; ty: number }) {
  const mx = fx + (tx - fx) * 0.35 + (ty - fy) * 0.08;
  const my = fy + (ty - fy) * 0.5 - (tx - fx) * 0.05;
  const angle = Math.atan2(ty - my, tx - mx);
  const al = 8;
  return (
    <g>
      <path d={`M${fx},${fy} Q${mx},${my} ${tx},${ty}`}
        fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55" />
      <path d={`M${tx - al * Math.cos(angle - 0.35)},${ty - al * Math.sin(angle - 0.35)} L${tx},${ty} L${tx - al * Math.cos(angle + 0.35)},${ty - al * Math.sin(angle + 0.35)}`}
        fill="none" stroke="#444" strokeWidth="0.65" opacity="0.55" />
    </g>
  );
}

/* ─── DRAG WRAPPER ─── */
function Drag({ comp, children, sel, onSel, onDrag }: {
  comp: CompState; children: React.ReactNode; sel: boolean;
  onSel: (id: number) => void; onDrag: (id: number, x: number, y: number) => void;
}) {
  const [d, setD] = useState(false);
  const off = useRef({ x: 0, y: 0 });
  const down = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSel(comp.id);
    setD(true);
    const svg = (e.currentTarget as SVGElement).closest('svg')!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    off.current = { x: sp.x - comp.x, y: sp.y - comp.y };
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!d) return;
    const svg = (e.currentTarget as SVGElement).closest('svg')!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    onDrag(comp.id, sp.x - off.current.x, sp.y - off.current.y);
  };
  return (
    <g onPointerDown={down} onPointerMove={move} onPointerUp={() => setD(false)} style={{ cursor: 'grab' }}>
      {children}
      {sel && (
        <circle cx={comp.x} cy={comp.y} r={comp.size * 2 + 15}
          fill="none" stroke="#b8860b" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />
      )}
    </g>
  );
}

/* ═══════════════════════════════════════════
   MAIN EMBEDDED COMPONENT
   ═══════════════════════════════════════════ */

export default function EmbeddedPlatingStudio({ components, title, venueName, venueAccent }: {
  components: { name: string }[];
  title: string;
  venueName: string;
  venueAccent: string;
}) {
  const initialComps = useMemo((): CompState[] => {
    const safe = (components || []).filter(c => c && c.name);
    if (!safe.length) return [];
    return safe.map((c, i) => {
      const shape = detectShape(c.name);
      const color = detectColor(c.name);
      const size = SIZE_MAP[shape] || 35;
      const angle = -Math.PI * 0.55 + (i / Math.max(safe.length - 1, 1)) * Math.PI * 1.6;
      const dist = PR * (0.25 + (i % 3) * 0.2);
      const isMain = i === 0;
      return {
        id: i + 1,
        name: c.name,
        shape,
        x: isMain ? PX : PX + Math.cos(angle) * dist * 0.85,
        y: isMain ? PY : PY + Math.sin(angle) * dist * 0.6,
        size: isMain ? Math.round(size * 1.15) : size,
        color,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [comps, setComps] = useState<CompState[]>(initialComps);
  const [sel, setSel] = useState<number | null>(null);
  const [edit, setEdit] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [panel, setPanel] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const nid = useRef(200);

  const accent = venueAccent || '#8B8578';
  const font = "'Crimson Pro', Georgia, serif";
  const titleFont = "'Playfair Display', serif";
  const dark = '#2c2418';
  const muted = '#8a7e6b';

  const drag = useCallback((id: number, x: number, y: number) => {
    setComps(p => p.map(c => c.id === id ? { ...c, x, y } : c));
  }, []);

  const add = (shape = 'dome') => {
    const id = nid.current++;
    setComps(p => [...p, {
      id,
      name: 'New Component',
      shape,
      x: PX + Math.sin(id * 1.7) * 80,
      y: PY + Math.cos(id * 1.3) * 60,
      size: SIZE_MAP[shape] || 35,
      color: '#c0b090',
    }]);
    setSel(id);
    setEdit(id);
    setPanel(true);
  };

  const rm = (id: number) => {
    setComps(p => p.filter(c => c.id !== id));
    if (sel === id) { setSel(null); setEdit(null); }
  };

  const dup = (id: number) => {
    const src = comps.find(c => c.id === id);
    if (!src) return;
    const newId = nid.current++;
    setComps(p => [...p, { ...src, id: newId, x: src.x + 25, y: src.y + 15, name: src.name + ' (copy)' }]);
    setSel(newId);
    setEdit(newId);
  };

  const upd = (id: number, u: Partial<CompState>) => {
    setComps(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  };

  const reorder = (id: number, dir: 'up' | 'down') => {
    setComps(p => {
      const idx = p.findIndex(c => c.id === id);
      if (idx < 0) return p;
      const newIdx = dir === 'up' ? Math.max(0, idx - 1) : Math.min(p.length - 1, idx + 1);
      const arr = [...p];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const exportSVG = () => {
    if (!svgRef.current) return;
    const d = new XMLSerializer().serializeToString(svgRef.current);
    const u = URL.createObjectURL(new Blob([d], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = u;
    a.download = `${(title || 'plating').replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const exportPNG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = 2520;
    canvas.height = 2160;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx!.fillStyle = '#fdfcf8';
      ctx!.fillRect(0, 0, 2520, 2160);
      ctx!.drawImage(img, 0, 0, 2520, 2160);
      const a = document.createElement('a');
      a.download = `${(title || 'plating').replace(/\s+/g, '_')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!comps.length) return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', fontSize: '10px', fontWeight: 600,
    borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s',
    border: `1px solid ${active ? accent : '#d4cfc4'}`,
    background: active ? `${accent}15` : 'transparent',
    color: active ? accent : '#6b5e4a', fontFamily: font,
  });

  return (
    <div style={{ borderRadius: '8px', border: '1px solid #e5e0d6', overflow: 'hidden', background: '#f9f7f2' }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(250,248,244,0.8)', borderBottom: '1px solid #e8e4dc', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, fontFamily: font }}>Plating Studio</span>
          <span style={{ fontSize: '9px', color: '#aaa', fontStyle: 'italic', fontFamily: font }}>3D Sketch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => setShowLabels(!showLabels)} style={btnStyle(showLabels)}>
            {showLabels ? 'Labels On' : 'Labels Off'}
          </button>
          <button onClick={() => setPanel(!panel)} style={btnStyle(panel)}>
            Edit
          </button>
          <button onClick={exportSVG} style={{ ...btnStyle(false), background: `${accent}15`, color: accent, border: `1px solid ${accent}40`, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            SVG
          </button>
          <button onClick={exportPNG} style={{ ...btnStyle(false), background: `${accent}15`, color: accent, border: `1px solid ${accent}40`, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            PNG
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex' }}>
        {/* SVG Canvas */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <svg ref={svgRef} viewBox="0 0 840 720"
            style={{ width: '100%', display: 'block', background: '#fdfcf8' }}
            onClick={() => { setSel(null); setEdit(null); }}>
            <defs>
              <radialGradient id="pShine" cx="36%" cy="30%" r="58%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Title */}
            <text x={PX} y="30" textAnchor="middle"
              style={{ fontSize: 16, fontStyle: 'italic', fill: '#222', fontFamily: titleFont, fontWeight: 700 }}>
              {title}
            </text>
            <text x={PX} y="48" textAnchor="middle"
              style={{ fontSize: 10, fill: '#888', fontFamily: font, fontStyle: 'italic' }}>
              {venueName}
            </text>

            {/* Plate */}
            <ellipse cx={PX + 6} cy={PY + 10} rx={PR + 18} ry={PR + 18} fill="#c0b8a8" opacity="0.1" />
            <ellipse cx={PX} cy={PY} rx={PR + 12} ry={PR + 12} fill="none" stroke="#b0a898" strokeWidth="0.5" />
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="#fefefe" stroke="#807868" strokeWidth="1.5" />
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="url(#pShine)" />
            <ellipse cx={PX} cy={PY} rx={PR - 38} ry={PR - 38} fill="none" stroke="#ccc5b5" strokeWidth="0.3" strokeDasharray="1.5,6" opacity="0.35" />
            <path d={`M${PX - PR * 0.65},${PY - PR * 0.72} A${PR},${PR} 0 0,1 ${PX + PR * 0.72},${PY - PR * 0.6}`}
              fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />

            {/* Components */}
            {comps.map(c => {
              const R = RENDERERS[c.shape] || Dome;
              return (
                <Drag key={c.id} comp={c} sel={sel === c.id}
                  onSel={id => { setSel(id); setEdit(id); if (!panel) setPanel(true); }}
                  onDrag={drag}>
                  <R x={c.x} y={c.y} size={c.size} color={c.color} id={`e-${c.id}`} />
                </Drag>
              );
            })}

            {/* Labels */}
            {showLabels && comps.map((c, i) => {
              const lp = LABEL_SLOTS[i % LABEL_SLOTS.length];
              const ax = lp.a === 'start' ? lp.x + c.name.length * 3 : lp.a === 'end' ? lp.x - c.name.length * 3 : lp.x;
              return (
                <g key={`l-${c.id}`} opacity={sel === c.id ? 1 : 0.85}>
                  <Arrow fx={ax} fy={lp.y + 4} tx={c.x} ty={c.y} />
                  <text x={lp.x} y={lp.y} textAnchor={lp.a}
                    style={{
                      fontFamily: font, fontSize: '13px', fontStyle: 'italic',
                      fill: sel === c.id ? '#111' : '#3a3020',
                      fontWeight: sel === c.id ? 600 : 400, cursor: 'pointer',
                    }}
                    onClick={(e) => { e.stopPropagation(); setSel(c.id); setEdit(c.id); setPanel(true); }}>
                    {c.name}
                  </text>
                </g>
              );
            })}

            {/* Bottom title */}
            <text x={PX} y={700} textAnchor="middle"
              style={{ fontFamily: titleFont, fontSize: '13px', fontWeight: 700, fill: dark, letterSpacing: '0.1em' }}>
              {(title || '').toUpperCase()}
            </text>
            <line x1={PX - 75} y1={708} x2={PX + 75} y2={708} stroke={accent} strokeWidth="0.5" opacity="0.35" />
          </svg>
        </div>

        {/* Edit Panel */}
        {panel && (
          <div style={{ width: '260px', borderLeft: '1px solid #e0dcd4', background: '#f5f2eb', overflowY: 'auto', maxHeight: '620px', padding: '12px', fontSize: '11px', fontFamily: font }}>
            <div style={{ fontFamily: titleFont, fontSize: '14px', fontWeight: 700, color: dark, marginBottom: '10px' }}>
              Components
              <span style={{ fontSize: '10px', fontWeight: 400, color: muted, marginLeft: '6px' }}>{comps.length}</span>
            </div>

            <button onClick={() => add('dome')} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '6px', fontSize: '10px', fontWeight: 600, fontFamily: font,
              borderRadius: '3px', border: `1px solid ${accent}`, color: accent,
              background: `${accent}10`, cursor: 'pointer', marginBottom: '10px',
            }}>+ Add Component</button>

            {comps.length === 0 && (
              <p style={{ color: muted, fontStyle: 'italic', fontSize: '11px', lineHeight: 1.5 }}>
                Click "+ Add Component" to start building your plate. Drag shapes to position them.
              </p>
            )}

            {comps.map(c => (
              <div key={c.id} onClick={() => { setSel(c.id); setEdit(c.id); }} style={{
                padding: '8px 10px', marginBottom: '3px', borderRadius: '4px', cursor: 'pointer',
                border: sel === c.id ? `1.5px solid ${accent}` : '1px solid #e0dcd4',
                background: sel === c.id ? '#faf6ed' : '#fdfcf9',
                transition: 'all 0.12s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, border: '1px solid #ccc' }} />
                    <span style={{ fontWeight: 600, color: dark, fontSize: '11.5px' }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={e => { e.stopPropagation(); dup(c.id); }} title="Duplicate"
                      style={{ background: 'none', border: 'none', color: '#b5a996', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '2px' }}>&#x29C9;</button>
                    <button onClick={e => { e.stopPropagation(); reorder(c.id, 'up'); }} title="Move back"
                      style={{ background: 'none', border: 'none', color: '#b5a996', cursor: 'pointer', fontSize: '11px', lineHeight: 1, padding: '2px' }}>&#8593;</button>
                    <button onClick={e => { e.stopPropagation(); reorder(c.id, 'down'); }} title="Move forward"
                      style={{ background: 'none', border: 'none', color: '#b5a996', cursor: 'pointer', fontSize: '11px', lineHeight: 1, padding: '2px' }}>&#8595;</button>
                    <button onClick={e => { e.stopPropagation(); rm(c.id); }} title="Remove"
                      style={{ background: 'none', border: 'none', color: '#c98080', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '2px' }}>&times;</button>
                  </div>
                </div>

                {edit === c.id && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '7px' }} onClick={e => e.stopPropagation()}>
                    <input value={c.name} onChange={e => upd(c.id, { name: e.target.value })} style={{
                      padding: '4px 7px', fontSize: '11px', fontFamily: font, border: '1px solid #d4cfc4',
                      borderRadius: '3px', background: '#fff', color: dark, outline: 'none',
                    }} />

                    <div style={{ fontSize: '9px', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shape</div>
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                      {SHAPES.map(s => (
                        <button key={s} onClick={() => upd(c.id, { shape: s, size: SIZE_MAP[s] || c.size })} style={{
                          padding: '2px 6px', fontSize: '9px', fontFamily: font, borderRadius: '2px',
                          border: c.shape === s ? `1px solid ${accent}` : '1px solid #d4cfc4',
                          background: c.shape === s ? dark : 'transparent',
                          color: c.shape === s ? '#faf8f4' : '#6b5e4a', cursor: 'pointer', textTransform: 'capitalize',
                        }}>{s}</button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '9px', color: muted, minWidth: '28px', fontWeight: 600, textTransform: 'uppercase' }}>Size</label>
                      <input type="range" min="8" max="100" value={c.size}
                        onChange={e => upd(c.id, { size: parseInt(e.target.value) })}
                        style={{ flex: 1, accentColor: accent }} />
                      <span style={{ fontSize: '10px', color: '#6b5e4a', minWidth: '22px', textAlign: 'right' }}>{c.size}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '9px', color: muted, minWidth: '28px', fontWeight: 600, textTransform: 'uppercase' }}>Tint</label>
                      <input type="color" value={c.color}
                        onChange={e => upd(c.id, { color: e.target.value })}
                        style={{ width: '24px', height: '18px', border: '1px solid #d4cfc4', borderRadius: '2px', cursor: 'pointer', padding: 0 }} />
                      <span style={{ fontSize: '9px', color: muted }}>{c.color}</span>
                      <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                        {['#d4c5a9', '#c0392b', '#7b2d3b', '#e8dcc8', '#4a7a35', '#3d2215', '#f0e6d0'].map(col => (
                          <button key={col} onClick={() => upd(c.id, { color: col })}
                            style={{ width: 12, height: 12, borderRadius: '50%', background: col, border: c.color === col ? `2px solid ${accent}` : '1px solid #ccc', cursor: 'pointer', padding: 0 }} />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <label style={{ fontSize: '9px', color: muted, fontWeight: 600 }}>X</label>
                        <input type="range" min="100" max="700" value={Math.round(c.x)}
                          onChange={e => upd(c.id, { x: parseInt(e.target.value) })}
                          style={{ flex: 1, accentColor: accent }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <label style={{ fontSize: '9px', color: muted, fontWeight: 600 }}>Y</label>
                        <input type="range" min="100" max="620" value={Math.round(c.y)}
                          onChange={e => upd(c.id, { y: parseInt(e.target.value) })}
                          style={{ flex: 1, accentColor: accent }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Quick-add */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e0dcd4' }}>
              <div style={{ fontSize: '9px', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Quick Add</div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {SHAPES.map(s => (
                  <button key={s} onClick={() => add(s)} style={{
                    padding: '3px 8px', fontSize: '9px', fontFamily: font, borderRadius: '2px',
                    border: '1px solid #d4cfc4', background: 'transparent', color: '#6b5e4a',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}>+ {s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 12px', background: 'rgba(250,248,244,0.5)', borderTop: '1px solid #e8e4dc', textAlign: 'center' }}>
        <span style={{ fontSize: '9px', color: '#aaa', fontStyle: 'italic', fontFamily: font }}>
          Drag to reposition &middot; Click to edit &middot; Toggle Edit panel for full control
        </span>
      </div>
    </div>
  );
}
