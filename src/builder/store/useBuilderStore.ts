import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createDefaultDesign } from '../model/defaultDesign';
import { serializeDesign } from '../model/serialization';
import { createId } from '../utils/id';
import type {
  BaseType,
  CompartmentVerticalFrameKey,
  DesignConfig,
  FrameFinish,
  HeightPreset,
  PanelFinish,
  PrimaryInsertConfig,
  RailFinish,
  SidePanelSide,
  WidthPreset,
} from '../model/types';
import { createDefaultCompartmentVerticalFrames } from '../model/types';

type FinishValue = PanelFinish | RailFinish;
type PrimaryInsertType = PrimaryInsertConfig['type'];

type BuilderState = {
  design: DesignConfig;
  importError: string | null;
  addBay: () => void;
  removeBay: (bayId: string) => void;
  moveBay: (bayId: string, direction: 'left' | 'right') => void;
  updateBayWidth: (bayId: string, width: WidthPreset) => void;
  addCompartment: (bayId: string) => void;
  removeCompartment: (bayId: string, compartmentId: string) => void;
  moveCompartment: (
    bayId: string,
    compartmentId: string,
    direction: 'up' | 'down',
  ) => void;
  updateCompartmentHeight: (
    compartmentId: string,
    height: HeightPreset,
  ) => void;
  setCompartmentPrimaryInsert: (
    compartmentId: string,
    insertType: PrimaryInsertType,
  ) => void;
  updatePrimaryInsertFinish: (
    compartmentId: string,
    finish: FinishValue,
  ) => void;
  toggleBackPanel: (compartmentId: string) => void;
  toggleBackPanelPegboard: (compartmentId: string) => void;
  toggleTopPanel: (compartmentId: string) => void;
  toggleTopPanelPegboard: (compartmentId: string) => void;
  toggleBottomPanel: (compartmentId: string) => void;
  toggleBottomPanelPegboard: (compartmentId: string) => void;
  toggleSidePanel: (compartmentId: string, side: SidePanelSide) => void;
  toggleSidePanelPegboard: (
    compartmentId: string,
    side: SidePanelSide,
  ) => void;
  toggleVerticalFrame: (
    compartmentId: string,
    frameKey: CompartmentVerticalFrameKey,
  ) => void;
  updateBackPanelFinish: (compartmentId: string, finish: PanelFinish) => void;
  updateTopPanelFinish: (compartmentId: string, finish: PanelFinish) => void;
  updateBottomPanelFinish: (compartmentId: string, finish: PanelFinish) => void;
  updateSidePanelFinish: (
    compartmentId: string,
    side: SidePanelSide,
    finish: PanelFinish,
  ) => void;
  setShowHumanReference: (enabled: boolean) => void;
  setFrameFinish: (finish: FrameFinish) => void;
  setBaseType: (baseType: BaseType) => void;
  setCasterEnabled: (enabled: boolean) => void;
  selectItem: (id: string | null) => void;
  loadDesign: (design: DesignConfig) => void;
  resetDesign: () => void;
  exportDesignJson: () => string;
  clearImportError: () => void;
  setImportError: (message: string | null) => void;
};

