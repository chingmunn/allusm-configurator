import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type DrawerViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function DrawerView(props: DrawerViewProps) {
  return <SelectableBox {...props} />;
}
