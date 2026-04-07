import { useEffect, useMemo, useState } from 'react';
import { getSelectionInfo } from '../model/selection';
import { DEPTH_PRESETS, HEIGHT_PRESETS, WIDTH_PRESETS } from '../model/types';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';

function formatPanelSummary(panelCount: number): string {
  if (panelCount === 0) {
    return 'no panels';
  }

  return panelCount === 1 ? '1 panel' : `${panelCount} panels`;
}

function getBayCompartmentHeightTotal(heights: number[]): number {
  return heights.reduce((total, height) => total + height, 0);
}

export function StructurePanel() {
  const [collapsedBays, setCollapsedBays] = useState<Record<string, boolean>>({});
  const design = useBuilderStore(builderSelectors.design);
  const selectedItemId = useBuilderStore(builderSelectors.selectedItemId);
  const addBay = useBuilderStore((state) => state.addBay);
  const removeBay = useBuilderStore((state) => state.removeBay);
  const moveBay = useBuilderStore((state) => state.moveBay);
  const updateBayWidth = useBuilderStore((state) => state.updateBayWidth);
  const addCompartment = useBuilderStore((state) => state.addCompartment);
  const removeCompartment = useBuilderStore((state) => state.removeCompartment);
  const moveCompartment = useBuilderStore((state) => state.moveCompartment);
  const updateCompartmentHeight = useBuilderStore(
    (state) => state.updateCompartmentHeight,
  );
  const setDepth = useBuilderStore((state) => state.setDepth);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const selection = useMemo(
    () => getSelectionInfo(design, selectedItemId),
    [design, selectedItemId],
  );

  const selectedBayId =
    selection?.kind === 'bay'
      ? selection.bay.id
      : selection?.kind === 'compartment'
        ? selection.bay.id
        : null;

  const selectedBayIndex =
    selectedBayId !== null
      ? design.bays.findIndex((bay) => bay.id === selectedBayId)
      : -1;

  const selectedCompartmentIndex =
    selection?.kind === 'compartment'
      ? selection.bay.compartments.findIndex(
          (compartment) => compartment.id === selection.compartment.id,
        )
      : -1;

  useEffect(() => {
    if (!selectedBayId) {
      return;
    }

    setCollapsedBays((current) => ({
      ...current,
      [selectedBayId]: false,
    }));
  }, [selectedBayId]);

  const toggleBayCollapsed = (bayId: string) => {
    setCollapsedBays((current) => ({
      ...current,
      [bayId]: !current[bayId],
    }));
  };

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Structure</h2>
          <p>Bays and vertical compartment stacks.</p>
        </div>
        <button type="button" className="button button--primary" onClick={addBay}>
          Add bay
        </button>
      </div>

      <div className="structure-tree">
        {design.bays.map((bay, bayIndex) => (
          (() => {
            const totalCompartmentHeight = getBayCompartmentHeightTotal(
              bay.compartments.map((compartment) => compartment.height),
            );

            return (
              <div key={bay.id} className="structure-tree__bay">
                <div className="structure-tree__header">
                  <button
                    type="button"
                    className={`structure-tree__item ${
                      selection?.id === bay.id ? 'is-selected' : ''
                    }`}
                    onClick={() => selectItem(bay.id)}
                  >
                    <span>Bay {bayIndex + 1}</span>
                    <small>
                      w {bay.width} mm | h {totalCompartmentHeight} mm
                    </small>
                  </button>
                  <button
                    type="button"
                    className="structure-tree__toggle"
                    aria-expanded={!collapsedBays[bay.id]}
                    onClick={() => toggleBayCollapsed(bay.id)}
                  >
                    {collapsedBays[bay.id] ? '+' : '-'}
                  </button>
                </div>
                {!collapsedBays[bay.id] ? (
                  <div className="structure-tree__children">
                    {bay.compartments.map((compartment, compartmentIndex) => {
                      const panelCount =
                        (compartment.panels.backPanel ? 1 : 0) +
                        (compartment.panels.topPanel ? 1 : 0) +
                        (compartment.panels.bottomPanel ? 1 : 0) +
                        compartment.panels.sidePanels.length;

                      return (
                        <button
                          key={compartment.id}
                          type="button"
                          className={`structure-tree__item structure-tree__item--child ${
                            selection?.id === compartment.id ? 'is-selected' : ''
                          }`}
                          onClick={() => selectItem(compartment.id)}
                        >
                          <span>Compartment {compartmentIndex + 1}</span>
                          <small>
                            {compartment.height} mm | {compartment.primaryInsert.type}{' '}
                            | {formatPanelSummary(panelCount)}
                          </small>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })()
        ))}
      </div>

      <div className="form-grid">
        <label>
          <span>Overall depth</span>
          <select
            value={design.depth}
            onChange={(event) =>
              setDepth(
                Number(event.target.value) as (typeof DEPTH_PRESETS)[number],
              )
            }
          >
            {DEPTH_PRESETS.map((depth) => (
              <option key={depth} value={depth}>
                {depth} mm
              </option>
            ))}
          </select>
        </label>
      </div>

      {selection?.kind === 'bay' ? (
        <div className="form-grid">
          <label>
            <span>Bay width</span>
            <select
              value={selection.bay.width}
              onChange={(event) =>
                updateBayWidth(
                  selection.bay.id,
                  Number(event.target.value) as (typeof WIDTH_PRESETS)[number],
                )
              }
            >
              {WIDTH_PRESETS.map((width) => (
                <option key={width} value={width}>
                  {width} mm
                </option>
              ))}
            </select>
          </label>
          <div className="panel-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => moveBay(selection.bay.id, 'left')}
              disabled={selectedBayIndex <= 0}
            >
              Move left
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => moveBay(selection.bay.id, 'right')}
              disabled={selectedBayIndex >= design.bays.length - 1}
            >
              Move right
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => addCompartment(selection.bay.id)}
            >
              Add compartment
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => removeBay(selection.bay.id)}
            >
              Remove bay
            </button>
          </div>
        </div>
      ) : null}

      {selection?.kind === 'compartment' ? (
        <div className="form-grid">
          <label>
            <span>Compartment height</span>
            <select
              value={selection.compartment.height}
              onChange={(event) =>
                updateCompartmentHeight(
                  selection.compartment.id,
                  Number(event.target.value) as (typeof HEIGHT_PRESETS)[number],
                )
              }
            >
              {HEIGHT_PRESETS.map((height) => (
                <option key={height} value={height}>
                  {height} mm
                </option>
              ))}
            </select>
          </label>
          <div className="panel-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() =>
                moveCompartment(selection.bay.id, selection.compartment.id, 'up')
              }
              disabled={
                selectedCompartmentIndex >=
                selection.bay.compartments.length - 1
              }
            >
              Move up
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() =>
                moveCompartment(selection.bay.id, selection.compartment.id, 'down')
              }
              disabled={selectedCompartmentIndex <= 0}
            >
              Move down
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => addCompartment(selection.bay.id)}
            >
              Add compartment to bay
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() =>
                removeCompartment(selection.bay.id, selection.compartment.id)
              }
            >
              Remove compartment
            </button>
          </div>
        </div>
      ) : null}

      {selectedBayId ? (
        <p className="panel-footnote">
          Active bay: {selectedBayId}. Compartments derive their vertical position
          automatically from stack order.
        </p>
      ) : null}
    </section>
  );
}
