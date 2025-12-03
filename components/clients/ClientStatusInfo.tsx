'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface ClientStatusInfoProps {
  client: any
  sessions: any[]
  isEditing?: boolean
  editData?: any
  setEditData?: (data: any) => void
  onStatusUpdate?: (newStatus: string) => Promise<void>
}

export function ClientStatusInfo({ client, sessions, isEditing, editData, setEditData, onStatusUpdate }: ClientStatusInfoProps) {
  const now = new Date()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  
  // Calculate days since last visit
  const lastSession = sessions[sessions.length - 1]
  const daysSinceLastVisit = lastSession
    ? Math.floor((now.getTime() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Get next appointment
  const upcomingSessions = sessions.filter(s => 
    s.nextSessionDate && new Date(s.nextSessionDate) > now
  )
  const nextAppointment = upcomingSessions[0]
  const daysUntilNext = nextAppointment
    ? Math.floor((new Date(nextAppointment.nextSessionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Check for overdue appointments (next session date has passed but no new session created)
  const overdueAppointments = sessions.filter(s => {
    if (!s.nextSessionDate) return false
    const nextDate = new Date(s.nextSessionDate)
    // Check if next session date has passed and no session exists after it
    if (nextDate < now) {
      const hasSessionAfter = sessions.some(session => 
        new Date(session.date) > nextDate
      )
      return !hasSessionAfter
    }
    return false
  })
  const hasOverdueAppointments = overdueAppointments.length > 0
  const oldestOverdueDate = hasOverdueAppointments 
    ? new Date(Math.min(...overdueAppointments.map(s => new Date(s.nextSessionDate).getTime())))
    : null
  const daysOverdue = oldestOverdueDate
    ? Math.floor((now.getTime() - oldestOverdueDate.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Auto-calculate status reason
  const getAutoStatusReason = () => {
    const totalSessions = sessions.length
    
    if (totalSessions === 0) {
      return { autoStatus: 'PENDING', reason: 'New client, awaiting first session' }
    }
    
    if (lastSession?.treatmentCompleted) {
      return { autoStatus: 'COMPLETED', reason: 'Treatment course completed successfully' }
    }
    
    // Check for GHOSTED status - multiple conditions
    // 1. Has overdue appointment(s) that were never attended (14+ days overdue)
    if (hasOverdueAppointments && daysOverdue && daysOverdue >= 14) {
      return { 
        autoStatus: 'GHOSTED', 
        reason: `Missed appointment ${daysOverdue} days ago, no follow-up session` 
      }
    }
    
    // 2. Long time without contact + multiple missed appointments + no upcoming appointment
    if (daysSinceLastVisit && daysSinceLastVisit > 60 && !nextAppointment && client.missedAppointments >= 2) {
      return { 
        autoStatus: 'GHOSTED', 
        reason: `No contact for ${daysSinceLastVisit} days, ${client.missedAppointments} missed appointments` 
      }
    }
    
    // 3. Has overdue appointment (7-13 days) - mark as INACTIVE for now
    if (hasOverdueAppointments && daysOverdue && daysOverdue >= 7 && daysOverdue < 14) {
      return { 
        autoStatus: 'INACTIVE', 
        reason: `Appointment overdue by ${daysOverdue} days - needs follow-up` 
      }
    }
    
    if (nextAppointment || (daysSinceLastVisit && daysSinceLastVisit <= 45)) {
      return { 
        autoStatus: 'ACTIVE', 
        reason: nextAppointment 
          ? `Next appointment scheduled for ${new Date(nextAppointment.nextSessionDate).toLocaleDateString()}` 
          : 'Recent session activity' 
      }
    }
    
    if (daysSinceLastVisit && daysSinceLastVisit > 45 && daysSinceLastVisit <= 60) {
      return { autoStatus: 'INACTIVE', reason: `No activity for ${daysSinceLastVisit} days` }
    }
    
    return { autoStatus: 'ACTIVE', reason: 'Has treatment history' }
  }

  const { autoStatus, reason } = getAutoStatusReason()
  const currentStatus = isEditing && editData ? editData.status : client.status
  const isManualOverride = currentStatus !== autoStatus

  // Handle quick status update
  const handleQuickStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusUpdate(newStatus)
      setShowStatusDropdown(false)
      toast.success('Status updated successfully!')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'GHOSTED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get recommendation based on status
  const getRecommendation = () => {
    if (client.status === 'PENDING') {
      return { text: 'Schedule first consultation', color: 'text-yellow-700 bg-yellow-50' }
    }
    if (client.status === 'GHOSTED') {
      return { text: 'Attempt to reconnect via phone/WhatsApp', color: 'text-red-700 bg-red-50' }
    }
    if (client.status === 'COMPLETED') {
      return { text: 'Follow-up after 3 months for maintenance', color: 'text-blue-700 bg-blue-50' }
    }
    if (nextAppointment && daysUntilNext !== null) {
      if (daysUntilNext < 0) {
        return { text: 'Appointment overdue - contact client immediately', color: 'text-red-700 bg-red-50' }
      } else if (daysUntilNext <= 2) {
        return { text: `Appointment in ${daysUntilNext} days - send reminder`, color: 'text-orange-700 bg-orange-50' }
      } else {
        return { text: `Next appointment in ${daysUntilNext} days`, color: 'text-green-700 bg-green-50' }
      }
    }
    if (daysSinceLastVisit && daysSinceLastVisit > 30) {
      return { text: 'Schedule follow-up appointment', color: 'text-orange-700 bg-orange-50' }
    }
    return { text: 'Schedule next session', color: 'text-blue-700 bg-blue-50' }
  }

  const recommendation = getRecommendation()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-2">📊</span>
        Client Status Overview
      </h3>

      {/* Status Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Current Status</p>
            {isEditing && editData && setEditData ? (
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 ${getStatusBadge(editData.status)} cursor-pointer focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="PENDING">⏳ Pending</option>
                <option value="ACTIVE">✓ Active</option>
                <option value="COMPLETED">🎉 Completed</option>
                <option value="INACTIVE">⏸ Inactive</option>
                <option value="GHOSTED">👻 Ghosted</option>
                <option value="CANCELLED">✕ Cancelled</option>
              </select>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm border-2 ${getStatusBadge(currentStatus)}`}>
                  {currentStatus === 'PENDING' && '⏳ Pending'}
                  {currentStatus === 'ACTIVE' && '✓ Active'}
                  {currentStatus === 'COMPLETED' && '🎉 Completed'}
                  {currentStatus === 'INACTIVE' && '⏸ Inactive'}
                  {currentStatus === 'GHOSTED' && '👻 Ghosted'}
                  {currentStatus === 'CANCELLED' && '✕ Cancelled'}
                </span>
                
                {/* Quick Status Update Dropdown */}
                {onStatusUpdate && (
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      disabled={isUpdatingStatus}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdatingStatus ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <span>Update Status</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {showStatusDropdown && !isUpdatingStatus && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowStatusDropdown(false)}
                        ></div>
                        
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                          <button
                            onClick={() => handleQuickStatusUpdate('PENDING')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 flex items-center gap-2"
                          >
                            <span>⏳</span>
                            <span>Pending</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusUpdate('ACTIVE')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center gap-2"
                          >
                            <span>✓</span>
                            <span>Active</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusUpdate('COMPLETED')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                          >
                            <span>🎉</span>
                            <span>Completed</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusUpdate('INACTIVE')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span>⏸</span>
                            <span>Inactive</span>
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => handleQuickStatusUpdate('GHOSTED')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-700"
                          >
                            <span>👻</span>
                            <span>Ghosted</span>
                          </button>
                          <button
                            onClick={() => handleQuickStatusUpdate('CANCELLED')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-700"
                          >
                            <span>✕</span>
                            <span>Cancelled</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">{isManualOverride && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-300">
                Manual Override
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Auto-calculated: </span>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(autoStatus)}`}>
            {autoStatus}
          </span>
          <span className="ml-2">- {reason}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Last Visit */}
        {lastSession && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Last Visit</p>
            <p className="font-semibold text-gray-900">
              {new Date(lastSession.date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {daysSinceLastVisit === 0 ? 'Today' : `${daysSinceLastVisit} days ago`}
            </p>
          </div>
        )}

        {/* Next Appointment */}
        {nextAppointment ? (
          <div className={`p-4 rounded-lg border ${
            daysUntilNext && daysUntilNext < 0 
              ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Next Appointment</p>
            <p className="font-semibold text-gray-900">
              {new Date(nextAppointment.nextSessionDate).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
            <p className={`text-xs mt-1 font-medium ${
              daysUntilNext && daysUntilNext < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {daysUntilNext && daysUntilNext < 0 
                ? `${Math.abs(daysUntilNext)} days overdue` 
                : `In ${daysUntilNext} days`
              }
            </p>
          </div>
        ) : sessions.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Next Appointment</p>
            <p className="font-semibold text-gray-900">Not Scheduled</p>
            <p className="text-xs text-yellow-600 mt-1 font-medium">
              Action needed
            </p>
          </div>
        )}

        {/* Total Sessions */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="font-semibold text-gray-900 text-2xl">{sessions.length}</p>
          {client.missedAppointments > 0 && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {client.missedAppointments} missed
            </p>
          )}
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className={`mt-4 p-4 rounded-lg border ${recommendation.color} border-current`}>
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <p className="font-semibold text-sm">Next Action</p>
            <p className="text-sm mt-1">{recommendation.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
