"use client";

import { KitchenLayout } from "@/lib/types";

/**
 * Isometric 3D perspective SVG renderer.
 * Draws cabinets and appliances as isometric boxes to give a sense of depth.
 */

// Isometric projection helpers
// We use a simple 30-degree isometric: x-axis goes right-down, y-axis goes left-down, z goes up
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const COS = Math.cos(ISO_ANGLE);
const SIN = Math.sin(ISO_ANGLE);

function isoProject(x: number, y: number, z: number): [number, number] {
  const sx = (x - y) * COS;
  const sy = (x + y) * SIN - z;
  return [sx, sy];
}

const CABINET_COLORS: Record<string, { top: string; front: string; side: string }> = {
  base:   { top: "#e6c9a0", front: "#c89860", side: "#b48040" },
  upper:  { top: "#d8b888", front: "#b88848", side: "#a07038" },
  tall:   { top: "#d0b080", front: "#b08040", side: "#986830" },
  corner: { top: "#d8b888", front: "#b88848", side: "#a07038" },
};

const APPLIANCE_COLORS: Record<string, { top: string; front: string; side: string }> = {
  fridge:      { top: "#c8dce8", front: "#9ec0d4", side: "#80a8bc" },
  oven:        { top: "#aaa", front: "#888", side: "#666" },
  cooktop:     { top: "#444", front: "#555", side: "#333" },
  dishwasher:  { top: "#b8d0dc", front: "#90b0c4", side: "#7898ac" },
  microwave:   { top: "#99a", front: "#778", side: "#667" },
  sink:        { top: "#c0d4e0", front: "#a0b8cc", side: "#88a0b4" },
  other:       { top: "#bbb", front: "#999", side: "#777" },
};

interface Props {
  layout: KitchenLayout;
}

export default function FloorPlan3D({ layout }: Props) {
  const { roomWidth, roomDepth, cabinets, appliances } = layout;

  // Scale factor to keep things manageable
  const scale = 0.12;
  const s = (v: number) => v * scale;

  // Get all items sorted by depth (back to front) for correct painter's algorithm
  const allItems = [
    ...cabinets.map((c) => ({
      ...c,
      kind: "cabinet" as const,
      h: c.dimensions.height || 870,
      colors: CABINET_COLORS[c.type] || CABINET_COLORS.base,
    })),
    ...appliances.map((a) => ({
      ...a,
      kind: "appliance" as const,
      h: a.dimensions.height || 870,
      colors: APPLIANCE_COLORS[a.type] || APPLIANCE_COLORS.other,
    })),
  ].sort((a, b) => {
    // Sort: items further back (smaller y then smaller x) render first
    const da = a.position.x + a.position.y;
    const db = b.position.x + b.position.y;
    return da - db;
  });

  // Compute SVG bounds
  const maxX = roomWidth;
  const maxY = roomDepth;
  const maxZ = 2200; // tallest possible item

  // Get corner points of the bounding volume
  const corners = [
    isoProject(s(0), s(0), 0),
    isoProject(s(maxX), s(0), 0),
    isoProject(s(0), s(maxY), 0),
    isoProject(s(maxX), s(maxY), 0),
    isoProject(s(0), s(0), s(maxZ)),
    isoProject(s(maxX), s(0), s(maxZ)),
  ];
  const minSx = Math.min(...corners.map((c) => c[0])) - 30;
  const maxSx = Math.max(...corners.map((c) => c[0])) + 30;
  const minSy = Math.min(...corners.map((c) => c[1])) - 30;
  const maxSy = Math.max(...corners.map((c) => c[1])) + 30;
  const vbW = maxSx - minSx;
  const vbH = maxSy - minSy;

  return (
    <svg viewBox={`${minSx} ${minSy} ${vbW} ${vbH}`} className="w-full h-full" style={{ maxHeight: "100%" }}>
      {/* Floor */}
      <IsoFloor width={s(roomWidth)} depth={s(roomDepth)} />

      {/* Back walls (top wall and left wall) for context */}
      <IsoWall
        x={0} y={0} z={0}
        w={s(roomWidth)} h={s(2400)}
        direction="back"
      />
      <IsoWall
        x={0} y={0} z={0}
        w={s(roomDepth)} h={s(2400)}
        direction="left"
      />

      {/* Items */}
      {allItems.map((item) => (
        <IsoBox
          key={item.id}
          x={s(item.position.x)}
          y={s(item.position.y)}
          z={0}
          w={s(item.dimensions.width)}
          d={s(item.dimensions.depth)}
          h={s(item.h)}
          colors={item.colors}
          label={item.label}
          reused={"reused" in item && item.reused === true}
        />
      ))}
    </svg>
  );
}

