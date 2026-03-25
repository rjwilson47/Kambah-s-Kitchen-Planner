import { KitchenLayout } from "./types";

/**
 * Revised kitchen layout — Kambah Kitchen.
 *
 * Traced from hand-drawn floor plan (March 2026).
 * Room: 2415mm wide × 3695mm deep.
 *
 * Orientation (matching the sketch, top of page = top of plan):
 *   - Top wall:    has a large 1935mm sliding door/archway, 300mm from left
 *   - Left wall:   solid wall with a window above the sink area
 *   - Right wall:  has an 850mm door, 935mm up from the bottom-right corner
 *   - Bottom wall: has a 790mm door on the right side
 *
 * Bottom wall run (left→right against bottom wall):
 *   Draws/Microwave tower (660mm) → Fridge (820mm) → 150mm wall return → Door (790mm)
 *
 * Left wall run (against left wall, working down from the peninsula):
 *   Sink base (600mm wide × 580mm deep) → Dishwasher (600mm wide × 600mm deep)
 *
 * Central peninsula (1220mm wide × 650mm deep):
 *   300mm filler | 600mm oven section | 300mm filler
 *   Stools sit on the room-side (right) of the peninsula
 *
 * Right wall: standalone Drawers unit (400mm wide × 1340mm tall) near top-right
 *
 * Dining table: oval, in the upper-right portion of the room
 *
 * Fridge is re-used. Dishwasher is Bosch (re-use — confirm with owner).
 */
export const DEFAULT_KITCHEN: KitchenLayout = {
  name: "Kambah Kitchen",
  roomWidth: 2415,
  roomDepth: 3695,

  walls: [
    {
      id: "wall-top",
      label: "Top Wall",
      start: { x: 0, y: 0 },
      end: { x: 2415, y: 0 },
      thickness: 100,
    },
    {
      id: "wall-left",
      label: "Left Wall",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 3695 },
      thickness: 100,
    },
    {
      id: "wall-right",
      label: "Right Wall",
      start: { x: 2415, y: 0 },
      end: { x: 2415, y: 3695 },
      thickness: 100,
    },
    {
      id: "wall-bottom",
      label: "Bottom Wall",
      start: { x: 0, y: 3695 },
      end: { x: 2415, y: 3695 },
      thickness: 100,
    },
  ],

  doors: [
    {
      id: "door-top",
      label: "Sliding Door",
      wall: "top",
      offset: 300,       // 300mm from left corner
      width: 1935,       // wide opening/archway
      type: "sliding",
    },
    {
      id: "door-bottom",
      label: "Door",
      wall: "bottom",
      offset: 1630,      // 660 (draws) + 820 (fridge) + 150 (wall return) = 1630
      width: 790,
      type: "door",
    },
    {
      id: "door-right",
      label: "Door",
      wall: "right",
      offset: 1910,      // 3695 - 935 - 850 = 1910 from top
      width: 850,
      type: "door",
    },
  ],

  windows: [
    {
      id: "window-left",
      label: "Window",
      wall: "left",
      offset: 2100,      // above the sink area
      width: 900,
      height: 600,
      sillHeight: 1000,
    },
  ],

  cabinets: [
    // --- Bottom wall run (against bottom wall, inner face at y ≈ 3595) ---
    {
      id: "draws-microwave",
      label: "Draws / Microwave Tower",
      type: "tall",
      position: { x: 100, y: 3045 },    // wall inner face (3645) - 600 depth = 3045
      dimensions: { width: 660, depth: 600, height: 2100 },
    },

    // --- Left wall run (against left wall, inner face at x = 100) ---
    {
      id: "sink-base",
      label: "Sink",
      type: "base",
      position: { x: 100, y: 2200 },
      dimensions: { width: 600, depth: 580, height: 870 },
    },

    // --- Central peninsula ---
    // 1220mm wide × 650mm deep, oven is in the middle 600mm
    {
      id: "peninsula",
      label: "Peninsula",
      type: "island",
      position: { x: 580, y: 1700 },    // left edge aligns with sink cabinet right edge
      dimensions: { width: 1220, depth: 650, height: 870 },
    },

    // --- Right wall — drawers unit near top-right corner ---
    {
      id: "right-drawers",
      label: "Drawers",
      type: "tall",
      position: { x: 1915, y: 100 },
      dimensions: { width: 400, depth: 600, height: 1340 },
    },
  ],

  appliances: [
    // --- Bottom wall: fridge ---
    {
      id: "fridge",
      label: "Fridge (re-use)",
      type: "fridge",
      position: { x: 760, y: 2945 },   // right of draws/microwave tower; wall face (3645) - 700 depth
      dimensions: { width: 820, depth: 700, height: 1800 },
      reused: true,
    },

    // --- Left wall: dishwasher (below sink) ---
    {
      id: "dishwasher",
      label: "Dishwasher",
      type: "dishwasher",
      position: { x: 100, y: 2800 },   // flush below sink base (2200 + 600)
      dimensions: { width: 600, depth: 600, height: 870 },
      reused: true, // Bosch — confirm re-use
    },

    // --- Peninsula: built-in oven in centre 600mm ---
    {
      id: "oven",
      label: "Oven",
      type: "oven",
      position: { x: 880, y: 1700 },   // 580 + 300 (left filler) = 880
      dimensions: { width: 600, depth: 650, height: 600 },
    },

    // --- Left wall: sink (appliance representation for the stainless basin) ---
    {
      id: "sink",
      label: "Sink",
      type: "sink",
      position: { x: 160, y: 2280 },   // inset within sink base cabinet
      dimensions: { width: 440, depth: 400, height: 200 },
    },
  ],

  furniture: [
    // Dining table — oval, upper-right area of room
    {
      id: "dining-table",
      label: "Table",
      type: "table",
      position: { x: 1100, y: 500 },
      dimensions: { width: 1000, depth: 820, height: 750 },
      shape: "oval",
    },
    // Stools at peninsula (right/room side)
    {
      id: "stool-1",
      label: "Stool",
      type: "stool",
      position: { x: 1850, y: 1800 },   // just past peninsula right edge (580+1220=1800)
      dimensions: { width: 400, depth: 400, height: 650 },
    },
    {
      id: "stool-2",
      label: "Stool",
      type: "stool",
      position: { x: 1850, y: 2050 },
      dimensions: { width: 400, depth: 400, height: 650 },
    },
  ],
};
