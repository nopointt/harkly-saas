"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatStore, CHAT_DEFAULTS } from "@/types/chat";

export const useChatState = create<ChatStore>()(
  persist(
    (set) => ({
      position: CHAT_DEFAULTS.DEFAULT_POSITION,
      collapsed: false,
      width: CHAT_DEFAULTS.WIDTH,

      setPosition: (position) => set({ position }),
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setWidth: (width) =>
        set({
          width: Math.min(
            CHAT_DEFAULTS.MAX_WIDTH,
            Math.max(CHAT_DEFAULTS.MIN_WIDTH, width)
          ),
        }),
    }),
    {
      name: "harkly-chat",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
