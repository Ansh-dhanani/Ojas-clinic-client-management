import React from 'react'
import { EditableField } from './EditableField'

interface ContactInfoSectionProps {
  client: any
  isEditing: boolean
  editData: any
  setEditData: (data: any) => void
}

export function ContactInfoSection({ client, isEditing, editData, setEditData }: ContactInfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-green-100 text-green-600 rounded-full p-2 mr-2">📞</span>
        Contact Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-11">
        <EditableField
          label="Phone"
          value={isEditing ? editData.phone : client.phone}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, phone: value })}
          type="text"
        />
        <EditableField
          label="WhatsApp"
          value={isEditing ? editData.whatsapp : (client.whatsapp || 'N/A')}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, whatsapp: value })}
          type="text"
        />
        <EditableField
          label="Email"
          value={isEditing ? editData.email : (client.email || 'N/A')}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, email: value })}
          type="email"
        />
        <div className="md:col-span-3">
          <EditableField
            label="Address"
            value={isEditing ? editData.address : (client.address || 'Not specified')}
            isEditing={isEditing}
            onChange={(value) => setEditData({ ...editData, address: value })}
            type="textarea"
          />
        </div>
      </div>
    </div>
  )
}
