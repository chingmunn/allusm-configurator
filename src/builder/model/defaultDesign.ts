import {
  STANDARD_DEPTH,
  createDefaultCompartmentFrameEdges,
  type DesignConfig,
} from './types';

export const FRAME_ROOT_ID = 'frame-root';
export const BASE_ROOT_ID = 'base-root';

export function createDefaultDesign(): DesignConfig {
  const now = new Date().toISOString();

  return {
    version: 1,
    frameFinish: 'raw-aluminium',
    baseType: 'casters',
    casterEnabled: true,
    depth: STANDARD_DEPTH,
    showHumanReference: true,
    selectedItemId: FRAME_ROOT_ID,
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
    bays: [
      {
        id: 'bay-left',
        width: 400,
        compartments: [
          {
            id: 'comp-left-bottom',
            height: 400,
            primaryInsert: {
              type: 'bench',
              finish: 'natural-oak',
            },
            panels: {
              backPanel: {
                type: 'back_panel',
                finish: 'blue-stain',
                pegboard: false,
              },
              topPanel: null,
              bottomPanel: {
                type: 'bottom_panel',
                finish: 'natural-oak',
                pegboard: false,
              },
              sidePanels: [
                {
                  type: 'side_panel',
                  finish: 'red-stain',
                  pegboard: false,
                  side: 'left',
                },
              ],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
          {
            id: 'comp-left-top',
            height: 500,
            primaryInsert: {
              type: 'open',
            },
            panels: {
              backPanel: {
                type: 'back_panel',
                finish: 'blue-stain',
                pegboard: true,
              },
              topPanel: {
                type: 'top_panel',
                finish: 'blue-stain',
                pegboard: false,
              },
              bottomPanel: null,
              sidePanels: [],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
        ],
      },
      {
        id: 'bay-middle',
        width: 600,
        compartments: [
          {
            id: 'comp-middle-bottom',
            height: 300,
            primaryInsert: {
              type: 'drawer',
              finish: 'red-stain',
            },
            panels: {
              backPanel: null,
              topPanel: null,
              bottomPanel: {
                type: 'bottom_panel',
                finish: 'red-stain',
                pegboard: false,
              },
              sidePanels: [],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
          {
            id: 'comp-middle-mid',
            height: 400,
            primaryInsert: {
              type: 'shelf',
              finish: 'light-grey-metal',
            },
            panels: {
              backPanel: {
                type: 'back_panel',
                finish: 'light-grey-metal',
                pegboard: false,
              },
              topPanel: {
                type: 'top_panel',
                finish: 'light-grey-metal',
                pegboard: false,
              },
              bottomPanel: null,
              sidePanels: [],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
          {
            id: 'comp-middle-top',
            height: 300,
            primaryInsert: {
              type: 'open',
            },
            panels: {
              backPanel: {
                type: 'back_panel',
                finish: 'blue-stain',
                pegboard: true,
              },
              topPanel: null,
              bottomPanel: null,
              sidePanels: [],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
        ],
      },
      {
        id: 'bay-right',
        width: 500,
        compartments: [
          {
            id: 'comp-right-bottom',
            height: 500,
            primaryInsert: {
              type: 'open',
            },
            panels: {
              backPanel: null,
              topPanel: null,
              bottomPanel: {
                type: 'bottom_panel',
                finish: 'natural-oak',
                pegboard: false,
              },
              sidePanels: [],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
          {
            id: 'comp-right-top',
            height: 600,
            primaryInsert: {
              type: 'hanger_rail',
              finish: 'dark-metal',
            },
            panels: {
              backPanel: {
                type: 'back_panel',
                finish: 'dark-green',
                pegboard: false,
              },
              topPanel: {
                type: 'top_panel',
                finish: 'dark-metal',
                pegboard: false,
              },
              bottomPanel: null,
              sidePanels: [
                {
                  type: 'side_panel',
                  finish: 'dark-metal',
                  pegboard: false,
                  side: 'right',
                },
              ],
            },
            frameEdges: createDefaultCompartmentFrameEdges(),
          },
        ],
      },
    ],
  };
}
