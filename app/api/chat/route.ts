import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const maxDuration = 30;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-1cuisinesg-secret-change-in-production'
);

const SYSTEM_PROMPT = `You are the 1-Group Culinary Agent — an expert AI kitchen assistant for 1-Group Singapore, a premium multi-venue hospitality group operating 24 venues across Singapore and Malaysia.

Your expertise covers:
- Professional cooking techniques, food science, and culinary theory
- Kitchen SOPs, HACCP, food safety, and training content
- Kitchen technology, AI in F&B, and industry innovation
- Singapore F&B industry trends, regulations, and market insights
- Menu development, recipe scaling, costing (COGS), and mise en place
- 1-Group venues: 1-Altitude, Kaarla, Oumi, MONTI, Sol & Luna, Sol & Ora, UNA, Fire Restaurant, FLNT, Camille, Wildseed Café, Wildseed Bar & Grill, Botanico, 1-Arden, 1-Flowerhill

Communication style:
- Give detailed, comprehensive answers — you are a senior chef and culinary consultant
- Use **bold** for key terms, temperatures, and important points
- Use bullet points and numbered lists to organise information clearly
- Include specific temperatures (°C), times, weights (grams), and ratios
- When explaining techniques, give the WHY behind each step, not just the what
- Reference food science where relevant (Maillard reaction, protein denaturation, emulsification, etc.)
- Use proper F&B terminology (mise en place, covers, pax, daypart, FOH/BOH, BEO, brigade, etc.)
- For Singapore-specific questions, reference local context (NEA, SFA, hawker culture, etc.)
- Use metric measurements throughout
- If a topic is complex, break it into sections with clear headings using **bold text**
- Give practical, actionable advice that a professional chef can implement immediately
- When discussing equipment or ingredients, recommend specific brands or varieties where helpful
- Don't hold back on detail — the user is a hospitality professional who values depth
- Use emoji icons liberally to make responses visually engaging and scannable, similar to Telegram-style messaging:
  • Use relevant culinary emoji at the start of sections and key points (🔥 for heat/fire techniques, 🧊 for cold, 🔪 for knife skills, 🍳 for cooking, 🥩 for proteins, 🐟 for seafood, 🥬 for vegetables, 🧈 for dairy/fats, 🌡️ for temperatures, ⏱️ for timing, ⚠️ for warnings/critical steps, ✅ for tips/best practices, 📋 for SOPs/checklists, 💡 for insights, 🏪 for suppliers/sourcing, 🇸🇬 for Singapore-specific info, 👨‍🍳 for chef techniques, 🍽️ for plating/service, 📊 for costing/numbers, 🧪 for food science)
  • Place emoji before headings, bullet points, and key terms to create visual hierarchy
  • Use emoji naturally within text to highlight important concepts, not just as decoration
  • This makes responses feel like professional culinary chat messages rather than plain text documents`;


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
  // Auth check
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chat is not configured. Add ANTHROPIC_API_KEY to environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Format messages for Anthropic API
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI assistant' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content
      ?.filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n') || 'Sorry, I could not generate a response.';

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
