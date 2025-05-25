'use client'

import React from 'react'
import {
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignTop,
  AlignCenterVertical,
  AlignBottom,
  Maximize2
} from 'lucide-react'
import { CanvasElement } from '../types/canvas'

interface AlignmentToolsProps {
  selectedElements: CanvasElement[]
  onUpdateElements: (updates: { id: string; props: Partial<CanvasElement> }[]) => void
}

const AlignmentTools: React.FC<AlignmentToolsProps> = ({
  selectedElements,
  onUpdateElements
}) => {
  if (selectedElements.length < 2) {
    return null
  }

  const getBounds = (element: CanvasElement) => {
    let left = element.x
    let top = element.y
    let right = element.x
    let bottom = element.y

    if (element.type === 'rectangle' || element.type === 'image' || element.type === 'text') {
      right = left + (element.width || 0)
      bottom = top + (element.height || 0)
    } else if (element.type === 'circle') {
      const radius = element.radius || 0
      left = element.x - radius
      top = element.y - radius
      right = element.x + radius
      bottom = element.y + radius
    } else if (element.type === 'line' && element.points) {
      const xPoints = element.points.filter((_, i) => i % 2 === 0)
      const yPoints = element.points.filter((_, i) => i % 2 === 1)
      left = Math.min(...xPoints)
      right = Math.max(...xPoints)
      top = Math.min(...yPoints)
      bottom = Math.max(...yPoints)
    }

    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }

  const alignLeft = () => {
    const leftMost = Math.min(...selectedElements.map(el => getBounds(el).left))
    const updates = selectedElements.map(el => {
      const bounds = getBounds(el)
      return {
        id: el.id,
        props: { x: leftMost + (el.x - bounds.left) }
      }
    })
    onUpdateElements(updates)
  }

  const alignCenter = () => {
    const allBounds = selectedElements.map(getBounds)
    const leftMost = Math.min(...allBounds.map(b => b.left))
    const rightMost = Math.max(...allBounds.map(b => b.right))
    const centerX = (leftMost + rightMost) / 2

    const updates = selectedElements.map((el, i) => {
      const bounds = allBounds[i]
      const elementCenterX = (bounds.left + bounds.right) / 2
      return {
        id: el.id,
        props: { x: el.x + (centerX - elementCenterX) }
      }
    })
    onUpdateElements(updates)
  }

  const alignRight = () => {
    const rightMost = Math.max(...selectedElements.map(el => getBounds(el).right))
    const updates = selectedElements.map(el => {
      const bounds = getBounds(el)
      return {
        id: el.id,
        props: { x: rightMost - bounds.width + (el.x - bounds.left) }
      }
    })
    onUpdateElements(updates)
  }

  const alignTop = () => {
    const topMost = Math.min(...selectedElements.map(el => getBounds(el).top))
    const updates = selectedElements.map(el => {
      const bounds = getBounds(el)
      return {
        id: el.id,
        props: { y: topMost + (el.y - bounds.top) }
      }
    })
    onUpdateElements(updates)
  }

  const alignMiddle = () => {
    const allBounds = selectedElements.map(getBounds)
    const topMost = Math.min(...allBounds.map(b => b.top))
    const bottomMost = Math.max(...allBounds.map(b => b.bottom))
    const centerY = (topMost + bottomMost) / 2

    const updates = selectedElements.map((el, i) => {
      const bounds = allBounds[i]
      const elementCenterY = (bounds.top + bounds.bottom) / 2
      return {
        id: el.id,
        props: { y: el.y + (centerY - elementCenterY) }
      }
    })
    onUpdateElements(updates)
  }

  const alignBottom = () => {
    const bottomMost = Math.max(...selectedElements.map(el => getBounds(el).bottom))
    const updates = selectedElements.map(el => {
      const bounds = getBounds(el)
      return {
        id: el.id,
        props: { y: bottomMost - bounds.height + (el.y - bounds.top) }
      }
    })
    onUpdateElements(updates)
  }

  const distributeHorizontally = () => {
    if (selectedElements.length < 3) return

    const sortedByX = [...selectedElements].sort((a, b) => {
      const boundsA = getBounds(a)
      const boundsB = getBounds(b)
      return (boundsA.left + boundsA.right) / 2 - (boundsB.left + boundsB.right) / 2
    })

    const firstBounds = getBounds(sortedByX[0])
    const lastBounds = getBounds(sortedByX[sortedByX.length - 1])
    const startX = (firstBounds.left + firstBounds.right) / 2
    const endX = (lastBounds.left + lastBounds.right) / 2
    const spacing = (endX - startX) / (sortedByX.length - 1)

    const updates = sortedByX.map((el, i) => {
      const bounds = getBounds(el)
      const currentCenterX = (bounds.left + bounds.right) / 2
      const targetCenterX = startX + spacing * i
      return {
        id: el.id,
        props: { x: el.x + (targetCenterX - currentCenterX) }
      }
    })
    onUpdateElements(updates)
  }

  const distributeVertically = () => {
    if (selectedElements.length < 3) return

    const sortedByY = [...selectedElements].sort((a, b) => {
      const boundsA = getBounds(a)
      const boundsB = getBounds(b)
      return (boundsA.top + boundsA.bottom) / 2 - (boundsB.top + boundsB.bottom) / 2
    })

    const firstBounds = getBounds(sortedByY[0])
    const lastBounds = getBounds(sortedByY[sortedByY.length - 1])
    const startY = (firstBounds.top + firstBounds.bottom) / 2
    const endY = (lastBounds.top + lastBounds.bottom) / 2
    const spacing = (endY - startY) / (sortedByY.length - 1)

    const updates = sortedByY.map((el, i) => {
      const bounds = getBounds(el)
      const currentCenterY = (bounds.top + bounds.bottom) / 2
      const targetCenterY = startY + spacing * i
      return {
        id: el.id,
        props: { y: el.y + (targetCenterY - currentCenterY) }
      }
    })
    onUpdateElements(updates)
  }

  return (
    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Align:</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={alignLeft}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={alignCenter}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Center"
          >
            <AlignCenterHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={alignRight}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <button
            onClick={alignTop}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Top"
          >
            <AlignTop className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={alignMiddle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Middle"
          >
            <AlignCenterVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={alignBottom}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Align Bottom"
          >
            <AlignBottom className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {selectedElements.length >= 3 && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribute:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={distributeHorizontally}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Distribute Horizontally"
              >
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400 rotate-90" />
              </button>
              <button
                onClick={distributeVertically}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Distribute Vertically"
              >
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AlignmentTools 