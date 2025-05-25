'use client'

import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Transformer } from 'react-konva'
import Rectangle from './shapes/Rectangle'
import Circle from './shapes/Circle'
import TextElement from './shapes/TextElement'
import ImageElement from './shapes/ImageElement'
import Line from './shapes/Line'
import { v4 as uuidv4 } from 'uuid'
import type Konva from 'konva' // Import Konva type for Stage node

interface DesignCanvasProps {
  elements: any[]
  selectedElement: any
  selectedElements?: any[]
  tool: string
  onSelect: (element: any | null, isMultiSelect?: boolean) => void
  onUpdate: (id: string, props: any) => void
  onAddElement: (element: any) => void
  onDelete: (id: string) => void
  stageRef: React.RefObject<Konva.Stage | null> // More specific type for stageRef
  // Props for line drawing
  isDrawingLine: boolean
  setIsDrawingLine: (isDrawing: boolean) => void
  currentLine: any // Could be more specific if CanvasElement type is imported here
  setCurrentLine: (line: any | null) => void
  setTool: (tool: string) => void; // Add setTool prop
  // Zoom and Pan props
  stageScale: number;
  setStageScale: (scale: number) => void;
  stagePosition: { x: number; y: number };
  setStagePosition: (position: { x: number; y: number }) => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  elements,
  selectedElement,
  selectedElements = [],
  tool,
  onSelect,
  onUpdate,
  onAddElement,
  onDelete,
  stageRef,
  isDrawingLine,
  setIsDrawingLine,
  currentLine,
  setCurrentLine,
  setTool, // Destructure setTool
  stageScale,
  setStageScale,
  stagePosition,
  setStagePosition,
}) => {
  const layerRef = useRef<Konva.Layer>(null) // Specific type
  const transformerRef = useRef<Konva.Transformer>(null) // Specific type
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const isPanningRef = useRef(false); // Ref to track panning state
  const lastPointerPositionRef = useRef({ x: 0, y: 0 }); // Ref for last pointer position during pan

  // Set up keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        if (selectedElements.length > 0) {
          // Delete all selected elements
          selectedElements.forEach(element => {
            onDelete(element.id)
          })
          onSelect(null)
        } else if (selectedElement) {
          // Delete single selected element
          onDelete(selectedElement.id)
          onSelect(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedElement, selectedElements, onDelete, onSelect])

  // Attach transformer to selected element(s)
  useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      const tr = transformerRef.current;
      const nodes: Konva.Node[] = [];
      
      // If we have multiple selected elements
      if (selectedElements.length > 0) {
        selectedElements.forEach(element => {
          const node = layerRef.current!.findOne(`#${element.id}`);
          if (node) {
            nodes.push(node);
          }
        });
      } 
      // Otherwise, if we have a single selected element
      else if (selectedElement) {
        const node = layerRef.current.findOne(`#${selectedElement.id}`);
        if (node) {
          nodes.push(node);
        }
      }
      
      tr.nodes(nodes);
      // Force a redraw of the layer containing the transformer
      tr.getLayer()?.batchDraw();
    }
  }, [selectedElement, selectedElements, elements]); // Add elements to dependency array to re-evaluate when element order changes

  const getPointerPosition = (): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return null;
    
    // Convert screen coordinates to canvas coordinates accounting for zoom and pan
    return {
      x: (pointerPos.x - stagePosition.x) / stageScale,
      y: (pointerPos.y - stagePosition.y) / stageScale
    };
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault(); // Prevent default browser scroll

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    // Determine new scale
    const scaleBy = 1.05;
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    // Clamp scale to a min/max range if desired
    newScale = Math.min(Math.max(newScale, 0.1), 10); 

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePosition(newPos);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'line') {
      if (isDrawingLine) return; // Should not happen if logic is correct elsewhere

      const pos = getPointerPosition();
      if (!pos) return;

      setIsDrawingLine(true);
      const newLineId = uuidv4();
      const newLine = {
        id: newLineId,
        type: 'line',
        points: [pos.x, pos.y, pos.x, pos.y], // Start and end at the same point initially
        stroke: '#000000',
        strokeWidth: 2,
        opacity: 1,
        x: 0, // Lines defined by points don't typically need separate x/y for the object itself unless grouped
        y: 0,
      };
      onAddElement(newLine); // Add to main elements state
      setCurrentLine(newLine); // Set as the line currently being drawn
      onSelect(newLine); // Select the new line
    } else if (tool === 'select' && e.target === e.currentTarget) {
      // Clicked on stage background with select tool: initiate panning
      isPanningRef.current = true;
      const pos = getPointerPosition();
      if (pos) lastPointerPositionRef.current = pos;
      // Potentially change cursor style for panning here
      // e.g., stageRef.current?.container().style.cursor = 'grabbing';
    } else {
      // If not drawing a line or panning, handle normal stage click for selection or other tools
      if (e.target === e.currentTarget) { 
        if (tool === 'select') {
          onSelect(null);
        } else {
          handleStageClick(e); 
        }
      } 
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDrawingLine && currentLine && tool === 'line') {
      const pos = getPointerPosition();
      if (!pos) return;

      const newPoints = [...currentLine.points];
      newPoints[2] = pos.x;
      newPoints[3] = pos.y;
      
      // Update the currentLine state in page.tsx for immediate feedback if needed,
      // but more importantly, update the element in the main elements array via onUpdate.
      onUpdate(currentLine.id, { ...currentLine, points: newPoints });
      // The currentLine state in page.tsx might also need an update if other components observe it directly
      setCurrentLine({ ...currentLine, points: newPoints }); 
    } else if (isPanningRef.current && tool === 'select') {
      // Handle panning
      const stage = stageRef.current;
      if (!stage) return;
      const pos = getPointerPosition();
      if (!pos) return;

      const dx = pos.x - lastPointerPositionRef.current.x;
      const dy = pos.y - lastPointerPositionRef.current.y;
      
      setStagePosition({
        x: stagePosition.x + dx,
        y: stagePosition.y + dy,
      });
      lastPointerPositionRef.current = pos;
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDrawingLine && tool === 'line') {
      setIsDrawingLine(false);
      // currentLine is already updated in elements array via onUpdate in handleMouseMove
      // Optionally, re-select it or perform any finalization
      if (currentLine) {
        onSelect(currentLine); // Ensure it remains selected
      }
      setCurrentLine(null); // Clear the temporary current line state
      setTool('select'); // Switch to select tool after finishing line drawing
    } else if (isPanningRef.current) {
      isPanningRef.current = false;
      // Reset cursor style if changed for panning
      // e.g., stageRef.current?.container().style.cursor = 'default';
    }
  };

  // This function now primarily handles non-line tool element creation on direct stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === 'line' || isDrawingLine || isPanningRef.current) return; 

    const stage = stageRef.current;
    if (!stage) return;

    if (e.target === e.currentTarget) { // Clicked on stage background
      if (tool === 'select') {
        onSelect(null);
      } else {
        const pos = getPointerPosition();
        if (!pos) return;
        const { x, y } = pos;
        let newElement: any; // Use 'any' or import CanvasElement type

        switch (tool) {
          case 'rectangle':
            newElement = { id: uuidv4(), type: 'rectangle', x, y, width: 100, height: 100, fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1, rotation: 0, shadowEnabled: false, shadowColor: 'black', shadowBlur: 5, shadowOffsetX: 5, shadowOffsetY: 5 };
            break;
          case 'circle':
            newElement = { id: uuidv4(), type: 'circle', x, y, radius: 50, fill: '#ffffff', stroke: '#000000', strokeWidth: 1, opacity: 1, rotation: 0, shadowEnabled: false, shadowColor: 'black', shadowBlur: 5, shadowOffsetX: 5, shadowOffsetY: 5 };
            break;
          case 'text':
            newElement = { 
              id: uuidv4(), type: 'text', x, y, text: 'Double click to edit', 
              fontSize: 18, fontFamily: 'Arial', fill: '#000000', 
              align: 'left', width: 200, opacity: 1, rotation: 0, 
              shadowEnabled: false, shadowColor: 'black', shadowBlur: 5, 
              shadowOffsetX: 5, shadowOffsetY: 5, isNew: true,
              fontStyleBold: false, // Default
              fontStyleItalic: false, // Default
              textDecorationUnderline: false, // Default
            };
            break;
          // Line case is removed from here as it's handled by mouse events
          default:
            return;
        }
        if (newElement) {
          onAddElement(newElement);
          onSelect(newElement);
        }
      }
    }
  };

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.canvas-container')
      if (container) {
        setStageSize({
          width: container.clientWidth || 800,
          height: container.clientHeight || 600,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div className="canvas-container w-full h-full flex items-center justify-center">
      <div className="relative bg-white shadow-lg" style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={false}
        >
          <Layer ref={layerRef}>
            {elements.map((element) => {
              switch (element.type) {
                case 'rectangle':
                  return (
                    <Rectangle
                      key={element.id}
                      shapeProps={element}
                      isSelected={selectedElement?.id === element.id || selectedElements.some(el => el.id === element.id)}
                      onSelect={(e) => {
                        const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey
                        onSelect(element, isMultiSelect)
                      }}
                      onChange={(newProps) => onUpdate(element.id, newProps)}
                    />
                  )
                case 'circle':
                  return (
                    <Circle
                      key={element.id}
                      shapeProps={element}
                      isSelected={selectedElement?.id === element.id || selectedElements.some(el => el.id === element.id)}
                      onSelect={(e) => {
                        const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey
                        onSelect(element, isMultiSelect)
                      }}
                      onChange={(newProps) => onUpdate(element.id, newProps)}
                    />
                  )
                case 'text':
                  return (
                    <TextElement
                      key={element.id}
                      shapeProps={element}
                      isSelected={selectedElement?.id === element.id || selectedElements.some(el => el.id === element.id)}
                      onSelect={(e) => {
                        const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey
                        onSelect(element, isMultiSelect)
                      }}
                      onChange={(newProps) => onUpdate(element.id, newProps)}
                      isNew={element.isNew}
                    />
                  )
                case 'image':
                  return (
                    <ImageElement
                      key={element.id}
                      shapeProps={element}
                      isSelected={selectedElement?.id === element.id || selectedElements.some(el => el.id === element.id)}
                      onSelect={(e) => {
                        const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey
                        onSelect(element, isMultiSelect)
                      }}
                      onChange={(newProps) => onUpdate(element.id, newProps)}
                    />
                  )
                case 'line':
                  return (
                    <Line
                      key={element.id}
                      shapeProps={element}
                      isSelected={selectedElement?.id === element.id || selectedElements.some(el => el.id === element.id)}
                      onSelect={(e) => {
                        const isMultiSelect = e?.evt?.ctrlKey || e?.evt?.metaKey
                        onSelect(element, isMultiSelect)
                      }}
                      onChange={(newProps) => onUpdate(element.id, newProps)}
                    />
                  )
                default:
                  return null
              }
            })}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              rotateEnabled={true}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default DesignCanvas 