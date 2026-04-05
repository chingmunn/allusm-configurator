import { describe, expect, it } from 'vitest';
import { createDefaultDesign } from '../model/defaultDesign';
import { deriveBom } from './deriveBom';

describe('deriveBom', () => {
  it('counts bays, compartments, inserts, and attached panels', () => {
    const bom = deriveBom(createDefaultDesign());

    expect(bom.totalBays).toBe(3);
    expect(bom.totalCompartments).toBe(7);
    expect(bom.insertCounts.bench).toBe(1);
    expect(bom.insertCounts.hanger_rail).toBe(1);
    expect(bom.insertCounts.back_panel).toBeGreaterThanOrEqual(1);
    expect(bom.insertCounts.side_panel).toBeGreaterThanOrEqual(1);
  });

  it('aggregates panel finishes across primary inserts and panel attachments', () => {
    const bom = deriveBom(createDefaultDesign());

    expect(bom.panelCountsByFinish['blue-stain']).toBeGreaterThanOrEqual(1);
    expect(bom.panelCountsByFinish['red-stain']).toBeGreaterThanOrEqual(1);
  });
});
