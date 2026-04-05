import type { CylinderDescriptor } from '../model/types';
import { SelectableCylinder } from './SelectableCylinder';

type HangerRailViewProps = {
  descriptor: CylinderDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function HangerRailView(props: HangerRailViewProps) {
  return <SelectableCylinder {...props} />;
}
