import { KitchenLayout } from "./types";

/**
 * Default L-shaped kitchen layout — Kambah kitchen.
 *
 * Approximate dimensions: 3700mm wide × 2800mm deep.
 * Top wall run (left→right): corner cabinet, 5× 600mm base/upper cabinets,
 *   600mm induction cooktop, 600mm oven, fridge at end.
 * Left wall run (top→bottom): dishwasher, 2× drawer units, microwave tower.
 * Dishwasher and fridge are flagged as re-used.
 */
export const DEFAULT_KITCHEN: KitchenLayout = {
  name: "Kambah Kitchen",
  roomWidth: 3700,
  roomDepth: 2800,
  walls: [
    {
      id: "wall-top",
      label: "Top Wall",
      start: { x: 0, y: 0 },
      end: { x: 3700, y: 0 },
      thickness: 100,
    },
    {
      id: "wall-left",
      label: "Left Wall",
      start: { x: 0, y: 0 },
      end: { x: 0, y: 2800 },
      thickness: 100,
    },
    {
      id: "wall-right",
      label: "Right Wall",
      start: { x: 3700, y: 0 },
      end: { x: 3700, y: 2800 },
      thickness: 100,
    },
    {
      id: "wall-bottom",
      label: "Bottom Wall",
      start: { x: 0, y: 2800 },
      end: { x: 3700, y: 2800 },
      thickness: 100,
    },
  ],

  cabinets: [
    // --- Top wall run (along y=100, below top wall) ---
    {
      id: "corner-base",
      label: "Corner Cabinet",
      type: "corner",
      position: { x: 100, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "base-1",
      label: "Base 1",
      type: "base",
      position: { x: 700, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "base-2",
      label: "Base 2",
      type: "base",
      position: { x: 1300, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "base-3",
      label: "Base 3",
      type: "base",
      position: { x: 1900, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "base-4",
      label: "Base 4",
      type: "base",
      position: { x: 2500, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "base-5",
      label: "Base 5",
      type: "base",
      position: { x: 3100, y: 100 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },

    // --- Left wall run (along x=100, right of left wall) ---
    {
      id: "drawer-1",
      label: "Drawer Unit 1",
      type: "base",
      position: { x: 100, y: 1300 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "drawer-2",
      label: "Drawer Unit 2",
      type: "base",
      position: { x: 100, y: 1900 },
      dimensions: { width: 600, depth: 600, height: 870 },
    },
    {
      id: "micro-tower",
      label: "Microwave Tower",
      type: "tall",
      position: { x: 100, y: 2500 },
      dimensions: { width: 600, depth: 600, height: 2100 },
    },
  ],

  appliances: [
    // --- Top wall run appliances ---
    {
      id: "cooktop",
      label: "Induction Cooktop",
      type: "cooktop",
      position: { x: 1900, y: 100 },
      dimensions: { width: 600, depth: 600, height: 50 },
    },
    {
      id: "oven",
      label: "Oven",
      type: "oven",
      position: { x: 2500, y: 100 },
      dimensions: { width: 600, depth: 600, height: 600 },
    },
    {
      id: "fridge",
      label: "Fridge (re-use)",
      type: "fridge",
      position: { x: 3100, y: 100 },
      dimensions: { width: 600, depth: 700, height: 1800 },
      reused: true,
    },

    // --- Left wall run appliances ---
    {
      id: "dishwasher",
      label: "Dishwasher (re-use)",
      type: "dishwasher",
      position: { x: 100, y: 700 },
      dimensions: { width: 600, depth: 600, height: 870 },
      reused: true,
    },
  ],
};
