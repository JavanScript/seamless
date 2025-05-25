'use client'

import { useRef, useEffect } from 'react'
import { Line as KonvaLine } from 'react-konva'
import type Konva from 'konva'

interface LineProps {
  shapeProps: any
  isSelected: boolean
  onSelect: () => void
  onChange: (props: any) => void
}

const Line: React.FC<LineProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Line>(null)

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = shapeRef.current
    if (!node) return

    const dx = node.x()
    const dy = node.y()
    
    const newPoints = shapeProps.points.map((p: number, i: number) => {
      return i % 2 === 0 ? p + dx : p + dy
    })

    onChange({
      ...shapeProps,
      points: newPoints,
      x: 0,
      y: 0,
    })
  }

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current
    if (!node) return

    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    const rotation = node.rotation()

    let newPoints = [...shapeProps.points]

    const tr = new Konva.Transform()
    tr.translate(node.x(), node.y())
    tr.rotate(rotation * Math.PI / 180)
    tr.scale(scaleX, scaleY)

    const transformedPoints: number[] = []
    for (let i = 0; i < newPoints.length; i += 2) {
      const p = tr.point({ x: newPoints[i], y: newPoints[i+1] })
      transformedPoints.push(p.x, p.y)
    }
    
    node.scaleX(1)
    node.scaleY(1)
    node.rotation(0)
    node.x(0)
    node.y(0)

    onChange({
      ...shapeProps,
      points: transformedPoints,
      x: 0,
      y: 0,
      rotation: 0,
    })
  }

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected, shapeProps.points])

  return (
    <KonvaLine
      id={shapeProps.id}
      ref={shapeRef}
      points={shapeProps.points}
      x={shapeProps.x || 0}
      y={shapeProps.y || 0}
      stroke={shapeProps.stroke}
      strokeWidth={shapeProps.strokeWidth}
      tension={0}
      lineCap="round"
      lineJoin="round"
      opacity={shapeProps.opacity}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  )
}

export default Line 