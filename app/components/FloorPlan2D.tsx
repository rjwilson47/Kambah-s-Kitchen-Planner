"use client";

import { KitchenLayout, DoorOpening, Window as KitchenWindow } from "@/lib/types";

/**
 * 2D top-down SVG floor plan renderer.
 * Draws walls (with door/window openings), cabinets, appliances,
 * furniture, and dimension lines.
 */

// --- Colour palette (matched to Kambah kitchen photos) ---

// Warm oak/honey cabinets
const CABINET_COLORS: Record<string, string> = {
  base: "#c49450",   // oak cabinet
  upper: "#b88840",  // slightly darker oak
  tall: "#b48040",   // tall units
  corner: "#c49450",
  island: "#c49450", // peninsula same as base
};

// Appliances are white in this kitchen
const APPLIANCE_COLORS: Record<string, string> = {
  fridge: "#f0f0f0",
  oven: "#f0f0f0",
  cooktop: "#555",
  dishwasher: "#f0f0f0",
  microwave: "#e8e8e8",
  sink: "#c0c8d0",     // stainless steel
  other: "#ddd",
};

const FURNITURE_COLORS: Record<string, string> = {
  table: "#f5f2ed",    // white table
  stool: "#d4c4a8",    // tan/beige stools
  chair: "#d4c4a8",
  other: "#ddd",
};

interface Props {
  layout: KitchenLayout;
}

