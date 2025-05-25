'use client'

import { useState, useRef, useEffect } from 'react'
// import DesignCanvas from './components/DesignCanvas'
import Toolbar from './components/Toolbar'
import PropertyPanel from './components/PropertyPanel'
import LayersPanel from './components/LayersPanel'
import ExportPanel from './components/ExportPanel'
import dynamic from 'next/dynamic'
import { v4 as uuidv4 } from 'uuid'
import type Konva from 'konva'; // Import Konva for types
import { CanvasElement } from './types/canvas'
import { useHistory } from './hooks/useHistory'
import { useAutoSave, loadFromLocalStorage } from './hooks/useAutoSave'

const DesignCanvas = dynamic(() => import('./components/DesignCanvas'), {
  ssr: false,
  loading: () => <p className="flex-1 flex items-center justify-center text-gray-500">Loading Canvas...</p>
})

export default function Home() {
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  
  // Load saved elements from localStorage
  const savedElements = typeof window !== 'undefined' ? loadFromLocalStorage<CanvasElement[]>('seamless-design-elements', []) : []
  const { state: elements, setState: setElements, undo, redo, canUndo, canRedo } = useHistory<CanvasElement[]>(savedElements)
  
  const [tool, setTool] = useState('select')
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showLayersPanel, setShowLayersPanel] = useState(true)
  const stageRef = useRef<Konva.Stage>(null)
  const [clipboard, setClipboard] = useState<Omit<CanvasElement, 'id'> | null>(null)
  
  // Auto-save elements to localStorage
  useAutoSave('seamless-design-elements', elements, 2000) // Save every 2 seconds

  // State for line drawing
  const [isDrawingLine, setIsDrawingLine] = useState(false)
  const [currentLine, setCurrentLine] = useState<CanvasElement | null>(null)

  // State for Zoom and Pan
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })

  // Detect if user is on Mac
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const handleAddElement = (element: CanvasElement) => {
    // For new lines, ensure isNew is not set if we used it for text previously
    const elToAdd = element.type === 'line' ? { ...element, isNew: undefined } : element
    setElements([...elements, elToAdd])
  }

  const handleUpdateElement = (id: string, newProps: Partial<CanvasElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...newProps } : el))
    )
  }

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null)
    }
  }

  const handleSelectElement = (element: CanvasElement | null) => {
    setSelectedElement(element)
    if (element && element.type === 'text' && element.isNew) {
      // If we select a new text element, we might want to remove the isNew flag
      // so it doesn't re-trigger auto-edit if re-selected before editing.
      // This depends on the exact auto-edit trigger logic in TextElement.
      // For now, let isNew be handled by TextElement.
    }
  }

  const handleExport = () => {
    setShowExportPanel(true)
  }

  const handleBringForward = (id: string) => {
    const index = elements.findIndex(el => el.id === id)
    if (index < elements.length - 1) {
      const newElements = [...elements]
      const temp = newElements[index]
      newElements[index] = newElements[index + 1]
      newElements[index + 1] = temp
      setElements(newElements)
    }
  }

  const handleSendBackward = (id: string) => {
    const index = elements.findIndex(el => el.id === id)
    if (index > 0) {
      const newElements = [...elements]
      const temp = newElements[index]
      newElements[index] = newElements[index - 1]
      newElements[index - 1] = temp
      setElements(newElements)
    }
  }

  const handleCopy = () => {
    if (selectedElement) {
      const { id, ...elementToCopy } = selectedElement
      setClipboard(elementToCopy)
    }
  }

  const handlePaste = () => {
    if (clipboard) {
      const newId = uuidv4()
      const newElement: CanvasElement = {
        ...clipboard,
        id: newId,
        x: (clipboard.x || 0) + 20, 
        y: (clipboard.y || 0) + 20,
        isNew: clipboard.type === 'text' ? true : undefined,
      }
      // If pasting a line, ensure its points are relative to its new x, y if needed
      // Or, better, lines might not need x,y if points are absolute.
      // For simplicity, let's assume points are absolute and x,y are for the group/transformer.
      setElements([...elements, newElement])
      setSelectedElement(newElement)
    }
  }

  const handleDuplicate = () => {
    if (selectedElement) {
      const { id, ...elementToDuplicate } = selectedElement
      const newId = uuidv4()
      const newElement: CanvasElement = {
        ...elementToDuplicate,
        id: newId,
        x: (selectedElement.x || 0) + 20, 
        y: (selectedElement.y || 0) + 20,
        isNew: selectedElement.type === 'text' ? true : undefined,
      }
      setElements([...elements, newElement])
      setSelectedElement(newElement)
    }
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Delete key handled in DesignCanvas for selected Konva element
      // Copy, Paste, Duplicate
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return // Don't interfere with text input
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (canRedo) redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        if (canRedo) redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        handleCopy()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        handlePaste()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicate()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [selectedElement, clipboard, elements, undo, redo, canUndo, canRedo]) // Dependencies for C/P/D

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Seamless Designer</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>•</span>
            <span>Untitled Design</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Undo/Redo Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo 
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400' 
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={`Undo (${isMac ? 'Cmd' : 'Ctrl'}+Z)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo 
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400' 
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={`Redo (${isMac ? 'Cmd' : 'Ctrl'}+Shift+Z)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Keyboard Shortcuts Info */}
          <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{isMac ? 'Cmd' : 'Ctrl'}</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">C</kbd>
              <span>Copy</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{isMac ? 'Cmd' : 'Ctrl'}</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">V</kbd>
              <span>Paste</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Del</kbd>
              <span>Delete</span>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
            <button 
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
              onClick={() => setStageScale(Math.max(0.1, stageScale - 0.1))}
            >
              <span className="text-xs">-</span>
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
              {Math.round(stageScale * 100)}%
            </span>
            <button 
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
              onClick={() => setStageScale(Math.min(5, stageScale + 0.1))}
            >
              <span className="text-xs">+</span>
            </button>
          </div>
          
          {/* Toggle Layers Button */}
          <button
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className={`p-2 rounded-lg transition-colors ${
              showLayersPanel 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Toggle Layers Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          
          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Export
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
          selectedTool={tool} 
          setTool={setTool} 
          onAddElement={handleAddElement} 
        />
        
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto relative">
          <div className="absolute inset-0 p-6">
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <DesignCanvas
                elements={elements}
                selectedElement={selectedElement}
                tool={tool}
                onSelect={handleSelectElement}
                onUpdate={handleUpdateElement}
                onAddElement={handleAddElement}
                onDelete={handleDeleteElement}
                stageRef={stageRef}
                isDrawingLine={isDrawingLine} 
                setIsDrawingLine={setIsDrawingLine} 
                currentLine={currentLine} 
                setCurrentLine={setCurrentLine}
                setTool={setTool}
                // Zoom and Pan props
                stageScale={stageScale}
                setStageScale={setStageScale}
                stagePosition={stagePosition}
                setStagePosition={setStagePosition}
              />
            </div>
          </div>
        </div>
        
        <PropertyPanel
          selectedElement={selectedElement}
          onUpdate={handleUpdateElement}
          onDelete={handleDeleteElement}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
        />
        
        {showLayersPanel && (
          <LayersPanel
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onReorderElements={setElements}
          />
        )}
      </div>
      
      {showExportPanel && (
        <ExportPanel 
          stageRef={stageRef} 
          onClose={() => setShowExportPanel(false)} 
        />
      )}
    </div>
  )
}
