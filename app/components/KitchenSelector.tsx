"use client";

import { useRef } from "react";
import { SavedKitchen } from "@/lib/types";

interface Props {
  kitchens: SavedKitchen[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onImport: (file: File) => void;
}

export default function KitchenSelector({
  kitchens,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onExport,
  onImport,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ""; // reset so same file can be re-imported
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Kitchen dropdown */}
      <select
        value={activeId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {kitchens.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}
          </option>
        ))}
      </select>

      {/* Action buttons */}
      <button
        onClick={onNew}
        title="New kitchen"
        className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 transition-colors"
      >
        + New
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        title="Import kitchen from JSON file"
        className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 transition-colors"
      >
        Import
      </button>

      {activeId && (
        <>
          <button
            onClick={() => onExport(activeId)}
            title="Export kitchen as JSON"
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Export
          </button>

          <button
            onClick={() => {
              if (confirm("Delete this kitchen?")) onDelete(activeId);
            }}
            title="Delete kitchen"
            className="rounded-md border border-red-300 text-red-600 px-2.5 py-1.5 text-sm
                       hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
