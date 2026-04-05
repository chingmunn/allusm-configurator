import { describe, expect, it } from 'vitest';
import { createDefaultDesign } from '../model/defaultDesign';
import { validateDesign } from './validateDesign';

describe('validateDesign', () => {
  it('flags an empty design', () => {
    const design = createDefaultDesign();
    design.bays = [];

    const issues = validateDesign(design);

    expect(issues.some((issue) => issue.code === 'design.empty')).toBe(true);
  });

  it('flags a bay with no compartments', () => {
    const design = createDefaultDesign();
    design.bays[0].compartments = [];

    const issues = validateDesign(design);

    expect(issues.some((issue) => issue.code === 'bay.empty')).toBe(true);
  });

  it('flags a bench above the bottom compartment', () => {
    const design = createDefaultDesign();
    design.bays[0].compartments[1].primaryInsert = {
      type: 'bench',
      finish: 'natural-oak',
    };

    const issues = validateDesign(design);

    expect(issues.some((issue) => issue.code === 'bench.position')).toBe(true);
  });

  it('flags a hanger rail in a compartment that is too short', () => {
    const design = createDefaultDesign();
    design.bays[0].compartments[0].primaryInsert = {
      type: 'hanger_rail',
      finish: 'dark-metal',
    };

    const issues = validateDesign(design);

    expect(
      issues.some((issue) => issue.code === 'hanger_rail.minimum_size'),
    ).toBe(true);
  });

  it('allows both left and right side panels on the same compartment', () => {
    const design = createDefaultDesign();
    design.bays[1].compartments[0].panels.sidePanels = [
      {
        type: 'side_panel',
        finish: 'blue-stain',
        pegboard: false,
        side: 'left',
      },
      {
        type: 'side_panel',
        finish: 'red-stain',
        pegboard: false,
        side: 'right',
      },
    ];

    const issues = validateDesign(design);

    expect(issues.some((issue) => issue.code === 'side_panel.exposed_face')).toBe(
      false,
    );
    expect(issues.some((issue) => issue.code === 'side_panel.duplicate_side')).toBe(
      false,
    );
  });
});
