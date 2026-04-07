import {
  BASE_HEIGHT,
  CASTER_HEIGHT,
  FRAME_BAR_THICKNESS,
} from '../model/sizes';
import { createDefaultCompartmentFrameEdges } from '../model/types';
import type { BomSummary, CompartmentFrameKey, DesignConfig } from '../model/types';

const VERTICAL_FRAME_KEYS: CompartmentFrameKey[] = [
  'frontLeft',
  'frontRight',
  'backLeft',
  'backRight',
];

const EXTERNAL_BOTTOM_WIDTH_KEYS = ['bottomFront', 'bottomBack'] as const;
const EXTERNAL_BOTTOM_DEPTH_KEYS = ['bottomLeft', 'bottomRight'] as const;
const EXTERNAL_TOP_WIDTH_KEYS = ['topFront', 'topBack'] as const;
const EXTERNAL_TOP_DEPTH_KEYS = ['topLeft', 'topRight'] as const;
const SHARED_WIDTH_KEY_PAIRS = [
  ['topFront', 'bottomFront'],
  ['topBack', 'bottomBack'],
] as const;
const SHARED_DEPTH_KEY_PAIRS = [
  ['topLeft', 'bottomLeft'],
  ['topRight', 'bottomRight'],
] as const;

export function deriveBom(design: DesignConfig): BomSummary {
  const baseHeight = design.casterEnabled ? CASTER_HEIGHT : BASE_HEIGHT;
  const designDepth = design.depth;
  const totalWidth = design.bays.reduce((sum, bay) => sum + bay.width, 0);
  const bodyHeight = Math.max(
    ...design.bays.map((bay) =>
      bay.compartments.reduce((sum, compartment) => sum + compartment.height, 0),
    ),
    0,
  );
  const totalHeight = bodyHeight + baseHeight;
  const totalCompartments = design.bays.reduce(
    (sum, bay) => sum + bay.compartments.length,
    0,
  );

  const insertCounts: BomSummary['insertCounts'] = {
    open: 0,
    back_panel: 0,
    top_panel: 0,
    bottom_panel: 0,
    side_panel: 0,
    shelf: 0,
    hanger_rail: 0,
    bench: 0,
    drawer: 0,
  };

  const panelCountsByFinish: BomSummary['panelCountsByFinish'] = {};
  let verticalCount = 0;
  let verticalLength = 0;
  let horizontalCount = 0;
  let horizontalLength = 0;
  let depthCount = 0;
  let depthLength = 0;

  design.bays.forEach((bay) => {
    bay.compartments.forEach((compartment, compartmentIndex) => {
      const compartmentAbove = bay.compartments[compartmentIndex + 1];
      insertCounts[compartment.primaryInsert.type] += 1;

      if (
        'finish' in compartment.primaryInsert &&
        compartment.primaryInsert.type !== 'hanger_rail'
      ) {
        panelCountsByFinish[compartment.primaryInsert.finish] =
          (panelCountsByFinish[compartment.primaryInsert.finish] ?? 0) + 1;
      }

      if (compartment.panels.backPanel) {
        insertCounts.back_panel += 1;
        panelCountsByFinish[compartment.panels.backPanel.finish] =
          (panelCountsByFinish[compartment.panels.backPanel.finish] ?? 0) + 1;
      }

      if (compartment.panels.topPanel) {
        insertCounts.top_panel += 1;
        panelCountsByFinish[compartment.panels.topPanel.finish] =
          (panelCountsByFinish[compartment.panels.topPanel.finish] ?? 0) + 1;
      }

      if (compartment.panels.bottomPanel) {
        insertCounts.bottom_panel += 1;
        panelCountsByFinish[compartment.panels.bottomPanel.finish] =
          (panelCountsByFinish[compartment.panels.bottomPanel.finish] ?? 0) + 1;
      }

      compartment.panels.sidePanels.forEach((panel) => {
        insertCounts.side_panel += 1;
        panelCountsByFinish[panel.finish] =
          (panelCountsByFinish[panel.finish] ?? 0) + 1;
      });

      const frameEdges = {
        ...createDefaultCompartmentFrameEdges(),
        ...compartment.frameEdges,
      };
      const frameEdgesAbove = compartmentAbove
        ? {
            ...createDefaultCompartmentFrameEdges(),
            ...compartmentAbove.frameEdges,
          }
        : null;

      VERTICAL_FRAME_KEYS.forEach((key) => {
        if (frameEdges[key]) {
          verticalCount += 1;
          verticalLength += compartment.height;
        }
      });

      if (compartmentIndex === 0) {
        EXTERNAL_BOTTOM_WIDTH_KEYS.forEach((key) => {
          if (frameEdges[key]) {
            horizontalCount += 1;
            horizontalLength += bay.width;
          }
        });

        EXTERNAL_BOTTOM_DEPTH_KEYS.forEach((key) => {
          if (frameEdges[key]) {
            depthCount += 1;
            depthLength += designDepth;
          }
        });
      }

      if (compartmentIndex === bay.compartments.length - 1) {
        EXTERNAL_TOP_WIDTH_KEYS.forEach((key) => {
          if (frameEdges[key]) {
            horizontalCount += 1;
            horizontalLength += bay.width;
          }
        });

        EXTERNAL_TOP_DEPTH_KEYS.forEach((key) => {
          if (frameEdges[key]) {
            depthCount += 1;
            depthLength += designDepth;
          }
        });
      }

      if (compartmentAbove && frameEdgesAbove) {
        SHARED_WIDTH_KEY_PAIRS.forEach(([lowerKey, upperKey]) => {
          if (frameEdges[lowerKey] || frameEdgesAbove[upperKey]) {
            horizontalCount += 1;
            horizontalLength += bay.width;
          }
        });

        SHARED_DEPTH_KEY_PAIRS.forEach(([lowerKey, upperKey]) => {
          if (frameEdges[lowerKey] || frameEdgesAbove[upperKey]) {
            depthCount += 1;
            depthLength += designDepth;
          }
        });
      }
    });
  });

  return {
    dimensions: {
      width: totalWidth,
      height: totalHeight,
      depth: designDepth,
    },
    totalBays: design.bays.length,
    totalCompartments,
    insertCounts,
    panelCountsByFinish,
    extrusionSummary: {
      verticalMembers: {
        count: verticalCount,
        totalLength: verticalLength,
      },
      horizontalMembers: {
        count: horizontalCount,
        totalLength: horizontalLength,
      },
      depthMembers: {
        count: depthCount,
        totalLength: depthLength,
      },
    },
  };
}
