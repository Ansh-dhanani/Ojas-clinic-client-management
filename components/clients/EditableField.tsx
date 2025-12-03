import React from 'react'

interface EditableFieldProps {
  label: string
  value: any
  displayValue?: string
  isEditing: boolean
  onChange: (value: any) => void
  type?: 'text' | 'email' | 'date' | 'select' | 'textarea' | 'number'
  options?: string[]
  renderDisplay?: (value: any) => React.ReactNode
  placeholder?: string
}

export function EditableField({ 
  label, 
  value, 
  displayValue,
  isEditing, 
  onChange, 
  type = 'text', 
  options = [],
  renderDisplay,
  placeholder
}: EditableFieldProps) {
  if (!isEditing) {
    return (
      <div>
        <p className="text-sm text-secondary mb-1">{label}</p>
        {renderDisplay ? (
          renderDisplay(value)
        ) : (
          <p className="font-semibold text-primary">{displayValue || value || 'N/A'}</p>
        )}
      </div>
    )
  }

  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-editing"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt || 'Select...'}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="input-editing"
        />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-editing"
        placeholder={placeholder}
      />
    </div>
  )
}
