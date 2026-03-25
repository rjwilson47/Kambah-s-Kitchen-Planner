/**
 * Core types for the Kitchen Planner app.
 * The KitchenLayout is the structured JSON that Claude produces and the SVG renderers consume.
 */

export interface Position {
  x: number; // mm from left wall
  y: number; // mm from top wall
}

export interface Dimensions {
  width: number;  // mm
  depth: number;  // mm
  height?: number; // mm (for 3D view)
}

export interface Wall {
  id: string;
  label: string;
  start: Position;
  end: Position;
  thickness: number; // mm
}

export interface Cabinet {
  id: string;
  label: string;
  type: "base" | "upper" | "tall" | "corner";
  position: Position;
  dimensions: Dimensions;
  color?: string;
}

export interface Appliance {
  id: string;
  label: string;
  type: "fridge" | "oven" | "cooktop" | "dishwasher" | "microwave" | "sink" | "other";
  position: Position;
  dimensions: Dimensions;
  reused?: boolean; // flag for appliances being re-used
  color?: string;
}

export interface KitchenLayout {
  name: string;
  roomWidth: number;   // mm — total room width
  roomDepth: number;   // mm — total room depth
  walls: Wall[];
  cabinets: Cabinet[];
  appliances: Appliance[];
}

/** A single chat message */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** The layout JSON returned by the assistant (if any) */
  layout?: KitchenLayout;
}

/** A saved kitchen project */
export interface SavedKitchen {
  id: string;
  name: string;
  layout: KitchenLayout;
  messages: ChatMessage[];
  updatedAt: number; // timestamp
}
