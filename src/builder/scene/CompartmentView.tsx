import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type CompartmentViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function CompartmentView(props: CompartmentViewProps) {
  return <SelectableBox {...props} opacity={0.05} />;
}
