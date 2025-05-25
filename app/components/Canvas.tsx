"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from "react-konva";
import type Konva from "konva";

// Define types for our canvas elements
export type ShapeType = "rectangle" | "circle" | "line" | "text";

export interface CanvasElement {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  points?: number[];
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  draggable: boolean;
}

export interface CanvasProps {
  width: number;
  height: number;
}

export interface CanvasHandle {
  addElement: (type: ShapeType, params: Partial<CanvasElement>) => void;
  deleteSelected: () => void;
  hasSelection: () => boolean;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ width, height }, ref) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  // Update transformer on selection change
  useEffect(() => {
    if (!transformerRef.current || !selectedId) return;

    const node = elements.find(elem => elem.id === selectedId);
    if (!node) return;

    // Find the corresponding Konva node
    const stage = stageRef.current;
    if (!stage) return;
    
    const selectedNode = stage.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  // Handle element selection
  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  // Handle canvas click for deselection
  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };
  
  // Handle drag end for updating element position
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const { x, y } = e.target.position();
    
    setElements(
      elements.map(el => {
        if (el.id === id) {
          return {
            ...el,
            x,
            y
          };
        }
        return el;
      })
    );
  };
  
  // Handle transform end for updating element size and position
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 but maintain the dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    setElements(
      elements.map(el => {
        if (el.id === id) {
          let updatedEl = { ...el };
          
          if (el.type === 'rectangle' || el.type === 'text') {
            updatedEl = {
              ...updatedEl,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            };
          } else if (el.type === 'circle') {
            updatedEl = {
              ...updatedEl, 
              x: node.x(),
              y: node.y(),
              radius: Math.max(5, el.radius! * scaleX), // Assuming uniform scaling
            };
          } else if (el.type === 'line') {
            // For lines, we need to scale all points
            const newPoints = [...(el.points || [])];
            for (let i = 0; i < newPoints.length; i += 2) {
              newPoints[i] *= scaleX;
              newPoints[i + 1] *= scaleY;
            }
            updatedEl = {
              ...updatedEl,
              x: node.x(),
              y: node.y(),
              points: newPoints,
            };
          }
          
          return updatedEl;
        }
        return el;
      })
    );
  };

  // Add a new element to the canvas
  const addElement = (type: ShapeType, params: Partial<CanvasElement> = {}) => {
    const id = Date.now().toString();
    const newElement: CanvasElement = {
      id,
      type,
      x: params.x || Math.random() * (width - 100),
      y: params.y || Math.random() * (height - 100),
      width: params.width || 100,
      height: params.height || 100,
      radius: params.radius || 50,
      text: params.text || "Text",
      points: params.points || [0, 0, 100, 100],
      fill: params.fill || "#3B82F6", // Default blue color
      stroke: params.stroke || "black",
      strokeWidth: params.strokeWidth || 1,
      draggable: true,
    };

    setElements([...elements, newElement]);
    setSelectedId(id);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };
  
  // Check if an element is selected
  const hasSelection = () => {
    return selectedId !== null;
  };
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addElement,
    deleteSelected,
    hasSelection
  }));

  // Render different shape types
  const renderElement = (element: CanvasElement) => {
    const props = {
      key: element.id,
      id: element.id,
      x: element.x,
      y: element.y,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      draggable: element.draggable,
      onClick: () => handleSelect(element.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, element.id),
    };

    switch (element.type) {
      case "rectangle":
        return (
          <Rect
            {...props}
            width={element.width}
            height={element.height}
          />
        );
      case "circle":
        return (
          <Circle
            {...props}
            radius={element.radius}
          />
        );
      case "line":
        return (
          <Line
            {...props}
            points={element.points}
          />
        );
      case "text":
        return (
          <Text
            {...props}
            text={element.text}
            fontSize={20}
            width={element.width}
            height={element.height}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col items-center">
      {/* Canvas Stage */}
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onClick={handleCanvasClick}
        className="border border-border rounded-md bg-white"
      >
        <Layer>
          {elements.map(renderElement)}
          {/* Transformer for selection */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resizing
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
});

export default Canvas;