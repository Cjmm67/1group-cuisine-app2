import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 60;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

const SKETCH_SYSTEM_PROMPT = `You are a professional culinary illustrator and plating diagram specialist. You produce clean, beautiful SVG plating diagrams that chefs use as references when building a dish on the pass.

Your output is ONLY a raw SVG element — no preamble, no explanation, no markdown, no code fences. Start directly with <svg and end with </svg>.

DIAGRAM REQUIREMENTS:

1. VIEWBOX: Always use viewBox="0 0 600 520". Width 600, height 520.

2. BACKGROUND: Cream/ivory paper texture — use a subtle rectangle fill #FAF8F4 for the full background, with a very light noise-like pattern using feTurbulence filter (opacity 0.03) to suggest paper texture.

3. VESSEL: Draw the vessel (plate, bowl, platter) as the centrepiece. Common vessels:
   - Round plate: circle at roughly cx=300, cy=240, with a rim ring slightly larger, rim colour lighter than plate colour
   - Deep bowl: ellipse suggesting depth with inner shadow ring
   - Rectangular platter: rounded rect
   - Vessel fill should be the colour described (e.g. matte black #1A1A1A, ivory #F5F0E8, dark slate #2A2A2A, white #FFFFFF)
   - Add a subtle drop shadow under the vessel using filter/feDropShadow

4. FOOD ELEMENTS: Place each major component as described. Use organic, irregular shapes (not perfect geometric circles) to suggest actual food:
   - Main protein/centrepiece: use a path with slightly organic curves, positioned centre or offset as described
   - Sauce pool: organic blob shapes, semi-transparent fill
   - Garnishes: small leaf shapes (path), dots (circles), lines for microherbs
   - Each element should be filled with an appropriate, food-realistic colour
   - Add subtle internal detail lines (lighter/darker strokes) to suggest texture

5. LABELS: For each major component, add a clean label:
   - Thin dashed line from component to label text (stroke-dasharray="3,3", stroke="#AAAAAA")
   - Label text in font-family="Georgia, serif" font-size="11" fill="#2C2C2C"
   - Labels positioned around the periphery, never overlapping food elements
   - Keep labels concise — component name only (1–3 words)

6. PERSPECTIVE: The described camera angle determines the view:
   - "overhead" or "top-down": pure flat plan view, vessel is a perfect circle
   - "45-degree": slight 3D perspective — vessel is a circle with a subtle elliptical rim to suggest angle, elements have minimal shadow
   - "eye-level": rare, show a very shallow ellipse for the plate, more height in elements

7. TYPOGRAPHY:
   - Title: font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1B3A2D" at top of diagram
   - Subtitle (venue name): font-family="Arial, sans-serif" font-size="11" fill="#8B8578" tracking
   - Chef note at bottom: font-family="Arial, sans-serif" font-size="10" fill="#8B8578" italic

8. COLOUR PALETTE: Draw from the actual dish colours described. Create a small colour legend in the bottom-right corner — 4–6 small colour swatches (10×10 rect) with labels showing what each colour represents.

9. STYLE: The overall aesthetic should feel like a professional chef's prep guide — precise but with a slightly hand-drawn warmth. Lines should be clean but not mechanical. Use stroke-linecap="round" and stroke-linejoin="round" throughout.

10. COMPOSITION: The vessel should occupy roughly 55% of the diagram height, centred horizontally at x=300. Title at top (y=30–50). Legend bottom-right. Optional plating note at very bottom centre in small italic text.

IMPORTANT: The SVG must be self-contained — no external fonts, no external images, no JavaScript. Use only SVG elements and CSS within the SVG.`;

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
    const { title, venueName, imagePrompt, components, assembly, venueAccent } = body;

    if (!imagePrompt) return NextResponse.json({ error: 'imagePrompt is required' }, { status: 400 });

    const userMessage = `Create a professional plating diagram SVG for the following dish.

DISH TITLE: ${title}
VENUE: ${venueName}
VENUE ACCENT COLOUR: ${venueAccent}

PLATING DESCRIPTION (from the chef's image brief):
${imagePrompt}

DISH COMPONENTS:
${(components || []).map((c: any, i: number) => `${i + 1}. ${c.name}`).join('\n')}

ASSEMBLY SEQUENCE:
${(assembly || []).join('\n')}

Based on the above, generate a complete SVG plating diagram. The diagram should visually represent the dish as described — vessel type, food placement, sauce work, garnish positions, colour palette, and camera angle. Use the venue accent colour ${venueAccent} for the title and any venue-branded decorative elements. Output ONLY the raw SVG — nothing else.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
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

    // Clean up any accidental code fences
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