function withUpdatedMetadata(design: DesignConfig): DesignConfig {
  return {
    ...design,
    metadata: {
      ...design.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

function createPrimaryInsert(insertType: PrimaryInsertType): PrimaryInsertConfig {
  switch (insertType) {
    case 'open':
      return { type: 'open' };
    case 'shelf':
      return { type: 'shelf', finish: 'natural-oak' };
    case 'hanger_rail':
      return { type: 'hanger_rail', finish: 'dark-metal' };
    case 'bench':
      return { type: 'bench', finish: 'natural-oak' };
    case 'drawer':
      return { type: 'drawer', finish: 'walnut' };
  }
}

function mapDesign(
  design: DesignConfig,
  mapper: (draft: DesignConfig) => DesignConfig,
): DesignConfig {
  return withUpdatedMetadata(mapper(design));
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      design: createDefaultDesign(),
      importError: null,
      addBay: () =>
        set((state) => ({
          design: mapDesign(state.design, (design) => {
            const newBayId = createId('bay');
            return {
              ...design,
              selectedItemId: newBayId,
              bays: [
                ...design.bays,
                {
                  id: newBayId,
                  width: 400,
                  compartments: [
                    {
                      id: createId('comp'),
                      height: 400,
                      primaryInsert: { type: 'open' },
                      panels: {
                        backPanel: null,
                        topPanel: null,
                        bottomPanel: null,
                        sidePanels: [],
                      },
                      verticalFrames: createDefaultCompartmentVerticalFrames(),
                    },
                  ],
                },
              ],
            };
          }),
        })),
      removeBay: (bayId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => {
            const nextBays = design.bays.filter((bay) => bay.id !== bayId);
            return {
              ...design,
              bays: nextBays,
              selectedItemId: nextBays[0]?.id ?? null,
            };
          }),
        })),
      moveBay: (bayId, direction) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => {
            const currentIndex = design.bays.findIndex((bay) => bay.id === bayId);
            const targetIndex =
              direction === 'left' ? currentIndex - 1 : currentIndex + 1;

            return {
              ...design,
              bays: moveItem(design.bays, currentIndex, targetIndex),
            };
          }),
        })),
      updateBayWidth: (bayId, width) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) =>
              bay.id === bayId ? { ...bay, width } : bay,
            ),
          })),
        })),
      addCompartment: (bayId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => {
            const newCompartmentId = createId('comp');
            return {
              ...design,
              selectedItemId: newCompartmentId,
              bays: design.bays.map((bay) =>
                bay.id === bayId
                  ? {
                      ...bay,
                      compartments: [
                        ...bay.compartments,
                        {
                          id: newCompartmentId,
                          height: 400,
                          primaryInsert: { type: 'open' },
                          panels: {
                            backPanel: null,
                            topPanel: null,
                            bottomPanel: null,
                            sidePanels: [],
                          },
                          verticalFrames: createDefaultCompartmentVerticalFrames(),
                        },
                      ],
                    }
                  : bay,
              ),
            };
          }),
        })),
      removeCompartment: (bayId, compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            selectedItemId: bayId,
            bays: design.bays.map((bay) =>
              bay.id === bayId
                ? {
                    ...bay,
                    compartments: bay.compartments.filter(
                      (compartment) => compartment.id !== compartmentId,
                    ),
                  }
                : bay,
            ),
          })),
        })),
      moveCompartment: (bayId, compartmentId, direction) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => {
              if (bay.id !== bayId) {
                return bay;
              }

              const currentIndex = bay.compartments.findIndex(
                (compartment) => compartment.id === compartmentId,
              );
              const targetIndex =
                direction === 'up' ? currentIndex + 1 : currentIndex - 1;

              return {
                ...bay,
                compartments: moveItem(
                  bay.compartments,
                  currentIndex,
                  targetIndex,
                ),
              };
            }),
          })),
        })),
      updateCompartmentHeight: (compartmentId, height) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? { ...compartment, height }
                  : compartment,
              ),
            })),
          })),
        })),
      setCompartmentPrimaryInsert: (compartmentId, insertType) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      primaryInsert: createPrimaryInsert(insertType),
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      updatePrimaryInsertFinish: (compartmentId, finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) => {
                if (compartment.id !== compartmentId) {
                  return compartment;
                }

                if (compartment.primaryInsert.type === 'hanger_rail') {
                  if (finish === 'light-grey-metal' || finish === 'dark-metal') {
                    return {
                      ...compartment,
                      primaryInsert: {
                        ...compartment.primaryInsert,
                        finish,
                      },
                    };
                  }

                  return compartment;
                }

                if (compartment.primaryInsert.type === 'open') {
                  return compartment;
                }

                return {
                  ...compartment,
                  primaryInsert: {
                    ...compartment.primaryInsert,
                    finish: finish as PanelFinish,
                  },
                };
              }),
            })),
          })),
        })),
      toggleBackPanel: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        backPanel: compartment.panels.backPanel
                          ? null
                          : {
                              type: 'back_panel',
                              finish: 'natural-oak',
                              pegboard: false,
                            },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleBackPanelPegboard: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId && compartment.panels.backPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        backPanel: {
                          ...compartment.panels.backPanel,
                          pegboard: !compartment.panels.backPanel.pegboard,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleTopPanel: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        topPanel: compartment.panels.topPanel
                          ? null
                          : {
                              type: 'top_panel',
                              finish: 'natural-oak',
                              pegboard: false,
                            },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleTopPanelPegboard: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId && compartment.panels.topPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        topPanel: {
                          ...compartment.panels.topPanel,
                          pegboard: !compartment.panels.topPanel.pegboard,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleBottomPanel: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        bottomPanel: compartment.panels.bottomPanel
                          ? null
                          : {
                              type: 'bottom_panel',
                              finish: 'natural-oak',
                              pegboard: false,
                            },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleBottomPanelPegboard: (compartmentId) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId &&
                compartment.panels.bottomPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        bottomPanel: {
                          ...compartment.panels.bottomPanel,
                          pegboard: !compartment.panels.bottomPanel.pegboard,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleSidePanel: (compartmentId, side) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) => {
                if (compartment.id !== compartmentId) {
                  return compartment;
                }

                const hasSide = compartment.panels.sidePanels.some(
                  (panel) => panel.side === side,
                );

                return {
                  ...compartment,
                  panels: {
                    ...compartment.panels,
                    sidePanels: hasSide
                      ? compartment.panels.sidePanels.filter(
                          (panel) => panel.side !== side,
                        )
                      : [
                          ...compartment.panels.sidePanels,
                          {
                            type: 'side_panel',
                            finish: 'natural-oak',
                            pegboard: false,
                            side,
                          },
                        ],
                  },
                };
              }),
            })),
          })),
        })),
      toggleSidePanelPegboard: (compartmentId, side) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        sidePanels: compartment.panels.sidePanels.map((panel) =>
                          panel.side === side
                            ? { ...panel, pegboard: !panel.pegboard }
                            : panel,
                        ),
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      toggleVerticalFrame: (compartmentId, frameKey) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      verticalFrames: {
                        ...compartment.verticalFrames,
                        [frameKey]: !compartment.verticalFrames[frameKey],
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      updateBackPanelFinish: (compartmentId, finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId && compartment.panels.backPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        backPanel: {
                          ...compartment.panels.backPanel,
                          finish,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      updateTopPanelFinish: (compartmentId, finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId && compartment.panels.topPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        topPanel: {
                          ...compartment.panels.topPanel,
                          finish,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      updateBottomPanelFinish: (compartmentId, finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId && compartment.panels.bottomPanel
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        bottomPanel: {
                          ...compartment.panels.bottomPanel,
                          finish,
                        },
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      updateSidePanelFinish: (compartmentId, side, finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            bays: design.bays.map((bay) => ({
              ...bay,
              compartments: bay.compartments.map((compartment) =>
                compartment.id === compartmentId
                  ? {
                      ...compartment,
                      panels: {
                        ...compartment.panels,
                        sidePanels: compartment.panels.sidePanels.map((panel) =>
                          panel.side === side ? { ...panel, finish } : panel,
                        ),
                      },
                    }
                  : compartment,
              ),
            })),
          })),
        })),
      setFrameFinish: (finish) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            frameFinish: finish,
          })),
        })),
      setBaseType: (baseType) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            baseType,
          })),
        })),
      setCasterEnabled: (enabled) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            casterEnabled: enabled,
          })),
        })),
      setShowHumanReference: (enabled) =>
        set((state) => ({
          design: mapDesign(state.design, (design) => ({
            ...design,
            showHumanReference: enabled,
          })),
        })),
      selectItem: (id) =>
        set((state) => ({
          design: {
            ...state.design,
            selectedItemId: id,
          },
        })),
      loadDesign: (design) =>
        set(() => ({
          design: withUpdatedMetadata(design),
          importError: null,
        })),
      resetDesign: () =>
        set(() => ({
          design: createDefaultDesign(),
          importError: null,
        })),
      exportDesignJson: () => serializeDesign(get().design),
      clearImportError: () =>
        set(() => ({
          importError: null,
        })),
      setImportError: (message) =>
        set(() => ({
          importError: message,
        })),
    }),
    {
      name: 'wardrobe-builder-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        design: state.design,
      }),
    },
  ),
);

export const builderSelectors = {
  design: (state: BuilderState) => state.design,
  selectedItemId: (state: BuilderState) => state.design.selectedItemId,
};
