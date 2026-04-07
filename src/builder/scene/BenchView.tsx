import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type BenchViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function BenchView(props: BenchViewProps) {
  return <SelectableBox {...props} />;
}
