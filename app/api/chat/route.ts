import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * System prompt that instructs Claude to return structured kitchen layout JSON
 * alongside a plain-English explanation.
 */
const SYSTEM_PROMPT = `You are Kambah's Kitchen Planner — an AI kitchen-design assistant.

The user will describe a kitchen layout or request changes to one. You always respond with:
1. A JSON block describing the full updated kitchen layout.
2. A plain-English explanation of what you changed and why.

Your response MUST be valid JSON wrapped in a markdown code fence, followed by your explanation.
Use this exact format every time:

\`\`\`json
{ ... full KitchenLayout JSON ... }
\`\`\`

<explanation>
Your plain-English description here.
</explanation>

## KitchenLayout JSON Schema

{
  "name": string,
  "roomWidth": number (mm),
  "roomDepth": number (mm),
  "walls": [
    { "id": string, "label": string, "start": {"x": number, "y": number}, "end": {"x": number, "y": number}, "thickness": number }
  ],
  "cabinets": [
    { "id": string, "label": string, "type": "base"|"upper"|"tall"|"corner"|"island", "position": {"x": number, "y": number}, "dimensions": {"width": number, "depth": number, "height": number}, "color": string (optional) }
  ],
  "appliances": [
    { "id": string, "label": string, "type": "fridge"|"oven"|"cooktop"|"dishwasher"|"microwave"|"sink"|"other", "position": {"x": number, "y": number}, "dimensions": {"width": number, "depth": number, "height": number}, "reused": boolean (optional), "color": string (optional) }
  ],
  "doors": [
    { "id": string, "label": string, "wall": "top"|"bottom"|"left"|"right", "offset": number (mm along wall), "width": number (mm), "type": "door"|"archway"|"sliding" }
  ],
  "windows": [
    { "id": string, "label": string, "wall": "top"|"bottom"|"left"|"right", "offset": number, "width": number, "height": number, "sillHeight": number }
  ],
  "furniture": [
    { "id": string, "label": string, "type": "table"|"stool"|"chair"|"other", "position": {"x": number, "y": number}, "dimensions": {"width": number, "depth": number, "height": number}, "shape": "rect"|"oval" (optional) }
  ]
}

Rules:
- All measurements are in millimeters.
- position.x is distance from the left wall interior face; position.y is distance from the top wall interior face.
- Walls have a thickness (typically 100mm). Interior items sit inside the wall boundaries.
- Always return the COMPLETE layout, not just the changed parts.
- Keep existing item IDs stable when modifying (so the UI can animate transitions).
- Mark re-used appliances with "reused": true.
- Use "island" type for peninsulas and island benches.
- Doors have an offset (mm from the wall start) and a width. Use "sliding" for sliding glass doors.
- Include doors, windows, and furniture in your response to preserve them across updates.
- Provide sensible default dimensions if the user doesn't specify (standard Australian kitchen sizes).`;

export async function POST(req: NextRequest) {
  try {
    const { messages, currentLayout } = await req.json();

    // Build the message list for Claude — include the current layout as context
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // Prepend the current layout to the first user message so Claude has context
    if (currentLayout && claudeMessages.length > 0) {
      const firstUserIdx = claudeMessages.findIndex((m: { role: string }) => m.role === "user");
      if (firstUserIdx === 0) {
        claudeMessages[0].content =
          `Current kitchen layout:\n\`\`\`json\n${JSON.stringify(currentLayout, null, 2)}\n\`\`\`\n\nUser request: ${claudeMessages[0].content}`;
      }
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    // Extract the text content
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => {
        if (block.type === "text") return block.text;
        return "";
      })
      .join("");

    // Parse out the JSON layout from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    let layout = null;
    if (jsonMatch) {
      try {
        layout = JSON.parse(jsonMatch[1]);
      } catch {
        // If JSON parsing fails, leave layout as null
      }
    }

    // Parse out the explanation
    const explanationMatch = text.match(/<explanation>\s*([\s\S]*?)<\/explanation>/);
    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : text.replace(/```json[\s\S]*?```/, "").trim();

    return NextResponse.json({ layout, explanation, raw: text });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
