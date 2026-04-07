import { describe, expect, it } from 'vitest';
import { createDefaultDesign } from '../model/defaultDesign';
import { deriveLayout } from './deriveLayout';

describe('deriveLayout', () => {
  it('derives overall dimensions from bays and stacked compartments', () => {
    const layout = deriveLayout(createDefaultDesign());

    expect(layout.dimensions.width).toBe(1500);
    expect(layout.dimensions.depth).toBe(500);
    expect(layout.dimensions.height).toBeGreaterThan(1000);
  });

  it('stacks compartment offsets from bottom to top', () => {
    const design = createDefaultDesign();
    const layout = deriveLayout(design);

    expect(layout.bays[0].compartmentOffsets).toEqual([72, 472]);
  });

  it('omits disabled compartment frame edges from frame geometry', () => {
    const design = createDefaultDesign();
    const compartment = design.bays[0].compartments[0];

    compartment.frameEdges.frontLeft = false;
    compartment.frameEdges.topFront = false;

    const layout = deriveLayout(design);
    const frameIds = layout.boxes
      .filter((box) => box.kind === 'frame')
      .map((box) => box.id);

    expect(frameIds).not.toContain(`frame-edge-${compartment.id}-frontLeft`);
    expect(frameIds).not.toContain(`frame-edge-${compartment.id}-topFront`);
    expect(frameIds).toContain(`frame-edge-${compartment.id}-frontRight`);
    expect(frameIds).toContain(`frame-edge-${compartment.id}-bottomBack`);
  });
});
