import { describe, expect, it } from 'vitest';
import { createDefaultDesign } from './defaultDesign';
import { parseDesignJson, serializeDesign } from './serialization';

describe('design serialization', () => {
  it('round-trips a valid design', () => {
    const original = createDefaultDesign();
    const parsed = parseDesignJson(serializeDesign(original));

    expect(parsed.bays).toHaveLength(original.bays.length);
    expect(parsed.frameFinish).toBe(original.frameFinish);
    expect(parsed.bays[0].compartments[0].panels.backPanel?.type).toBe('back_panel');
  });

  it('supports legacy single-insert compartment JSON', () => {
    const parsed = parseDesignJson(
      JSON.stringify({
        version: 1,
        frameFinish: 'raw-aluminium',
        baseType: 'casters',
        casterEnabled: true,
        bays: [
          {
            id: 'bay-1',
            width: 400,
            compartments: [
              {
                id: 'comp-1',
                height: 400,
                insert: {
                  type: 'back_panel',
                  finish: 'blue-stain',
                },
              },
            ],
          },
        ],
      }),
    );

    expect(parsed.bays[0].compartments[0].primaryInsert.type).toBe('open');
    expect(parsed.bays[0].compartments[0].panels.backPanel?.finish).toBe('blue-stain');
  });

  it('maps a legacy pegboard primary insert to a pegboard back panel', () => {
    const parsed = parseDesignJson(
      JSON.stringify({
        version: 1,
        frameFinish: 'raw-aluminium',
        baseType: 'casters',
        casterEnabled: true,
        bays: [
          {
            id: 'bay-1',
            width: 400,
            compartments: [
              {
                id: 'comp-1',
                height: 400,
                primaryInsert: {
                  type: 'pegboard',
                  finish: 'natural-oak',
                },
                panels: {
                  backPanel: null,
                  sidePanels: [],
                },
              },
            ],
          },
        ],
      }),
    );

    expect(parsed.bays[0].compartments[0].primaryInsert.type).toBe('open');
    expect(parsed.bays[0].compartments[0].panels.backPanel?.pegboard).toBe(true);
    expect(parsed.bays[0].compartments[0].panels.backPanel?.finish).toBe(
      'natural-oak',
    );
  });

  it('defaults compartment frame edges to enabled when omitted', () => {
    const parsed = parseDesignJson(
      JSON.stringify({
        version: 1,
        frameFinish: 'raw-aluminium',
        baseType: 'casters',
        casterEnabled: true,
        bays: [
          {
            id: 'bay-1',
            width: 400,
            compartments: [
              {
                id: 'comp-1',
                height: 400,
                primaryInsert: {
                  type: 'open',
                },
                panels: {
                  backPanel: null,
                  sidePanels: [],
                },
              },
            ],
          },
        ],
      }),
    );

    expect(parsed.bays[0].compartments[0].frameEdges.frontLeft).toBe(true);
    expect(parsed.bays[0].compartments[0].frameEdges.backRight).toBe(true);
    expect(parsed.bays[0].compartments[0].frameEdges.topFront).toBe(true);
    expect(parsed.bays[0].compartments[0].frameEdges.bottomLeft).toBe(true);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseDesignJson('{bad json')).toThrowError('Unable to parse JSON.');
  });
});
