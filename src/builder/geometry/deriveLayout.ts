import { BASE_ROOT_ID, FRAME_ROOT_ID } from '../model/defaultDesign';
import {
  frameFinishColors,
  panelFinishMaterials,
  railFinishColors,
} from '../model/finishes';
import {
  BASE_HEIGHT,
  CASTER_HEIGHT,
  CASTER_RADIUS,
  DRAWER_FACE_THICKNESS,
  FRAME_BAR_THICKNESS,
  PANEL_THICKNESS,
  RAIL_RADIUS,
  SHELF_THICKNESS,
} from '../model/sizes';
import type {
  BoxDescriptor,
  CompartmentFrameKey,
  CylinderDescriptor,
  DesignConfig,
  LayoutBay,
  LayoutResult,
} from '../model/types';
import { createDefaultCompartmentFrameEdges } from '../model/types';

const SHARED_HORIZONTAL_FRAME_MAPPINGS = [
  {
    lowerKey: 'topFront',
    upperKey: 'bottomFront',
    idSuffix: 'shared-front',
    axis: 'width',
    zSide: 'front',
  },
  {
    lowerKey: 'topBack',
    upperKey: 'bottomBack',
    idSuffix: 'shared-back',
    axis: 'width',
    zSide: 'back',
  },
  {
    lowerKey: 'topLeft',
    upperKey: 'bottomLeft',
    idSuffix: 'shared-left',
    axis: 'depth',
    xOffset: 0,
  },
  {
    lowerKey: 'topRight',
    upperKey: 'bottomRight',
    idSuffix: 'shared-right',
    axis: 'depth',
    xOffset: 1,
  },
] as const satisfies ReadonlyArray<{
  lowerKey: CompartmentFrameKey;
  upperKey: CompartmentFrameKey;
  idSuffix: string;
  axis: 'width' | 'depth';
  zSide?: 'front' | 'back';
  xOffset?: 0 | 1;
}>;

function getBaseHeight(design: DesignConfig): number {
  return design.casterEnabled ? CASTER_HEIGHT : BASE_HEIGHT;
}

function pushFrameBox(
  boxes: BoxDescriptor[],
  design: DesignConfig,
  id: string,
  position: [number, number, number],
  size: [number, number, number],
  selectId = FRAME_ROOT_ID,
) {
  boxes.push({
    id,
    kind: 'frame',
    selectId,
    color: frameFinishColors[design.frameFinish],
    position,
    size,
  });
}

function getPanelMaterialProps(finish: keyof typeof panelFinishMaterials) {
  const material = panelFinishMaterials[finish];

  return {
    color: material.color,
    opacity: material.opacity,
    roughness: material.roughness,
    metalness: material.metalness,
    transmission: material.transmission,
  };
}

