import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { deriveBom } from '../geometry/deriveBom';
import { parseDesignJson } from '../model/serialization';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';

function formatMillimeters(value: number): string {
  return `${value.toLocaleString()} mm`;
}

export function SummaryPanel() {
  const design = useBuilderStore(builderSelectors.design);
  const exportDesignJson = useBuilderStore((state) => state.exportDesignJson);
  const loadDesign = useBuilderStore((state) => state.loadDesign);
  const resetDesign = useBuilderStore((state) => state.resetDesign);
  const importError = useBuilderStore((state) => state.importError);
  const setImportError = useBuilderStore((state) => state.setImportError);
  const clearImportError = useBuilderStore((state) => state.clearImportError);

  const bom = useMemo(() => deriveBom(design), [design]);
  const exportedJson = useMemo(() => exportDesignJson(), [design, exportDesignJson]);
  const [importText, setImportText] = useState(exportedJson);

  useEffect(() => {
    setImportText(exportedJson);
  }, [exportedJson]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportedJson);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wardrobe-design.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsed = parseDesignJson(importText);
      loadDesign(parsed);
      clearImportError();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.');
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
  };

  return (
    <aside className="summary-rail">
      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <h2>Summary</h2>
            <p>Dimensions, counts, BOM, and data exchange.</p>
          </div>
        </div>

        <div className="summary-stats">
          <div className="summary-stat">
            <span>Total width</span>
            <strong>{formatMillimeters(bom.dimensions.width)}</strong>
          </div>
          <div className="summary-stat">
            <span>Total height</span>
            <strong>{formatMillimeters(bom.dimensions.height)}</strong>
          </div>
          <div className="summary-stat">
            <span>Total depth</span>
            <strong>{formatMillimeters(bom.dimensions.depth)}</strong>
          </div>
          <div className="summary-stat">
            <span>Bays</span>
            <strong>{bom.totalBays}</strong>
          </div>
          <div className="summary-stat">
            <span>Compartments</span>
            <strong>{bom.totalCompartments}</strong>
          </div>
        </div>

        <div className="summary-block">
          <h3>Insert counts</h3>
          <ul className="compact-list">
            {Object.entries(bom.insertCounts).map(([type, count]) => (
              <li key={type}>
                <span>{type}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-block">
          <h3>Panel counts by finish</h3>
          <ul className="compact-list">
            {Object.entries(bom.panelCountsByFinish).map(([finish, count]) => (
              <li key={finish}>
                <span>{finish}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-block">
          <h3>Extrusion summary</h3>
          <ul className="compact-list">
            <li>
              <span>Vertical members</span>
              <strong>
                {bom.extrusionSummary.verticalMembers.count} pcs |{' '}
                {formatMillimeters(bom.extrusionSummary.verticalMembers.totalLength)}
              </strong>
            </li>
            <li>
              <span>Horizontal members</span>
              <strong>
                {bom.extrusionSummary.horizontalMembers.count} pcs |{' '}
                {formatMillimeters(
                  bom.extrusionSummary.horizontalMembers.totalLength,
                )}
              </strong>
            </li>
            <li>
              <span>Depth members</span>
              <strong>
                {bom.extrusionSummary.depthMembers.count} pcs |{' '}
                {formatMillimeters(bom.extrusionSummary.depthMembers.totalLength)}
              </strong>
            </li>
          </ul>
        </div>

        <div className="summary-block">
          <h3>Export / import</h3>
          <div className="panel-actions">
            <button type="button" className="button button--primary" onClick={handleCopy}>
              Copy JSON
            </button>
            <button type="button" className="button button--secondary" onClick={handleDownload}>
              Download JSON
            </button>
            <button type="button" className="button button--ghost" onClick={resetDesign}>
              Reset demo
            </button>
          </div>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="json-textarea"
            spellCheck={false}
          />
          <div className="panel-actions">
            <button type="button" className="button button--primary" onClick={handleImport}>
              Import JSON
            </button>
            <label className="button button--secondary button--file">
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleFileUpload}
              />
              Load file
            </label>
          </div>
          {importError ? <p className="error-text">{importError}</p> : null}
        </div>
      </section>
    </aside>
  );
}