/** Isometric floor quad */
function IsoFloor({ width, depth }: { width: number; depth: number }) {
  const [x0, y0] = isoProject(0, 0, 0);
  const [x1, y1] = isoProject(width, 0, 0);
  const [x2, y2] = isoProject(width, depth, 0);
  const [x3, y3] = isoProject(0, depth, 0);

  return (
    <polygon
      points={`${x0},${y0} ${x1},${y1} ${x2},${y2} ${x3},${y3}`}
      fill="#f0ece4"
      stroke="#ccc"
      strokeWidth={0.5}
    />
  );
}

/** Isometric wall (back or left) */
function IsoWall({ x, y, z, w, h, direction }: {
  x: number; y: number; z: number; w: number; h: number; direction: "back" | "left";
}) {
  let pts: [number, number][];

  if (direction === "back") {
    pts = [
      isoProject(x, y, z),
      isoProject(x + w, y, z),
      isoProject(x + w, y, z + h),
      isoProject(x, y, z + h),
    ];
  } else {
    pts = [
      isoProject(x, y, z),
      isoProject(x, y + w, z),
      isoProject(x, y + w, z + h),
      isoProject(x, y, z + h),
    ];
  }

  return (
    <polygon
      points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")}
      fill="#e8e4dc"
      stroke="#bbb"
      strokeWidth={0.5}
      opacity={0.6}
    />
  );
}

/** A single isometric box with top, front, and side faces */
function IsoBox({ x, y, z, w, d, h, colors, label, reused }: {
  x: number; y: number; z: number;
  w: number; d: number; h: number;
  colors: { top: string; front: string; side: string };
  label: string;
  reused?: boolean;
}) {
  // 8 corners of the box
  const topFace = [
    isoProject(x, y, z + h),
    isoProject(x + w, y, z + h),
    isoProject(x + w, y + d, z + h),
    isoProject(x, y + d, z + h),
  ];

  const frontFace = [
    isoProject(x, y + d, z),
    isoProject(x + w, y + d, z),
    isoProject(x + w, y + d, z + h),
    isoProject(x, y + d, z + h),
  ];

  const sideFace = [
    isoProject(x + w, y, z),
    isoProject(x + w, y + d, z),
    isoProject(x + w, y + d, z + h),
    isoProject(x + w, y, z + h),
  ];

  const toStr = (pts: [number, number][]) => pts.map((p) => `${p[0]},${p[1]}`).join(" ");

  // Label position — center of top face
  const labelPos = isoProject(x + w / 2, y + d / 2, z + h);

  const strokeStyle = reused ? { stroke: "#e67e22", strokeWidth: 1.5, strokeDasharray: "4,2" } : { stroke: "#0003", strokeWidth: 0.5 };

  return (
    <g>
      {/* Side face (right) */}
      <polygon points={toStr(sideFace)} fill={colors.side} {...strokeStyle} />
      {/* Front face */}
      <polygon points={toStr(frontFace)} fill={colors.front} {...strokeStyle} />
      {/* Top face */}
      <polygon points={toStr(topFace)} fill={colors.top} {...strokeStyle} />
      {/* Label */}
      <text
        x={labelPos[0]}
        y={labelPos[1] - 2}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={Math.min(w, d) * 0.28}
        fill="#333"
        fontFamily="sans-serif"
        fontWeight="500"
      >
        {label}
      </text>
    </g>
  );
}
