import React from 'react'
import { EditableField } from './EditableField'

interface PersonalInfoSectionProps {
  client: any
  isEditing: boolean
  editData: any
  setEditData: (data: any) => void
}

export function PersonalInfoSection({ client, isEditing, editData, setEditData }: PersonalInfoSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-2">👤</span>
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pl-11">
        <EditableField
          label="Full Name"
          value={isEditing ? editData.fullName : client.fullName}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, fullName: value })}
          type="text"
        />
        <EditableField
          label="Gender"
          value={isEditing ? editData.gender : client.gender}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, gender: value })}
          type="select"
          options={['MALE', 'FEMALE', 'OTHER']}
        />
        <EditableField
          label="Date of Birth"
          value={isEditing ? editData.dateOfBirth : (client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '')}
          displayValue={client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, dateOfBirth: value })}
          type="date"
        />
        <div>
          <p className="text-sm text-gray-600 mb-1">Age</p>
          <p className="font-semibold text-gray-900">
            {client.dateOfBirth 
              ? Math.floor((new Date().getTime() - new Date(client.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
              : 'N/A'
            } years
          </p>
        </div>
        
        <EditableField
          label="Total Sessions Needed"
          value={isEditing ? editData.totalSessionsNeeded : client.totalSessionsNeeded}
          displayValue={client.totalSessionsNeeded ? client.totalSessionsNeeded.toString() : 'Not set'}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, totalSessionsNeeded: value })}
          type="number"
          placeholder="e.g., 6"
        />
        <div>
          <p className="text-sm text-gray-600 mb-1">Sessions Progress</p>
          <p className="font-semibold text-gray-900">
            {client.totalSessionsCompleted || 0} / {client.totalSessionsNeeded || '?'}
          </p>
        </div>
        <EditableField
          label="Total Sessions Completed"
          value={isEditing ? editData.totalSessionsCompleted : client.totalSessionsCompleted}
          displayValue={client.totalSessionsCompleted?.toString() || '0'}
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, totalSessionsCompleted: value })}
          type="number"
          placeholder="e.g., 8"
        />
        <div>
          <p className="text-sm text-gray-600 mb-1">Member Since</p>
          <p className="font-semibold text-gray-900">
            {new Date(client.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
