"use client";

import { KitchenLayout } from "@/lib/types";

/**
 * Isometric 3D perspective SVG renderer.
 * Colours matched to the real Kambah kitchen (warm oak cabinets, white appliances,
 * cream benchtop, beige tile floor).
 */

// Isometric projection: 30-degree angle
const ISO_ANGLE = Math.PI / 6;
const COS = Math.cos(ISO_ANGLE);
const SIN = Math.sin(ISO_ANGLE);

function isoProject(x: number, y: number, z: number): [number, number] {
  return [(x - y) * COS, (x + y) * SIN - z];
}

// --- Colour palette matched to photos ---

// Warm oak/honey cathedral-style cabinets
const CABINET_COLORS: Record<string, { top: string; front: string; side: string }> = {
  base:   { top: "#e8dcc8", front: "#c49450", side: "#a87830" }, // cream benchtop, oak front
  upper:  { top: "#c49450", front: "#b88840", side: "#9c7030" },
  tall:   { top: "#c49450", front: "#b48040", side: "#986830" },
  corner: { top: "#e8dcc8", front: "#c49450", side: "#a87830" },
  island: { top: "#e8dcc8", front: "#c49450", side: "#a87830" }, // peninsula = benchtop + oak
};

// White appliances (Mitsubishi fridge, Bosch dishwasher, white oven)
const APPLIANCE_COLORS: Record<string, { top: string; front: string; side: string }> = {
  fridge:      { top: "#f8f8f8", front: "#f0f0f0", side: "#e0e0e0" },
  oven:        { top: "#f5f5f5", front: "#f0f0f0", side: "#ddd" },
  cooktop:     { top: "#333", front: "#555", side: "#444" },
  dishwasher:  { top: "#e8dcc8", front: "#f0f0f0", side: "#ddd" }, // benchtop on top
  microwave:   { top: "#eee", front: "#e8e8e8", side: "#d8d8d8" },
  sink:        { top: "#c0c8d0", front: "#c49450", side: "#a87830" }, // steel top, oak cabinet
  other:       { top: "#ddd", front: "#ccc", side: "#bbb" },
};

// Furniture
const FURNITURE_COLORS: Record<string, { top: string; front: string; side: string }> = {
  table: { top: "#f5f2ed", front: "#e8e4dc", side: "#ddd8d0" },   // white table
  stool: { top: "#d4c0a0", front: "#c4b090", side: "#b4a080" },   // tan stools
  chair: { top: "#d4c0a0", front: "#c4b090", side: "#b4a080" },
  other: { top: "#ddd", front: "#ccc", side: "#bbb" },
};

interface Props {
  layout: KitchenLayout;
}

export default function FloorPlan3D({ layout }: Props) {
  const { roomWidth, roomDepth, cabinets, appliances, furniture, doors } = layout;

  const scale = 0.12;
  const s = (v: number) => v * scale;

  // Collect all renderable items, sorted back-to-front for painter's algorithm
  const allItems = [
    ...(furniture || []).map((f) => ({
      ...f,
      kind: "furniture" as const,
      h: f.dimensions.height || 750,
      colors: FURNITURE_COLORS[f.type] || FURNITURE_COLORS.other,
      isOval: f.shape === "oval",
      reused: false,
    })),
    ...cabinets.map((c) => ({
      ...c,
      kind: "cabinet" as const,
      h: c.dimensions.height || 870,
      colors: CABINET_COLORS[c.type] || CABINET_COLORS.base,
      isOval: false,
      reused: false,
    })),
    ...appliances.map((a) => ({
      ...a,
      kind: "appliance" as const,
      h: a.dimensions.height || 870,
      colors: APPLIANCE_COLORS[a.type] || APPLIANCE_COLORS.other,
      isOval: false,
      reused: a.reused || false,
    })),
  ].sort((a, b) => (a.position.x + a.position.y) - (b.position.x + b.position.y));

  // Compute SVG bounds
  const maxZ = 2400;
  const corners = [
    isoProject(s(0), s(0), 0),
    isoProject(s(roomWidth), s(0), 0),
    isoProject(s(0), s(roomDepth), 0),
    isoProject(s(roomWidth), s(roomDepth), 0),
    isoProject(s(0), s(0), s(maxZ)),
    isoProject(s(roomWidth), s(0), s(maxZ)),
  ];
  const minSx = Math.min(...corners.map((c) => c[0])) - 30;
  const maxSx = Math.max(...corners.map((c) => c[0])) + 30;
  const minSy = Math.min(...corners.map((c) => c[1])) - 30;
  const maxSy = Math.max(...corners.map((c) => c[1])) + 30;

  return (
    <svg
      viewBox={`${minSx} ${minSy} ${maxSx - minSx} ${maxSy - minSy}`}
      className="w-full h-full"
      style={{ maxHeight: "100%" }}
    >
      {/* Floor — cream/beige tiles */}
      <IsoFloor width={s(roomWidth)} depth={s(roomDepth)} />

      {/* Back wall (top wall) with door gap */}
      <IsoWallWithOpenings
        direction="back"
        wallLength={s(roomWidth)}
        wallHeight={s(2400)}
        openings={(doors || []).filter((d) => d.wall === "top").map((d) => ({
          offset: s(d.offset), width: s(d.width),
        }))}
      />

      {/* Left wall with window */}
      <IsoWallWithOpenings
        direction="left"
        wallLength={s(roomDepth)}
        wallHeight={s(2400)}
        openings={[]}
      />

      {/* All items */}
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
          reused={item.reused}
        />
      ))}
    </svg>
  );
}

