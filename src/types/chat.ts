// ─── Chat Panel Types ─────────────────────────────────────────────────────────

export type ChatPanelPosition = "left" | "center" | "right";

export type ChatPanelSize = "max" | "half" | "hidden";

export interface ChatState {
  position: ChatPanelPosition;
  size: ChatPanelSize;
  width: number;
}

export type ChatStore = {
  position: ChatPanelPosition;
  size: ChatPanelSize;
  width: number;

  setPosition: (position: ChatPanelPosition) => void;
  setSize: (size: ChatPanelSize) => void;
  cycleSize: () => void;
  setWidth: (width: number) => void;
};

export const CHAT_DEFAULTS = {
  WIDTH_CENTER: 660,
  WIDTH_EDGE: 410,
  DEFAULT_POSITION: "center" as ChatPanelPosition,
  DEFAULT_SIZE: "max" as ChatPanelSize,
} as const;
