import { useState, useCallback } from 'react'

interface SnapSettings {
  enabled: boolean
  gridSize: number
  snapToElements: boolean
  showGrid: boolean
}

export function useSnapToGrid(initialSettings?: Partial<SnapSettings>) {
  const [settings, setSettings] = useState<SnapSettings>({
    enabled: true,
    gridSize: 10,
    snapToElements: true,
    showGrid: true,
    ...initialSettings
  })

  const snapToGrid = useCallback((value: number): number => {
    if (!settings.enabled) return value
    return Math.round(value / settings.gridSize) * settings.gridSize
  }, [settings.enabled, settings.gridSize])

  const snapPosition = useCallback((x: number, y: number): { x: number; y: number } => {
    if (!settings.enabled) return { x, y }
    return {
      x: snapToGrid(x),
      y: snapToGrid(y)
    }
  }, [settings.enabled, snapToGrid])

  const getSnapLines = useCallback((
    currentElement: { x: number; y: number; width?: number; height?: number },
    otherElements: Array<{ x: number; y: number; width?: number; height?: number }>,
    threshold: number = 5
  ): { vertical: number[]; horizontal: number[] } => {
    if (!settings.snapToElements) return { vertical: [], horizontal: [] }

    const vertical: number[] = []
    const horizontal: number[] = []

    const currentBounds = {
      left: currentElement.x,
      right: currentElement.x + (currentElement.width || 0),
      centerX: currentElement.x + (currentElement.width || 0) / 2,
      top: currentElement.y,
      bottom: currentElement.y + (currentElement.height || 0),
      centerY: currentElement.y + (currentElement.height || 0) / 2
    }

    otherElements.forEach(element => {
      const bounds = {
        left: element.x,
        right: element.x + (element.width || 0),
        centerX: element.x + (element.width || 0) / 2,
        top: element.y,
        bottom: element.y + (element.height || 0),
        centerY: element.y + (element.height || 0) / 2
      }

      // Check vertical alignment
      if (Math.abs(currentBounds.left - bounds.left) < threshold) vertical.push(bounds.left)
      if (Math.abs(currentBounds.left - bounds.right) < threshold) vertical.push(bounds.right)
      if (Math.abs(currentBounds.right - bounds.left) < threshold) vertical.push(bounds.left)
      if (Math.abs(currentBounds.right - bounds.right) < threshold) vertical.push(bounds.right)
      if (Math.abs(currentBounds.centerX - bounds.centerX) < threshold) vertical.push(bounds.centerX)

      // Check horizontal alignment
      if (Math.abs(currentBounds.top - bounds.top) < threshold) horizontal.push(bounds.top)
      if (Math.abs(currentBounds.top - bounds.bottom) < threshold) horizontal.push(bounds.bottom)
      if (Math.abs(currentBounds.bottom - bounds.top) < threshold) horizontal.push(bounds.top)
      if (Math.abs(currentBounds.bottom - bounds.bottom) < threshold) horizontal.push(bounds.bottom)
      if (Math.abs(currentBounds.centerY - bounds.centerY) < threshold) horizontal.push(bounds.centerY)
    })

    return { vertical: [...new Set(vertical)], horizontal: [...new Set(horizontal)] }
  }, [settings.snapToElements])

  return {
    settings,
    setSettings,
    snapToGrid,
    snapPosition,
    getSnapLines
  }
} 