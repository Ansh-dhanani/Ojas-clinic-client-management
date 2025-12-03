'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDashboardStats } from '@/lib/hooks'
import { Navigation } from '@/components/layout/Navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: stats, isLoading, error } = useDashboardStats()
  const [showPendingPayments, setShowPendingPayments] = useState(false)
  const [pendingPaymentsData, setPendingPaymentsData] = useState<any[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  const fetchPendingPayments = async () => {
    setLoadingPending(true)
    try {
      const response = await fetch('/api/dashboard/pending-payments')
      const data = await response.json()
      setPendingPaymentsData(data.pendingPayments || [])
      setShowPendingPayments(true)
    } catch (error) {
      console.error('Error fetching pending payments:', error)
    } finally {
      setLoadingPending(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={stats?.stats.totalClients || 0}
            subtitle={`${stats?.stats.activeClients || 0} active`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Sessions"
            value={stats?.stats.totalSessions || 0}
            subtitle={`${stats?.stats.thisMonthSessions || 0} this month`}
            icon="📅"
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.stats.totalRevenue?.toLocaleString() || 0}`}
            subtitle={`₹${stats?.stats.thisMonthRevenue?.toLocaleString() || 0} this month`}
            icon="💰"
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={`₹${stats?.stats.pendingPayments?.toLocaleString() || 0}`}
            subtitle={`${stats?.stats.upcomingAppointments || 0} appointments`}
            icon="⏳"
            color="orange"
            onClick={fetchPendingPayments}
            clickable={true}
          />
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h3>
          {stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSessions.map((session: any) => (
                    <tr key={session.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.client.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {session.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{session.doctor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/sessions/${session.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium transition"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No recent sessions</p>
            </div>
          )}
        </div>

        {/* Treatment Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Treatment Categories</h3>
          {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition">
                  <p className="text-sm text-gray-600 mb-1">{category}</p>
                  <p className="text-3xl font-bold text-blue-600">{String(count)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No treatment data available</p>
            </div>
          )}
        </div>
      </main>

      {/* Pending Payments Modal */}
      {showPendingPayments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Pending Payments</h3>
              <button
                onClick={() => setShowPendingPayments(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingPending ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading pending payments...</p>
                </div>
              ) : pendingPaymentsData.length > 0 ? (
                <div className="space-y-4">
                  {pendingPaymentsData.map((client: any) => (
                    <div key={client.clientId} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{client.fullName}</h4>
                          <p className="text-sm text-gray-600">{client.clientId} • {client.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">₹{client.totalPending.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{client.sessionsCount} session{client.sessionsCount > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {client.sessions.map((session: any) => (
                          <div key={session.id} className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">Session #{session.sessionNumber}</p>
                                <p className="text-sm text-gray-600">{session.category} • {new Date(session.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">₹{session.paymentAmount?.toLocaleString() || 0}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  session.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  session.paymentStatus === 'PARTIAL' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {session.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Link
                        href={`/clients/${client.id}`}
                        className="block w-full text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                      >
                        View Client Details →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h4>
                  <p className="text-gray-600">No pending payments at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  onClick,
  clickable = false
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: string;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }[color]

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 ${
        clickable ? 'cursor-pointer hover:border-orange-300' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className={`text-4xl font-bold bg-gradient-to-r ${colorClasses} bg-clip-text text-transparent mb-2`}>
        {value}
      </p>
      <p className="text-sm text-gray-500">{subtitle}</p>
      {clickable && (
        <p className="text-xs text-orange-600 font-medium mt-2">Click to view details →</p>
      )}
    </div>
  )
}
