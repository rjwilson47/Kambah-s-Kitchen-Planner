# Kambah's Kitchen Planner

AI-powered kitchen layout planner. Describe changes in a chat interface and watch the floor plan update in real time.

## Features

- **Chat-driven design** — type natural language requests like "move the fridge to the left wall" or "add an island bench"
- **2D floor plan** — top-down SVG with labelled cabinets, appliances, and dimension lines
- **3D isometric view** — toggle to see an isometric perspective of your layout
- **Multiple kitchens** — save, switch between, export, and import kitchen projects (stored in browser localStorage)
- **Default layout** — ships with the Kambah L-shape kitchen pre-configured
- **Reset** — one-click reset to start fresh
- **Mobile responsive** — stacks vertically on small screens

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) via server-side route
- **Vercel** for deployment

## Setup

### 1. Clone and install

```bash
git clone https://github.com/rjwilson47/kambah-s-kitchen-planner.git
cd kambah-s-kitchen-planner
npm install
```

### 2. Set up environment variable

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=your-api-key-here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com/).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com/new)
3. Add the environment variable:
   - Go to **Settings → Environment Variables**
   - Add `ANTHROPIC_API_KEY` with your API key
   - Apply to **Production**, **Preview**, and **Development**
4. Deploy — Vercel auto-detects Next.js

## Usage

1. Select a kitchen from the dropdown (or create a new one)
2. Type layout changes in the chat panel
3. The AI returns an updated layout JSON + explanation
4. The floor plan updates automatically
5. Toggle between 2D and 3D views
6. Export your kitchen as JSON to share or back up
7. Import a JSON file to load someone else's kitchen

## Project Structure

```
app/
  page.tsx              — Main page (layout + state management)
  layout.tsx            — Root layout with metadata
  globals.css           — Tailwind imports
  api/chat/route.ts     — Server-side Anthropic API proxy
  components/
    ChatInterface.tsx   — Chat message list + input
    FloorPlan2D.tsx     — Top-down SVG renderer
    FloorPlan3D.tsx     — Isometric 3D SVG renderer
    KitchenSelector.tsx — Dropdown + import/export/delete controls
lib/
  types.ts              — TypeScript interfaces
  defaultKitchen.ts     — Hard-coded Kambah kitchen layout
  storage.ts            — localStorage helpers for save/load/export/import
```
