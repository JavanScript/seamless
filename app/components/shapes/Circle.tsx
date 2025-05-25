'use client'

import { useRef, useEffect } from 'react'
import { Circle as KonvaCircle } from 'react-konva'

interface CircleProps {
  shapeProps: any
  isSelected: boolean
  onSelect: (e?: any) => void
  onChange: (props: any) => void
}

const Circle: React.FC<CircleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<any>(null)

  // Update transformer on shape changes
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.getSelfRect = () => {
        return {
          x: -shapeProps.radius,
          y: -shapeProps.radius,
          width: shapeProps.radius * 2,
          height: shapeProps.radius * 2,
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

    // Use the average of scaleX and scaleY to determine the new radius
    const newRadius = Math.max(5, node.radius() * scaleX)

    // Reset scale to 1
    node.scaleX(1)
    node.scaleY(1)

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      radius: newRadius,
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

  return (
    <KonvaCircle
      id={shapeProps.id}
      ref={shapeRef}
      x={shapeProps.x}
      y={shapeProps.y}
      radius={shapeProps.radius}
      fill={shapeProps.fill}
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

export default Circle 