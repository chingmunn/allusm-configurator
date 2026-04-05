import { memo, useMemo } from 'react';
import { deriveLayout } from '../geometry/deriveLayout';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';
import { BaseBoxView, BaseCylinderView } from './BaseView';
import { BayView } from './BayView';
import { BenchView } from './BenchView';
import { CeilingReferenceView } from './CeilingReferenceView';
import { CompartmentView } from './CompartmentView';
import { DrawerView } from './DrawerView';
import { FrameView } from './FrameView';
import { HangerRailView } from './HangerRailView';
import { HumanReferenceView } from './HumanReferenceView';
import { PanelView } from './PanelView';
import { PegboardView } from './PegboardView';
import { ShelfView } from './ShelfView';

function BuilderSceneInner() {
  const design = useBuilderStore(builderSelectors.design);
  const selectedItemId = useBuilderStore(builderSelectors.selectedItemId);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const clearSelection = () => selectItem(null);
  const layout = useMemo(() => deriveLayout(design), [design]);

  return (
    <group position={layout.sceneOffset}>
      <CeilingReferenceView
        width={layout.dimensions.width}
        depth={layout.dimensions.depth}
        height={2600}
        onDeselect={clearSelection}
      />

      {layout.bays.map((bay) => (
        <BayView
          key={`bay-volume-${bay.bayId}`}
          bayId={bay.bayId}
          position={[
            bay.xStart + bay.width / 2,
            layout.dimensions.height / 2,
            layout.dimensions.depth / 2,
          ]}
          size={[bay.width, layout.dimensions.height, layout.dimensions.depth]}
          selected={selectedItemId === bay.bayId}
          onSelect={selectItem}
        />
      ))}

      {design.showHumanReference ? (
        <HumanReferenceView
          position={[
            layout.dimensions.width * 0.5,
            0,
            layout.dimensions.depth + 420,
          ]}
          onDeselect={clearSelection}
        />
      ) : null}

      {layout.boxes.map((descriptor) => {
        const selected = descriptor.selectId === selectedItemId;

        switch (descriptor.kind) {
          case 'frame':
            return (
              <FrameView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'panel':
            return (
              <PanelView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'pegboard':
            return (
              <PegboardView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'shelf':
            return (
              <ShelfView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'bench':
            return (
              <BenchView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'drawer':
            return (
              <DrawerView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'base':
            return (
              <BaseBoxView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          case 'compartment':
            return (
              <CompartmentView
                key={descriptor.id}
                descriptor={descriptor}
                selected={selected}
                onSelect={selectItem}
              />
            );
          default:
            return null;
        }
      })}

      {layout.cylinders.map((descriptor) => {
        const selected = descriptor.selectId === selectedItemId;
        if (descriptor.kind === 'rail') {
          return (
            <HangerRailView
              key={descriptor.id}
              descriptor={descriptor}
              selected={selected}
              onSelect={selectItem}
            />
          );
        }

        return (
          <BaseCylinderView
            key={descriptor.id}
            descriptor={descriptor}
            selected={selected}
            onSelect={selectItem}
          />
        );
      })}
    </group>
  );
}

export const BuilderScene = memo(BuilderSceneInner);
