'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Trash2, 
  MoveUp, 
  MoveDown, 
  SlidersHorizontal,
  Droplet,
  Square,
  Type,
  Image as ImageIcon,
  Slash,
  Circle as CircleIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { CanvasElement } from '../types/canvas'

interface PropertyPanelProps {
  selectedElement: CanvasElement | null
  onUpdate: (id: string, newProps: Partial<CanvasElement>) => void
  onDelete: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedElement,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Selection</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    )
  }

  const handleColorChange = (property: string, value: string) => {
    onUpdate(selectedElement.id, { [property]: value })
  }

  const handleNumberChange = (property: string, value: string, min?: number, max?: number) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = parseFloat((selectedElement as any)[property]) || 0;
    } else {
      if (min !== undefined && numValue < min) numValue = min;
      if (max !== undefined && numValue > max) numValue = max;
    }
    onUpdate(selectedElement.id, { [property]: numValue } as Partial<CanvasElement>);
  }

  const handleTextChange = (property: string, value: string) => {
    onUpdate(selectedElement.id, { [property]: value })
  }

  const handleFontFamilyChange = (value: string) => {
    onUpdate(selectedElement.id, { fontFamily: value })
  }

  const handleTextAlignChange = (value: string) => {
    onUpdate(selectedElement.id, { align: value as 'left' | 'center' | 'right' })
  }

  const handleShadowToggle = () => {
    const newValue = !(selectedElement.shadowEnabled || false)
    onUpdate(selectedElement.id, { shadowEnabled: newValue })
  }

  const getElementTypeIcon = () => {
    switch (selectedElement.type) {
      case 'rectangle':
        return <Square className="w-5 h-5" />
      case 'circle':
        return <CircleIcon className="w-5 h-5" />
      case 'text':
        return <Type className="w-5 h-5" />
      case 'image':
        return <ImageIcon className="w-5 h-5" />
      case 'line':
        return <Slash className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              {getElementTypeIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Element Properties</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBringForward(selectedElement.id)}
            className="flex-1"
          >
            <MoveUp className="w-4 h-4 mr-1" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSendBackward(selectedElement.id)}
            className="flex-1"
          >
            <MoveDown className="w-4 h-4 mr-1" />
            Backward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(selectedElement.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Properties */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        
        {/* Position & Size Section */}
        <PropertySection title="Position & Size">
          <div className="grid grid-cols-2 gap-3">
            <PropertyField label="X">
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleNumberChange('x', e.target.value)}
                className="h-9"
              />
            </PropertyField>
            <PropertyField label="Y">
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleNumberChange('y', e.target.value)}
                className="h-9"
              />
            </PropertyField>
          </div>

          {/* Width and Height for rectangles, images, and text */}
          {(selectedElement.type === 'rectangle' || 
            selectedElement.type === 'image' || 
            selectedElement.type === 'text') && (
            <div className="grid grid-cols-2 gap-3">
              <PropertyField label="Width">
                <Input
                  type="number"
                  value={Math.round(selectedElement.width || 0)}
                  onChange={(e) => handleNumberChange('width', e.target.value, 1)}
                  className="h-9"
                />
              </PropertyField>
              {selectedElement.type !== 'text' && (
                <PropertyField label="Height">
                  <Input
                    type="number"
                    value={Math.round(selectedElement.height || 0)}
                    onChange={(e) => handleNumberChange('height', e.target.value, 1)}
                    className="h-9"
                  />
                </PropertyField>
              )}
            </div>
          )}

          {/* Radius for circles */}
          {selectedElement.type === 'circle' && (
            <PropertyField label="Radius">
              <Input
                type="number"
                value={Math.round(selectedElement.radius || 0)}
                onChange={(e) => handleNumberChange('radius', e.target.value, 1)}
                className="h-9"
              />
            </PropertyField>
          )}

          {/* Rotation for all elements except Line */}
          {selectedElement.type !== 'line' && (
            <PropertyField label="Rotation">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={Math.round(selectedElement.rotation || 0)}
                  onChange={(e) => handleNumberChange('rotation', e.target.value, -360, 360)}
                  className="h-9 flex-1"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">°</span>
              </div>
            </PropertyField>
          )}
        </PropertySection>

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <PropertySection title="Text">
            <PropertyField label="Content">
              <Input
                type="text"
                value={selectedElement.text || ''}
                onChange={(e) => handleTextChange('text', e.target.value)}
                className="h-9"
                placeholder="Enter text..."
              />
            </PropertyField>
            
            <div className="grid grid-cols-2 gap-3">
              <PropertyField label="Font Size">
                <Input
                  type="number"
                  value={selectedElement.fontSize || 18}
                  onChange={(e) => handleNumberChange('fontSize', e.target.value, 1)}
                  className="h-9"
                />
              </PropertyField>
              <PropertyField label="Font Family">
                <select
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                  className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </PropertyField>
            </div>

            <PropertyField label="Style">
              <div className="flex space-x-1">
                <ToggleButton
                  active={selectedElement.fontStyleBold || false}
                  onClick={() => onUpdate(selectedElement.id, { fontStyleBold: !selectedElement.fontStyleBold })}
                  icon={<Bold className="w-4 h-4" />}
                  tooltip="Bold"
                />
                <ToggleButton
                  active={selectedElement.fontStyleItalic || false}
                  onClick={() => onUpdate(selectedElement.id, { fontStyleItalic: !selectedElement.fontStyleItalic })}
                  icon={<Italic className="w-4 h-4" />}
                  tooltip="Italic"
                />
                <ToggleButton
                  active={selectedElement.textDecorationUnderline || false}
                  onClick={() => onUpdate(selectedElement.id, { textDecorationUnderline: !selectedElement.textDecorationUnderline })}
                  icon={<Underline className="w-4 h-4" />}
                  tooltip="Underline"
                />
              </div>
            </PropertyField>

            <PropertyField label="Alignment">
              <div className="flex space-x-1">
                <ToggleButton
                  active={selectedElement.align === 'left'}
                  onClick={() => handleTextAlignChange('left')}
                  icon={<AlignLeft className="w-4 h-4" />}
                  tooltip="Left"
                />
                <ToggleButton
                  active={selectedElement.align === 'center'}
                  onClick={() => handleTextAlignChange('center')}
                  icon={<AlignCenter className="w-4 h-4" />}
                  tooltip="Center"
                />
                <ToggleButton
                  active={selectedElement.align === 'right'}
                  onClick={() => handleTextAlignChange('right')}
                  icon={<AlignRight className="w-4 h-4" />}
                  tooltip="Right"
                />
              </div>
            </PropertyField>
          </PropertySection>
        )}

        {/* Appearance Section */}
        <PropertySection title="Appearance">
          {/* Fill color for shapes and text */}
          {(selectedElement.type === 'rectangle' || 
            selectedElement.type === 'circle' || 
            selectedElement.type === 'text') && (
            <PropertyField label="Fill Color">
              <ColorInput
                value={selectedElement.fill || '#000000'}
                onChange={(value) => handleColorChange('fill', value)}
              />
            </PropertyField>
          )}

          {/* Stroke color and width for shapes and lines */}
          {(selectedElement.type === 'rectangle' || 
            selectedElement.type === 'circle' || 
            selectedElement.type === 'line') && (
            <>
              <PropertyField label="Stroke Color">
                <ColorInput
                  value={selectedElement.stroke || '#000000'}
                  onChange={(value) => handleColorChange('stroke', value)}
                />
              </PropertyField>
              <PropertyField label="Stroke Width">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={selectedElement.strokeWidth || 0}
                  onChange={(e) => handleNumberChange('strokeWidth', e.target.value, 0, 50)}
                  className="h-9"
                />
              </PropertyField>
            </>
          )}

          <PropertyField label="Opacity">
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElement.opacity || 1}
                onChange={(e) => handleNumberChange('opacity', e.target.value, 0, 1)}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                {Math.round((selectedElement.opacity || 1) * 100)}%
              </span>
            </div>
          </PropertyField>
        </PropertySection>

        {/* Effects Section */}
        {(selectedElement.type === 'rectangle' || 
          selectedElement.type === 'circle' || 
          selectedElement.type === 'text' ||
          selectedElement.type === 'image') && (
          <PropertySection title="Effects">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Drop Shadow</span>
              </div>
              <ToggleSwitch
                checked={selectedElement.shadowEnabled || false}
                onChange={handleShadowToggle}
              />
            </div>

            {selectedElement.shadowEnabled && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <PropertyField label="Shadow Color">
                  <ColorInput
                    value={selectedElement.shadowColor || '#000000'}
                    onChange={(value) => handleColorChange('shadowColor', value)}
                  />
                </PropertyField>
                
                <PropertyField label="Blur">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedElement.shadowBlur || 5}
                    onChange={(e) => handleNumberChange('shadowBlur', e.target.value, 0, 100)}
                    className="h-9"
                  />
                </PropertyField>
                
                <div className="grid grid-cols-2 gap-3">
                  <PropertyField label="Offset X">
                    <Input
                      type="number"
                      min="-100"
                      max="100"
                      value={selectedElement.shadowOffsetX || 0}
                      onChange={(e) => handleNumberChange('shadowOffsetX', e.target.value, -100, 100)}
                      className="h-9"
                    />
                  </PropertyField>
                  <PropertyField label="Offset Y">
                    <Input
                      type="number"
                      min="-100"
                      max="100"
                      value={selectedElement.shadowOffsetY || 0}
                      onChange={(e) => handleNumberChange('shadowOffsetY', e.target.value, -100, 100)}
                      className="h-9"
                    />
                  </PropertyField>
                </div>
              </div>
            )}
          </PropertySection>
        )}
      </div>
    </div>
  )
}

// Helper Components
const PropertySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h4>
    <div className="space-y-3">
      {children}
    </div>
  </div>
)

const PropertyField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    {children}
  </div>
)

const ColorInput: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
  <div className="flex space-x-2">
    <div className="relative">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-9 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
      />
    </div>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 flex-1 font-mono text-sm"
      placeholder="#000000"
    />
  </div>
)

const ToggleButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  tooltip: string 
}> = ({ active, onClick, icon, tooltip }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`flex-1 h-9 flex items-center justify-center rounded-md border transition-colors ${
      active 
        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400' 
        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`}
  >
    {icon}
  </button>
)

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

export default PropertyPanel 