export function deriveLayout(design: DesignConfig): LayoutResult {
  const baseHeight = getBaseHeight(design);
  const designDepth = design.depth;
  const overallWidth = design.bays.reduce((sum, bay) => sum + bay.width, 0);
  const overallBodyHeight = Math.max(
    ...design.bays.map((bay) =>
      bay.compartments.reduce((sum, compartment) => sum + compartment.height, 0),
    ),
    0,
  );
  const overallHeight = overallBodyHeight + baseHeight;
  const dimensions = {
    width: overallWidth,
    height: overallHeight,
    depth: designDepth,
  };

  const layoutBays: LayoutBay[] = [];
  let xCursor = 0;
  for (const bay of design.bays) {
    let yOffset = baseHeight;
    const offsets: number[] = [];
    for (const compartment of bay.compartments) {
      offsets.push(yOffset);
      yOffset += compartment.height;
    }

    layoutBays.push({
      bayId: bay.id,
      xStart: xCursor,
      width: bay.width,
      height: yOffset - baseHeight,
      compartmentOffsets: offsets,
    });
    xCursor += bay.width;
  }

  const boxes: BoxDescriptor[] = [];
  const cylinders: CylinderDescriptor[] = [];

  layoutBays.forEach((layoutBay, bayIndex) => {
    const bay = design.bays[bayIndex];
    bay.compartments.forEach((compartment, compartmentIndex) => {
      const compartmentAbove = bay.compartments[compartmentIndex + 1];
      const bottomY = layoutBay.compartmentOffsets[compartmentIndex];
      const height = compartment.height;
      const centerY = bottomY + height / 2;
      const centerX = layoutBay.xStart + layoutBay.width / 2;
      const topEdgeY = bottomY + height - FRAME_BAR_THICKNESS / 2;
      const bottomEdgeY = bottomY + FRAME_BAR_THICKNESS / 2;
      const innerWidth = Math.max(layoutBay.width - FRAME_BAR_THICKNESS * 2, 20);
      const innerDepth = Math.max(designDepth - FRAME_BAR_THICKNESS * 2, 20);
      const innerHeight = Math.max(height - FRAME_BAR_THICKNESS * 2, 20);
      const verticalFrameHeight = height;
      const hangerRailY = bottomY + Math.max(height - 100, RAIL_RADIUS * 2);
      const hangerRailSpan = innerWidth * 0.8;
      const hangerRodTopY = bottomY + height - FRAME_BAR_THICKNESS / 2;
      const hangerRodLength = Math.max(hangerRodTopY - hangerRailY, 20);
      const hangerRodCenterY = hangerRailY + hangerRodLength / 2;
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

      const frameEdgeDescriptors = [
        {
          key: 'frontLeft',
          position: [
            layoutBay.xStart,
            centerY,
            FRAME_BAR_THICKNESS / 2,
          ] as [number, number, number],
          size: [
            FRAME_BAR_THICKNESS,
            verticalFrameHeight,
            FRAME_BAR_THICKNESS,
          ] as [number, number, number],
        },
        {
          key: 'frontRight',
          position: [
            layoutBay.xStart + layoutBay.width,
            centerY,
            FRAME_BAR_THICKNESS / 2,
          ] as [number, number, number],
          size: [
            FRAME_BAR_THICKNESS,
            verticalFrameHeight,
            FRAME_BAR_THICKNESS,
          ] as [number, number, number],
        },
        {
          key: 'backLeft',
          position: [
            layoutBay.xStart,
            centerY,
            designDepth - FRAME_BAR_THICKNESS / 2,
          ] as [number, number, number],
          size: [
            FRAME_BAR_THICKNESS,
            verticalFrameHeight,
            FRAME_BAR_THICKNESS,
          ] as [number, number, number],
        },
        {
          key: 'backRight',
          position: [
            layoutBay.xStart + layoutBay.width,
            centerY,
            designDepth - FRAME_BAR_THICKNESS / 2,
          ] as [number, number, number],
          size: [
            FRAME_BAR_THICKNESS,
            verticalFrameHeight,
            FRAME_BAR_THICKNESS,
          ] as [number, number, number],
        },
      ] as const;

      frameEdgeDescriptors.forEach(({ key, position, size }) => {
        if (!frameEdges[key]) {
          return;
        }

        pushFrameBox(
          boxes,
          design,
          `frame-edge-${compartment.id}-${key}`,
          position,
          size,
          compartment.id,
        );
      });

      if (compartmentIndex === 0) {
        const bottomRailDescriptors = [
          {
            key: 'bottomFront',
            position: [centerX, bottomEdgeY, FRAME_BAR_THICKNESS / 2] as [
              number,
              number,
              number,
            ],
            size: [layoutBay.width, FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'bottomBack',
            position: [
              centerX,
              bottomEdgeY,
              designDepth - FRAME_BAR_THICKNESS / 2,
            ] as [number, number, number],
            size: [layoutBay.width, FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'bottomLeft',
            position: [layoutBay.xStart, bottomEdgeY, designDepth / 2] as [
              number,
              number,
              number,
            ],
            size: [FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS, designDepth] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'bottomRight',
            position: [layoutBay.xStart + layoutBay.width, bottomEdgeY, designDepth / 2] as [
              number,
              number,
              number,
            ],
            size: [FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS, designDepth] as [
              number,
              number,
              number,
            ],
          },
        ] as const;

        bottomRailDescriptors.forEach(({ key, position, size }) => {
          if (!frameEdges[key]) {
            return;
          }

          pushFrameBox(
            boxes,
            design,
            `frame-edge-${compartment.id}-${key}`,
            position,
            size,
            compartment.id,
          );
        });
      }

      if (compartmentIndex === bay.compartments.length - 1) {
        const topRailDescriptors = [
          {
            key: 'topFront',
            position: [centerX, topEdgeY, FRAME_BAR_THICKNESS / 2] as [
              number,
              number,
              number,
            ],
            size: [layoutBay.width, FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'topBack',
            position: [centerX, topEdgeY, designDepth - FRAME_BAR_THICKNESS / 2] as [
              number,
              number,
              number,
            ],
            size: [layoutBay.width, FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'topLeft',
            position: [layoutBay.xStart, topEdgeY, designDepth / 2] as [
              number,
              number,
              number,
            ],
            size: [FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS, designDepth] as [
              number,
              number,
              number,
            ],
          },
          {
            key: 'topRight',
            position: [layoutBay.xStart + layoutBay.width, topEdgeY, designDepth / 2] as [
              number,
              number,
              number,
            ],
            size: [FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS, designDepth] as [
              number,
              number,
              number,
            ],
          },
        ] as const;

        topRailDescriptors.forEach(({ key, position, size }) => {
          if (!frameEdges[key]) {
            return;
          }

          pushFrameBox(
            boxes,
            design,
            `frame-edge-${compartment.id}-${key}`,
            position,
            size,
            compartment.id,
          );
        });
      }

      if (compartmentAbove && frameEdgesAbove) {
        SHARED_HORIZONTAL_FRAME_MAPPINGS.forEach((mapping) => {
          const isEnabled =
            frameEdges[mapping.lowerKey] || frameEdgesAbove[mapping.upperKey];

          if (!isEnabled) {
            return;
          }

          const position: [number, number, number] =
            mapping.axis === 'width'
              ? [
                  centerX,
                  topEdgeY,
                  mapping.zSide === 'back'
                    ? designDepth - FRAME_BAR_THICKNESS / 2
                    : FRAME_BAR_THICKNESS / 2,
                ]
              : [
                  mapping.xOffset === 0
                    ? layoutBay.xStart
                    : layoutBay.xStart + layoutBay.width,
                  topEdgeY,
                  designDepth / 2,
                ];

          const size: [number, number, number] =
              mapping.axis === 'width'
              ? [layoutBay.width, FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS]
              : [FRAME_BAR_THICKNESS, FRAME_BAR_THICKNESS, designDepth];

          pushFrameBox(
            boxes,
            design,
            `frame-edge-${compartment.id}-${mapping.idSuffix}`,
            position,
            size,
            compartment.id,
          );
        });
      }

      boxes.push({
        id: `comp-shell-${compartment.id}`,
        kind: 'compartment',
        selectId: compartment.id,
        color: '#eef3f6',
        position: [centerX, centerY, designDepth / 2],
        size: [innerWidth, innerHeight, innerDepth],
      });

      if (compartment.panels.backPanel) {
        const material = getPanelMaterialProps(compartment.panels.backPanel.finish);
        boxes.push({
          id: `back-panel-${compartment.id}`,
          kind: compartment.panels.backPanel.pegboard ? 'pegboard' : 'panel',
          selectId: compartment.id,
          ...material,
          position: [
            centerX,
            centerY,
            designDepth - PANEL_THICKNESS / 2 - FRAME_BAR_THICKNESS,
          ],
          size: [innerWidth, innerHeight, PANEL_THICKNESS],
        });
      }

      if (compartment.panels.topPanel) {
        const material = getPanelMaterialProps(compartment.panels.topPanel.finish);
        boxes.push({
          id: `top-panel-${compartment.id}`,
          kind: compartment.panels.topPanel.pegboard ? 'pegboard' : 'panel',
          selectId: compartment.id,
          ...material,
          position: [centerX, bottomY + height - PANEL_THICKNESS / 2, designDepth / 2],
          size: [innerWidth, PANEL_THICKNESS, innerDepth],
        });
      }

      if (compartment.panels.bottomPanel) {
        const material = getPanelMaterialProps(
          compartment.panels.bottomPanel.finish,
        );
        boxes.push({
          id: `bottom-panel-${compartment.id}`,
          kind: compartment.panels.bottomPanel.pegboard ? 'pegboard' : 'panel',
          selectId: compartment.id,
          ...material,
          position: [centerX, bottomY + PANEL_THICKNESS / 2, designDepth / 2],
          size: [innerWidth, PANEL_THICKNESS, innerDepth],
        });
      }

      compartment.panels.sidePanels.forEach((panel) => {
        const isLeft = panel.side === 'left';
        const material = getPanelMaterialProps(panel.finish);
        boxes.push({
          id: `side-panel-${compartment.id}-${panel.side}`,
          kind: panel.pegboard ? 'pegboard' : 'panel',
          selectId: compartment.id,
          ...material,
          position: [
            isLeft
              ? layoutBay.xStart + PANEL_THICKNESS / 2 + FRAME_BAR_THICKNESS
              : layoutBay.xStart +
                layoutBay.width -
                PANEL_THICKNESS / 2 -
                FRAME_BAR_THICKNESS,
            centerY,
            designDepth / 2,
          ],
          size: [PANEL_THICKNESS, innerHeight, innerDepth],
        });
      });

      switch (compartment.primaryInsert.type) {
        case 'open':
          break;
        case 'shelf':
          {
            const material = getPanelMaterialProps(compartment.primaryInsert.finish);
          boxes.push({
            id: `shelf-${compartment.id}`,
            kind: 'shelf',
            selectId: compartment.id,
            ...material,
            position: [centerX, centerY, designDepth / 2],
            size: [innerWidth, SHELF_THICKNESS, innerDepth * 0.9],
          });
          }
          break;
        case 'hanger_rail':
          {
            const railFinish = compartment.primaryInsert.finish;
          cylinders.push({
            id: `rail-${compartment.id}`,
            kind: 'rail',
            selectId: compartment.id,
            color: railFinishColors[railFinish],
            position: [centerX, hangerRailY, designDepth / 2],
            radius: RAIL_RADIUS,
            height: hangerRailSpan,
            rotation: [0, 0, Math.PI / 2],
          });
          [centerX - hangerRailSpan / 2, centerX + hangerRailSpan / 2].forEach(
            (rodX, rodIndex) => {
              cylinders.push({
                id: `rail-support-${compartment.id}-${rodIndex}`,
                kind: 'rail',
                selectId: compartment.id,
                color: railFinishColors[railFinish],
                position: [rodX, hangerRodCenterY, designDepth / 2],
                radius: Math.max(RAIL_RADIUS * 0.55, 4),
                height: hangerRodLength,
                rotation: [0, 0, 0],
              });
            },
          );
          }
          break;
        case 'bench':
          {
            const material = getPanelMaterialProps(compartment.primaryInsert.finish);
          boxes.push({
            id: `bench-top-${compartment.id}`,
            kind: 'bench',
            selectId: compartment.id,
            ...material,
            position: [
              centerX,
              bottomY + SHELF_THICKNESS,
              designDepth / 2,
            ],
            size: [innerWidth, SHELF_THICKNESS, innerDepth * 0.95],
          });
          boxes.push({
            id: `bench-front-${compartment.id}`,
            kind: 'bench',
            selectId: compartment.id,
            ...material,
            position: [
              centerX,
              bottomY + height / 2,
              FRAME_BAR_THICKNESS + PANEL_THICKNESS / 2,
            ],
            size: [innerWidth, innerHeight * 0.7, PANEL_THICKNESS],
          });
          }
          break;
        case 'drawer':
          {
            const material = getPanelMaterialProps(compartment.primaryInsert.finish);
          boxes.push({
            id: `drawer-front-${compartment.id}`,
            kind: 'drawer',
            selectId: compartment.id,
            ...material,
            position: [
              centerX,
              centerY,
              FRAME_BAR_THICKNESS + DRAWER_FACE_THICKNESS / 2,
            ],
            size: [innerWidth * 0.96, innerHeight * 0.82, DRAWER_FACE_THICKNESS],
          });
          }
          break;
      }
    });
  });

  boxes.push({
    id: 'base-rail',
    kind: 'base',
    selectId: BASE_ROOT_ID,
    color: design.baseType === 'casters' ? '#5f6973' : '#737e88',
    position: [overallWidth / 2, BASE_HEIGHT / 2, designDepth / 2],
    size: [Math.max(overallWidth, 10), BASE_HEIGHT, designDepth * 0.85],
  });

  if (design.casterEnabled && overallWidth > 0) {
    const casterXPositions = [CASTER_RADIUS, overallWidth - CASTER_RADIUS];
    const casterZPositions = [CASTER_RADIUS, designDepth - CASTER_RADIUS];

    casterXPositions.forEach((xPos, xIndex) => {
      casterZPositions.forEach((zPos, zIndex) => {
        cylinders.push({
          id: `caster-${xIndex}-${zIndex}`,
          kind: 'caster',
          selectId: BASE_ROOT_ID,
          color: '#2f3338',
          position: [xPos, CASTER_HEIGHT / 2, zPos],
          radius: CASTER_RADIUS,
          height: CASTER_HEIGHT * 0.4,
          rotation: [Math.PI / 2, 0, 0],
        });
      });
    });
  }

  return {
    dimensions,
    bays: layoutBays,
    boxes,
    cylinders,
    sceneOffset: [-overallWidth / 2, -overallHeight / 2, -designDepth / 2],
  };
}
