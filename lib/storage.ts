import { SavedKitchen, KitchenLayout, ChatMessage } from "./types";
import { DEFAULT_KITCHEN } from "./defaultKitchen";

const STORAGE_KEY = "kambah-kitchens";

/** Generate a simple unique ID */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Load all saved kitchens from localStorage */
export function loadKitchens(): SavedKitchen[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save the full list of kitchens to localStorage */
function persist(kitchens: SavedKitchen[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kitchens));
}

/** Save or update a kitchen project */
export function saveKitchen(
  id: string | null,
  name: string,
  layout: KitchenLayout,
  messages: ChatMessage[]
): SavedKitchen {
  const kitchens = loadKitchens();
  const now = Date.now();

  if (id) {
    const idx = kitchens.findIndex((k) => k.id === id);
    if (idx >= 0) {
      kitchens[idx] = { ...kitchens[idx], name, layout, messages, updatedAt: now };
      persist(kitchens);
      return kitchens[idx];
    }
  }

  // Create new
  const saved: SavedKitchen = { id: uid(), name, layout, messages, updatedAt: now };
  kitchens.push(saved);
  persist(kitchens);
  return saved;
}

/** Delete a kitchen by ID */
export function deleteKitchen(id: string) {
  const kitchens = loadKitchens().filter((k) => k.id !== id);
  persist(kitchens);
}

/** Export a kitchen as a downloadable JSON file */
export function exportKitchen(kitchen: SavedKitchen) {
  const blob = new Blob([JSON.stringify(kitchen, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${kitchen.name.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import a kitchen from a JSON file — returns the parsed SavedKitchen */
export function importKitchenFromFile(file: File): Promise<SavedKitchen> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        // Accept either a full SavedKitchen or just a KitchenLayout
        if (data.layout && data.messages) {
          // Full SavedKitchen — give it a new ID to avoid collisions
          const saved: SavedKitchen = {
            ...data,
            id: uid(),
            updatedAt: Date.now(),
          };
          const kitchens = loadKitchens();
          kitchens.push(saved);
          persist(kitchens);
          resolve(saved);
        } else if (data.roomWidth && data.walls) {
          // Just a KitchenLayout
          const saved = saveKitchen(null, data.name || "Imported Kitchen", data as KitchenLayout, []);
          resolve(saved);
        } else {
          reject(new Error("Invalid kitchen file format"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** Get or create the default Kambah kitchen */
export function getOrCreateDefault(): SavedKitchen {
  const kitchens = loadKitchens();
  const existing = kitchens.find((k) => k.name === "Kambah Kitchen");
  if (existing) return existing;
  return saveKitchen(null, "Kambah Kitchen", DEFAULT_KITCHEN, []);
}
