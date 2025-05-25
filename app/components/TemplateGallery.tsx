'use client'

import React from 'react'
import { FileText, Image as ImageIcon, Presentation, CreditCard, Layout, Sparkles } from 'lucide-react'
import { CanvasElement } from '../types/canvas'
import { v4 as uuidv4 } from 'uuid'

export interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  elements: Omit<CanvasElement, 'id'>[]
  width: number
  height: number
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void
  isOpen: boolean
  onClose: () => void
}

const templates: Template[] = [
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'Business',
    thumbnail: '/templates/business-card.png',
    width: 350,
    height: 200,
    elements: [
      {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 350,
        height: 200,
        fill: '#1a1a1a',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 30,
        y: 30,
        text: 'John Doe',
        fontSize: 24,
        fontFamily: 'Arial',
        fontStyleBold: true,
        fill: '#ffffff',
        align: 'left',
        width: 200,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 30,
        y: 60,
        text: 'Creative Director',
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#cccccc',
        align: 'left',
        width: 200,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'rectangle',
        x: 30,
        y: 90,
        width: 60,
        height: 2,
        fill: '#3b82f6',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 30,
        y: 110,
        text: 'john.doe@company.com',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#ffffff',
        align: 'left',
        width: 200,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 30,
        y: 130,
        text: '+1 (555) 123-4567',
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#ffffff',
        align: 'left',
        width: 200,
        opacity: 1,
        rotation: 0
      }
    ]
  },
  {
    id: 'social-media-post',
    name: 'Social Media Post',
    category: 'Social',
    thumbnail: '/templates/social-post.png',
    width: 500,
    height: 500,
    elements: [
      {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 500,
        height: 500,
        fill: '#f3f4f6',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'circle',
        x: 250,
        y: 150,
        radius: 80,
        fill: '#3b82f6',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 0.2,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 250,
        text: 'Amazing Design',
        fontSize: 48,
        fontFamily: 'Arial',
        fontStyleBold: true,
        fill: '#1a1a1a',
        align: 'center',
        width: 400,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 320,
        text: 'Create stunning visuals in minutes',
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#666666',
        align: 'center',
        width: 400,
        opacity: 1,
        rotation: 0
      }
    ]
  },
  {
    id: 'presentation-slide',
    name: 'Presentation Slide',
    category: 'Presentation',
    thumbnail: '/templates/presentation.png',
    width: 800,
    height: 600,
    elements: [
      {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        fill: '#ffffff',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 800,
        height: 100,
        fill: '#3b82f6',
        stroke: 'none',
        strokeWidth: 0,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 30,
        text: 'Slide Title Here',
        fontSize: 36,
        fontFamily: 'Arial',
        fontStyleBold: true,
        fill: '#ffffff',
        align: 'left',
        width: 700,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 150,
        text: '• First bullet point',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#333333',
        align: 'left',
        width: 700,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 200,
        text: '• Second bullet point',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#333333',
        align: 'left',
        width: 700,
        opacity: 1,
        rotation: 0
      },
      {
        type: 'text',
        x: 50,
        y: 250,
        text: '• Third bullet point',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#333333',
        align: 'left',
        width: 700,
        opacity: 1,
        rotation: 0
      }
    ]
  }
]

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, isOpen, onClose }) => {
  if (!isOpen) return null

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Business':
        return <CreditCard className="w-4 h-4" />
      case 'Social':
        return <ImageIcon className="w-4 h-4" />
      case 'Presentation':
        return <Presentation className="w-4 h-4" />
      default:
        return <Layout className="w-4 h-4" />
    }
  }

  const handleSelectTemplate = (template: Template) => {
    // Add unique IDs to elements when selecting
    const templateWithIds = {
      ...template,
      elements: template.elements.map(el => ({
        ...el,
        id: uuidv4()
      }))
    }
    onSelectTemplate(templateWithIds as Template)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Template Gallery</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="group cursor-pointer"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500">
                      <FileText className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(template.category)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{template.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {template.width} × {template.height}px
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateGallery 