import { createDefaultDesign } from './defaultDesign';
import {
  BASE_TYPES,
  DEPTH_PRESETS,
  FRAME_FINISHES,
  HEIGHT_PRESETS,
  PANEL_FINISHES,
  RAIL_FINISHES,
  SIDE_PANEL_SIDES,
  WIDTH_PRESETS,
  createDefaultCompartmentFrameEdges,
} from './types';
import type {
  BackPanelInsert,
  BottomPanelInsert,
  BaseType,
  Bay,
  Compartment,
  DepthPreset,
  DesignConfig,
  FrameFinish,
  HeightPreset,
  CompartmentFrameKey,
  PanelFinish,
  PrimaryInsertConfig,
  RailFinish,
  SidePanelInsert,
  SidePanelSide,
  TopPanelInsert,
  WidthPreset,
} from './types';

function parsePegboardFlag(value: unknown): boolean {
  return isBoolean(value) ? value : false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isWidthPreset(value: unknown): value is WidthPreset {
  return WIDTH_PRESETS.includes(value as WidthPreset);
}

function isHeightPreset(value: unknown): value is HeightPreset {
  return HEIGHT_PRESETS.includes(value as HeightPreset);
}

function isDepthPreset(value: unknown): value is DepthPreset {
  return DEPTH_PRESETS.includes(value as DepthPreset);
}

function isFrameFinish(value: unknown): value is FrameFinish {
  return FRAME_FINISHES.includes(value as FrameFinish);
}

function isBaseType(value: unknown): value is BaseType {
  return BASE_TYPES.includes(value as BaseType);
}

function isPanelFinish(value: unknown): value is PanelFinish {
  return PANEL_FINISHES.includes(value as PanelFinish);
}

function isRailFinish(value: unknown): value is RailFinish {
  return RAIL_FINISHES.includes(value as RailFinish);
}

function isSide(value: unknown): value is SidePanelSide {
  return SIDE_PANEL_SIDES.includes(value as SidePanelSide);
}

function parseFrameEdges(value: unknown): Record<CompartmentFrameKey, boolean> {
  const defaults = createDefaultCompartmentFrameEdges();

  if (!isRecord(value)) {
    return defaults;
  }

  return {
    frontLeft: isBoolean(value.frontLeft) ? value.frontLeft : defaults.frontLeft,
    frontRight: isBoolean(value.frontRight)
      ? value.frontRight
      : defaults.frontRight,
    backLeft: isBoolean(value.backLeft) ? value.backLeft : defaults.backLeft,
    backRight: isBoolean(value.backRight) ? value.backRight : defaults.backRight,
    topFront: isBoolean(value.topFront) ? value.topFront : defaults.topFront,
    topBack: isBoolean(value.topBack) ? value.topBack : defaults.topBack,
    topLeft: isBoolean(value.topLeft) ? value.topLeft : defaults.topLeft,
    topRight: isBoolean(value.topRight) ? value.topRight : defaults.topRight,
    bottomFront: isBoolean(value.bottomFront)
      ? value.bottomFront
      : defaults.bottomFront,
    bottomBack: isBoolean(value.bottomBack) ? value.bottomBack : defaults.bottomBack,
    bottomLeft: isBoolean(value.bottomLeft) ? value.bottomLeft : defaults.bottomLeft,
    bottomRight: isBoolean(value.bottomRight)
      ? value.bottomRight
      : defaults.bottomRight,
  };
}

function parsePrimaryInsert(value: unknown): PrimaryInsertConfig {
  if (!isRecord(value) || !isString(value.type)) {
    throw new Error('Each compartment primary insert must include a valid type.');
  }

  switch (value.type) {
    case 'open':
      return { type: 'open' };
    case 'shelf':
      if (!isPanelFinish(value.finish)) {
        throw new Error('Shelves require a valid finish.');
      }
      return { type: 'shelf', finish: value.finish };
    case 'hanger_rail':
      if (!isRailFinish(value.finish)) {
        throw new Error('Hanger rails require a valid metal finish.');
      }
      return { type: 'hanger_rail', finish: value.finish };
    case 'bench':
      if (!isPanelFinish(value.finish)) {
        throw new Error('Bench modules require a valid finish.');
      }
      return { type: 'bench', finish: value.finish };
    case 'drawer':
      if (!isPanelFinish(value.finish)) {
        throw new Error('Drawers require a valid finish.');
      }
      return { type: 'drawer', finish: value.finish };
    default:
      throw new Error(`Unsupported primary insert type: ${value.type}`);
  }
}

function parseBackPanel(value: unknown): BackPanelInsert | null {
  if (value == null) {
    return null;
  }

  if (!isRecord(value) || value.type !== 'back_panel' || !isPanelFinish(value.finish)) {
    throw new Error('Back panels require a valid finish.');
  }

  return {
    type: 'back_panel',
    finish: value.finish,
    pegboard: parsePegboardFlag(value.pegboard),
  };
}

function parseTopPanel(value: unknown): TopPanelInsert | null {
  if (value == null) {
    return null;
  }

  if (!isRecord(value) || value.type !== 'top_panel' || !isPanelFinish(value.finish)) {
    throw new Error('Top panels require a valid finish.');
  }

  return {
    type: 'top_panel',
    finish: value.finish,
    pegboard: parsePegboardFlag(value.pegboard),
  };
}

function parseBottomPanel(value: unknown): BottomPanelInsert | null {
  if (value == null) {
    return null;
  }

  if (
    !isRecord(value) ||
    value.type !== 'bottom_panel' ||
    !isPanelFinish(value.finish)
  ) {
    throw new Error('Bottom panels require a valid finish.');
  }

  return {
    type: 'bottom_panel',
    finish: value.finish,
    pegboard: parsePegboardFlag(value.pegboard),
  };
}

function parseSidePanel(value: unknown): SidePanelInsert {
  if (!isRecord(value) || value.type !== 'side_panel') {
    throw new Error('Side panels must include a valid type.');
  }

  if (!isPanelFinish(value.finish) || !isSide(value.side)) {
    throw new Error('Side panels require a valid finish and side.');
  }

  return {
    type: 'side_panel',
    finish: value.finish,
    pegboard: parsePegboardFlag(value.pegboard),
    side: value.side,
  };
}

function parseLegacyCompartmentInsert(
  value: unknown,
): Pick<Compartment, 'primaryInsert' | 'panels' | 'frameEdges'> {
  if (!isRecord(value) || !isString(value.type)) {
    throw new Error('Each legacy compartment insert must include a valid type.');
  }

  switch (value.type) {
    case 'open':
    case 'shelf':
    case 'hanger_rail':
    case 'bench':
    case 'drawer':
      return {
        primaryInsert: parsePrimaryInsert(value),
        panels: {
          backPanel: null,
          topPanel: null,
          bottomPanel: null,
          sidePanels: [],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    case 'pegboard':
      if (!isPanelFinish(value.finish)) {
        throw new Error('Legacy pegboard panels require a valid finish.');
      }
      return {
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: {
            type: 'back_panel',
            finish: value.finish,
            pegboard: true,
          },
          topPanel: null,
          bottomPanel: null,
          sidePanels: [],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    case 'back_panel':
      return {
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: parseBackPanel(value),
          topPanel: null,
          bottomPanel: null,
          sidePanels: [],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    case 'side_panel':
      return {
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: null,
          topPanel: null,
          bottomPanel: null,
          sidePanels: [parseSidePanel(value)],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    case 'top_panel':
      return {
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: null,
          topPanel: parseTopPanel(value),
          bottomPanel: null,
          sidePanels: [],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    case 'bottom_panel':
      return {
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: null,
          topPanel: null,
          bottomPanel: parseBottomPanel(value),
          sidePanels: [],
        },
        frameEdges: createDefaultCompartmentFrameEdges(),
      };
    default:
      throw new Error(`Unsupported legacy insert type: ${value.type}`);
  }
}

function parseCompartment(value: unknown): Compartment {
  if (!isRecord(value) || !isString(value.id) || !isHeightPreset(value.height)) {
    throw new Error('Each compartment must include an id and valid height.');
  }

  if ('primaryInsert' in value) {
    if (
      isRecord(value.primaryInsert) &&
      value.primaryInsert.type === 'pegboard' &&
      isPanelFinish(value.primaryInsert.finish)
    ) {
      const panelsRecord = isRecord(value.panels) ? value.panels : {};
      const sidePanelValues = Array.isArray(panelsRecord.sidePanels)
        ? panelsRecord.sidePanels.map(parseSidePanel)
        : [];

      return {
        id: value.id,
        height: value.height,
        primaryInsert: { type: 'open' },
        panels: {
          backPanel: {
            type: 'back_panel',
            finish: value.primaryInsert.finish,
            pegboard: true,
          },
          topPanel: parseTopPanel(panelsRecord.topPanel),
          bottomPanel: parseBottomPanel(panelsRecord.bottomPanel),
          sidePanels: sidePanelValues,
        },
        frameEdges: parseFrameEdges(value.frameEdges ?? value.verticalFrames),
      };
    }

    const panelsRecord = isRecord(value.panels) ? value.panels : {};
    const sidePanelValues = Array.isArray(panelsRecord.sidePanels)
      ? panelsRecord.sidePanels.map(parseSidePanel)
      : [];

    return {
      id: value.id,
      height: value.height,
      primaryInsert: parsePrimaryInsert(value.primaryInsert),
      panels: {
        backPanel: parseBackPanel(panelsRecord.backPanel),
        topPanel: parseTopPanel(panelsRecord.topPanel),
        bottomPanel: parseBottomPanel(panelsRecord.bottomPanel),
        sidePanels: sidePanelValues,
      },
      frameEdges: parseFrameEdges(value.frameEdges ?? value.verticalFrames),
    };
  }

  return {
    id: value.id,
    height: value.height,
    ...parseLegacyCompartmentInsert(value.insert),
  };
}

function parseBay(value: unknown): Bay {
  if (!isRecord(value) || !isString(value.id) || !isWidthPreset(value.width)) {
    throw new Error('Each bay must include an id and valid width.');
  }

  if (!Array.isArray(value.compartments)) {
    throw new Error('Each bay must include a compartments array.');
  }

  return {
    id: value.id,
    width: value.width,
    compartments: value.compartments.map(parseCompartment),
  };
}

export function normalizeDesignConfig(input: unknown): DesignConfig {
  if (!isRecord(input)) {
    throw new Error('Configuration must be an object.');
  }

  const fallback = createDefaultDesign();

  if (!Array.isArray(input.bays)) {
    throw new Error('Configuration must include bays.');
  }

  return {
    version: typeof input.version === 'number' ? input.version : fallback.version,
    frameFinish: isFrameFinish(input.frameFinish)
      ? input.frameFinish
      : fallback.frameFinish,
    baseType: isBaseType(input.baseType) ? input.baseType : fallback.baseType,
    casterEnabled: isBoolean(input.casterEnabled)
      ? input.casterEnabled
      : fallback.casterEnabled,
    depth: isDepthPreset(input.depth) ? input.depth : fallback.depth,
    showHumanReference: isBoolean(input.showHumanReference)
      ? input.showHumanReference
      : fallback.showHumanReference,
    bays: input.bays.map(parseBay),
    selectedItemId: isString(input.selectedItemId) ? input.selectedItemId : null,
    metadata:
      isRecord(input.metadata) &&
      isString(input.metadata.createdAt) &&
      isString(input.metadata.updatedAt)
        ? {
            createdAt: input.metadata.createdAt,
            updatedAt: input.metadata.updatedAt,
          }
        : fallback.metadata,
  };
}

export function parseDesignJson(json: string): DesignConfig {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Unable to parse JSON.');
  }

  return normalizeDesignConfig(parsed);
}

export function serializeDesign(design: DesignConfig): string {
  return JSON.stringify(design, null, 2);
}
