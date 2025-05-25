'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Image as ImageIcon, 
  MousePointer, 
  Slash,
  Pen
} from 'lucide-react'

interface ToolbarProps {
  selectedTool: string
  setTool: (tool: string) => void
  onAddElement: (element: any) => void
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  selectedTool, 
  setTool, 
  onAddElement 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    // Reset input value to allow uploading the same file again if needed
    if(e.target) e.target.value = '' 

    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const newImage = {
            id: uuidv4(),
            type: 'image',
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            src: event.target.result as string,
            opacity: 1,
            shadowEnabled: false,
            shadowColor: 'black',
            shadowBlur: 5,
            shadowOffsetX: 5,
            shadowOffsetY: 5,
          };
          
          onAddElement(newImage);
          setTool('select'); // Reset tool to select after adding image
        } else {
          // Handle case where result is not available (e.g. error during load)
          setTool('select');
          alert("Could not load image.");
        }
      };

      reader.onerror = () => {
        setTool('select');
        alert("Error reading file.");
      };
      
      reader.readAsDataURL(file);
    } else {
      // No file selected, or selection was cleared.
      // If the tool was 'image', reset it to 'select' as the action is cancelled.
      if (selectedTool === 'image') {
        setTool('select');
      }
    }
  }
  
  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      
      {/* Tools Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tools</h3>
      </div>
      
      {/* Selection Tool */}
      <div className="p-3">
        <ToolButton 
          icon={<MousePointer size={18} />} 
          tooltip="Select (V)"
          selected={selectedTool === 'select'}
          onClick={() => setTool('select')}
        />
      </div>
      
      {/* Divider */}
      <div className="mx-3 border-t border-gray-200 dark:border-gray-700"></div>
      
      {/* Content Tools */}
      <div className="p-3 space-y-2">
        <ToolButton 
          icon={<Type size={18} />} 
          tooltip="Text (T)"
          selected={selectedTool === 'text'}
          onClick={() => setTool('text')}
        />
        
        <ToolButton 
          icon={<ImageIcon size={18} />} 
          tooltip="Upload Image"
          selected={selectedTool === 'image'}
          onClick={handleImageButtonClick}
        />
      </div>
      
      {/* Divider */}
      <div className="mx-3 border-t border-gray-200 dark:border-gray-700"></div>
      
      {/* Shape Tools */}
      <div className="p-3 space-y-2">
        <ToolButton 
          icon={<Square size={18} />} 
          tooltip="Rectangle (R)"
          selected={selectedTool === 'rectangle'}
          onClick={() => setTool('rectangle')}
        />
        
        <ToolButton 
          icon={<CircleIcon size={18} />} 
          tooltip="Circle (C)"
          selected={selectedTool === 'circle'}
          onClick={() => setTool('circle')}
        />
        
        <ToolButton 
          icon={<Slash size={18} />} 
          tooltip="Line (L)"
          selected={selectedTool === 'line'}
          onClick={() => setTool('line')}
        />

        <ToolButton 
          icon={<Pen size={18} />} 
          tooltip="Pen (P)"
          selected={selectedTool === 'pen'}
          onClick={() => setTool('pen')}
        />
      </div>
    </div>
  )
}

interface ToolButtonProps {
  icon: React.ReactNode
  tooltip: string
  selected: boolean
  onClick: () => void
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon, 
  tooltip, 
  selected, 
  onClick 
}) => {
  return (
    <button
      className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 relative group ${
        selected 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
      onClick={onClick}
      title={tooltip}
    >
      {icon}
      
      {/* Enhanced Tooltip */}
      <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
        {tooltip}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
      </div>
    </button>
  )
}

export default Toolbar
