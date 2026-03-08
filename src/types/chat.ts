// ─── Chat Panel Types ─────────────────────────────────────────────────────────

export type ChatPanelPosition = "left" | "center" | "right";

export interface ChatState {
  position: ChatPanelPosition;
  collapsed: boolean;
  width: number;
}

export type ChatStore = {
  position: ChatPanelPosition;
  collapsed: boolean;
  width: number;

  setPosition: (position: ChatPanelPosition) => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setWidth: (width: number) => void;
};

export const CHAT_DEFAULTS = {
  WIDTH: 360,
  MIN_WIDTH: 280,
  MAX_WIDTH: 600,
  DEFAULT_POSITION: "right" as ChatPanelPosition,
} as const;
