'use client'

import React from 'react'
import { Sliders, Sun, Contrast, Droplets, Droplet } from 'lucide-react'

export interface ImageFilters {
  brightness?: number // 0-200, default 100
  contrast?: number // 0-200, default 100
  saturation?: number // 0-200, default 100
  blur?: number // 0-20, default 0
  grayscale?: number // 0-100, default 0
  sepia?: number // 0-100, default 0
  hueRotate?: number // 0-360, default 0
}

interface ImageFiltersEditorProps {
  filters: ImageFilters
  onChange: (filters: ImageFilters) => void
}

const ImageFiltersEditor: React.FC<ImageFiltersEditorProps> = ({ filters, onChange }) => {
  const handleFilterChange = (filterName: keyof ImageFilters, value: number) => {
    onChange({
      ...filters,
      [filterName]: value
    })
  }

  const resetFilters = () => {
    onChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0
    })
  }

  const filterControls = [
    {
      name: 'brightness' as keyof ImageFilters,
      label: 'Brightness',
      icon: Sun,
      min: 0,
      max: 200,
      default: 100,
      unit: '%'
    },
    {
      name: 'contrast' as keyof ImageFilters,
      label: 'Contrast',
      icon: Contrast,
      min: 0,
      max: 200,
      default: 100,
      unit: '%'
    },
    {
      name: 'saturation' as keyof ImageFilters,
      label: 'Saturation',
      icon: Droplets,
      min: 0,
      max: 200,
      default: 100,
      unit: '%'
    },
    {
      name: 'blur' as keyof ImageFilters,
      label: 'Blur',
      icon: Droplet,
      min: 0,
      max: 20,
      default: 0,
      unit: 'px'
    },
    {
      name: 'grayscale' as keyof ImageFilters,
      label: 'Grayscale',
      icon: Sliders,
      min: 0,
      max: 100,
      default: 0,
      unit: '%'
    },
    {
      name: 'sepia' as keyof ImageFilters,
      label: 'Sepia',
      icon: Sliders,
      min: 0,
      max: 100,
      default: 0,
      unit: '%'
    },
    {
      name: 'hueRotate' as keyof ImageFilters,
      label: 'Hue Rotate',
      icon: Sliders,
      min: 0,
      max: 360,
      default: 0,
      unit: '°'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Image Filters</h4>
        <button
          onClick={resetFilters}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-3">
        {filterControls.map(({ name, label, icon: Icon, min, max, default: defaultValue, unit }) => {
          const value = filters[name] ?? defaultValue
          const isModified = value !== defaultValue

          return (
            <div key={name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                    {value}{unit}
                  </span>
                  {isModified && (
                    <button
                      onClick={() => handleFilterChange(name, defaultValue)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => handleFilterChange(name, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Filter CSS Preview */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
          filter: {getFilterCSS(filters)}
        </p>
      </div>
    </div>
  )
}

export function getFilterCSS(filters: ImageFilters): string {
  const filterStrings: string[] = []
  
  if (filters.brightness !== undefined && filters.brightness !== 100) {
    filterStrings.push(`brightness(${filters.brightness}%)`)
  }
  if (filters.contrast !== undefined && filters.contrast !== 100) {
    filterStrings.push(`contrast(${filters.contrast}%)`)
  }
  if (filters.saturation !== undefined && filters.saturation !== 100) {
    filterStrings.push(`saturate(${filters.saturation}%)`)
  }
  if (filters.blur !== undefined && filters.blur !== 0) {
    filterStrings.push(`blur(${filters.blur}px)`)
  }
  if (filters.grayscale !== undefined && filters.grayscale !== 0) {
    filterStrings.push(`grayscale(${filters.grayscale}%)`)
  }
  if (filters.sepia !== undefined && filters.sepia !== 0) {
    filterStrings.push(`sepia(${filters.sepia}%)`)
  }
  if (filters.hueRotate !== undefined && filters.hueRotate !== 0) {
    filterStrings.push(`hue-rotate(${filters.hueRotate}deg)`)
  }
  
  return filterStrings.join(' ') || 'none'
}

export default ImageFiltersEditor 