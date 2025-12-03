'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Navigation } from '@/components/layout/Navigation'
import { EditSessionModal } from '@/components/clients/EditSessionModal'
import { AddPaymentModal } from '@/components/sessions/AddPaymentModal'
import { ImageModal } from '@/components/common/ImageModal'

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch session')
      return res.json()
    },
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['session-payments', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${params.id}/payments`)
      if (!res.ok) return []
      return res.json()
    },
  })

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Session</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/clients/${session.clientId}`} className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Client
          </Link>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {session.sessionNumber}
          </span>
        </div>

        {/* Session Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{session.client.fullName}</h2>
              <p className="text-gray-600">Session on {new Date(session.date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Session
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold text-gray-900">{session.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{session.client.phone}</p>
            </div>
          </div>
        </div>

        {/* Before Condition */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Before Treatment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {session.acneSeverity && (
              <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Acne Severity</p>
                <p className="font-semibold text-red-700">{session.acneSeverity}</p>
              </div>
            )}
            {session.scarType && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Scar Type</p>
                <p className="font-semibold text-purple-700">{session.scarType.replace('_', ' ')}</p>
              </div>
            )}
            {session.pigmentationLevel && (
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Pigmentation</p>
                <p className="font-semibold text-yellow-700">{session.pigmentationLevel}</p>
              </div>
            )}
            {session.glowDullnessScale && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Glow/Dullness</p>
                <p className="font-semibold text-green-700">{session.glowDullnessScale}/10</p>
              </div>
            )}
            {session.hairDensity && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Hair Density</p>
                <p className="font-semibold text-blue-700">{session.hairDensity}</p>
              </div>
            )}
            {session.hasInflammation && (
              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1">Inflammation</p>
                <p className="font-semibold text-red-700">Present</p>
              </div>
            )}
          </div>

          {session.beforeCondition && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Condition Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{session.beforeCondition}</p>
            </div>
          )}

          {session.beforePhotos && session.beforePhotos.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Before Photos ({session.beforePhotos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {session.beforePhotos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img 
                      src={photo} 
                      alt={`Before ${index + 1}`} 
                      className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition cursor-pointer"
                      onClick={() => setSelectedImage({ src: photo, alt: `Before Photo ${index + 1}` })}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Treatments & Products */}
        {(session.treatmentsPerformed?.length > 0 || session.productsUsed?.length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Treatment Details</h3>
            
            {session.treatmentsPerformed?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Treatments Performed</h4>
                <div className="flex flex-wrap gap-2">
                  {session.treatmentsPerformed.map((treatment: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {treatment}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {session.productsUsed?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Products Used</h4>
                <div className="flex flex-wrap gap-2">
                  {session.productsUsed.map((product: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* After Treatment */}
        {(session.afterNotes || session.afterPhotos?.length > 0) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">After Treatment</h3>
            
            {session.immediateOutcome && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Immediate Outcome</h4>
                <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{session.immediateOutcome}</p>
              </div>
            )}

            {session.sideEffects && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Side Effects</h4>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">{session.sideEffects}</p>
              </div>
            )}

            {session.afterNotes && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{session.afterNotes}</p>
              </div>
            )}

            {session.afterPhotos?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">After Photos ({session.afterPhotos.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {session.afterPhotos.map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`After ${index + 1}`} 
                        className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition cursor-pointer"
                        onClick={() => setSelectedImage({ src: photo, alt: `After Photo ${index + 1}` })}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Follow-up & Recommendations */}
        {(session.nextSessionDate || session.postCareInstructions || session.doctorSuggestions || session.prescribedMedicines) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Follow-up & Care</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {session.nextSessionDate && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Next Session</p>
                  <p className="font-semibold text-blue-700">
                    {new Date(session.nextSessionDate).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}
              {session.expectedResultTime && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Expected Results</p>
                  <p className="font-semibold text-purple-700">{session.expectedResultTime}</p>
                </div>
              )}
            </div>

            {session.postCareInstructions && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Post-Care Instructions</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">{session.postCareInstructions}</p>
              </div>
            )}

            {session.doctorSuggestions && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Doctor's Suggestions</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded-lg">{session.doctorSuggestions}</p>
              </div>
            )}

            {session.prescribedMedicines && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prescribed Medicines</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg">{session.prescribedMedicines}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Details */}
        {session.paymentAmount && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>💰</span> Payment Details
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Payment
              </button>
            </div>
            
            {/* Payment History */}
            {payments.length > 0 ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Payment History ({payments.length})</h4>
                <div className="space-y-3 mb-6">
                  {payments.map((payment: any, index: number) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                            Payment #{payments.length - index}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">₹{payment.amount}</p>
                        <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Paid and Remaining */}
                <div className="pt-4 border-t border-gray-300">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-700">₹{session.paymentAmount}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{payments.reduce((sum: number, p: any) => sum + p.amount, 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">Remaining</p>
                      <p className="text-2xl font-bold text-orange-700">
                        ₹{session.paymentAmount - payments.reduce((sum: number, p: any) => sum + p.amount, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 mb-4">No payment records yet</p>
                <p className="text-sm text-gray-400">Click "Add Payment" above to record the first payment</p>
              </div>
            )}

            {session.paymentNotes && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Notes</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{session.paymentNotes}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Session Modal */}
      {showEditModal && (
        <EditSessionModal
          session={session}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <AddPaymentModal
          sessionId={params.id}
          onClose={() => setShowAddPaymentModal(false)}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}
