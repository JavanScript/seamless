'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Palette } from 'lucide-react'

export interface GradientStop {
  color: string
  position: number // 0-100
}

export interface GradientConfig {
  type: 'linear' | 'radial'
  angle?: number // for linear gradients
  stops: GradientStop[]
}

interface GradientEditorProps {
  value: GradientConfig
  onChange: (gradient: GradientConfig) => void
}

const GradientEditor: React.FC<GradientEditorProps> = ({ value, onChange }) => {
  const [selectedStop, setSelectedStop] = useState<number>(0)

  const addStop = () => {
    const newStop: GradientStop = {
      color: '#000000',
      position: 50
    }
    onChange({
      ...value,
      stops: [...value.stops, newStop].sort((a, b) => a.position - b.position)
    })
  }

  const removeStop = (index: number) => {
    if (value.stops.length <= 2) return // Need at least 2 stops
    const newStops = value.stops.filter((_, i) => i !== index)
    onChange({ ...value, stops: newStops })
    if (selectedStop >= newStops.length) {
      setSelectedStop(newStops.length - 1)
    }
  }

  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...value.stops]
    newStops[index] = { ...newStops[index], ...updates }
    onChange({ ...value, stops: newStops.sort((a, b) => a.position - b.position) })
  }

  const getGradientCSS = () => {
    const stops = value.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
    if (value.type === 'linear') {
      return `linear-gradient(${value.angle || 0}deg, ${stops})`
    } else {
      return `radial-gradient(circle, ${stops})`
    }
  }

  return (
    <div className="space-y-4">
      {/* Gradient Type */}
      <div className="flex space-x-2">
        <button
          onClick={() => onChange({ ...value, type: 'linear' })}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            value.type === 'linear'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => onChange({ ...value, type: 'radial' })}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            value.type === 'radial'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Radial
        </button>
      </div>

      {/* Angle for Linear Gradient */}
      {value.type === 'linear' && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Angle</label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              type="number"
              value={value.angle || 0}
              onChange={(e) => onChange({ ...value, angle: parseInt(e.target.value) || 0 })}
              className="h-9"
              min="0"
              max="360"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">°</span>
          </div>
        </div>
      )}

      {/* Gradient Preview */}
      <div
        className="h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
        style={{ background: getGradientCSS() }}
      />

      {/* Color Stops */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Stops</label>
          <Button
            size="sm"
            variant="outline"
            onClick={addStop}
            className="h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {value.stops.map((stop, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                selectedStop === index
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedStop(index)}
            >
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(index, { color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(index, { color: e.target.value })}
                className="h-8 flex-1 font-mono text-xs"
              />
              <Input
                type="number"
                value={stop.position}
                onChange={(e) => updateStop(index, { position: parseInt(e.target.value) || 0 })}
                className="h-8 w-16"
                min="0"
                max="100"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeStop(index)
                }}
                disabled={value.stops.length <= 2}
                className={`p-1 rounded transition-colors ${
                  value.stops.length > 2
                    ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GradientEditor 