import { useMemo } from 'react';
import { getSelectionInfo } from '../model/selection';
import {
  COMPARTMENT_VERTICAL_FRAME_KEYS,
  SIDE_PANEL_SIDES,
} from '../model/types';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';

const PRIMARY_INSERT_OPTIONS = [
  'open',
  'shelf',
  'hanger_rail',
  'bench',
  'drawer',
] as const;

export function SelectionPanel() {
  const design = useBuilderStore(builderSelectors.design);
  const selectedItemId = useBuilderStore(builderSelectors.selectedItemId);
  const setCompartmentPrimaryInsert = useBuilderStore(
    (state) => state.setCompartmentPrimaryInsert,
  );
  const toggleBackPanel = useBuilderStore((state) => state.toggleBackPanel);
  const toggleBackPanelPegboard = useBuilderStore(
    (state) => state.toggleBackPanelPegboard,
  );
  const toggleTopPanel = useBuilderStore((state) => state.toggleTopPanel);
  const toggleTopPanelPegboard = useBuilderStore(
    (state) => state.toggleTopPanelPegboard,
  );
  const toggleBottomPanel = useBuilderStore((state) => state.toggleBottomPanel);
  const toggleBottomPanelPegboard = useBuilderStore(
    (state) => state.toggleBottomPanelPegboard,
  );
  const toggleSidePanel = useBuilderStore((state) => state.toggleSidePanel);
  const toggleSidePanelPegboard = useBuilderStore(
    (state) => state.toggleSidePanelPegboard,
  );
  const toggleVerticalFrame = useBuilderStore((state) => state.toggleVerticalFrame);
  const selection = useMemo(
    () => getSelectionInfo(design, selectedItemId),
    [design, selectedItemId],
  );

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Selection</h2>
          <p>Inspect and edit the active item.</p>
        </div>
      </div>

      {!selection ? <p className="empty-state">Select a bay or compartment.</p> : null}

      {selection ? (
        <div className="selection-details">
          <div className="key-value">
            <span>Type</span>
            <strong>{selection.kind}</strong>
          </div>
          <div className="key-value">
            <span>ID</span>
            <strong>{selection.id}</strong>
          </div>
          <div className="key-value">
            <span>Label</span>
            <strong>{selection.label}</strong>
          </div>
        </div>
      ) : null}

      {selection?.kind === 'compartment' ? (
        <div className="form-grid">
          <label>
            <span>Primary insert</span>
            <select
              value={selection.compartment.primaryInsert.type}
              onChange={(event) =>
                setCompartmentPrimaryInsert(
                  selection.compartment.id,
                  event.target.value as (typeof PRIMARY_INSERT_OPTIONS)[number],
                )
              }
            >
              {PRIMARY_INSERT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <span>Attached panels</span>
            <div className="panel-option-row">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={Boolean(selection.compartment.panels.backPanel)}
                  onChange={() => toggleBackPanel(selection.compartment.id)}
                />
                <span>Back panel</span>
              </label>
              {selection.compartment.panels.backPanel ? (
                <label className="switch-field">
                  <span>Peg</span>
                  <input
                    type="checkbox"
                    checked={selection.compartment.panels.backPanel.pegboard}
                    onChange={() => toggleBackPanelPegboard(selection.compartment.id)}
                  />
                  <span className="switch-ui" aria-hidden="true" />
                </label>
              ) : null}
            </div>
            <div className="panel-option-row">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={Boolean(selection.compartment.panels.topPanel)}
                  onChange={() => toggleTopPanel(selection.compartment.id)}
                />
                <span>Top panel</span>
              </label>
              {selection.compartment.panels.topPanel ? (
                <label className="switch-field">
                  <span>Peg</span>
                  <input
                    type="checkbox"
                    checked={selection.compartment.panels.topPanel.pegboard}
                    onChange={() => toggleTopPanelPegboard(selection.compartment.id)}
                  />
                  <span className="switch-ui" aria-hidden="true" />
                </label>
              ) : null}
            </div>
            <div className="panel-option-row">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={Boolean(selection.compartment.panels.bottomPanel)}
                  onChange={() => toggleBottomPanel(selection.compartment.id)}
                />
                <span>Bottom panel</span>
              </label>
              {selection.compartment.panels.bottomPanel ? (
                <label className="switch-field">
                  <span>Peg</span>
                  <input
                    type="checkbox"
                    checked={selection.compartment.panels.bottomPanel.pegboard}
                    onChange={() => toggleBottomPanelPegboard(selection.compartment.id)}
                  />
                  <span className="switch-ui" aria-hidden="true" />
                </label>
              ) : null}
            </div>
            {SIDE_PANEL_SIDES.map((side) => (
              <div key={side} className="panel-option-row">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={selection.compartment.panels.sidePanels.some(
                      (panel) => panel.side === side,
                    )}
                    onChange={() => toggleSidePanel(selection.compartment.id, side)}
                  />
                  <span>{side === 'left' ? 'Left side panel' : 'Right side panel'}</span>
                </label>
                {selection.compartment.panels.sidePanels.some(
                  (panel) => panel.side === side,
                ) ? (
                  <label className="switch-field">
                    <span>Peg</span>
                    <input
                      type="checkbox"
                      checked={selection.compartment.panels.sidePanels.some(
                        (panel) => panel.side === side && panel.pegboard,
                      )}
                      onChange={() =>
                        toggleSidePanelPegboard(selection.compartment.id, side)
                      }
                    />
                    <span className="switch-ui" aria-hidden="true" />
                  </label>
                ) : null}
              </div>
            ))}
          </div>

          <div className="form-grid">
            <span>Vertical frame uprights</span>
            {COMPARTMENT_VERTICAL_FRAME_KEYS.map((frameKey) => (
              <label key={frameKey} className="checkbox-field">
                <input
                  type="checkbox"
                  checked={selection.compartment.verticalFrames[frameKey]}
                  onChange={() =>
                    toggleVerticalFrame(selection.compartment.id, frameKey)
                  }
                />
                <span>
                  {frameKey === 'frontLeft'
                    ? 'Front left upright'
                    : frameKey === 'frontRight'
                      ? 'Front right upright'
                      : frameKey === 'backLeft'
                        ? 'Back left upright'
                        : 'Back right upright'}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
