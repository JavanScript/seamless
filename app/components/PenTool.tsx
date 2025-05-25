'use client'

import React, { useState, useRef } from 'react'
import { Stage, Layer, Line, Circle, Path } from 'react-konva'

export interface PathPoint {
  x: number
  y: number
  controlIn?: { x: number; y: number }
  controlOut?: { x: number; y: number }
}

export interface CustomPath {
  id: string
  points: PathPoint[]
  closed: boolean
  fill?: string
  stroke?: string
  strokeWidth?: number
}

interface PenToolProps {
  onPathComplete: (path: CustomPath) => void
  currentPath: CustomPath | null
  onUpdatePath: (path: CustomPath) => void
}

const PenTool: React.FC<PenToolProps> = ({ onPathComplete, currentPath, onUpdatePath }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [isDraggingControl, setIsDraggingControl] = useState<'in' | 'out' | null>(null)

  const handlePointClick = (index: number, e: any) => {
    e.cancelBubble = true
    
    if (!currentPath) return

    // If clicking on the first point while drawing, close the path
    if (isDrawing && index === 0 && currentPath.points.length > 2) {
      const closedPath = { ...currentPath, closed: true }
      onUpdatePath(closedPath)
      onPathComplete(closedPath)
      setIsDrawing(false)
      setSelectedPoint(null)
    } else {
      setSelectedPoint(index)
    }
  }

  const handleStageClick = (e: any) => {
    const pos = e.target.getStage().getPointerPosition()
    
    if (!isDrawing && !currentPath) {
      // Start a new path
      const newPath: CustomPath = {
        id: `path-${Date.now()}`,
        points: [{
          x: pos.x,
          y: pos.y,
          controlOut: { x: pos.x + 50, y: pos.y }
        }],
        closed: false,
        stroke: '#000000',
        strokeWidth: 2
      }
      onUpdatePath(newPath)
      setIsDrawing(true)
      setSelectedPoint(0)
    } else if (isDrawing && currentPath) {
      // Add a new point to the current path
      const lastPoint = currentPath.points[currentPath.points.length - 1]
      const newPoint: PathPoint = {
        x: pos.x,
        y: pos.y,
        controlIn: { x: pos.x - 50, y: pos.y },
        controlOut: { x: pos.x + 50, y: pos.y }
      }
      
      // Update the last point's control out to point towards the new point
      if (lastPoint.controlOut) {
        const dx = pos.x - lastPoint.x
        const dy = pos.y - lastPoint.y
        lastPoint.controlOut = {
          x: lastPoint.x + dx * 0.3,
          y: lastPoint.y + dy * 0.3
        }
      }
      
      onUpdatePath({
        ...currentPath,
        points: [...currentPath.points.slice(0, -1), lastPoint, newPoint]
      })
      setSelectedPoint(currentPath.points.length)
    }
  }

  const handleControlDrag = (pointIndex: number, controlType: 'in' | 'out', e: any) => {
    if (!currentPath) return

    const pos = e.target.position()
    const updatedPoints = [...currentPath.points]
    const point = updatedPoints[pointIndex]

    if (controlType === 'in' && point.controlIn) {
      point.controlIn = { x: pos.x, y: pos.y }
    } else if (controlType === 'out' && point.controlOut) {
      point.controlOut = { x: pos.x, y: pos.y }
    }

    onUpdatePath({ ...currentPath, points: updatedPoints })
  }

  const getPathData = (path: CustomPath): string => {
    if (path.points.length < 2) return ''

    let pathData = `M ${path.points[0].x} ${path.points[0].y}`

    for (let i = 1; i < path.points.length; i++) {
      const prevPoint = path.points[i - 1]
      const point = path.points[i]

      if (prevPoint.controlOut && point.controlIn) {
        pathData += ` C ${prevPoint.controlOut.x} ${prevPoint.controlOut.y}, ${point.controlIn.x} ${point.controlIn.y}, ${point.x} ${point.y}`
      } else {
        pathData += ` L ${point.x} ${point.y}`
      }
    }

    if (path.closed && path.points.length > 2) {
      const lastPoint = path.points[path.points.length - 1]
      const firstPoint = path.points[0]

      if (lastPoint.controlOut && firstPoint.controlIn) {
        pathData += ` C ${lastPoint.controlOut.x} ${lastPoint.controlOut.y}, ${firstPoint.controlIn.x} ${firstPoint.controlIn.y}, ${firstPoint.x} ${firstPoint.y}`
      }
      pathData += ' Z'
    }

    return pathData
  }

  return (
    <div className="pen-tool-overlay">
      {currentPath && (
        <>
          {/* Path */}
          <Path
            data={getPathData(currentPath)}
            fill={currentPath.closed ? currentPath.fill : 'none'}
            stroke={currentPath.stroke}
            strokeWidth={currentPath.strokeWidth}
          />

          {/* Points and Controls */}
          {currentPath.points.map((point, index) => (
            <React.Fragment key={index}>
              {/* Control handles */}
              {selectedPoint === index && (
                <>
                  {point.controlIn && (
                    <>
                      <Line
                        points={[point.x, point.y, point.controlIn.x, point.controlIn.y]}
                        stroke="#999"
                        strokeWidth={1}
                      />
                      <Circle
                        x={point.controlIn.x}
                        y={point.controlIn.y}
                        radius={4}
                        fill="#fff"
                        stroke="#999"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => handleControlDrag(index, 'in', e)}
                      />
                    </>
                  )}
                  {point.controlOut && (
                    <>
                      <Line
                        points={[point.x, point.y, point.controlOut.x, point.controlOut.y]}
                        stroke="#999"
                        strokeWidth={1}
                      />
                      <Circle
                        x={point.controlOut.x}
                        y={point.controlOut.y}
                        radius={4}
                        fill="#fff"
                        stroke="#999"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => handleControlDrag(index, 'out', e)}
                      />
                    </>
                  )}
                </>
              )}

              {/* Point */}
              <Circle
                x={point.x}
                y={point.y}
                radius={5}
                fill={selectedPoint === index ? '#0066ff' : '#fff'}
                stroke={index === 0 && isDrawing ? '#00ff00' : '#0066ff'}
                strokeWidth={2}
                onClick={(e) => handlePointClick(index, e)}
                onTap={(e) => handlePointClick(index, e)}
              />
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  )
}

export default PenTool 