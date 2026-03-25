"use client";

import { KitchenLayout } from "@/lib/types";

/**
 * 2D top-down SVG floor plan renderer.
 * Reads a KitchenLayout JSON and draws walls, cabinets, appliances, and dimension lines.
 */

// Color palette for different item types
const CABINET_COLORS: Record<string, string> = {
  base: "#d4a574",
  upper: "#c49464",
  tall: "#b48454",
  corner: "#c49464",
};

const APPLIANCE_COLORS: Record<string, string> = {
  fridge: "#a8c4d4",
  oven: "#888",
  cooktop: "#555",
  dishwasher: "#94b8c8",
  microwave: "#778",
  sink: "#b0c4d8",
  other: "#aaa",
};

interface Props {
  layout: KitchenLayout;
}

export default function FloorPlan2D({ layout }: Props) {
  const { roomWidth, roomDepth, walls, cabinets, appliances } = layout;

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
      {/* Background */}
      <rect x={0} y={0} width={roomWidth} height={roomDepth} fill="#faf8f5" stroke="#ccc" strokeWidth={2} />

      {/* Walls */}
      {walls.map((wall) => {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;

        // Determine wall rect based on orientation
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        const t = wall.thickness;

        let wx: number, wy: number, ww: number, wh: number;
        if (isHorizontal) {
          wx = Math.min(wall.start.x, wall.end.x);
          wy = Math.min(wall.start.y, wall.end.y) - t / 2;
          ww = Math.abs(dx);
          wh = t;
        } else {
          wx = Math.min(wall.start.x, wall.end.x) - t / 2;
          wy = Math.min(wall.start.y, wall.end.y);
          ww = t;
          wh = Math.abs(dy);
        }

        return (
          <rect key={wall.id} x={wx} y={wy} width={ww} height={wh} fill="#666" stroke="#444" strokeWidth={1} />
        );
      })}

      {/* Cabinets */}
      {cabinets.map((cab) => (
        <g key={cab.id}>
          <rect
            x={cab.position.x}
            y={cab.position.y}
            width={cab.dimensions.width}
            height={cab.dimensions.depth}
            fill={cab.color || CABINET_COLORS[cab.type] || "#d4a574"}
            stroke="#8b6914"
            strokeWidth={2}
            rx={4}
          />
          <text
            x={cab.position.x + cab.dimensions.width / 2}
            y={cab.position.y + cab.dimensions.depth / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(cab.dimensions.width, cab.dimensions.depth) * 0.2}
            fill="#4a3000"
            fontFamily="sans-serif"
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
            fill={app.color || APPLIANCE_COLORS[app.type] || "#aaa"}
            stroke={app.reused ? "#e67e22" : "#456"}
            strokeWidth={app.reused ? 3 : 2}
            strokeDasharray={app.reused ? "8,4" : "none"}
            rx={4}
          />
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
      <DimensionLine
        x1={0} y1={-pad / 2}
        x2={roomWidth} y2={-pad / 2}
        label={`${roomWidth}mm`}
      />

      {/* Dimension line — room depth (left) */}
      <DimensionLine
        x1={-pad / 2} y1={0}
        x2={-pad / 2} y2={roomDepth}
        label={`${roomDepth}mm`}
        vertical
      />
    </svg>
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
      {/* Main line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} />

      {vertical ? (
        <>
          {/* Top arrow */}
          <polygon points={`${x1},${y1} ${x1 - arrowSize / 2},${y1 + arrowSize} ${x1 + arrowSize / 2},${y1 + arrowSize}`} />
          {/* Bottom arrow */}
          <polygon points={`${x2},${y2} ${x2 - arrowSize / 2},${y2 - arrowSize} ${x2 + arrowSize / 2},${y2 - arrowSize}`} />
          {/* Tick marks */}
          <line x1={x1 - 20} y1={y1} x2={x1 + 20} y2={y1} />
          <line x1={x2 - 20} y1={y2} x2={x2 + 20} y2={y2} />
          {/* Label */}
          <text
            x={x1}
            y={(y1 + y2) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(-90, ${x1}, ${(y1 + y2) / 2})`}
            fill="#444"
            stroke="none"
          >
            {label}
          </text>
        </>
      ) : (
        <>
          {/* Left arrow */}
          <polygon points={`${x1},${y1} ${x1 + arrowSize},${y1 - arrowSize / 2} ${x1 + arrowSize},${y1 + arrowSize / 2}`} />
          {/* Right arrow */}
          <polygon points={`${x2},${y2} ${x2 - arrowSize},${y2 - arrowSize / 2} ${x2 - arrowSize},${y2 + arrowSize / 2}`} />
          {/* Tick marks */}
          <line x1={x1} y1={y1 - 20} x2={x1} y2={y1 + 20} />
          <line x1={x2} y1={y2 - 20} x2={x2} y2={y2 + 20} />
          {/* Label */}
          <text
            x={(x1 + x2) / 2}
            y={y1 - 30}
            textAnchor="middle"
            dominantBaseline="auto"
            fill="#444"
            stroke="none"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}
