'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/layout/Navigation'
import { PersonalInfoSection } from '@/components/clients/PersonalInfoSection'
import { ContactInfoSection } from '@/components/clients/ContactInfoSection'
import { SkinProfileSection } from '@/components/clients/SkinProfileSection'
import { SessionStatisticsSection } from '@/components/clients/SessionStatisticsSection'
import { SessionsList } from '@/components/clients/SessionsList'
import { AddSessionModal } from '@/components/clients/AddSessionModal'
import { ClientStatusInfo } from '@/components/clients/ClientStatusInfo'

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview')
  const [editData, setEditData] = useState<any>(null)

  const { data: clientData, isLoading, error } = useQuery({
    queryKey: ['client', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch client')
      return res.json()
    },
  })

  const client = clientData?.client
  const sessions = clientData?.sessions || []

  const updateClient = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/clients/${client?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update client')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', params.id] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client updated successfully!')
      setIsEditing(false)
      setEditData(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update client')
    },
  })

  // Initialize edit data when entering edit mode
  const handleEditClick = () => {
    if (!client) return
    setEditData({
      fullName: client.fullName,
      gender: client.gender,
      dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
      phone: client.phone,
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      address: client.address || '',
      skinType: client.skinType || '',
      skinConcerns: client.skinConcerns || '',
      status: client.status,
      totalSessionsNeeded: client.totalSessionsNeeded || '',
      totalSessionsCompleted: client.totalSessionsCompleted || 0,
    })
    setIsEditing(true)
  }

  const handleSaveChanges = () => {
    updateClient.mutate(editData)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData(null)
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading client...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Client</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Link href="/clients" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block">
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="min-h-screen bg-page">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/clients" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">
          ← Back to Clients
        </Link>

        {/* Header with Tabs */}
        <div className="card mb-6">
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{client.fullName}</h2>
              </div>
              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    {activeTab === 'overview' && (
                      <button
                        onClick={handleEditClick}
                        className="btn-secondary"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    <button
                      onClick={() => setShowSessionForm(true)}
                      className="btn-primary"
                    >
                      + Add Session
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                      disabled={updateClient.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="btn-success"
                      disabled={updateClient.isPending}
                    >
                      {updateClient.isPending ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Overview
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-4 py-2 font-medium transition border-b-2 ${
                  activeTab === 'sessions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Sessions ({sessions.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ClientStatusInfo 
                  client={client} 
                  sessions={sessions} 
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />
                
                <PersonalInfoSection 
                  client={client}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />
                
                <ContactInfoSection 
                  client={client}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />
                
                <SkinProfileSection 
                  client={client}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />
                
                <SessionStatisticsSection sessions={sessions} />
              </div>
            )}

            {activeTab === 'sessions' && (
              <SessionsList 
                sessions={sessions}
                onAddSession={() => setShowSessionForm(true)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Add Session Modal */}
      {showSessionForm && (
        <AddSessionModal
          clientId={params.id}
          sessionNumber={Math.max(0, ...sessions.map((s: any) => parseInt(s.sessionNumber) || 0)) + 1}
          onClose={() => setShowSessionForm(false)}
        />
      )}
    </div>
  )
}


