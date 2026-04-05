import { HEIGHT_PRESETS, WIDTH_PRESETS } from '../model/types';
import type { DesignConfig, ValidationIssue } from '../model/types';

function createIssue(
  severity: ValidationIssue['severity'],
  code: string,
  message: string,
  targetId?: string,
): ValidationIssue {
  return {
    id: `${severity}:${code}:${targetId ?? 'global'}`,
    severity,
    code,
    message,
    targetId,
  };
}

export function validateDesign(design: DesignConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (design.bays.length === 0) {
    issues.push(
      createIssue('error', 'design.empty', 'Add at least one bay to the design.'),
    );
  }

  design.bays.forEach((bay, bayIndex) => {
    if (!WIDTH_PRESETS.includes(bay.width)) {
      issues.push(
        createIssue(
          'error',
          'bay.width.invalid',
          `Bay ${bayIndex + 1} uses an unsupported width preset.`,
          bay.id,
        ),
      );
    }

    if (bay.compartments.length === 0) {
      issues.push(
        createIssue(
          'error',
          'bay.empty',
          `Bay ${bayIndex + 1} must contain at least one compartment.`,
          bay.id,
        ),
      );
    }

    bay.compartments.forEach((compartment, compartmentIndex) => {
      if (!HEIGHT_PRESETS.includes(compartment.height)) {
        issues.push(
          createIssue(
            'error',
            'compartment.height.invalid',
            `Compartment ${compartmentIndex + 1} in bay ${bayIndex + 1} uses an unsupported height preset.`,
            compartment.id,
          ),
        );
      }

      if (
        compartment.primaryInsert.type === 'bench' &&
        compartmentIndex !== 0
      ) {
        issues.push(
          createIssue(
            'error',
            'bench.position',
            'Bench modules can only be placed in the bottom compartment of a bay.',
            compartment.id,
          ),
        );
      }

      if (
        compartment.primaryInsert.type === 'hanger_rail' &&
        (bay.width < 400 || compartment.height < 500)
      ) {
        issues.push(
          createIssue(
            'error',
            'hanger_rail.minimum_size',
            'Hanger rails require a bay width of at least 400 mm and a compartment height of at least 500 mm.',
            compartment.id,
          ),
        );
      }

      const sideSet = new Set<string>();
      compartment.panels.sidePanels.forEach((panel) => {
        if (sideSet.has(panel.side)) {
          issues.push(
            createIssue(
              'error',
              'side_panel.duplicate_side',
              `Only one ${panel.side} side panel is allowed per compartment.`,
              compartment.id,
            ),
          );
        }
        sideSet.add(panel.side);
      });
    });
  });

  return issues;
}
