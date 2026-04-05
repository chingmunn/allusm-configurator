import { useMemo } from 'react';
import { getSelectionInfo } from '../model/selection';
import { validateDesign } from '../rules/validateDesign';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';

export function ValidationPanel() {
  const design = useBuilderStore(builderSelectors.design);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const issues = useMemo(() => validateDesign(design), [design]);

  return (
    <section className="panel-card">
      <div className="panel-card__header">
        <div>
          <h2>Validation</h2>
          <p>Deterministic rule feedback for the current design.</p>
        </div>
      </div>

      {issues.length === 0 ? (
        <p className="empty-state empty-state--success">No validation issues.</p>
      ) : (
        <ul className="validation-list">
          {issues.map((issue) => {
            const targetSelection = issue.targetId
              ? getSelectionInfo(design, issue.targetId)
              : null;

            const targetLabel = (() => {
              if (!issue.targetId) {
                return null;
              }

              if (!targetSelection) {
                return issue.targetId;
              }

              if (targetSelection.kind === 'compartment') {
                const bayIndex = design.bays.findIndex(
                  (bay) => bay.id === targetSelection.bay.id,
                );
                return `Bay ${bayIndex + 1} / ${targetSelection.label}`;
              }

              return targetSelection.label;
            })();

            return (
              <li
                key={issue.id}
                className={`validation-list__item validation-list__item--${issue.severity}`}
              >
                <strong>{issue.severity.toUpperCase()}</strong>
                <div className="validation-list__content">
                  <span>{issue.message}</span>
                  {targetLabel ? (
                    <button
                      type="button"
                      className="validation-list__target"
                      onClick={() => selectItem(issue.targetId ?? null)}
                    >
                      View: {targetLabel}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
