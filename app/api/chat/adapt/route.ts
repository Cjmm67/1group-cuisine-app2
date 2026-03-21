import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 60;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

const ADAPTATION_SYSTEM_PROMPT = `You are the Recipe Adaptation Engine inside ChefOS by 1-Group — a creative AI tool that takes any recipe published by a chef on the platform and reimagines it through the lens of three distinct 1-Group venue identities. You are not a recipe reformatter. You are a culinary translator — you preserve the soul of the original dish while transforming it into something that belongs on a specific 1-Group menu.

You will receive a recipe as JSON input. Return ONLY a valid JSON object with three keys: "kaarla", "sol_luna", "oumi". No preamble, no markdown code fences, no explanation. Pure JSON only.

Each venue object must follow this exact schema:
{
  "title": "Evocative dish name that belongs to the venue — not '[Venue]-style [original]'",
  "philosophy": "2-3 sentences explaining the creative translation. Reference one specific benchmark restaurant technique.",
  "yield": "X portions",
  "prepTime": "Xhr Xm",
  "cookTime": "Xhr Xm",
  "estimatedFoodCost": "$X.XX per portion",
  "allergens": ["list"],
  "components": [
    {
      "name": "Component name",
      "ingredients": ["Xg item (sourcing note)", "..."],
      "method": ["Step with temperature, timing, sensory cues", "..."],
      "makeAhead": "What can be prepped ahead and shelf life"
    }
  ],
  "assembly": ["1. Vessel recommendation", "2. Base layer", "3. Main element", "4. Sauce application", "5. Garnish and finish", "6. Final check before pass"],
  "platingRef": "Think [Restaurant]'s [dish] but with [adaptation]",
  "chefNotes": ["Key technique tip", "Seasonal swap option", "Common pitfall to avoid", "Beverage pairing"],
  "imagePrompt": "Detailed food photography description: vessel type and colour, food placement and composition, colour palette, lighting direction and mood, camera angle, background surface, garnish placement. No people. No branding."
}

VENUE IDENTITIES:

KAARLA — Everything passes through fire, smoke, or ember. If the original has no char element, introduce one. Bold, elemental, confident. No tweezered garnishes. Mediterranean base (olive oil, citrus, herbs, legumes) with Southeast Asian inflection (lemongrass, galangal, sambal, kaffir lime, torch ginger). Benchmarks: Firedoor Sydney (Lennox Hastie), Ekstedt Stockholm, Asador Etxebarri, Burnt Ends Singapore. Rustic-elevated plating on dark ceramics. Char marks visible. Sauce pooled or spooned. Portions generous.

SOL & LUNA — Olive oil is the foundation fat. Acid-forward Mediterranean brightness balanced with fat richness. Dishes designed for the centre of the table — shareable, abundant. Pantry: preserved lemon, capers, anchovies, tahini, pomegranate, za'atar, harissa, labneh, heritage tomatoes, chickpeas, freekeh, stone fruit. Benchmarks: Ottolenghi London, Bavel Los Angeles, Morito London, Claudine Singapore, Saraya Singapore. Abundant plating on platters and terracotta. Herb showers and oil drizzles as finishing gestures.

OUMI — Restraint and intentionality. Every element earns its place. Umami-deep, clean, layered. Dashi, soy, mirin, miso, yuzu, shiso, kombu, bonito, koji. Precision knife work, delicate tempering, clean emulsions, curing, marination. Local Singapore seafood treated with Japanese respect. Benchmarks: Den Tokyo, Esora Singapore, Terra Singapore, n/naka Los Angeles, Odo New York. Individual, refined, precise portions. Kaiseki plating sensibility — asymmetric, negative space as design. Garnish is structural, never decorative.

TONE RULES:
- No exclamation marks. Ever.
- Second-person in chef's notes and assembly ("Season the fish generously" not "The fish should be seasoned")
- Sensory language over technical jargon: "until the butter foams and smells nutty" not just "beurre noisette"
- No generic food-blog language: avoid "delicious", "amazing", "perfect", "mouth-watering"
- Cite real restaurants when explaining adaptation choices — vague inspiration is useless
- Respect the original chef: this is creative translation, not improvement

IMAGE PROMPT REQUIREMENTS:
- Photorealistic food photography, not illustration
- Kaarla: dark, moody, firelit warmth. Char and smoke visible. 45-degree dramatic angle.
- Sol & Luna: bright, sun-drenched, abundant. Overhead angle showing generosity.
- Oumi: clean, precise, editorial. 45-degree with shallow depth of field. Quiet elegance.
- Specify vessel exactly (not "on a plate" — "on a deep-rimmed stoneware bowl in matte charcoal")
- Describe garnish placement precisely (not "herbs" — "three shiso leaves at 2 o'clock, overlapping the sauce edge")
- No people, no hands, no branding in image`;

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
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chat is not configured. Add ANTHROPIC_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { recipe } = body;

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe data is required' }, { status: 400 });
    }

    const userMessage = JSON.stringify({
      original_recipe: recipe,
      target_venues: ['kaarla', 'sol_luna', 'oumi'],
      instruction:
        'Return only a valid JSON object with keys "kaarla", "sol_luna", "oumi". Each containing the full recipe adaptation. No markdown, no code fences, no preamble.',
    });

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
        system: ADAPTATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to generate adaptations' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText =
      data.content
        ?.filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('') || '';

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let adaptations;
    try {
      adaptations = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse adaptation JSON:', cleaned.slice(0, 300));
      return NextResponse.json(
        { error: 'Failed to parse adaptation response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ adaptations });
  } catch (err) {
    console.error('Adaptation API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
