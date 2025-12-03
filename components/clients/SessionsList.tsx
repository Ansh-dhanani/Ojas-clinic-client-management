import React, { useState, useMemo } from 'react'
import Link from 'next/link'

interface SessionsListProps {
  sessions: any[]
  onAddSession: () => void
}

export function SessionsList({ sessions, onAddSession }: SessionsListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions]

    // Filter by payment status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(session => {
        if (filterStatus === 'paid') return session.paymentStatus === 'PAID'
        if (filterStatus === 'pending') return session.paymentStatus === 'PENDING'
        if (filterStatus === 'partial') return session.paymentStatus === 'PARTIAL'
        if (filterStatus === 'overdue') return session.paymentStatus === 'OVERDUE'
        if (filterStatus === 'upcoming') return session.paymentStatus === 'UPCOMING'
        if (filterStatus === 'no-payment') return !session.paymentAmount
        return true
      })
    }

    // Sort sessions
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else if (sortBy === 'status') {
        // Sort by payment status priority: OVERDUE > PENDING > PARTIAL > PAID > NO_PAYMENT
        const statusPriority: Record<string, number> = {
          'OVERDUE': 5,
          'PENDING': 4,
          'PARTIAL': 3,
          'PAID': 2,
          'none': 1
        }
        const priorityA = statusPriority[a.paymentStatus || 'none'] || 0
        const priorityB = statusPriority[b.paymentStatus || 'none'] || 0
        return sortOrder === 'desc' ? priorityB - priorityA : priorityA - priorityB
      }
      return 0
    })

    return filtered
  }, [sessions, sortBy, filterStatus, sortOrder])

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">No sessions yet</p>
        <button
          onClick={onAddSession}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Add first session
        </button>
      </div>
    )
  }

  const getPaymentStatusBadge = (session: any) => {
    const now = new Date()
    const sessionDate = new Date(session.date)
    const isPast = sessionDate < now

    // For future sessions, only show payment status if PAID or PARTIAL
    if (!isPast) {
      if (session.paymentStatus === 'PAID' && session.paymentAmount) {
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            ✓ Paid
          </span>
        )
      }
      if (session.paymentStatus === 'PARTIAL' && session.paymentAmount) {
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            ◐ Partial
          </span>
        )
      }
      return null
    }

    // For past sessions, check payment status
    if (!session.paymentAmount) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          No Payment
        </span>
      )
    }

    if (session.paymentStatus === 'PAID') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          ✓ Paid
        </span>
      )
    }

    if (session.paymentStatus === 'PENDING') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          ⏳ Pending
        </span>
      )
    }

    if (session.paymentStatus === 'PARTIAL') {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
          ◐ Partial
        </span>
      )
    }

    if (session.paymentStatus === 'OVERDUE') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          ⚠ Overdue
        </span>
      )
    }

    return null
  }

  const getTreatmentStatusBadge = (session: any) => {
    const now = new Date()
    const sessionDate = new Date(session.date)
    const isPast = sessionDate < now

    // For upcoming sessions
    if (!isPast) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          📅 Upcoming
        </span>
      )
    }

    // For past sessions
    if (session.treatmentCompleted) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          ✅ Treatment Done
        </span>
      )
    }

    return (
      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
        🔄 Treatment Remaining
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sort Controls */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="status">Payment Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">{sortBy === 'date' ? 'Newest First' : 'High Priority First'}</option>
              <option value="asc">{sortBy === 'date' ? 'Oldest First' : 'Low Priority First'}</option>
            </select>
          </div>

          {/* Filter by Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sessions ({sessions.length})</option>
              <option value="paid">Paid ({sessions.filter(s => s.paymentStatus === 'PAID').length})</option>
              <option value="pending">Pending ({sessions.filter(s => s.paymentStatus === 'PENDING').length})</option>
              <option value="partial">Partial ({sessions.filter(s => s.paymentStatus === 'PARTIAL').length})</option>
              <option value="overdue">Overdue ({sessions.filter(s => s.paymentStatus === 'OVERDUE').length})</option>
              <option value="upcoming">Upcoming ({sessions.filter(s => s.paymentStatus === 'UPCOMING').length})</option>
              <option value="no-payment">No Payment ({sessions.filter(s => !s.paymentAmount).length})</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Sessions List */}
      {filteredAndSortedSessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">No sessions match the current filter</p>
          <button
            onClick={() => setFilterStatus('all')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        filteredAndSortedSessions.map((session: any, index: number) => (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    Session #{session.sessionNumber}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {new Date(session.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  {getTreatmentStatusBadge(session)}
                  {getPaymentStatusBadge(session)}
                  {session.paymentAmount && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      ₹{session.paymentAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">
                  <span className="font-semibold">Category:</span> {session.category}
                </p>
                {session.beforeCondition && (
                  <p className="text-gray-600 mt-2 text-sm">{session.beforeCondition.substring(0, 100)}...</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {session.beforePhotos?.length > 0 && (
                  <span className="text-sm text-gray-500">📷 {session.beforePhotos.length} photos</span>
                )}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
