'use client';

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";

const PX = 420, PY = 370, PR = 300;

/* ═══════════════════════════════════════════
   3D COMPONENT RENDERERS — LARGE & DETAILED
   ═══════════════════════════════════════════ */

function Dome({ x, y, size, color, id }) {
  const w = size * 2.8, h = size * 2.2;
  const baseY = y + h * 0.22;
  return (
    <g>
      {/* Ground shadow — big soft oval */}
      <ellipse cx={x + 4} cy={baseY + h * 0.15} rx={w * 0.6} ry={h * 0.22} fill="#000" opacity="0.08" />
      <ellipse cx={x + 2} cy={baseY + h * 0.1} rx={w * 0.55} ry={h * 0.18} fill="#000" opacity="0.04" />

      {/* Base platform ellipse — thick */}
      <ellipse cx={x} cy={baseY} rx={w * 0.56} ry={h * 0.16}
        fill={`url(#dome-base-${id})`} stroke="#555" strokeWidth="1.3" />
      {/* Base rim highlight */}
      <path d={`M${x - w * 0.48},${baseY - h * 0.02} A${w * 0.5},${h * 0.14} 0 0,1 ${x + w * 0.48},${baseY - h * 0.02}`}
        fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.3" />

      {/* Dome body — rich curved form */}
      <path d={`M${x - w * 0.52},${baseY}
        C${x - w * 0.53},${y - h * 0.4} ${x - w * 0.2},${y - h * 0.82} ${x},${y - h * 0.85}
        C${x + w * 0.2},${y - h * 0.82} ${x + w * 0.53},${y - h * 0.4} ${x + w * 0.52},${baseY}`}
        fill={`url(#dome-body-${id})`} stroke="#444" strokeWidth="1.4" />

      {/* Dense horizontal contour lines — gives that sketch feel */}
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

      {/* Cross-section dashed ellipse — the key reference sketch detail */}
      <ellipse cx={x} cy={baseY - h * 0.35} rx={w * 0.44} ry={h * 0.13}
        fill="none" stroke="#444" strokeWidth="1.1" strokeDasharray="7,5" opacity="0.6" />
      {/* Arrows on dashed line */}
      <path d={`M${x + w * 0.35},${baseY - h * 0.38} l5,-4 l-2,6`} fill="#444" opacity="0.5" />
      <path d={`M${x - w * 0.35},${baseY - h * 0.32} l-5,4 l2,-6`} fill="#444" opacity="0.5" />

      {/* Left shadow — pencil shading with cross-hatch */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const t = i * 0.11;
        const sx = x - w * 0.48 + t * w * 0.15;
        const sy1 = baseY - h * t * 0.7;
        const sy2 = baseY - h * 0.05;
        return (
          <line key={`sh-${i}`} x1={sx} y1={sy1} x2={sx + 3} y2={sy2}
            stroke="#777" strokeWidth="0.4" opacity={0.15 + (1 - t) * 0.15} />
        );
      })}

      {/* Right-side lighter hatching */}
      {[0, 1, 2, 3].map((i) => {
        const t = i * 0.15;
        const sx = x + w * 0.25 + t * w * 0.15;
        return (
          <line key={`rh-${i}`} x1={sx} y1={baseY - h * 0.5 + i * 8} x2={sx + 4} y2={baseY}
            stroke="#999" strokeWidth="0.3" opacity="0.1" />
        );
      })}

      {/* Big highlight — curved white stroke */}
      <path d={`M${x - w * 0.12},${y - h * 0.7}
        Q${x - w * 0.02},${y - h * 0.82} ${x + w * 0.12},${y - h * 0.65}`}
        fill="none" stroke="#fff" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      <path d={`M${x - w * 0.08},${y - h * 0.55}
        Q${x + w * 0.02},${y - h * 0.62} ${x + w * 0.08},${y - h * 0.5}`}
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