/** Isometric floor quad */
function IsoFloor({ width, depth }: { width: number; depth: number }) {
  const pts = [
    isoProject(0, 0, 0),
    isoProject(width, 0, 0),
    isoProject(width, depth, 0),
    isoProject(0, depth, 0),
  ];
  return (
    <polygon
      points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")}
      fill="#ddd4c4"  // beige tile floor
      stroke="#c8c0b0"
      strokeWidth={0.5}
    />
  );
}

/** Isometric wall with optional door openings rendered as gaps */
function IsoWallWithOpenings({ direction, wallLength, wallHeight, openings }: {
  direction: "back" | "left";
  wallLength: number;
  wallHeight: number;
  openings: { offset: number; width: number }[];
}) {
  // Build solid segments
  const segments: { start: number; length: number }[] = [];
  let pos = 0;
  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  for (const op of sorted) {
    if (op.offset > pos) segments.push({ start: pos, length: op.offset - pos });
    pos = op.offset + op.width;
  }
  if (pos < wallLength) segments.push({ start: pos, length: wallLength - pos });

  return (
    <g>
      {segments.map((seg, i) => {
        let pts: [number, number][];
        if (direction === "back") {
          pts = [
            isoProject(seg.start, 0, 0),
            isoProject(seg.start + seg.length, 0, 0),
            isoProject(seg.start + seg.length, 0, wallHeight),
            isoProject(seg.start, 0, wallHeight),
          ];
        } else {
          pts = [
            isoProject(0, seg.start, 0),
            isoProject(0, seg.start + seg.length, 0),
            isoProject(0, seg.start + seg.length, wallHeight),
            isoProject(0, seg.start, wallHeight),
          ];
        }
        return (
          <polygon
            key={i}
            points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")}
            fill={direction === "back" ? "#e8e0d0" : "#ede8e0"}
            stroke="#c8c0b0"
            strokeWidth={0.5}
            opacity={0.6}
          />
        );
      })}
    </g>
  );
}

/** Isometric box with top, front, and side faces */
function IsoBox({ x, y, z, w, d, h, colors, label, reused }: {
  x: number; y: number; z: number;
  w: number; d: number; h: number;
  colors: { top: string; front: string; side: string };
  label: string;
  reused?: boolean;
}) {
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
  const labelPos = isoProject(x + w / 2, y + d / 2, z + h);
  const strokeStyle = reused
    ? { stroke: "#e67e22", strokeWidth: 1.5, strokeDasharray: "4,2" }
    : { stroke: "#0003", strokeWidth: 0.5 };

  return (
    <g>
      <polygon points={toStr(sideFace)} fill={colors.side} {...strokeStyle} />
      <polygon points={toStr(frontFace)} fill={colors.front} {...strokeStyle} />
      <polygon points={toStr(topFace)} fill={colors.top} {...strokeStyle} />
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
