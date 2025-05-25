'use client'

import { useState } from 'react'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Layers,
  Square,
  Circle as CircleIcon,
  Type,
  Image as ImageIcon,
  Slash,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { CanvasElement } from '../types/canvas'

interface LayersPanelProps {
  elements: CanvasElement[]
  selectedElement: CanvasElement | null
  onSelectElement: (element: CanvasElement | null) => void
  onUpdateElement: (id: string, props: Partial<CanvasElement>) => void
  onDeleteElement: (id: string) => void
  onReorderElements: (newOrder: CanvasElement[]) => void
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-4 h-4" />
      case 'circle':
        return <CircleIcon className="w-4 h-4" />
      case 'text':
        return <Type className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'line':
        return <Slash className="w-4 h-4" />
      default:
        return null
    }
  }

  const getElementName = (element: CanvasElement) => {
    if (element.type === 'text' && element.text) {
      return element.text.substring(0, 20) + (element.text.length > 20 ? '...' : '')
    }
    return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${elements.indexOf(element) + 1}`
  }

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedItem(elementId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = elements.findIndex(el => el.id === draggedItem)
    const targetIndex = elements.findIndex(el => el.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newElements = [...elements]
    const [removed] = newElements.splice(draggedIndex, 1)
    newElements.splice(targetIndex, 0, removed)

    onReorderElements(newElements)
    setDraggedItem(null)
  }

  const toggleVisibility = (element: CanvasElement) => {
    onUpdateElement(element.id, { 
      opacity: element.opacity === 0 ? 1 : 0 
    })
  }

  const toggleLock = (element: CanvasElement) => {
    onUpdateElement(element.id, { 
      locked: !(element as any).locked 
    })
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Layers</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">({elements.length})</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Layers List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {elements.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs mt-1">Add elements to see them here</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {[...elements].reverse().map((element) => (
                <div
                  key={element.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, element.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, element.id)}
                  onClick={() => onSelectElement(element)}
                  className={`
                    group flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors
                    ${selectedElement?.id === element.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${draggedItem === element.id ? 'opacity-50' : ''}
                  `}
                >
                  {/* Element Icon */}
                  <div className="text-gray-500 dark:text-gray-400">
                    {getElementIcon(element.type)}
                  </div>

                  {/* Element Name */}
                  <div className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                    {getElementName(element)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleVisibility(element)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title={element.opacity === 0 ? "Show" : "Hide"}
                    >
                      {element.opacity === 0 ? (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Eye className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLock(element)
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      title={(element as any).locked ? "Unlock" : "Lock"}
                    >
                      {(element as any).locked ? (
                        <Lock className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Unlock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      {!isCollapsed && elements.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              if (selectedElement) {
                onDeleteElement(selectedElement.id)
              }
            }}
            disabled={!selectedElement}
            className={`
              w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors
              ${selectedElement 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            Delete Selected Layer
          </button>
        </div>
      )}
    </div>
  )
}

export default LayersPanel 