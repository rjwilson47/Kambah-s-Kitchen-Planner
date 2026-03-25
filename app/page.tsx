"use client";

import { useState, useEffect, useCallback } from "react";
import { KitchenLayout, ChatMessage, SavedKitchen } from "@/lib/types";
import { DEFAULT_KITCHEN } from "@/lib/defaultKitchen";
import {
  loadKitchens,
  saveKitchen,
  deleteKitchen,
  exportKitchen,
  importKitchenFromFile,
  getOrCreateDefault,
} from "@/lib/storage";

import ChatInterface from "./components/ChatInterface";
import FloorPlan2D from "./components/FloorPlan2D";
import FloorPlan3D from "./components/FloorPlan3D";
import KitchenSelector from "./components/KitchenSelector";

type ViewMode = "2d" | "3d";

export default function Home() {
  // --- State ---
  const [kitchens, setKitchens] = useState<SavedKitchen[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [layout, setLayout] = useState<KitchenLayout>(DEFAULT_KITCHEN);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  // --- Initialize from localStorage on mount ---
  useEffect(() => {
    const defaultKitchen = getOrCreateDefault();
    const allKitchens = loadKitchens();
    setKitchens(allKitchens);
    setActiveId(defaultKitchen.id);
    setLayout(defaultKitchen.layout);
    setMessages(defaultKitchen.messages);
  }, []);

  // --- Persist current kitchen whenever layout or messages change ---
  const persistCurrent = useCallback(() => {
    if (!activeId) return;
    const saved = saveKitchen(activeId, layout.name, layout, messages);
    setKitchens(loadKitchens());
    return saved;
  }, [activeId, layout, messages]);

  useEffect(() => {
    if (activeId) persistCurrent();
  }, [layout, messages, activeId, persistCurrent]);

  // --- Send a chat message to the API ---
  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          currentLayout: layout,
        }),
      });

      const data = await res.json();

      if (data.error) {
        const errMsg: ChatMessage = { role: "assistant", content: `Error: ${data.error}` };
        setMessages([...updatedMessages, errMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.explanation || data.raw || "Layout updated.",
          layout: data.layout || undefined,
        };
        setMessages([...updatedMessages, assistantMsg]);

        // Update the floor plan if a valid layout was returned
        if (data.layout) {
          setLayout(data.layout);
        }
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        role: "assistant",
        content: `Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
      setMessages([...updatedMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- Kitchen selector handlers ---
  const handleSelectKitchen = (id: string) => {
    const k = kitchens.find((k) => k.id === id);
    if (!k) return;
    setActiveId(k.id);
    setLayout(k.layout);
    setMessages(k.messages);
  };

  const handleNewKitchen = () => {
    const name = prompt("Kitchen name:", "New Kitchen");
    if (!name) return;
    const newLayout: KitchenLayout = { ...DEFAULT_KITCHEN, name };
    const saved = saveKitchen(null, name, newLayout, []);
    setKitchens(loadKitchens());
    setActiveId(saved.id);
    setLayout(saved.layout);
    setMessages([]);
  };

  const handleDeleteKitchen = (id: string) => {
    deleteKitchen(id);
    const remaining = loadKitchens();
    setKitchens(remaining);
    if (remaining.length > 0) {
      handleSelectKitchen(remaining[0].id);
    } else {
      // Re-create default
      const def = getOrCreateDefault();
      setKitchens(loadKitchens());
      setActiveId(def.id);
      setLayout(def.layout);
      setMessages([]);
    }
  };

  const handleExport = (id: string) => {
    const k = kitchens.find((k) => k.id === id);
    if (k) exportKitchen(k);
  };

  const handleImport = async (file: File) => {
    try {
      const saved = await importKitchenFromFile(file);
      setKitchens(loadKitchens());
      setActiveId(saved.id);
      setLayout(saved.layout);
      setMessages(saved.messages);
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset this kitchen to the default layout? Chat history will be cleared.")) return;
    setLayout(DEFAULT_KITCHEN);
    setMessages([]);
  };

  // --- Render ---
  return (
    <div className="h-screen flex flex-col">
      {/* Header bar */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 flex-wrap bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold whitespace-nowrap">Kambah&apos;s Kitchen Planner</h1>
          <KitchenSelector
            kitchens={kitchens}
            activeId={activeId}
            onSelect={handleSelectKitchen}
            onNew={handleNewKitchen}
            onDelete={handleDeleteKitchen}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "2d" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "3d" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              3D
            </button>
          </div>

          <button
            onClick={handleReset}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600
                       hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main content: floor plan (left) + chat (right), stacks vertically on mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Floor plan panel */}
        <div className="flex-1 p-4 overflow-auto bg-gray-50 flex items-center justify-center min-h-[300px]">
          {viewMode === "2d" ? (
            <FloorPlan2D layout={layout} />
          ) : (
            <FloorPlan3D layout={layout} />
          )}
        </div>

        {/* Chat panel */}
        <div className="w-full md:w-96 lg:w-[28rem] border-t md:border-t-0 md:border-l border-gray-200 flex flex-col min-h-[300px]">
          <ChatInterface messages={messages} onSend={handleSend} loading={loading} />
        </div>
      </div>
    </div>
  );
}
