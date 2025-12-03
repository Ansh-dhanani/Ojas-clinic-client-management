import React from 'react'

interface SessionStatisticsSectionProps {
  sessions: any[]
}

export function SessionStatisticsSection({ sessions }: SessionStatisticsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="bg-indigo-100 text-indigo-600 rounded-full p-2 mr-2">📊</span>
        Session Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-11">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
          <p className="font-semibold text-gray-900 text-3xl">{sessions.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">First Visit</p>
          <p className="font-semibold text-gray-900">
            {sessions.length > 0 
              ? new Date(sessions[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A'
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Last Visit</p>
          <p className="font-semibold text-gray-900">
            {sessions.length > 0 
              ? new Date(sessions[sessions.length - 1].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'N/A'
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Upcoming Session</p>
          <p className="font-semibold text-gray-900">
            {sessions.length > 0 && sessions[sessions.length - 1].nextSessionDate
              ? new Date(sessions[sessions.length - 1].nextSessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Not scheduled'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
