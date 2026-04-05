import { FinishesPanel } from './FinishesPanel';
import { SelectionPanel } from './SelectionPanel';
import { StructurePanel } from './StructurePanel';
import { ValidationPanel } from './ValidationPanel';

export function Sidebar() {
  return (
    <aside className="app-sidebar">
      <StructurePanel />
      <SelectionPanel />
      <FinishesPanel />
      <ValidationPanel />
    </aside>
  );
}
