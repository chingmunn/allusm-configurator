import { BASE_ROOT_ID, FRAME_ROOT_ID } from './defaultDesign';
import type { DesignConfig, SelectionInfo } from './types';

export function getSelectionInfo(
  design: DesignConfig,
  selectedId: string | null,
): SelectionInfo | null {
  if (!selectedId) {
    return null;
  }

  if (selectedId === FRAME_ROOT_ID) {
    return {
      id: FRAME_ROOT_ID,
      kind: 'frame',
      label: 'Frame',
    };
  }

  if (selectedId === BASE_ROOT_ID) {
    return {
      id: BASE_ROOT_ID,
      kind: 'base',
      label: 'Base',
    };
  }

  const bay = design.bays.find((item) => item.id === selectedId);
  if (bay) {
    return {
      id: bay.id,
      kind: 'bay',
      label: `Bay ${design.bays.findIndex((item) => item.id === bay.id) + 1}`,
      bay,
    };
  }

  for (const designBay of design.bays) {
    const compartmentIndex = designBay.compartments.findIndex(
      (item) => item.id === selectedId,
    );
    if (compartmentIndex >= 0) {
      return {
        id: selectedId,
        kind: 'compartment',
        label: `Compartment ${compartmentIndex + 1}`,
        bay: designBay,
        compartment: designBay.compartments[compartmentIndex],
        compartmentIndex,
      };
    }
  }

  return null;
}
