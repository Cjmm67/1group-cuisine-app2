import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 120;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

const SKETCH_SYSTEM_PROMPT = `You are a world-class culinary illustrator who produces hand-drawn plating diagrams in the style of a Michelin-starred chef's R&D notebook. Your output is ONLY raw SVG — no preamble, no explanation, no markdown, no code fences. Start with <svg and end with </svg>.

CRITICAL AESTHETIC: Your drawings look like PROFESSIONAL CHARCOAL AND GRAPHITE SKETCHES on heavy-grain parchment paper — NOT flat vector graphics. Every element must have visible hand-drawn quality, depth, and materiality.

═══ SVG SETUP ═══

ViewBox: "0 0 680 600". Background: rect fill="#FAF8F4" covering full area.

Required SVG filters in <defs>:
<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" seed="3" result="noise"/><feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/><feBlend in="SourceGraphic" in2="grayNoise" mode="multiply"/></filter>
<filter id="pencil"><feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="3" seed="8" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="wash"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
<filter id="washHeavy"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/></filter>
<filter id="shadow" x="-20%" y="-10%" width="140%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="8" result="s"/><feOffset dx="4" dy="6" result="os"/><feFlood flood-color="#000" flood-opacity="0.1" result="c"/><feComposite in="c" in2="os" operator="in" result="sh"/><feComposite in="SourceGraphic" in2="sh" operator="over"/></filter>

═══ PLATE / VESSEL ═══

- Triple-layer ground shadow (3 ellipses, opacity: 0.1, 0.06, 0.03)
- Outer rim ring (thin, 0.5px stroke)
- Main plate body: 2px stroke with filter="url(#pencil)"
- Inner decorative rim line (dashed)
- Radial gradient shine from upper-left
- TWO rim highlight arcs (3px white at 0.25 opacity + 1.5px at 0.12)

═══ FOOD COMPONENTS — ORGANIC SHAPES ONLY ═══

NEVER use perfect geometric shapes. Every food element uses <path> with organic curves.

For EACH component, render ALL of these layers:
1. GROUND SHADOW — soft ellipse beneath (opacity 0.06-0.1)
2. BASE FORM — organic path, radialGradient fill (5+ stops: white highlight → color → dark edge)
3. WATERCOLOR WASH — 2-3 overlapping semi-transparent shapes (opacity 0.06-0.15, filter="url(#wash)") bleeding past the outline
4. HEAVY OUTLINE — 1.8-2.5px stroke with filter="url(#pencil)"
5. CROSS-HATCHING — 10-15 thin lines (0.3-0.5px, opacity 0.08-0.2) on shadow side + 5-8 cross-direction lines
6. CONTOUR LINES — curved dashed lines following the surface form
7. HIGHLIGHTS — three layers: primary 3-4px white at 0.4 opacity, secondary 2px at 0.3, tertiary 1px at 0.2
8. TEXTURE DETAIL — Maillard marks for protein, flow lines for sauce, calyx for berries, ridge lines for quenelles, vein lines for herbs

═══ SAUCE RENDERING ═══

Sauces must look LIQUID:
- Outer wash bleed (color at 0.04 opacity, filter="url(#washHeavy)")
- Main organic path, radialGradient fill
- Inner darker concentration (0.12-0.18 opacity, filter="url(#wash)")
- 5-7 internal flow lines (thin, low opacity)
- 2-3 surface reflection highlights (curved white strokes)
- Edge thickening strokes for meniscus

═══ ANNOTATION LABELS ═══

- Georgia serif, italic, 12-13px
- Connected by curved bezier lines (0.6px, "#555", opacity 0.5) with arrowheads
- Labels around the periphery, never overlapping food
- Apply filter="url(#pencil)" to label text

═══ TITLE ═══

- Dish title: Georgia serif, 15px, bold, centered below plate
- Venue name: 10px, italic, muted, below title

═══ WHAT MAKES THIS HAND-DRAWN ═══

1. Pencil filter on ALL major outlines (non-negotiable)
2. Varying stroke widths (thicker shadow side, thinner highlight side)
3. Wash layers that bleed PAST outlines
4. Cross-hatching that varies in density
5. Broad soft white highlight strokes (like eraser lifts on graphite)
6. Multiple overlapping transparent fills (NOT solid flat fills)
7. Organic irregular paths (NOT geometric shapes)

Output ONLY raw SVG. Start with <svg, end with </svg>.`;

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 503 });

  try {
    const body = await request.json();
    const { title, venueName, imagePrompt, components, assembly, venueAccent, style } = body;

    if (!title && !imagePrompt) return NextResponse.json({ error: 'Title or description is required' }, { status: 400 });

    const styleGuide = style === 'dramatic' ? 'Dramatic chiaroscuro — single side-lit source, deep shadows, heavy charcoal with deep blacks.'
      : style === 'minimal' ? 'Clean, minimal — fine-point pen with light grey wash. Maximum negative space. Kaiseki restraint.'
      : style === 'warm' ? 'Warm golden lighting — watercolour wash with conte crayon undertones. Mediterranean generosity.'
      : style === 'editorial' ? 'Overhead flat-lit editorial — even diffused light, maximum surface detail. Architectural precision.'
      : 'Elegant side-lighting from upper-left. Professional charcoal and graphite with controlled watercolour wash.';

    const userMessage = `Draw a professional plating diagram for this dish:

DISH: ${title || 'Untitled'}
${venueName ? `VENUE: ${venueName}` : ''}
${venueAccent ? `ACCENT COLOUR: ${venueAccent} (for title and decorative elements)` : ''}

DESCRIPTION:
${imagePrompt || `A composed dish featuring: ${(components || []).map((c: any) => c.name).join(', ')}`}

COMPONENTS TO LABEL:
${(components || []).map((c: any, i: number) => `${i + 1}. ${c.name}`).join('\n') || 'Label all visible components'}

${assembly?.length ? `ASSEMBLY NOTES:\n${assembly.join('\n')}` : ''}

STYLE: ${styleGuide}

Draw this now. Every component needs: ground shadow, wash layers, pencil-filtered outline, cross-hatching, and multi-layer highlights. The plate needs triple shadow, pencil rim, and highlight arcs. Output ONLY raw SVG.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: SKETCH_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, err);
      return NextResponse.json({ error: 'Failed to generate sketch. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') || '';

    const svg = rawText
      .replace(/^```svg\s*/i, '')
      .replace(/^```xml\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    if (!svg.startsWith('<svg')) {
      console.error('Response is not an SVG:', svg.slice(0, 200));
      return NextResponse.json({ error: 'Generated response was not a valid SVG. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ svg });
  } catch (err) {
    console.error('Sketch API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
