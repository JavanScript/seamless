'use client'

import { useRef, useEffect } from 'react'
import { Rect } from 'react-konva'
import type Konva from 'konva'
import { CanvasElement } from '../../types/canvas'

interface RectangleProps {
  shapeProps: CanvasElement
  isSelected: boolean
  onSelect: (e?: any) => void
  onChange: (props: Partial<CanvasElement>) => void
}

const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Rect>(null)

  // Update transformer on shape changes
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.getSelfRect = () => {
        return {
          x: 0,
          y: 0,
          width: shapeProps.width,
          height: shapeProps.height,
        }
      }
    }
  }, [isSelected, shapeProps])

  const handleDragEnd = (e: any) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    })
  }

  const handleTransformEnd = (e: any) => {
    // Transformer changes the scale of the node
    // We need to reset the scale and update width and height
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    })
  }

  const getShadowProps = () => {
    if (!shapeProps.shadowEnabled) return {}
    
    return {
      shadowBlur: shapeProps.shadowBlur,
      shadowColor: shapeProps.shadowColor,
      shadowOffsetX: shapeProps.shadowOffsetX,
      shadowOffsetY: shapeProps.shadowOffsetY,
    }
  }

  const getFillProps = () => {
    if (shapeProps.fillType === 'gradient' && shapeProps.gradient) {
      const { type, stops, angle, start, end, startRadius, endRadius } = shapeProps.gradient;
      const colorStops = stops.flatMap(s => [s.position / 100, s.color]);

      if (type === 'linear') {
        // Calculate start and end points for linear gradient based on angle and shape bounds
        // Konva's linear gradient angle is different from CSS. 0 is horizontal right, 90 is vertical down.
        // For simplicity, let's assume angle maps to simple x/y offsets for now or direct points are given.
        // A more robust solution would convert CSS-like angle to Konva's x/y points.
        const x = 0, y = 0, width = shapeProps.width || 0, height = shapeProps.height || 0;
        let startPoint = { x: start?.x ?? 0, y: start?.y ?? 0 };
        let endPoint = { x: end?.x ?? width, y: end?.y ?? 0 }; // Default horizontal

        if (angle !== undefined) {
            // Basic angle mapping, can be improved
            if (angle === 0) { startPoint = {x:0, y:0}; endPoint = {x:width, y:0}; }
            else if (angle === 45) { startPoint = {x:0, y:0}; endPoint = {x:width, y:height}; }
            else if (angle === 90) { startPoint = {x:0, y:0}; endPoint = {x:0, y:height}; }
            else if (angle === 135) { startPoint = {x:width, y:0}; endPoint = {x:0, y:height}; }
            else if (angle === 180) { startPoint = {x:width, y:0}; endPoint = {x:0, y:0}; }
            // etc. A full trigonometric calculation is better.
        }

        return {
          fillPriority: 'gradient',
          fillLinearGradientStartPoint: startPoint,
          fillLinearGradientEndPoint: endPoint,
          fillLinearGradientColorStops: colorStops,
        };
      } else if (type === 'radial') {
        return {
          fillPriority: 'gradient',
          fillRadialGradientStartPoint: start || { x: (shapeProps.width || 0) / 2, y: (shapeProps.height || 0) / 2 },
          fillRadialGradientEndPoint: end || { x: (shapeProps.width || 0) / 2, y: (shapeProps.height || 0) / 2 },
          fillRadialGradientStartRadius: startRadius || 0,
          fillRadialGradientEndRadius: endRadius || (Math.max(shapeProps.width || 0, shapeProps.height || 0) / 2), 
          fillRadialGradientColorStops: colorStops,
        };
      }
    }
    return { fillPriority: 'color', fill: shapeProps.fill }; // Solid color by default
  }

  return (
    <Rect
      id={shapeProps.id}
      ref={shapeRef}
      x={shapeProps.x}
      y={shapeProps.y}
      width={shapeProps.width}
      height={shapeProps.height}
      {...getFillProps()}
      stroke={shapeProps.stroke}
      strokeWidth={shapeProps.strokeWidth}
      opacity={shapeProps.opacity}
      rotation={shapeProps.rotation}
      {...getShadowProps()}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  )
}

export default Rectangle 