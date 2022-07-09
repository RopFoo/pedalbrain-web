import { KnobShape, Position } from "./helper";

type CheckKnobTargetParams = {
  position: Position;
  knobShapes: KnobShape[];
  onSelect?: (knob: KnobShape) => void;
};

export function checkKnobTarget({
  position,
  knobShapes,
  onSelect,
}: CheckKnobTargetParams) {
  const { x, y } = position;

  let newDragTarget: KnobShape | null = null;
  let newIsRotate = false;
  let isTarget = false;

  for (let i = 0; i < knobShapes.length; i++) {
    const knobShape = knobShapes[i];
    if (
      x >= knobShape.dragElement.x - 50 &&
      x <= knobShape.dragElement.x - 50 + knobShape.dragElement.w &&
      y >= knobShape.dragElement.y + 50 &&
      y <= knobShape.dragElement.y + 50 + knobShape.dragElement.h
    ) {
      newDragTarget = knobShape;
      newDragTarget.isSelected = true;

      newIsRotate = false;
      if (onSelect) onSelect(knobShape);

      isTarget = true;
      break;
    }
    if (
      x >= knobShape.rotateElement.x &&
      x >= knobShape.rotateElement.x &&
      x <= knobShape.rotateElement.x + knobShape.rotateElement.w &&
      y >= knobShape.rotateElement.y &&
      y <= knobShape.rotateElement.y + knobShape.rotateElement.h
    ) {
      newDragTarget = knobShape;
      newDragTarget.isSelected = true;
      newIsRotate = true;
      if (onSelect) onSelect(knobShape);

      isTarget = true;
      break;
    }
  }
  return { isTarget, newDragTarget, newIsRotate };
}
