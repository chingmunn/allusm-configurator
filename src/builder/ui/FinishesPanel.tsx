import { useMemo } from 'react';
import { getSelectionInfo } from '../model/selection';
import {
  BASE_TYPES,
  FRAME_FINISHES,
  PANEL_FINISHES,
  RAIL_FINISHES,
} from '../model/types';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';

export function FinishesPanel() {
  const design = useBuilderStore(builderSelectors.design);
  const selectedItemId = useBuilderStore(builderSelectors.selectedItemId);
  const setFrameFinish = useBuilderStore((state) => state.setFrameFinish);
  const setBaseType = useBuilderStore((state) => state.setBaseType);
  const setCasterEnabled = useBuilderStore((state) => state.setCasterEnabled);
  const setShowHumanReference = useBuilderStore(
    (state) => state.setShowHumanReference,
  );
  const updatePrimaryInsertFinish = useBuilderStore(
    (state) => state.updatePrimaryInsertFinish,
  );
  const updateBackPanelFinish = useBuilderStore(
    (state) => state.updateBackPanelFinish,
  );
  const updateTopPanelFinish = useBuilderStore(
    (state) => state.updateTopPanelFinish,
  );
  const updateBottomPanelFinish = useBuilderStore(
    (state) => state.updateBottomPanelFinish,
  );
  const updateSidePanelFinish = useBuilderStore(
    (state) => state.updateSidePanelFinish,
  );
  const selection = useMemo(
    () => getSelectionInfo(design, selectedItemId),
    [design, selectedItemId],
  );

  const selectedCompartment =
    selection?.kind === 'compartment' ? selection.compartment : null;

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Finishes</h2>
          <p>Global frame settings and compartment finish controls.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Frame finish</span>
          <select
            value={design.frameFinish}
            onChange={(event) =>
              setFrameFinish(event.target.value as (typeof FRAME_FINISHES)[number])
            }
          >
            {FRAME_FINISHES.map((finish) => (
              <option key={finish} value={finish}>
                {finish}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Base type</span>
          <select
            value={design.baseType}
            onChange={(event) =>
              setBaseType(event.target.value as (typeof BASE_TYPES)[number])
            }
          >
            {BASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={design.casterEnabled}
            onChange={(event) => setCasterEnabled(event.target.checked)}
          />
          <span>Enable casters</span>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={design.showHumanReference}
            onChange={(event) => setShowHumanReference(event.target.checked)}
          />
          <span>Show human reference</span>
        </label>

        {selectedCompartment &&
        selectedCompartment.primaryInsert.type !== 'open' ? (
          <label>
            <span>Primary insert finish</span>
            <select
              value={selectedCompartment.primaryInsert.finish}
              onChange={(event) =>
                updatePrimaryInsertFinish(
                  selectedCompartment.id,
                  event.target.value as typeof selectedCompartment.primaryInsert.finish,
                )
              }
            >
              {selectedCompartment.primaryInsert.type === 'hanger_rail'
                ? RAIL_FINISHES.map((finish) => (
                    <option key={finish} value={finish}>
                      {finish}
                    </option>
                  ))
                : PANEL_FINISHES.map((finish) => (
                    <option key={finish} value={finish}>
                      {finish}
                    </option>
                  ))}
            </select>
          </label>
        ) : null}

        {selectedCompartment?.panels.backPanel ? (
          <label>
            <span>Back panel finish</span>
            <select
              value={selectedCompartment.panels.backPanel.finish}
              onChange={(event) =>
                updateBackPanelFinish(
                  selectedCompartment.id,
                  event.target.value as (typeof PANEL_FINISHES)[number],
                )
              }
            >
              {PANEL_FINISHES.map((finish) => (
                <option key={finish} value={finish}>
                  {finish}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedCompartment?.panels.topPanel ? (
          <label>
            <span>Top panel finish</span>
            <select
              value={selectedCompartment.panels.topPanel.finish}
              onChange={(event) =>
                updateTopPanelFinish(
                  selectedCompartment.id,
                  event.target.value as (typeof PANEL_FINISHES)[number],
                )
              }
            >
              {PANEL_FINISHES.map((finish) => (
                <option key={finish} value={finish}>
                  {finish}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedCompartment?.panels.bottomPanel ? (
          <label>
            <span>Bottom panel finish</span>
            <select
              value={selectedCompartment.panels.bottomPanel.finish}
              onChange={(event) =>
                updateBottomPanelFinish(
                  selectedCompartment.id,
                  event.target.value as (typeof PANEL_FINISHES)[number],
                )
              }
            >
              {PANEL_FINISHES.map((finish) => (
                <option key={finish} value={finish}>
                  {finish}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {selectedCompartment?.panels.sidePanels.map((panel) => (
          <label key={panel.side}>
            <span>{panel.side === 'left' ? 'Left' : 'Right'} side finish</span>
            <select
              value={panel.finish}
              onChange={(event) =>
                updateSidePanelFinish(
                  selectedCompartment.id,
                  panel.side,
                  event.target.value as (typeof PANEL_FINISHES)[number],
                )
              }
            >
              {PANEL_FINISHES.map((finish) => (
                <option key={finish} value={finish}>
                  {finish}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
