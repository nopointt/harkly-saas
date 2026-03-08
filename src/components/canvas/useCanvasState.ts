"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CanvasFrame,
  CanvasStore,
  CanvasViewport,
  CANVAS_DEFAULTS,
} from "@/types/canvas";

const DEFAULT_VIEWPORT: CanvasViewport = {
  panX: 0,
  panY: 0,
  zoom: 1,
};

export const useCanvasState = create<CanvasStore>()(
  persist(
    (set, get) => ({
      frames: [],
      viewport: DEFAULT_VIEWPORT,
      selectedFrameId: null,
      maxZIndex: 0,

      addFrame: (frameData) => {
        const id = crypto.randomUUID();
        const { maxZIndex } = get();
        const zIndex = maxZIndex + 1;
        const frame: CanvasFrame = { id, zIndex, ...frameData };
        set((state) => ({
          frames: [...state.frames, frame],
          maxZIndex: zIndex,
          selectedFrameId: id,
        }));
        return id;
      },

      updateFrame: (id, patch) =>
        set((state) => ({
          frames: state.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      removeFrame: (id) =>
        set((state) => ({
          frames: state.frames.filter((f) => f.id !== id),
          selectedFrameId: state.selectedFrameId === id ? null : state.selectedFrameId,
        })),

      bringToFront: (id) => {
        const { maxZIndex } = get();
        const zIndex = maxZIndex + 1;
        set((state) => ({
          frames: state.frames.map((f) => (f.id === id ? { ...f, zIndex } : f)),
          maxZIndex: zIndex,
        }));
      },

      selectFrame: (id) => set({ selectedFrameId: id }),

      minimizeFrame: (id) =>
        set((state) => ({
          frames: state.frames.map((f) =>
            f.id === id ? { ...f, minimized: !f.minimized } : f
          ),
        })),

      setViewport: (patch) =>
        set((state) => ({
          viewport: { ...state.viewport, ...patch },
        })),

      resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

      zoomTo: (zoom, centerX = 0, centerY = 0) => {
        const clamped = Math.min(
          CANVAS_DEFAULTS.MAX_ZOOM,
          Math.max(CANVAS_DEFAULTS.MIN_ZOOM, zoom)
        );
        set((state) => {
          const scale = clamped / state.viewport.zoom;
          return {
            viewport: {
              zoom: clamped,
              panX: centerX - (centerX - state.viewport.panX) * scale,
              panY: centerY - (centerY - state.viewport.panY) * scale,
            },
          };
        });
      },
    }),
    {
      name: "harkly-canvas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
