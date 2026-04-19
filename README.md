# CanvasAI — Visual Canvas Builder with AI

Draw diagrams by hand OR generate them with AI.
Everything is editable, exportable, and yours.

## Setup
1. Clone the repo
2. npm install
3. Copy .env.example → .env
4. Add your Groq API key (free at console.groq.com)
5. npm run dev
6. Open http://localhost:5173

## Deploy to Vercel
1. Push to GitHub
2. Import to Vercel
3. Add VITE_GROQ_API_KEY environment variable
4. Deploy

## How to use

MANUAL MODE:
  - Pick a shape from the left toolbar
  - Click the canvas to place it
  - Drag shapes freely anywhere
  - Double-click to edit labels
  - Pick Arrow tool → click shape A → click shape B to connect
  - Select a shape → edit colors, size, text in right panel
  - Scroll to zoom in/out

AI MODE:
  - Click the ✦ button (bottom-right)
  - "Generate New" → describe a diagram → AI builds it on canvas
  - "Improve Selected" → select shapes → describe changes → AI updates them
  - Everything AI generates is fully editable like manual shapes

EXPORT:
  - Export PNG or SVG from the top bar
  - Save as JSON to reload later