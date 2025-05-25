'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Download, Image as ImageIcon, FileImage, Settings } from 'lucide-react'

interface ExportPanelProps {
  stageRef: React.RefObject<any>
  onClose: () => void
}

const ExportPanel: React.FC<ExportPanelProps> = ({ stageRef, onClose }) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [quality, setQuality] = useState(1)
  const [filename, setFilename] = useState('seamless-design')
  const [exportWidth, setExportWidth] = useState(800)
  const [exportHeight, setExportHeight] = useState(600)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Generate preview when panel opens
  useEffect(() => {
    generatePreview()
    
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  const generatePreview = () => {
    if (!stageRef.current) return

    // Get the current stage and create a preview image
    const stage = stageRef.current
    const dataURL = stage.toDataURL({
      pixelRatio: 1,
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality
    })
    
    setPreviewUrl(dataURL)
  }

  const handleExport = () => {
    if (!stageRef.current) return
    
    setIsExporting(true)
    
    // Get the current stage
    const stage = stageRef.current
    
    // Create a high-resolution export
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality,
      width: exportWidth,
      height: exportHeight
    })

    // Create a temporary link and trigger download
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = dataURL
      downloadLinkRef.current.download = `${filename}.${format}`
      downloadLinkRef.current.click()
    }
    
    setIsExporting(false)
  }

  const handleFormatChange = (newFormat: 'png' | 'jpeg') => {
    setFormat(newFormat)
    generatePreview()
  }

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseFloat(e.target.value)
    setQuality(newQuality)
    generatePreview()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Design</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Download your design in high quality</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Export Settings</h3>
              </div>
              
              <div className="space-y-5">
                {/* Filename */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filename</label>
                  <Input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full h-10"
                    placeholder="Enter filename..."
                  />
                </div>
                
                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Format</label>
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        format === 'png' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => handleFormatChange('png')}
                    >
                      PNG
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        format === 'jpeg' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => handleFormatChange('jpeg')}
                    >
                      JPEG
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format === 'png' ? 'Best for designs with transparency' : 'Smaller file size, good for photos'}
                  </p>
                </div>
                
                {/* Quality Slider for JPEG */}
                {format === 'jpeg' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quality</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={handleQualityChange}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right font-medium">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Dimensions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dimensions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        type="number"
                        value={exportWidth}
                        onChange={(e) => setExportWidth(parseInt(e.target.value) || 800)}
                        className="w-full h-10"
                        placeholder="Width"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Width (px)</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={exportHeight}
                        onChange={(e) => setExportHeight(parseInt(e.target.value) || 600)}
                        className="w-full h-10"
                        placeholder="Height"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Height (px)</p>
                    </div>
                  </div>
                </div>
                
                {/* Export Button */}
                <Button
                  onClick={handleExport}
                  className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  disabled={isExporting}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isExporting ? 'Exporting...' : `Download ${format.toUpperCase()}`}
                </Button>
                <a ref={downloadLinkRef} className="hidden" />
              </div>
            </div>
            
            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-6">
                <div className="aspect-[4/3] flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Export Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                      <ImageIcon className="w-12 h-12 mb-3" />
                      <p className="text-sm font-medium">Preview not available</p>
                      <p className="text-xs">Generating preview...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> The exported image will be rendered at 2x resolution for crisp, high-quality output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportPanel 