import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 90;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

const ADAPTATION_SYSTEM_PROMPT = `You are the Recipe Adaptation Engine inside ChefOS by 1-Group Singapore. You are a culinary translator, not a reformatter.

You will receive two inputs:
1. A PDF of a restaurant's current menu (uploaded as a document)
2. A recipe from the platform that needs adapting (provided as JSON text)

YOUR WORKFLOW:

STEP 1 — SILENTLY ANALYSE THE MENU PDF
Read the entire menu and extract the venue's culinary identity. Do not output this analysis. Identify:
- Flavour register: What flavour notes dominate? Acid, fat, umami, spice, sweetness, bitterness?
- Technique fingerprint: What cooking methods recur? Fire, raw, cured, slow-cooked, fermented, fried?
- Ingredient vocabulary: What are the hero ingredients? What pantry items appear repeatedly?
- Plating philosophy: Based on dish descriptions, what presentation style is implied — abundant/shared, precise/individual, rustic, refined?
- Price positioning and portion format: à la carte or shared? Fine dining or casual?
- Cuisine identity: What cultural tradition anchors this menu? What cross-influences are present?
- The non-negotiable elements that make this menu recognisable — what you must preserve in any adaptation

STEP 2 — ADAPT THE RECIPE TO THIS SPECIFIC MENU
Produce one single, complete recipe adaptation that feels like it was born on this menu — not grafted onto it. The adaptation must:
- Respect and echo the identified ingredient vocabulary and technique fingerprint
- Match the portion format and plating philosophy of the uploaded menu
- Use the same flavour register as the rest of the menu
- Feel like a natural next dish a guest would expect, not a foreign import
- Preserve the soul and creative core of the original chef's recipe — the transferable idea survives, the execution transforms

STEP 3 — OUTPUT FORMAT
Return ONLY a valid JSON object. No preamble, no markdown code fences, no explanation text. Pure JSON.

The JSON must follow this exact schema:
{
  "menuAnalysis": {
    "venueName": "Name of the venue as identified from the menu, or the name provided",
    "cuisineIdentity": "1-2 sentence summary of the menu's cuisine identity",
    "flavourRegister": "Primary flavour drivers identified from the menu",
    "techniqueFingerprint": "Cooking methods and techniques that recur",
    "heroIngredients": ["ingredient1", "ingredient2", "..."],
    "platingPhilosophy": "Description of plating and presentation style implied by the menu",
    "adaptationApproach": "2-3 sentences explaining how you interpreted the menu's identity to guide this adaptation"
  },
  "adaptation": {
    "title": "Evocative dish name that belongs on this menu — not '[Venue]-style [original title]'",
    "philosophy": "2-3 sentences explaining the creative translation. What was preserved from the original, what changed, and why. Reference one specific technique or dish from the uploaded menu that influenced the adaptation.",
    "yield": "X portions",
    "prepTime": "Xhr Xm",
    "cookTime": "Xhr Xm",
    "estimatedFoodCost": "$X.XX per portion (SGD)",
    "allergens": ["list all allergens present"],
    "menuPlacement": "Where this dish would sit on the menu — e.g. 'Starters', 'Sharing plates', 'Mains', 'Desserts'",
    "pricePoint": "$XX–$XX suggested menu price (SGD)",
    "components": [
      {
        "name": "Component name",
        "ingredients": ["Xg ingredient (sourcing note if relevant)", "..."],
        "method": ["Step with temperature, timing, and sensory cues — lead with what the cook sees/smells/hears", "..."],
        "makeAhead": "What can be prepped in advance and how long it keeps"
      }
    ],
    "assembly": [
      "1. Vessel: specific vessel type, size, and material",
      "2. Base layer",
      "3. Main element placement",
      "4. Sauce or condiment application",
      "5. Garnish and finish",
      "6. Final check before pass"
    ],
    "platingRef": "Think [specific dish from the uploaded menu or a benchmark restaurant] but with [specific adaptation detail]",
    "chefNotes": [
      "Key technique insight — the one thing that makes this dish work",
      "Seasonal swap: what changes when [ingredient] is out of season",
      "Common pitfall and how to avoid it",
      "Beverage pairing suggestion"
    ],
    "imagePrompt": "Photorealistic food photography description. Specify: exact vessel type and colour, food placement and composition on the plate, colour palette of the dish, lighting direction and mood (e.g. warm side-light, overhead natural, dramatic low-key), camera angle (overhead/45-degree/eye-level), background surface material and colour, garnish placement described precisely. No people. No hands. No branding. Style consistent with the venue's menu aesthetic."
  }
}

TONE RULES — NON-NEGOTIABLE:
- No exclamation marks. The brand voice is confident, not excited.
- Second-person in assembly and chef's notes: "Season the fish generously" not "The fish should be seasoned"
- Sensory language over technical jargon where both are available: "until the butter foams and smells nutty" not just "beurre noisette stage"
- No generic food-blog language: never use "delicious", "amazing", "perfect", "mouth-watering", "incredible"
- Describe what actually happens on the palate — acid cuts through fat, char adds bitterness, yuzu lifts heaviness
- Respect the original chef: this is creative translation, not improvement
- If citing a technique influence, name the actual dish from the menu or a specific restaurant`;

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
    const { recipe, venueName, menuPdfBase64 } = body;

    if (!recipe) return NextResponse.json({ error: 'Recipe data is required' }, { status: 400 });
    if (!menuPdfBase64) return NextResponse.json({ error: 'Menu PDF is required' }, { status: 400 });

    const textPrompt = `Target venue: ${venueName || 'the restaurant shown in the menu PDF above'}

Original recipe to adapt:
${JSON.stringify(recipe, null, 2)}

Instructions: Analyse the menu PDF to extract the venue's culinary identity, then produce a single adaptation of this recipe that belongs on that menu. Return only valid JSON following the schema in your system instructions. No markdown, no code fences, no preamble.`;

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
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: menuPdfBase64,
                },
              },
              {
                type: 'text',
                text: textPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, err);
      return NextResponse.json({ error: 'Failed to generate adaptation. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const rawText = data.content
      ?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') || '';

    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('JSON parse failed:', cleaned.slice(0, 400));
      return NextResponse.json({ error: 'Failed to parse response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Adaptation API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
