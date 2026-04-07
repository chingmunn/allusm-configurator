import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type ShelfViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function ShelfView(props: ShelfViewProps) {
  return <SelectableBox {...props} />;
}
