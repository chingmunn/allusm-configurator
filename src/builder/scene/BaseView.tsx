import type { BoxDescriptor, CylinderDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';
import { SelectableCylinder } from './SelectableCylinder';

type BaseBoxViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

type BaseCylinderViewProps = {
  descriptor: CylinderDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function BaseBoxView(props: BaseBoxViewProps) {
  return <SelectableBox {...props} />;
}

export function BaseCylinderView(props: BaseCylinderViewProps) {
  return <SelectableCylinder {...props} />;
}
