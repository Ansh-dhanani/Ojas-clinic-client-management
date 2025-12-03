import React from 'react'
import { EditableField } from './EditableField'

interface SkinProfileSectionProps {
  client: any
  isEditing: boolean
  editData: any
  setEditData: (data: any) => void
}

export function SkinProfileSection({ client, isEditing, editData, setEditData }: SkinProfileSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-pink-100 text-pink-600 rounded-full p-2 mr-2">✨</span>
        Skin Profile
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
        <EditableField
          label="Skin Type"
          value={isEditing ? editData.skinType : (client.skinType || 'Not specified')}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, skinType: value })}
          type="select"
          options={['', 'NORMAL', 'DRY', 'OILY', 'COMBINATION', 'SENSITIVE']}
        />
        <EditableField
          label="Skin Concerns"
          value={isEditing ? editData.skinConcerns : (client.skinConcerns || 'Not specified')}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, skinConcerns: value })}
          type="textarea"
        />
      </div>
    </div>
  )
}
