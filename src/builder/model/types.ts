export const WIDTH_PRESETS = [300, 400, 500, 600, 800, 1000] as const;
export const HEIGHT_PRESETS = [200, 300, 400, 500, 600, 800, 1000, 1100, 1200, 1300, 1400, 1500, 1600] as const;
export const STANDARD_DEPTH = 500;

export type WidthPreset = (typeof WIDTH_PRESETS)[number];
export type HeightPreset = (typeof HEIGHT_PRESETS)[number];

export const PANEL_FINISHES = [
  'natural-oak',
  'walnut',
  'blue-stain',
  'red-stain',
  'dark-green',
  'light-grey-metal',
  'dark-metal',
  'clear-glass',
] as const;

export const FRAME_FINISHES = ['raw-aluminium', 'black'] as const;
export const BASE_TYPES = ['fixed', 'casters'] as const;
export const SIDE_PANEL_SIDES = ['left', 'right'] as const;
export const RAIL_FINISHES = ['light-grey-metal', 'dark-metal'] as const;
export const COMPARTMENT_FRAME_KEYS = [
  'frontLeft',
  'frontRight',
  'backLeft',
  'backRight',
  'topFront',
  'topBack',
  'topLeft',
  'topRight',
  'bottomFront',
  'bottomBack',
  'bottomLeft',
  'bottomRight',
] as const;

export type PanelFinish = (typeof PANEL_FINISHES)[number];
export type FrameFinish = (typeof FRAME_FINISHES)[number];
export type BaseType = (typeof BASE_TYPES)[number];
export type SidePanelSide = (typeof SIDE_PANEL_SIDES)[number];
export type RailFinish = (typeof RAIL_FINISHES)[number];
export type CompartmentFrameKey = (typeof COMPARTMENT_FRAME_KEYS)[number];

export type OpenInsert = {
  type: 'open';
};

export type ShelfInsert = {
  type: 'shelf';
  finish: PanelFinish;
};

export type HangerRailInsert = {
  type: 'hanger_rail';
  finish: RailFinish;
};

export type BenchInsert = {
  type: 'bench';
  finish: PanelFinish;
};

export type DrawerInsert = {
  type: 'drawer';
  finish: PanelFinish;
};

export type PrimaryInsertConfig =
  | OpenInsert
  | ShelfInsert
  | HangerRailInsert
  | BenchInsert
  | DrawerInsert;

type PanelSurfaceConfig = {
  finish: PanelFinish;
  pegboard: boolean;
};

export type BackPanelInsert = PanelSurfaceConfig & {
  type: 'back_panel';
};

export type TopPanelInsert = PanelSurfaceConfig & {
  type: 'top_panel';
};

export type BottomPanelInsert = PanelSurfaceConfig & {
  type: 'bottom_panel';
};

export type SidePanelInsert = PanelSurfaceConfig & {
  type: 'side_panel';
  side: SidePanelSide;
};

export type PanelInsertConfig =
  | BackPanelInsert
  | TopPanelInsert
  | BottomPanelInsert
  | SidePanelInsert;
export type InsertConfig = PrimaryInsertConfig | PanelInsertConfig;

export type CompartmentPanels = {
  backPanel: BackPanelInsert | null;
  topPanel: TopPanelInsert | null;
  bottomPanel: BottomPanelInsert | null;
  sidePanels: SidePanelInsert[];
};

export type CompartmentFrameEdges = Record<CompartmentFrameKey, boolean>;

export function createDefaultCompartmentFrameEdges(): CompartmentFrameEdges {
  return {
    frontLeft: true,
    frontRight: true,
    backLeft: true,
    backRight: true,
    topFront: true,
    topBack: true,
    topLeft: true,
    topRight: true,
    bottomFront: true,
    bottomBack: true,
    bottomLeft: true,
    bottomRight: true,
  };
}

export type Compartment = {
  id: string;
  height: HeightPreset;
  primaryInsert: PrimaryInsertConfig;
  panels: CompartmentPanels;
  frameEdges: CompartmentFrameEdges;
};

export type Bay = {
  id: string;
  width: WidthPreset;
  compartments: Compartment[];
};

export type DesignMetadata = {
  createdAt: string;
  updatedAt: string;
};

export type DesignConfig = {
  version: number;
  frameFinish: FrameFinish;
  baseType: BaseType;
  casterEnabled: boolean;
  showHumanReference: boolean;
  bays: Bay[];
  selectedItemId: string | null;
  metadata: DesignMetadata;
};

export type ValidationSeverity = 'error' | 'warning';

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  targetId?: string;
};

export type SelectedKind = 'frame' | 'base' | 'bay' | 'compartment';

export type SelectionInfo =
  | {
      id: 'frame-root';
      kind: 'frame';
      label: string;
    }
  | {
      id: 'base-root';
      kind: 'base';
      label: string;
    }
  | {
      id: string;
      kind: 'bay';
      label: string;
      bay: Bay;
    }
  | {
      id: string;
      kind: 'compartment';
      label: string;
      bay: Bay;
      compartment: Compartment;
      compartmentIndex: number;
    };

export type DesignDimensions = {
  width: number;
  height: number;
  depth: number;
};

export type BoxDescriptor = {
  id: string;
  kind:
    | 'frame'
    | 'bay'
    | 'compartment'
    | 'panel'
    | 'pegboard'
    | 'shelf'
    | 'bench'
    | 'drawer'
    | 'base';
  selectId: string;
  color: string;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  position: [number, number, number];
  size: [number, number, number];
};

export type CylinderDescriptor = {
  id: string;
  kind: 'rail' | 'caster';
  selectId: string;
  color: string;
  position: [number, number, number];
  radius: number;
  height: number;
  rotation: [number, number, number];
};

export type LayoutBay = {
  bayId: string;
  xStart: number;
  width: number;
  height: number;
  compartmentOffsets: number[];
};

export type LayoutResult = {
  dimensions: DesignDimensions;
  bays: LayoutBay[];
  boxes: BoxDescriptor[];
  cylinders: CylinderDescriptor[];
  sceneOffset: [number, number, number];
};

export type BomSummary = {
  dimensions: DesignDimensions;
  totalBays: number;
  totalCompartments: number;
  insertCounts: Record<InsertConfig['type'], number>;
  panelCountsByFinish: Partial<Record<PanelFinish, number>>;
  extrusionSummary: {
    verticalMembers: { count: number; totalLength: number };
    horizontalMembers: { count: number; totalLength: number };
    depthMembers: { count: number; totalLength: number };
  };
};
