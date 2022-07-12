import type { Knob } from "@prisma/client";
import clsx from "clsx";
import * as React from "react";
import { useCanvas } from "~/hooks/useCanvas";
import { drawPedal } from "~/utils/canvas/helper";
import type { PedalShape, Position } from "~/utils/canvas/types";
import { checkKnobTarget } from "~/utils/check-knob-target";
import KnobOverlay from "./KnobOberlay";

interface PedalCanvasProps {
  pedalShape: PedalShape;
  resolution?: number;
  width?: number;
  height?: number;
  hasBackground?: boolean;
}

export default function PedalCanvas({
  pedalShape,
  resolution = 2,
  width = 500,
  height = 500,
  hasBackground = false,
}: PedalCanvasProps) {
  const { canvasRef, context } = useCanvas();

  const [selectedKnob, setSelectedKnob] = React.useState<Knob | null>(null);

  const isMouseDown = React.useRef(false);
  const isRotationMode = React.useRef(false);

  const dragTarget = React.useRef<Knob | null>(null);

  const startPos = React.useRef<Position>({ x: 0, y: 0 });

  const inputPosXRef = React.useRef<HTMLInputElement>(null);
  const inputPosYRef = React.useRef<HTMLInputElement>(null);

  const selectedKnobId = selectedKnob?.id;
  const canvas = canvasRef.current;

  React.useEffect(() => {
    if (canvas && context && pedalShape) {
      drawPedal({
        canvas,
        context,
        pedalShape,
        resolution,
        selectedId: selectedKnobId,
      });
    }
  }, [canvas, context, selectedKnobId, pedalShape, resolution]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (canvasRef.current && pedalShape) {
      startPos.current = {
        x: Number(e.nativeEvent.offsetX - canvasRef.current.clientLeft),
        y: Number(e.nativeEvent.offsetY - canvasRef.current.clientTop),
      };

      const { newDragTarget, isTarget, newIsRotate } = checkKnobTarget({
        position: startPos.current,
        resolution,
        knobs: pedalShape.knobs,
        onSelect: (knob) => {
          //   selectedKnob.current = knob;
          setSelectedKnob(knob);
        },
        onDeselect: () => setSelectedKnob(null),
      });

      isMouseDown.current = isTarget;
      isRotationMode.current = newIsRotate;
      dragTarget.current = newDragTarget;
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isMouseDown) return;

    if (canvasRef.current) {
      const mouseX = Number(
        e.nativeEvent.offsetX - canvasRef.current.clientLeft
      );
      const mouseY = Number(
        e.nativeEvent.offsetY - canvasRef.current.clientTop
      );
      const dx = mouseX - startPos.current.x;
      const dy = mouseY - startPos.current.y;

      startPos.current = {
        x: mouseX,
        y: mouseY,
      };

      if (!isRotationMode.current && dragTarget.current) {
        dragTarget.current.posX += dx;
        dragTarget.current.posY += dy;
        if (inputPosXRef.current && inputPosYRef.current) {
          inputPosXRef.current.value = dragTarget.current.posX.toString();
          inputPosYRef.current.value = dragTarget.current.posY.toString();
        }
      } else if (isRotationMode.current && dragTarget.current) {
        const radians = Math.atan2(mouseX - dx, mouseY - dy);
        const degree = radians * (180 / Math.PI) * -1 + 90;
        dragTarget.current.rotation = degree;
      }
      if (context && pedalShape)
        drawPedal({
          canvas: canvasRef.current,
          context,
          pedalShape,
          resolution,
          selectedId: selectedKnob?.id,
        });
    }
  };

  const handleMouseUp = () => {
    dragTarget.current = null;
    isRotationMode.current = false;
    isMouseDown.current = true;
  };

  const handleMouseOut = () => handleMouseUp();

  return (
    <div className="relative h-[500px]">
      <canvas
        className={clsx("rounded-2xl", { "bg-darkblue": hasBackground })}
        height={height * resolution}
        width={width * resolution}
        style={{
          // backgroundColor: "lightgray",
          height: height,
          width: width,
          aspectRatio: `auto ${height * resolution} / ${height * resolution}`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        ref={canvasRef}
      />

      {selectedKnob && (
        <KnobOverlay
          knob={selectedKnob}
          inputPosXRef={inputPosXRef}
          inputPosYRef={inputPosYRef}
          width={width}
        />
      )}
    </div>
  );
}