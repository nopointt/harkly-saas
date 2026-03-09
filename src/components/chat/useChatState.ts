"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatStore, ChatPanelSize, CHAT_DEFAULTS } from "@/types/chat";

const SIZE_CYCLE: Record<ChatPanelSize, ChatPanelSize> = {
  max: "half",
  half: "hidden",
  hidden: "max",
};

export const useChatState = create<ChatStore>()(
  persist(
    (set) => ({
      position: CHAT_DEFAULTS.DEFAULT_POSITION,
      size: CHAT_DEFAULTS.DEFAULT_SIZE,
      width: CHAT_DEFAULTS.WIDTH_CENTER,

      setPosition: (position) =>
        set({
          position,
          width:
            position === "center"
              ? CHAT_DEFAULTS.WIDTH_CENTER
              : CHAT_DEFAULTS.WIDTH_EDGE,
        }),

      setSize: (size) => set({ size }),

      cycleSize: () =>
        set((state) => ({ size: SIZE_CYCLE[state.size] })),

      setWidth: (width) => set({ width }),
    }),
    {
      name: "harkly-chat",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
