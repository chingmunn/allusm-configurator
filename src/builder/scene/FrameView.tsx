import type { BoxDescriptor } from '../model/types';
import { SelectableBox } from './SelectableBox';

type FrameViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function FrameView(props: FrameViewProps) {
  return <SelectableBox {...props} />;
}
