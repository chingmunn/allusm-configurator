import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type PanelViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function PanelView(props: PanelViewProps) {
  return <SelectableBox {...props} />;
}
