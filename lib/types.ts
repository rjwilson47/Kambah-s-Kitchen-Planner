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

/** A door or archway opening in a wall */
export interface DoorOpening {
  id: string;
  label: string;
  /** Which wall this opening is on */
  wall: "top" | "bottom" | "left" | "right";
  /** Offset along the wall from its start point (mm) */
  offset: number;
  /** Width of the opening (mm) */
  width: number;
  /** "door", "archway", or "sliding" */
  type: "door" | "archway" | "sliding";
}

/** A window in a wall */
export interface Window {
  id: string;
  label: string;
  wall: "top" | "bottom" | "left" | "right";
  offset: number;  // mm along the wall
  width: number;   // mm
  height: number;  // mm (sill to head)
  sillHeight: number; // mm from floor to sill
}

/** A piece of furniture (table, stools, etc.) */
export interface Furniture {
  id: string;
  label: string;
  type: "table" | "stool" | "chair" | "other";
  position: Position;
  dimensions: Dimensions;
  shape?: "rect" | "oval"; // for rendering
}

export interface Cabinet {
  id: string;
  label: string;
  type: "base" | "upper" | "tall" | "corner" | "island";
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
  doors?: DoorOpening[];
  windows?: Window[];
  furniture?: Furniture[];
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
