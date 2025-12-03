'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ImageModal } from '@/components/common/ImageModal'

interface EditSessionModalProps {
  session: any
  onClose: () => void
}

export function EditSessionModal({ session, onClose }: EditSessionModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    beforeCondition: '',
    acneSeverity: '',
    scarType: '',
    pigmentationLevel: '',
    glowDullnessScale: 5,
    hairDensity: '',
    textureRoughness: 5,
    poreVisibility: 5,
    hasInflammation: false,
    beforePhotos: [] as string[],
    treatmentsPerformed: [] as string[],
    productsUsed: [] as string[],
    afterNotes: '',
    immediateOutcome: '',
    sideEffects: '',
    afterPhotos: [] as string[],
    nextSessionDate: '',
    expectedResultTime: '',
    postCareInstructions: '',
    doctorSuggestions: '',
    prescribedMedicines: '',
    treatmentCompleted: false,
    paymentAmount: '',
    paymentMethod: '',
    paymentStatus: 'PENDING',
    paymentDate: '',
    paymentNotes: '',
  })
  
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [afterImagePreview, setAfterImagePreview] = useState<string[]>([])
  const [treatmentInput, setTreatmentInput] = useState('')
  const [productInput, setProductInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)

  // Initialize form with session data
  useEffect(() => {
    if (session) {
      setFormData({
        date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
        category: session.category || '',
        beforeCondition: session.beforeCondition || '',
        acneSeverity: session.acneSeverity || '',
        scarType: session.scarType || '',
        pigmentationLevel: session.pigmentationLevel || '',
        glowDullnessScale: session.glowDullnessScale || 5,
        hairDensity: session.hairDensity || '',
        textureRoughness: session.textureRoughness || 5,
        poreVisibility: session.poreVisibility || 5,
        hasInflammation: session.hasInflammation || false,
        beforePhotos: session.beforePhotos || [],
        treatmentsPerformed: session.treatmentsPerformed || [],
        productsUsed: session.productsUsed || [],
        afterNotes: session.afterNotes || '',
        immediateOutcome: session.immediateOutcome || '',
        sideEffects: session.sideEffects || '',
        afterPhotos: session.afterPhotos || [],
        nextSessionDate: session.nextSessionDate ? new Date(session.nextSessionDate).toISOString().split('T')[0] : '',
        expectedResultTime: session.expectedResultTime || '',
        postCareInstructions: session.postCareInstructions || '',
        doctorSuggestions: session.doctorSuggestions || '',
        prescribedMedicines: session.prescribedMedicines || '',
        treatmentCompleted: session.treatmentCompleted || false,
        paymentAmount: session.paymentAmount?.toString() || '',
        paymentMethod: session.paymentMethod || '',
        paymentStatus: session.paymentStatus || 'PENDING',
        paymentDate: session.paymentDate ? new Date(session.paymentDate).toISOString().split('T')[0] : '',
        paymentNotes: session.paymentNotes || '',
      })
      setImagePreview(session.beforePhotos || [])
      setAfterImagePreview(session.afterPhotos || [])
    }
  }, [session])

  const updateSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update session')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', session.id] })
      queryClient.invalidateQueries({ queryKey: ['client', session.clientId] })
      toast.success('Session updated successfully!')
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          newImages.push(base64)
          if (newImages.length === files.length) {
            setImagePreview([...imagePreview, ...newImages])
            setFormData({ ...formData, beforePhotos: [...formData.beforePhotos, ...newImages] })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    const newPhotos = formData.beforePhotos.filter((_, i) => i !== index)
    setImagePreview(newPreviews)
    setFormData({ ...formData, beforePhotos: newPhotos })
  }

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          newImages.push(base64)
          if (newImages.length === files.length) {
            setAfterImagePreview([...afterImagePreview, ...newImages])
            setFormData({ ...formData, afterPhotos: [...formData.afterPhotos, ...newImages] })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAfterImage = (index: number) => {
    const newPreviews = afterImagePreview.filter((_, i) => i !== index)
    const newPhotos = formData.afterPhotos.filter((_, i) => i !== index)
    setAfterImagePreview(newPreviews)
    setFormData({ ...formData, afterPhotos: newPhotos })
  }

  const addTreatment = () => {
    if (treatmentInput.trim()) {
      setFormData({ 
        ...formData, 
        treatmentsPerformed: [...formData.treatmentsPerformed, treatmentInput.trim()] 
      })
      setTreatmentInput('')
    }
  }

  const removeTreatment = (index: number) => {
    setFormData({ 
      ...formData, 
      treatmentsPerformed: formData.treatmentsPerformed.filter((_, i) => i !== index) 
    })
  }

  const addProduct = () => {
    if (productInput.trim()) {
      setFormData({ 
        ...formData, 
        productsUsed: [...formData.productsUsed, productInput.trim()] 
      })
      setProductInput('')
    }
  }

  const removeProduct = (index: number) => {
    setFormData({ 
      ...formData, 
      productsUsed: formData.productsUsed.filter((_, i) => i !== index) 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSession.mutateAsync(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
          <h3 className="text-2xl font-bold text-gray-900">Edit Session {session.sessionNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4 text-blue-900">📋 Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Acne Treatment">Acne Treatment</option>
                  <option value="Pigmentation">Pigmentation</option>
                  <option value="Anti-Aging">Anti-Aging</option>
                  <option value="Hair Removal">Hair Removal</option>
                  <option value="Scar Treatment">Scar Treatment</option>
                  <option value="Skin Glow">Skin Glow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.treatmentCompleted}
                    onChange={(e) => setFormData({ ...formData, treatmentCompleted: e.target.checked })}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-blue-900">✓ Mark Treatment as Completed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Before Condition Assessment */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4 text-green-900">🔍 Before Condition Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acne Severity</label>
                <select
                  value={formData.acneSeverity}
                  onChange={(e) => setFormData({ ...formData, acneSeverity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scar Type</label>
                <select
                  value={formData.scarType}
                  onChange={(e) => setFormData({ ...formData, scarType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="ICE_PICK">Ice Pick</option>
                  <option value="BOXCAR">Boxcar</option>
                  <option value="ROLLING">Rolling</option>
                  <option value="HYPERTROPHIC">Hypertrophic</option>
                  <option value="KELOID">Keloid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pigmentation Level</label>
                <select
                  value={formData.pigmentationLevel}
                  onChange={(e) => setFormData({ ...formData, pigmentationLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glow/Dullness Scale (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.glowDullnessScale}
                  onChange={(e) => setFormData({ ...formData, glowDullnessScale: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hair Density</label>
                <select
                  value={formData.hairDensity}
                  onChange={(e) => setFormData({ ...formData, hairDensity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="THIN">Thin</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="THICK">Thick</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texture Roughness (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.textureRoughness}
                  onChange={(e) => setFormData({ ...formData, textureRoughness: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pore Visibility (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.poreVisibility}
                  onChange={(e) => setFormData({ ...formData, poreVisibility: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasInflammation}
                  onChange={(e) => setFormData({ ...formData, hasInflammation: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Has Inflammation</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Before Condition Description *</label>
              <textarea
                required
                rows={4}
                value={formData.beforeCondition}
                onChange={(e) => setFormData({ ...formData, beforeCondition: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the patient's condition before treatment..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Before Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {imagePreview.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition" 
                        onClick={() => setSelectedImage({ src: img, alt: `Before Photo ${index + 1}` })}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Treatment Details */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4 text-purple-900">💊 Treatment Details</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatments Performed</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={treatmentInput}
                    onChange={(e) => setTreatmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTreatment())}
                    placeholder="Enter treatment and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTreatment}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                {formData.treatmentsPerformed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.treatmentsPerformed.map((treatment, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        {treatment}
                        <button
                          type="button"
                          onClick={() => removeTreatment(index)}
                          className="ml-2 hover:text-purple-900"
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Products Used</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                    placeholder="Enter product and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addProduct}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                {formData.productsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.productsUsed.map((product, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        {product}
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="ml-2 hover:text-purple-900"
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* After Treatment - Only show if treatment is marked as completed */}
          {formData.treatmentCompleted && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4 text-orange-900">📝 After Treatment</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">After Notes</label>
                <textarea
                  rows={3}
                  value={formData.afterNotes}
                  onChange={(e) => setFormData({ ...formData, afterNotes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Notes about the treatment session..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Outcome</label>
                <textarea
                  rows={2}
                  value={formData.immediateOutcome}
                  onChange={(e) => setFormData({ ...formData, immediateOutcome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Immediate results observed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects (if any)</label>
                <textarea
                  rows={2}
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any side effects noticed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">After Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAfterImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {afterImagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {afterImagePreview.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`After ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition" 
                          onClick={() => setSelectedImage({ src: img, alt: `After Photo ${index + 1}` })}
                        />
                        <button
                          type="button"
                          onClick={() => removeAfterImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Follow-up & Instructions */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-4 text-yellow-900">📅 Follow-up & Instructions</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Session Date</label>
                <input
                  type="date"
                  value={formData.nextSessionDate}
                  onChange={(e) => setFormData({ ...formData, nextSessionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Result Time</label>
                <input
                  type="text"
                  value={formData.expectedResultTime}
                  onChange={(e) => setFormData({ ...formData, expectedResultTime: e.target.value })}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post-Care Instructions</label>
                <textarea
                  rows={3}
                  value={formData.postCareInstructions}
                  onChange={(e) => setFormData({ ...formData, postCareInstructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for patient care after treatment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Suggestions</label>
                <textarea
                  rows={3}
                  value={formData.doctorSuggestions}
                  onChange={(e) => setFormData({ ...formData, doctorSuggestions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Doctor's recommendations and suggestions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Medicines</label>
                <textarea
                  rows={2}
                  value={formData.prescribedMedicines}
                  onChange={(e) => setFormData({ ...formData, prescribedMedicines: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="List of prescribed medicines..."
                />
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> Payment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select payment method</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Notes</label>
                <textarea
                  rows={2}
                  value={formData.paymentNotes}
                  onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Additional payment notes or transaction details..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={updateSession.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
              disabled={updateSession.isPending}
            >
              {updateSession.isPending ? 'Updating...' : 'Update Session'}
            </button>
          </div>
        </form>
      </div>

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
