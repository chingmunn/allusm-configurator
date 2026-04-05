import { BuilderCanvas } from '../builder/scene/BuilderCanvas';
import { Sidebar } from '../builder/ui/Sidebar';
import { SummaryPanel } from '../builder/ui/SummaryPanel';

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Wardrobe / Shelving Configurator</p>
          <h1>Modular Builder MVP</h1>
        </div>
        <p className="app-header__copy">
          Assemble valid frame-and-panel structures from presets, inspect the
          design in 3D, and export JSON plus BOM-style summaries.
        </p>
      </header>

      <main className="app-layout">
        <Sidebar />
        <BuilderCanvas />
        <SummaryPanel />
      </main>
    </div>
  );
}
