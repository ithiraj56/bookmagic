'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { templates, type Template, getTemplateById } from '@/lib/templates'
import { selectTemplate, getSelectedTemplate } from '@/lib/mock-storage'

interface TemplateSelectorProps {
  projectId: string
  onTemplateSelect?: (templateId: string) => void
}

export default function TemplateSelector({ projectId, onTemplateSelect }: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()

  useEffect(() => {
    // Load any existing template selection for this project
    const existingSelection = getSelectedTemplate(projectId)
    if (existingSelection) {
      setSelectedTemplateId(existingSelection)
    }
  }, [projectId])

  const handleTemplateSelect = (templateId: string) => {
    // Update local state
    setSelectedTemplateId(templateId)
    
    // Save to mock storage
    selectTemplate(projectId, templateId)
    
    // Notify parent component
    onTemplateSelect?.(templateId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Template</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select a formatting template for your book. Each template includes specific fonts, sizing, and layout optimized for different types of content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={() => handleTemplateSelect(template.id)}
          />
        ))}
      </div>

      {selectedTemplateId && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Template Selected: {getTemplateById(selectedTemplateId)?.name}
              </p>
              <p className="text-sm text-blue-700">
                You can change your template selection at any time before processing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <div
      className={`
        relative border rounded-lg p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onSelect}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircleIcon className="h-3 w-3" />
            <span>Selected</span>
          </div>
        </div>
      )}

      {/* Preview image placeholder */}
      <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-2">Preview</div>
          <div className="text-gray-600 text-sm font-medium">{template.name}</div>
          <div className="text-gray-500 text-xs mt-1">{template.size}</div>
        </div>
      </div>

      {/* Template info */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900">{template.name}</h4>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Size:</span>
            <span className="text-gray-900">{template.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Font:</span>
            <span className="text-gray-900">{template.font}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">{template.description}</p>

        {/* Select button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className={`
            w-full mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${isSelected
              ? 'bg-blue-500 text-white cursor-default'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
          disabled={isSelected}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  )
} 