import { getApiKey } from '../utils/apiKey';

function resolveApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY || getApiKey();
}

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const GENERATE_SYSTEM_PROMPT = `You are a diagram data generator.
Output ONLY raw JSON. No markdown. No backticks. No text.

Your job is ONLY to decide:
- What shapes exist (their labels, types, colors)
- What arrows connect them (direction, label, style)
- What layout type fits best

You do NOT set x, y, width, height coordinates.
Those are calculated by the application automatically.

Choose layoutType from:
  "linear"   → for sequences, pipelines, linked lists,
                step-by-step processes
  "tree"     → for hierarchies, parent-child, BST,
                org charts, taxonomies
  "circle"   → for circular lists, cycles, round-robin,
                ring topologies
  "cluster"  → for networks, star topology, hub and spoke

COLOR GUIDE (use minimum 3 different colors):
  Entry / user-facing    : "#4A5568"
  Process / logic        : "#2D3748"
  Storage / database     : "#742A2A"
  Cache / fast           : "#744210"
  External / third party : "#1A365D"
  Output / result        : "#1C4532"
  Decision               : "#44337A"

ARROW COLOR GUIDE:
  Forward / request  : "#63B3ED"
  Return / response  : "#FC8181"
  Bidirectional      : "#9F7AEA"
  Optional           : "#68D391"

OUTPUT FORMAT — exactly this JSON structure:
{
  "title": "Diagram Title",
  "layoutType": "linear",
  "shapes": [
    {
      "id": "s1",
      "type": "rect",
      "label": "Browser",
      "fillColor": "#4A5568",
      "strokeColor": "rgba(255,255,255,0.15)",
      "strokeWidth": 1,
      "textColor": "#FFFFFF",
      "fontSize": 13,
      "fontBold": false,
      "fontItalic": false,
      "opacity": 1
    }
  ],
  "arrows": [
    {
      "id": "a1",
      "fromShapeId": "s1",
      "toShapeId": "s2",
      "label": "request",
      "color": "#63B3ED",
      "strokeWidth": 1.5,
      "style": "solid",
      "arrowHead": "end"
    }
  ]
}

RULES:
- Maximum 8 shapes
- Maximum 10 arrows
- Labels max 3 words, Title Case
- Every shape must connect to at least one arrow
- No isolated shapes`;

const IMPROVE_SYSTEM_PROMPT = `You are a diagram editor. The user has selected shapes on the canvas.
Your job is to MODIFY those selected shapes only — never create new ones.

INPUT: You receive the selected shapes and user's instruction.
OUTPUT: Return ONLY the modified shapes with the same IDs.

OUTPUT FORMAT:
{
  "title": "Updated Title",
  "shapes": [
    {
      "id": "s1",  // MUST be the SAME id as input
      "type": "rect",
      "label": "New Label",  // changed if requested
      "fillColor": "#NewColor",  // changed if requested
      ...
    }
  ],
  "arrows": [...]
}

CRITICAL RULES:
1. ONLY return the shapes that were in the input — nothing more.
2. NEVER add new shapes — only modify existing ones.
3. NEVER remove shapes from the selection.
4. Keep the EXACT SAME IDs from the input — do NOT rename them.
5. Only change what user requests (label, color, etc.)
6. Do NOT include x, y, width, height — those are set by the app.
7. If user wants to add shapes, respond with ONLY the existing shapes modified.

COLOR GUIDE (for changing colors):
  Entry / user-facing    : "#4A5568"
  Process / logic        : "#2D3748"
  Storage / database     : "#742A2A"
  Cache / fast           : "#744210"
  External / third party : "#1A365D"
  Output / result        : "#1C4532"

ARROW COLOR GUIDE:
  Forward / request  : "#63B3ED"
  Return / response  : "#FC8181"
  Bidirectional      : "#9F7AEA"

If user says "change color" or "change label" — update ONLY that property.
Keep everything else exactly as it was.
Output ONLY raw JSON, no markdown.`;

async function makeRequest(messages) {
  const key = resolveApiKey();
  if (!key) {
    throw new Error('API_KEY_MISSING');
  }
  
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 3000
    })
  });
  
  if (response.status === 401) {
    throw new Error('Invalid API key. Check your .env file.');
  }
  
  if (response.status === 429) {
    throw new Error('Too many requests, please wait a moment');
  }
  
  if (!response.ok) {
    throw new Error('Connection failed. Check your internet.');
  }
  
  const data = await response.json();
  
  if (!data.choices || !data.choices[0]) {
    throw new Error('AI returned nothing. Try rephrasing.');
  }
  
  return data.choices[0].message.content;
}

export async function generateDiagram(userPrompt) {
  const messages = [
    { role: 'system', content: GENERATE_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];
  
  const response = await makeRequest(messages);
  return response;
}

export async function improveDiagram(userPrompt, shapeJSON) {
  const messages = [
    { role: 'system', content: IMPROVE_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
    { role: 'user', content: `Current diagram JSON: ${shapeJSON}` }
  ];
  
  const response = await makeRequest(messages);
  return response;
}