// ─── Canvas Types ─────────────────────────────────────────────────────────────

export type FrameModuleType =
  | "framing-studio"
  | "corpus-triage"
  | "evidence-extractor"
  | "insight-canvas"
  | "research-notebook"
  | "blank";

export interface CanvasFrame {
  id: string;
  module: FrameModuleType;
  title: string;
  /** Absolute position on infinite canvas */
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  /** Which ResearchProject this frame is bound to */
  projectId?: string;
}

export interface CanvasViewport {
  /** Pan offset X in canvas coordinates */
  panX: number;
  /** Pan offset Y in canvas coordinates */
  panY: number;
  /** Zoom level: 1 = 100% */
  zoom: number;
}

export type CanvasStore = {
  frames: CanvasFrame[];
  viewport: CanvasViewport;
  selectedFrameId: string | null;
  maxZIndex: number;

  // Frame actions
  addFrame: (frame: Omit<CanvasFrame, "id" | "zIndex">) => string;
  updateFrame: (id: string, patch: Partial<Omit<CanvasFrame, "id">>) => void;
  removeFrame: (id: string) => void;
  bringToFront: (id: string) => void;
  selectFrame: (id: string | null) => void;
  minimizeFrame: (id: string) => void;

  // Viewport actions
  setViewport: (patch: Partial<CanvasViewport>) => void;
  resetViewport: () => void;
  zoomTo: (zoom: number, centerX?: number, centerY?: number) => void;
};

/** Default canvas constants */
export const CANVAS_DEFAULTS = {
  GRID_SIZE: 100,
  BACKGROUND_COLOR: "#FFF8E7",
  GRID_COLOR: "rgba(0,0,0,0.06)",
  MIN_ZOOM: 0.2,
  MAX_ZOOM: 2.5,
  DEFAULT_FRAME_WIDTH: 600,
  DEFAULT_FRAME_HEIGHT: 480,
  FRAME_MIN_WIDTH: 320,
  FRAME_MIN_HEIGHT: 240,
} as const;