export default function FloorPlan2D({ layout }: Props) {
  const { roomWidth, roomDepth, walls, cabinets, appliances, doors, windows, furniture } = layout;

  // SVG viewBox with padding for dimension lines
  const pad = 300;
  const vbW = roomWidth + pad * 2;
  const vbH = roomDepth + pad * 2;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`}
      className="w-full h-full"
      style={{ maxHeight: "100%" }}
    >
      {/* Floor */}
      <rect x={0} y={0} width={roomWidth} height={roomDepth} fill="#e8e0d0" stroke="#bbb" strokeWidth={2} />

      {/* Walls — draw as segments with gaps for doors */}
      {walls.map((wall) => {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;

        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        const t = wall.thickness;

        // Find doors on this wall
        const wallSide = getWallSide(wall.id);
        const wallDoors = (doors || []).filter((d) => d.wall === wallSide);
        const wallWindows = (windows || []).filter((w) => w.wall === wallSide);

        // Build segments (solid wall sections between openings)
        const openings = [
          ...wallDoors.map((d) => ({ offset: d.offset, width: d.width, type: "door" as const })),
          // Windows don't create gaps in 2D floor plan walls (they're above floor)
        ].sort((a, b) => a.offset - b.offset);

        const segments = getWallSegments(len, openings);

        return (
          <g key={wall.id}>
            {segments.map((seg, i) => {
              let wx: number, wy: number, ww: number, wh: number;
              if (isHorizontal) {
                const dir = dx > 0 ? 1 : -1;
                wx = wall.start.x + seg.start * dir;
                wy = wall.start.y - t / 2;
                ww = seg.length;
                wh = t;
                if (dir < 0) wx = wall.start.x - seg.start - seg.length;
              } else {
                const dir = dy > 0 ? 1 : -1;
                wx = wall.start.x - t / 2;
                wy = wall.start.y + seg.start * dir;
                ww = t;
                wh = seg.length;
                if (dir < 0) wy = wall.start.y - seg.start - seg.length;
              }
              return (
                <rect key={i} x={wx} y={wy} width={ww} height={wh} fill="#666" stroke="#444" strokeWidth={1} />
              );
            })}

            {/* Draw door swing arcs for regular doors */}
            {wallDoors.map((door) => (
              <DoorArc key={door.id} door={door} wall={wall} roomWidth={roomWidth} roomDepth={roomDepth} />
            ))}

            {/* Draw window indicators (dashed line on wall) */}
            {wallWindows.map((win) => (
              <WindowMark key={win.id} window={win} wall={wall} roomWidth={roomWidth} roomDepth={roomDepth} />
            ))}
          </g>
        );
      })}

      {/* Furniture (draw behind cabinets/appliances) */}
      {(furniture || []).map((item) => (
        <g key={item.id}>
          {item.shape === "oval" ? (
            <ellipse
              cx={item.position.x + item.dimensions.width / 2}
              cy={item.position.y + item.dimensions.depth / 2}
              rx={item.dimensions.width / 2}
              ry={item.dimensions.depth / 2}
              fill={FURNITURE_COLORS[item.type] || "#ddd"}
              stroke="#bbb"
              strokeWidth={2}
            />
          ) : (
            <rect
              x={item.position.x}
              y={item.position.y}
              width={item.dimensions.width}
              height={item.dimensions.depth}
              fill={FURNITURE_COLORS[item.type] || "#ddd"}
              stroke="#bbb"
              strokeWidth={2}
              rx={item.type === "stool" ? item.dimensions.width / 2 : 4}
            />
          )}
          <text
            x={item.position.x + item.dimensions.width / 2}
            y={item.position.y + item.dimensions.depth / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(item.dimensions.width, item.dimensions.depth) * 0.2}
            fill="#888"
            fontFamily="sans-serif"
          >
            {item.label}
          </text>
        </g>
      ))}

      {/* Cabinets */}
      {cabinets.map((cab) => (
        <g key={cab.id}>
          <rect
            x={cab.position.x}
            y={cab.position.y}
            width={cab.dimensions.width}
            height={cab.dimensions.depth}
            fill={cab.color || CABINET_COLORS[cab.type] || "#c49450"}
            stroke="#8b6914"
            strokeWidth={2}
            rx={4}
          />
          <text
            x={cab.position.x + cab.dimensions.width / 2}
            y={cab.position.y + cab.dimensions.depth / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(cab.dimensions.width, cab.dimensions.depth) * 0.18}
            fill="#3a2000"
            fontFamily="sans-serif"
            fontWeight="500"
          >
            {cab.label}
          </text>
        </g>
      ))}

      {/* Appliances */}
      {appliances.map((app) => (
        <g key={app.id}>
          <rect
            x={app.position.x}
            y={app.position.y}
            width={app.dimensions.width}
            height={app.dimensions.depth}
            fill={app.color || APPLIANCE_COLORS[app.type] || "#ddd"}
            stroke={app.reused ? "#e67e22" : "#789"}
            strokeWidth={app.reused ? 3 : 2}
            strokeDasharray={app.reused ? "8,4" : "none"}
            rx={4}
          />
          {/* Sink detail: draw basin outline */}
          {app.type === "sink" && (
            <>
              <rect
                x={app.position.x + 20}
                y={app.position.y + 20}
                width={app.dimensions.width * 0.55}
                height={app.dimensions.depth - 40}
                fill="none"
                stroke="#8899aa"
                strokeWidth={2}
                rx={8}
              />
              <rect
                x={app.position.x + app.dimensions.width * 0.55 + 30}
                y={app.position.y + 30}
                width={app.dimensions.width * 0.3}
                height={app.dimensions.depth - 60}
                fill="none"
                stroke="#8899aa"
                strokeWidth={2}
                rx={6}
              />
            </>
          )}
          <text
            x={app.position.x + app.dimensions.width / 2}
            y={app.position.y + app.dimensions.depth / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(app.dimensions.width, app.dimensions.depth) * 0.18}
            fill="#1a2a3a"
            fontFamily="sans-serif"
          >
            {app.label}
          </text>
        </g>
      ))}

      {/* Dimension line — room width (top) */}
      <DimensionLine x1={0} y1={-pad / 2} x2={roomWidth} y2={-pad / 2} label={`${roomWidth}mm`} />

      {/* Dimension line — room depth (left) */}
      <DimensionLine x1={-pad / 2} y1={0} x2={-pad / 2} y2={roomDepth} label={`${roomDepth}mm`} vertical />
    </svg>
  );
}

// --- Helper: map wall ID to a side name ---
function getWallSide(wallId: string): string {
  if (wallId.includes("top")) return "top";
  if (wallId.includes("bottom")) return "bottom";
  if (wallId.includes("left")) return "left";
  if (wallId.includes("right")) return "right";
  return "";
}

// --- Helper: split a wall into solid segments around door openings ---
function getWallSegments(
  wallLength: number,
  openings: { offset: number; width: number }[]
): { start: number; length: number }[] {
  const segments: { start: number; length: number }[] = [];
  let pos = 0;
  for (const op of openings) {
    if (op.offset > pos) {
      segments.push({ start: pos, length: op.offset - pos });
    }
    pos = op.offset + op.width;
  }
  if (pos < wallLength) {
    segments.push({ start: pos, length: wallLength - pos });
  }
  return segments;
}

// --- Door arc indicator ---
function DoorArc({ door, wall, roomWidth, roomDepth }: {
  door: DoorOpening;
  wall: { id: string; start: { x: number; y: number }; end: { x: number; y: number }; thickness: number };
  roomWidth: number;
  roomDepth: number;
}) {
  const side = getWallSide(wall.id);
  const r = door.width * 0.4; // arc radius

  let cx: number, cy: number;
  let startAngle: number, endAngle: number;

  if (side === "top") {
    cx = door.offset;
    cy = 0;
    startAngle = 0;
    endAngle = Math.PI / 2;
  } else if (side === "bottom") {
    cx = door.offset;
    cy = roomDepth;
    startAngle = -Math.PI / 2;
    endAngle = 0;
  } else if (side === "left") {
    cx = 0;
    cy = door.offset;
    startAngle = -Math.PI / 2;
    endAngle = 0;
  } else {
    cx = roomWidth;
    cy = door.offset;
    startAngle = Math.PI / 2;
    endAngle = Math.PI;
  }

  if (door.type === "sliding") {
    // Sliding doors: draw arrows instead of arc
    if (side === "top" || side === "bottom") {
      const y = cy;
      return (
        <g>
          <line x1={door.offset} y1={y - 15} x2={door.offset + door.width} y2={y - 15}
                stroke="#4488aa" strokeWidth={3} strokeDasharray="12,6" />
          <line x1={door.offset} y1={y + 15} x2={door.offset + door.width} y2={y + 15}
                stroke="#4488aa" strokeWidth={3} strokeDasharray="12,6" />
        </g>
      );
    }
    const x = cx;
    return (
      <g>
        <line x1={x - 15} y1={door.offset} x2={x - 15} y2={door.offset + door.width}
              stroke="#4488aa" strokeWidth={3} strokeDasharray="12,6" />
        <line x1={x + 15} y1={door.offset} x2={x + 15} y2={door.offset + door.width}
              stroke="#4488aa" strokeWidth={3} strokeDasharray="12,6" />
      </g>
    );
  }

  // Regular door: draw a quarter-circle arc
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return (
    <path
      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
      fill="none"
      stroke="#4488aa"
      strokeWidth={2}
      strokeDasharray="6,4"
    />
  );
}

// --- Window mark on wall (shows as a triple-line symbol) ---
function WindowMark({ window: win, wall, roomWidth, roomDepth }: {
  window: { id: string; wall: string; offset: number; width: number };
  wall: { id: string; start: { x: number; y: number }; end: { x: number; y: number } };
  roomWidth: number;
  roomDepth: number;
}) {
  const side = getWallSide(wall.id);
  const inset = 15;

  let x1: number, y1: number, x2: number, y2: number;

  if (side === "top") {
    x1 = win.offset; y1 = -inset; x2 = win.offset + win.width; y2 = -inset;
  } else if (side === "bottom") {
    x1 = win.offset; y1 = roomDepth + inset; x2 = win.offset + win.width; y2 = roomDepth + inset;
  } else if (side === "left") {
    x1 = -inset; y1 = win.offset; x2 = -inset; y2 = win.offset + win.width;
  } else {
    x1 = roomWidth + inset; y1 = win.offset; x2 = roomWidth + inset; y2 = win.offset + win.width;
  }

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#58a0d0" strokeWidth={6} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a0d4f0" strokeWidth={3} />
    </g>
  );
}

/** Draws a dimension line with arrows and a centered label */
function DimensionLine({
  x1, y1, x2, y2, label, vertical = false,
}: {
  x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean;
}) {
  const arrowSize = 30;

  return (
    <g stroke="#666" strokeWidth={1.5} fill="#666" fontSize={60} fontFamily="sans-serif">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />

      {vertical ? (
        <>
          <polygon points={`${x1},${y1} ${x1 - arrowSize / 2},${y1 + arrowSize} ${x1 + arrowSize / 2},${y1 + arrowSize}`} />
          <polygon points={`${x2},${y2} ${x2 - arrowSize / 2},${y2 - arrowSize} ${x2 + arrowSize / 2},${y2 - arrowSize}`} />
          <line x1={x1 - 20} y1={y1} x2={x1 + 20} y2={y1} />
          <line x1={x2 - 20} y1={y2} x2={x2 + 20} y2={y2} />
          <text
            x={x1} y={(y1 + y2) / 2}
            textAnchor="middle" dominantBaseline="central"
            transform={`rotate(-90, ${x1}, ${(y1 + y2) / 2})`}
            fill="#444" stroke="none"
          >
            {label}
          </text>
        </>
      ) : (
        <>
          <polygon points={`${x1},${y1} ${x1 + arrowSize},${y1 - arrowSize / 2} ${x1 + arrowSize},${y1 + arrowSize / 2}`} />
          <polygon points={`${x2},${y2} ${x2 - arrowSize},${y2 - arrowSize / 2} ${x2 - arrowSize},${y2 + arrowSize / 2}`} />
          <line x1={x1} y1={y1 - 20} x2={x1} y2={y1 + 20} />
          <line x1={x2} y1={y2 - 20} x2={x2} y2={y2 + 20} />
          <text
            x={(x1 + x2) / 2} y={y1 - 30}
            textAnchor="middle" dominantBaseline="auto"
            fill="#444" stroke="none"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}
