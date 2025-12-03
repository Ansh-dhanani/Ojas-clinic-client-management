'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClients, useCreateClient, useDeleteClient } from '@/lib/hooks'
import { Navigation } from '@/components/layout/Navigation'

export default function ClientsPage() {
  const { status } = useSession()
  const router = useRouter()
  const { data: clients, isLoading, error } = useClients()
  const createClient = useCreateClient()
  const deleteClient = useDeleteClient()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'sessions' | 'payment'>('date')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  })

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createClient.mutateAsync(formData)
    setShowForm(false)
    setFormData({ fullName: '', phone: '', email: '', address: '' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient.mutateAsync(id)
    }
  }

  const filteredClients = clients?.filter((client: any) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = (
      client.fullName.toLowerCase().includes(search) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(search))
    )
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
    
    const matchesCategory = filterCategory === 'all' || 
      (client.concernCategory && client.concernCategory.includes(filterCategory))
    
    // Payment status filter
    let matchesPayment = true
    if (filterPayment !== 'all') {
      const sessions = client.sessions || []
      const now = new Date()
      
      if (filterPayment === 'pending') {
        // Has sessions with pending payments (past sessions with PENDING/PARTIAL/OVERDUE status)
        matchesPayment = sessions.some((s: any) => 
          new Date(s.date) < now && 
          s.paymentAmount && 
          ['PENDING', 'PARTIAL', 'OVERDUE'].includes(s.paymentStatus)
        )
      } else if (filterPayment === 'paid') {
        // All past sessions with payment are PAID
        const pastSessionsWithPayment = sessions.filter((s: any) => 
          new Date(s.date) < now && s.paymentAmount
        )
        matchesPayment = pastSessionsWithPayment.length > 0 && 
          pastSessionsWithPayment.every((s: any) => s.paymentStatus === 'PAID')
      } else if (filterPayment === 'overdue') {
        // Has sessions with OVERDUE status
        matchesPayment = sessions.some((s: any) => s.paymentStatus === 'OVERDUE')
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPayment
  })

  const sortedClients = filteredClients?.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        return a.fullName.localeCompare(b.fullName)
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'sessions':
        return (b._count?.sessions || 0) - (a._count?.sessions || 0)
      case 'payment':
        // Sort by pending payment amount
        const getPendingAmount = (client: any) => {
          const now = new Date()
          return (client.sessions || [])
            .filter((s: any) => 
              new Date(s.date) < now && 
              s.paymentAmount && 
              ['PENDING', 'PARTIAL', 'OVERDUE'].includes(s.paymentStatus)
            )
            .reduce((sum: number, s: any) => sum + (s.paymentAmount || 0), 0)
        }
        return getPendingAmount(b) - getPendingAmount(a)
      default:
        return 0
    }
  })

  // Pagination logic
  const totalClients = sortedClients?.length || 0
  const totalPages = Math.ceil(totalClients / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedClients = sortedClients?.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = (setter: any, value: any) => {
    setter(value)
    setCurrentPage(1)
  }

  // Get unique categories from all clients
  const allCategories = [...new Set(
    clients?.flatMap((client: any) => client.concernCategory || []) || []
  )] as string[]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Clients</h2>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
            <p className="text-gray-600 mt-1">{clients?.length || 0} total clients</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            + Add New Client
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date Added (Newest)</option>
                <option value="name">Name (A-Z)</option>
                <option value="status">Status</option>
                <option value="sessions">Sessions Count</option>
                <option value="payment">Pending Payment Amount</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="ACTIVE">✓ Active</option>
                <option value="COMPLETED">🎉 Completed</option>
                <option value="INACTIVE">⏸ Inactive</option>
                <option value="GHOSTED">👻 Ghosted</option>
                <option value="CANCELLED">✕ Cancelled</option>
              </select>
            </div>

            {/* Filter by Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Payment</label>
              <select
                value={filterPayment}
                onChange={(e) => handleFilterChange(setFilterPayment, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="pending">💰 Has Pending</option>
                <option value="paid">✓ All Paid</option>
                <option value="overdue">⚠️ Has Overdue</option>
              </select>
            </div>

            {/* Filter by Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Concern</label>
              <select
                value={filterCategory}
                onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Concerns</option>
                {allCategories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || filterCategory !== 'all' || filterPayment !== 'all' || sortBy !== 'date') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {sortBy !== 'date' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Sort: {sortBy === 'name' ? 'Name' : sortBy === 'status' ? 'Status' : sortBy === 'sessions' ? 'Sessions' : 'Payment'}
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {filterStatus}
                  <button
                  onChange={(e) => handleFilterChange(setFilterStatus, 'all')}
                  className="ml-1 hover:text-green-900"
                >×</button>
                </span>
              )}
              {filterPayment !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Payment: {filterPayment === 'pending' ? 'Has Pending' : filterPayment === 'paid' ? 'All Paid' : 'Has Overdue'}
                  <button
                    onClick={() => handleFilterChange(setFilterPayment, 'all')}
                    className="ml-1 hover:text-orange-900"
                  >×</button>
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Concern: {filterCategory}
                  <button
                    onClick={() => handleFilterChange(setFilterCategory, 'all')}
                    className="ml-1 hover:text-purple-900"
                  >×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSortBy('date')
                  setFilterStatus('all')
                  setFilterCategory('all')
                  setFilterPayment('all')
                  setCurrentPage(1)
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {paginatedClients && paginatedClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Next Session</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClients.map((client: any) => {
                    // Calculate pending payment amount
                    const now = new Date()
                    const pendingAmount = (client.sessions || [])
                      .filter((s: any) => 
                        new Date(s.date) < now && 
                        s.paymentAmount && 
                        ['PENDING', 'PARTIAL', 'OVERDUE'].includes(s.paymentStatus)
                      )
                      .reduce((sum: number, s: any) => sum + (s.paymentAmount || 0), 0)
                    
                    const hasOverdue = (client.sessions || []).some((s: any) => s.paymentStatus === 'OVERDUE')
                    
                    // Find next upcoming session
                    const upcomingSessions = (client.sessions || [])
                      .filter((s: any) => new Date(s.date) > now)
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    const nextSession = upcomingSessions[0]
                    
                    return (
                    <tr key={client.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          client.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          client.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          client.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          client.status === 'GHOSTED' ? 'bg-red-100 text-red-800' :
                          client.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status === 'PENDING' && '⏳ '}
                          {client.status === 'ACTIVE' && '✓ '}
                          {client.status === 'COMPLETED' && '🎉 '}
                          {client.status === 'INACTIVE' && '⏸ '}
                          {client.status === 'GHOSTED' && '👻 '}
                          {client.status === 'CANCELLED' && '✕ '}
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client._count?.sessions || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {nextSession ? (
                          <div>
                            <p className="font-medium text-blue-600">
                              {new Date(nextSession.date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">{nextSession.category}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No upcoming</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {client._count?.sessions === 0 ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            🆕 New Client
                          </span>
                        ) : pendingAmount > 0 ? (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            hasOverdue ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {hasOverdue ? '⚠️' : '💰'} ₹{pendingAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium transition mr-4"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                          disabled={deleteClient.isPending}
                        >
                          {deleteClient.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No clients match your search.' : 'No clients found. Add your first client to get started.'}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalClients > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalClients)} of {totalClients}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg border transition ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Client Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Add New Client</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={createClient.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                  disabled={createClient.isPending}
                >
                  {createClient.isPending ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
