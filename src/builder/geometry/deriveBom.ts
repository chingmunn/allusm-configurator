import { BASE_HEIGHT, CASTER_HEIGHT, STANDARD_DEPTH } from '../model/sizes';
import type { BomSummary, DesignConfig } from '../model/types';

export function deriveBom(design: DesignConfig): BomSummary {
  const baseHeight = design.casterEnabled ? CASTER_HEIGHT : BASE_HEIGHT;
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

  design.bays.forEach((bay) => {
    bay.compartments.forEach((compartment) => {
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

      Object.values(compartment.verticalFrames).forEach((enabled) => {
        if (enabled) {
          verticalCount += 1;
          verticalLength += compartment.height;
        }
      });
    });
  });

  let horizontalCount = 0;
  let horizontalLength = 0;
  let depthCount = 0;
  let depthLength = 0;

  design.bays.forEach((bay) => {
    const planeCount = bay.compartments.length + 1;
    horizontalCount += planeCount * 2;
    horizontalLength += planeCount * 2 * bay.width;

    depthCount += planeCount * 2;
    depthLength += planeCount * 2 * STANDARD_DEPTH;
  });

  return {
    dimensions: {
      width: totalWidth,
      height: totalHeight,
      depth: STANDARD_DEPTH,
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