function Berries({ x, y, size, color, id }) {
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
            {/* Shadow */}
            <ellipse cx={bx + 1.5} cy={by + br * 0.85} rx={br * 0.9} ry={br * 0.35}
              fill="#000" opacity="0.07" />
            {/* Sphere body — rich gradient */}
            <circle cx={bx} cy={by} r={br}
              fill={`url(#berry-g-${id}-${i})`} stroke="#555" strokeWidth="0.9" />
            {/* Bottom shadow crescent */}
            <path d={`M${bx - br * 0.7},${by + br * 0.3}
              A${br * 0.9},${br * 0.9} 0 0,0 ${bx + br * 0.7},${by + br * 0.3}`}
              fill="#000" opacity="0.06" />
            {/* Cross-hatch shadow on left */}
            {[0, 1, 2].map(j => (
              <line key={j} x1={bx - br * 0.6 + j * 2} y1={by - br * 0.2 + j * 3}
                x2={bx - br * 0.3 + j * 2} y2={by + br * 0.5 + j * 2}
                stroke="#777" strokeWidth="0.3" opacity="0.15" />
            ))}
            {/* Big specular highlight */}
            <ellipse cx={bx - br * 0.2} cy={by - br * 0.25} rx={br * 0.3} ry={br * 0.22}
              fill="#fff" opacity="0.55" />
            <circle cx={bx - br * 0.15} cy={by - br * 0.2} r={br * 0.12}
              fill="#fff" opacity="0.8" />
            {/* Calyx star */}
            <text x={bx + br * 0.05} y={by + br * 0.15} textAnchor="middle"
              fontSize={br * 0.7} fill="#555" opacity="0.35">✻</text>
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

function Sauce({ x, y, size, color, id }) {
  const s = size * 2;
  return (
    <g>
      {/* Large organic pool — multiple layers for wash effect */}
      <path d={`M${x - s * 0.7},${y + s * 0.1}
        C${x - s * 0.5},${y - s * 0.35} ${x - s * 0.05},${y - s * 0.38} ${x + s * 0.35},${y - s * 0.22}
        C${x + s * 0.7},${y - s * 0.05} ${x + s * 0.8},${y + s * 0.2} ${x + s * 0.65},${y + s * 0.38}
        C${x + s * 0.45},${y + s * 0.55} ${x + s * 0.05},${y + s * 0.5} ${x - s * 0.2},${y + s * 0.42}
        C${x - s * 0.55},${y + s * 0.35} ${x - s * 0.75},${y + s * 0.3} ${x - s * 0.7},${y + s * 0.1} Z`}
        fill={`url(#sauce-g-${id})`} stroke="#777" strokeWidth="0.7" opacity="0.85" />

      {/* Inner darker wash area */}
      <path d={`M${x - s * 0.3},${y + s * 0.05}
        C${x - s * 0.1},${y - s * 0.15} ${x + s * 0.2},${y - s * 0.1} ${x + s * 0.4},${y + s * 0.05}
        C${x + s * 0.5},${y + s * 0.2} ${x + s * 0.2},${y + s * 0.3} ${x - s * 0.05},${y + s * 0.25}
        C${x - s * 0.25},${y + s * 0.2} ${x - s * 0.35},${y + s * 0.15} ${x - s * 0.3},${y + s * 0.05} Z`}
        fill={color} opacity="0.1" />

      {/* Watercolor-like internal flow strokes */}
      {[0, 1, 2, 3, 4].map(i => {
        const ox = (i - 2) * s * 0.15;
        return (
          <path key={i}
            d={`M${x - s * 0.4 + ox},${y + s * 0.15 + i * 3}
              Q${x + ox * 0.5},${y - s * 0.05 + i * 4} ${x + s * 0.45 + ox * 0.3},${y + s * 0.1 + i * 2}`}
            fill="none" stroke={color} strokeWidth={0.5 + Math.random() * 0.3} opacity={0.08 + i * 0.02} />
        );
      })}

      {/* Edge thickening strokes — pencil feel */}
      <path d={`M${x - s * 0.65},${y + s * 0.15}
        C${x - s * 0.45},${y - s * 0.28} ${x},${y - s * 0.32} ${x + s * 0.3},${y - s * 0.18}`}
        fill="none" stroke="#666" strokeWidth="0.4" opacity="0.3" />

      {/* Highlight reflection */}
      <path d={`M${x - s * 0.15},${y - s * 0.12}
        C${x + s * 0.1},${y - s * 0.22} ${x + s * 0.3},${y - s * 0.12} ${x + s * 0.4},${y - s * 0.02}`}
        fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" strokeLinecap="round" />
      <path d={`M${x + s * 0.1},${y + s * 0.08}
        C${x + s * 0.25},${y} ${x + s * 0.4},${y + s * 0.05} ${x + s * 0.5},${y + s * 0.12}`}
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

function Quenelle({ x, y, size, color, id }) {
  const w = size * 2.2, h = size * 1.4;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.45} rx={w * 0.42} ry={h * 0.12} fill="#000" opacity="0.06" />
      <path d={`M${x - w * 0.5},${y + h * 0.15}
        Q${x - w * 0.45},${y - h * 0.65} ${x + w * 0.1},${y - h * 0.55}
        Q${x + w * 0.5},${y - h * 0.45} ${x + w * 0.5},${y + h * 0.1}
        Q${x + w * 0.35},${y + h * 0.45} ${x + w * 0.05},${y + h * 0.35}
        Q${x - w * 0.3},${y + h * 0.45} ${x - w * 0.5},${y + h * 0.15} Z`}
        fill={`url(#quen-g-${id})`} stroke="#555" strokeWidth="1.1" />
      {/* Spoon ridge lines */}
      {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => (
        <path key={i}
          d={`M${x - w * 0.35 + t * w * 0.35},${y - h * 0.4 + t * h * 0.25}
            Q${x + t * w * 0.15},${y + t * h * 0.2} ${x + w * 0.25 + t * w * 0.08},${y + t * h * 0.15}`}
          fill="none" stroke="#999" strokeWidth="0.4" opacity={0.2 + t * 0.1} />
      ))}
      <path d={`M${x - w * 0.15},${y - h * 0.4} Q${x},${y - h * 0.55} ${x + w * 0.12},${y - h * 0.35}`}
        fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      {/* Cross-hatch shadow */}
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

function PulledSugar({ x, y, size, color, id }) {
  const s = size * 1.8;
  return (
    <g>
      {/* Main tall graceful curve */}
      <path d={`M${x},${y}
        C${x + s * 0.25},${y - s * 0.6} ${x - s * 0.25},${y - s * 1.4} ${x + s * 0.1},${y - s * 2.2}
        C${x + s * 0.3},${y - s * 2.7} ${x + s * 0.55},${y - s * 2.5} ${x + s * 0.35},${y - s * 1.8}`}
        fill="none" stroke="#555" strokeWidth="1.8" opacity="0.65" strokeLinecap="round" />
      {/* Dimension line */}
      <path d={`M${x + 3},${y - 2}
        C${x + s * 0.28},${y - s * 0.58} ${x - s * 0.22},${y - s * 1.38} ${x + s * 0.13},${y - s * 2.18}`}
        fill="none" stroke="#999" strokeWidth="0.6" opacity="0.3" />
      {/* Highlight */}
      <path d={`M${x + s * 0.02},${y - s * 0.8}
        C${x - s * 0.08},${y - s * 1.1} ${x - s * 0.02},${y - s * 1.5} ${x + s * 0.08},${y - s * 1.9}`}
        fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
      {/* Small decorative curl at top */}
      <path d={`M${x + s * 0.35},${y - s * 1.8}
        C${x + s * 0.4},${y - s * 1.6} ${x + s * 0.25},${y - s * 1.55} ${x + s * 0.2},${y - s * 1.65}`}
        fill="none" stroke="#666" strokeWidth="0.8" opacity="0.4" />
    </g>
  );
}

function ChocolateShard({ x, y, size, color, id }) {
  const s = size * 1.4;
  return (
    <g>
      <ellipse cx={x + 1} cy={y + s * 0.35} rx={s * 0.4} ry={s * 0.08} fill="#000" opacity="0.05" />
      <path d={`M${x - s * 0.4},${y + s * 0.3}
        L${x - s * 0.35},${y - s * 0.55}
        C${x - s * 0.15},${y - s * 0.75} ${x + s * 0.2},${y - s * 0.65} ${x + s * 0.35},${y - s * 0.4}
        L${x + s * 0.5},${y + s * 0.05}
        Q${x + s * 0.35},${y + s * 0.35} ${x + s * 0.05},${y + s * 0.32}
        Q${x - s * 0.25},${y + s * 0.38} ${x - s * 0.4},${y + s * 0.3} Z`}
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

function Cookie({ x, y, size, color, id }) {
  const w = size * 1.8, h = size * 0.7, d = size * 0.35;
  return (
    <g>
      <ellipse cx={x + 2} cy={y + h * 0.5 + d + 3} rx={w * 0.5} ry={h * 0.18} fill="#000" opacity="0.06" />
      <path d={`M${x - w * 0.5},${y + h * 0.5} L${x - w * 0.5},${y + h * 0.5 + d}
        L${x + w * 0.5},${y + h * 0.5 + d} L${x + w * 0.5},${y + h * 0.5} Z`}
        fill={color} opacity="0.1" stroke="#666" strokeWidth="0.6" />
      <rect x={x - w * 0.5} y={y - h * 0.5} width={w} height={h} rx="3"
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

function Glaze({ x, y, size, color, id }) {
  const s = size * 1.6;
  return (
    <g>
      <path d={`M${x - s * 0.55},${y}
        C${x - s * 0.45},${y - s * 0.35} ${x - s * 0.05},${y - s * 0.4} ${x + s * 0.3},${y - s * 0.2}
        C${x + s * 0.55},${y - s * 0.05} ${x + s * 0.6},${y + s * 0.22} ${x + s * 0.35},${y + s * 0.35}
        C${x + s * 0.05},${y + s * 0.45} ${x - s * 0.35},${y + s * 0.38} ${x - s * 0.55},${y} Z`}
        fill={`url(#glaze-g-${id})`} stroke="#888" strokeWidth="0.6" opacity="0.85" />
      <path d={`M${x - s * 0.15},${y - s * 0.15}
        C${x + s * 0.05},${y - s * 0.25} ${x + s * 0.25},${y - s * 0.12} ${x + s * 0.35},${y}`}
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

function Leaf({ x, y, size, color, id }) {
  const s = size * 1.3;
  return (
    <g>
      <path d={`M${x},${y - s * 0.95}
        C${x + s * 0.5},${y - s * 0.55} ${x + s * 0.45},${y + s * 0.4} ${x},${y + s * 0.95}
        C${x - s * 0.45},${y + s * 0.4} ${x - s * 0.5},${y - s * 0.55} ${x},${y - s * 0.95} Z`}
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

const RENDERERS = { dome: Dome, berries: Berries, sauce: Sauce, quenelle: Quenelle,
  "pulled sugar": PulledSugar, "chocolate shard": ChocolateShard, cookie: Cookie,
  glaze: Glaze, "leaf garnish": Leaf };
const SHAPES = Object.keys(RENDERERS);

const PRESETS = [
  { name: "Vacherin (Reference)", components: [
    { id: 1, name: "Almond Paste", shape: "dome", x: 400, y: 350, size: 65, color: "#d4c5a9" },
    { id: 2, name: "Strawberry Sorbet", shape: "quenelle", x: 405, y: 270, size: 32, color: "#e87a7a" },
    { id: 3, name: "Pulled Sugar Garnish", shape: "pulled sugar", x: 410, y: 275, size: 38, color: "#f5deb3" },
    { id: 4, name: "Red Currants", shape: "berries", x: 240, y: 365, size: 32, color: "#c0392b" },
    { id: 5, name: "Red Currant & Wine Jus", shape: "sauce", x: 440, y: 440, size: 52, color: "#7b2d3b" },
    { id: 6, name: "Fraise des Bois", shape: "leaf garnish", x: 370, y: 265, size: 18, color: "#d43d3d" },
    { id: 7, name: "White Chocolate Garnish", shape: "chocolate shard", x: 320, y: 290, size: 26, color: "#f0e6d0" },
    { id: 8, name: "Gablé Cookie", shape: "cookie", x: 480, y: 405, size: 26, color: "#c9a96e" },
    { id: 9, name: "Red Clear Glaze", shape: "glaze", x: 300, y: 330, size: 35, color: "#b53030" },
    { id: 10, name: "Almond Ice Cream", shape: "quenelle", x: 520, y: 325, size: 24, color: "#e8dcc8" },
  ]},
  { name: "Seafood Plate", components: [
    { id: 1, name: "Seared Scallop", shape: "dome", x: 380, y: 340, size: 50, color: "#f0e0c0" },
    { id: 2, name: "Sea Urchin Emulsion", shape: "sauce", x: 460, y: 420, size: 50, color: "#d4a030" },
    { id: 3, name: "Cauliflower Purée", shape: "quenelle", x: 280, y: 400, size: 38, color: "#f0ead2" },
    { id: 4, name: "Dashi Gel", shape: "berries", x: 490, y: 310, size: 22, color: "#c8a96e" },
    { id: 5, name: "Nori Crisp", shape: "chocolate shard", x: 395, y: 280, size: 30, color: "#2d5016" },
    { id: 6, name: "Finger Lime", shape: "berries", x: 395, y: 365, size: 15, color: "#a8d84e" },
    { id: 7, name: "Bonito Glaze", shape: "glaze", x: 315, y: 350, size: 32, color: "#8b6c3e" },
  ]},
  { name: "Blank Plate", components: [] },
];

const LABELS = [
  { x: 45, y: 55, a: "start" }, { x: 780, y: 55, a: "end" },
  { x: 790, y: 195, a: "end" }, { x: 795, y: 350, a: "end" },
  { x: 775, y: 510, a: "end" }, { x: 45, y: 510, a: "start" },
  { x: 25, y: 350, a: "start" }, { x: 25, y: 195, a: "start" },
  { x: 420, y: 660, a: "middle" }, { x: 420, y: 35, a: "middle" },
  { x: 150, y: 630, a: "start" }, { x: 690, y: 630, a: "end" },
];

function Arrow({ fx, fy, tx, ty }) {
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

function Drag({ comp, children, sel, onSel, onDrag }) {
  const [d, setD] = useState(false);
  const off = useRef({ x: 0, y: 0 });
  const down = (e) => {
    e.stopPropagation(); onSel(comp.id); setD(true);
    const svg = e.currentTarget.closest("svg");
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    off.current = { x: sp.x - comp.x, y: sp.y - comp.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!d) return;
    const svg = e.currentTarget.closest("svg");
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    onDrag(comp.id, sp.x - off.current.x, sp.y - off.current.y);
  };
  return (
    <g onPointerDown={down} onPointerMove={move} onPointerUp={() => setD(false)} style={{ cursor: "grab" }}>
      {children}
      {sel && <circle cx={comp.x} cy={comp.y} r={comp.size * 2 + 15} fill="none" stroke="#b8860b" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />}
    </g>
  );
}

export default function PlatingStudioPage() {
  const [comps, setComps] = useState(PRESETS[0].components);
  const [sel, setSel] = useState(null);
  const [edit, setEdit] = useState(null);
  const [name, setName] = useState(PRESETS[0].name);
  const [panel, setPanel] = useState(true);
  const svgRef = useRef(null);
  const nid = useRef(200);

  const drag = useCallback((id, x, y) => setComps(p => p.map(c => c.id === id ? { ...c, x, y } : c)), []);
  const add = () => {
    const id = nid.current++;
    setComps(p => [...p, { id, name: "New Component", shape: "dome",
      x: PX + (Math.random() - 0.5) * 140, y: PY + (Math.random() - 0.5) * 140,
      size: 35, color: "#c0b090" }]);
    setSel(id); setEdit(id);
  };
  const rm = (id) => { setComps(p => p.filter(c => c.id !== id)); if (sel === id) { setSel(null); setEdit(null); } };
  const upd = (id, u) => setComps(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  const load = (pr) => { setComps(pr.components.map(c => ({ ...c }))); setName(pr.name); setSel(null); setEdit(null); nid.current = Math.max(0, ...pr.components.map(c => c.id)) + 200; };
  const exp = () => {
    if (!svgRef.current) return;
    const d = new XMLSerializer().serializeToString(svgRef.current);
    const u = URL.createObjectURL(new Blob([d], { type: "image/svg+xml" }));
    const a = document.createElement("a"); a.href = u; a.download = `${name.replace(/\s+/g, "_")}_plating.svg`; a.click(); URL.revokeObjectURL(u);
  };

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", background: "#f9f7f2", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      <div style={{ padding: "12px 20px", borderBottom: "1px solid #ddd8ce", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/create" style={{ color: "#8a7e6b", textDecoration: "none", fontSize: "18px", lineHeight: 1 }}>←</Link>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 700, color: "#2c2418" }}>Plating Studio</span>
          <span style={{ fontSize: "11px", color: "#8a7e6b", fontStyle: "italic" }}>3D Sketch — 1-CUISINESG</span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => load(p)} style={{
              padding: "4px 12px", fontSize: "11px", border: "1px solid #c9c0b0", borderRadius: "3px",
              background: name === p.name ? "#2c2418" : "transparent", color: name === p.name ? "#faf8f4" : "#5a4e3a",
              cursor: "pointer", fontFamily: "inherit" }}>{p.name}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px", minWidth: 0 }}>
          <input value={name} onChange={e => setName(e.target.value)} style={{
            fontFamily: "'Playfair Display', serif", fontSize: "21px", fontWeight: 700, color: "#2c2418",
            border: "none", borderBottom: "1px solid transparent", background: "transparent", textAlign: "center",
            marginBottom: "4px", outline: "none", width: "400px", letterSpacing: "0.04em" }}
            onFocus={e => e.target.style.borderBottomColor = "#b8860b"}
            onBlur={e => e.target.style.borderBottomColor = "transparent"} />

          <svg ref={svgRef} viewBox="0 0 840 720" style={{ width: "100%", maxWidth: "760px", background: "#fdfcf8", borderRadius: "3px", border: "1px solid #e5e0d6" }}
            onClick={() => { setSel(null); setEdit(null); }}>
            <defs>
              <radialGradient id="pShine" cx="36%" cy="30%" r="58%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Plate */}
            <ellipse cx={PX + 6} cy={PY + 10} rx={PR + 18} ry={PR + 18} fill="#c0b8a8" opacity="0.1" />
            <ellipse cx={PX} cy={PY} rx={PR + 12} ry={PR + 12} fill="none" stroke="#b0a898" strokeWidth="0.5" />
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="#fefefe" stroke="#807868" strokeWidth="1.5" />
            <ellipse cx={PX} cy={PY} rx={PR} ry={PR} fill="url(#pShine)" />
            <ellipse cx={PX} cy={PY} rx={PR - 38} ry={PR - 38} fill="none" stroke="#ccc5b5" strokeWidth="0.3" strokeDasharray="1.5,6" opacity="0.35" />
            {/* Rim highlight */}
            <path d={`M${PX - PR * 0.65},${PY - PR * 0.72} A${PR},${PR} 0 0,1 ${PX + PR * 0.72},${PY - PR * 0.6}`}
              fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.22" strokeLinecap="round" />

            {/* Components */}
            {comps.map(c => {
              const R = RENDERERS[c.shape] || Dome;
              return (
                <Drag key={c.id} comp={c} sel={sel === c.id} onSel={id => { setSel(id); setEdit(id); }} onDrag={drag}>
                  <R x={c.x} y={c.y} size={c.size} color={c.color} id={c.id} />
                </Drag>
              );
            })}

            {/* Labels */}
            {comps.map((c, i) => {
              const lp = LABELS[i % LABELS.length];
              const ax = lp.a === "start" ? lp.x + c.name.length * 3 : lp.a === "end" ? lp.x - c.name.length * 3 : lp.x;
              return (
                <g key={`l-${c.id}`}>
                  <Arrow fx={ax} fy={lp.y + 4} tx={c.x} ty={c.y} />
                  <text x={lp.x} y={lp.y} textAnchor={lp.a} style={{
                    fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "13.5px",
                    fontStyle: "italic", fill: "#3a3020", fontWeight: 400 }}>{c.name}</text>
                </g>
              );
            })}

            <text x={PX} y={700} textAnchor="middle" style={{
              fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700,
              fill: "#2c2418", letterSpacing: "0.1em" }}>{name.toUpperCase()}</text>
            <line x1={PX - 85} y1={708} x2={PX + 85} y2={708} stroke="#b8860b" strokeWidth="0.5" opacity="0.35" />
          </svg>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={add} style={{ padding: "7px 18px", fontSize: "12px", fontFamily: "inherit", border: "1px solid #b8860b", borderRadius: "3px", background: "#2c2418", color: "#faf8f4", cursor: "pointer" }}>+ Add Component</button>
            <button onClick={exp} style={{ padding: "7px 18px", fontSize: "12px", fontFamily: "inherit", border: "1px solid #c9c0b0", borderRadius: "3px", background: "transparent", color: "#5a4e3a", cursor: "pointer" }}>Export SVG</button>
          </div>
        </div>

        {panel && (
          <div style={{ width: "260px", borderLeft: "1px solid #e0dcd4", background: "#f5f2eb", overflowY: "auto", padding: "14px", fontSize: "12px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700, color: "#2c2418", marginBottom: "12px" }}>Components</div>
            {comps.length === 0 && <p style={{ color: "#8a7e6b", fontStyle: "italic", fontSize: "11px" }}>Click "+ Add Component" to begin.</p>}
            {comps.map(c => (
              <div key={c.id} onClick={() => { setSel(c.id); setEdit(c.id); }} style={{
                padding: "9px 10px", marginBottom: "4px", borderRadius: "4px", cursor: "pointer",
                border: sel === c.id ? "1.5px solid #b8860b" : "1px solid #e0dcd4",
                background: sel === c.id ? "#faf6ed" : "#fdfcf9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "#2c2418", fontSize: "12px" }}>{c.name}</span>
                  <button onClick={e => { e.stopPropagation(); rm(c.id); }} style={{ background: "none", border: "none", color: "#b5a996", cursor: "pointer", fontSize: "15px", lineHeight: 1 }}>×</button>
                </div>
                {edit === c.id && (
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "7px" }}>
                    <input value={c.name} onChange={e => upd(c.id, { name: e.target.value })} style={{
                      padding: "4px 7px", fontSize: "11px", fontFamily: "inherit", border: "1px solid #d4cfc4",
                      borderRadius: "3px", background: "#fff", color: "#2c2418", outline: "none" }} />
                    <div style={{ fontSize: "9px", color: "#8a7e6b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Shape</div>
                    <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
                      {SHAPES.map(s => (
                        <button key={s} onClick={e => { e.stopPropagation(); upd(c.id, { shape: s }); }} style={{
                          padding: "2px 6px", fontSize: "9.5px", fontFamily: "inherit", borderRadius: "2px",
                          border: c.shape === s ? "1px solid #b8860b" : "1px solid #d4cfc4",
                          background: c.shape === s ? "#2c2418" : "transparent",
                          color: c.shape === s ? "#faf8f4" : "#6b5e4a", cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "9px", color: "#8a7e6b", minWidth: "28px", fontWeight: 600, textTransform: "uppercase" }}>Size</label>
                      <input type="range" min="12" max="90" value={c.size} onChange={e => upd(c.id, { size: parseInt(e.target.value) })} style={{ flex: 1, accentColor: "#b8860b" }} />
                      <span style={{ fontSize: "10px", color: "#6b5e4a", minWidth: "20px" }}>{c.size}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label style={{ fontSize: "9px", color: "#8a7e6b", minWidth: "28px", fontWeight: 600, textTransform: "uppercase" }}>Tint</label>
                      <input type="color" value={c.color} onChange={e => upd(c.id, { color: e.target.value })} style={{ width: "24px", height: "18px", border: "1px solid #d4cfc4", borderRadius: "2px", cursor: "pointer", padding: 0 }} />
                      <span style={{ fontSize: "9px", color: "#8a7e6b" }}>{c.color}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setPanel(!panel)} style={{
        position: "fixed", right: panel ? "260px" : "0", top: "50%", transform: "translateY(-50%)",
        width: "16px", height: "48px", border: "1px solid #ddd8ce", borderRight: panel ? "none" : undefined,
        background: "#f5f2eb", cursor: "pointer", fontSize: "9px", color: "#8a7e6b",
        borderRadius: "3px 0 0 3px", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {panel ? "›" : "‹"}
      </button>
    </div>
  );
}
