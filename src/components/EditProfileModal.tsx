import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { IndustryDropdown } from './shared/IndustryDropdown'

interface Contractor {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  industry: string
  sub_service: string
  zip_codes: string[]
  sms_opt_in?: boolean
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  contractor: Contractor
  onSuccess: () => void
}

export const EditProfileModal = ({ isOpen, onClose, contractor, onSuccess }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    sub_service: '',
    zip_codes: '',
    sms_opt_in: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (contractor && isOpen) {
      setFormData({
        business_name: contractor.business_name || '',
        contact_name: contractor.contact_name || '',
        email: contractor.email || '',
        phone: contractor.phone || '',
        industry: contractor.industry || '',
        sub_service: contractor.sub_service || '',
        zip_codes: contractor.zip_codes?.join(', ') || '',
        sms_opt_in: contractor.sms_opt_in ?? true
      })
      setErrorMessage('')
    }
  }, [contractor, isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      industry: value,
      sub_service: ''
    }))
  }

  const handleSubServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sub_service: value
    }))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    if (!formData.business_name || !formData.contact_name || !formData.email || !formData.phone || !formData.industry || !formData.sub_service || !formData.zip_codes) {
      setErrorMessage('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('Please enter a valid phone number')
      setIsSubmitting(false)
      return
    }

    const zipCodesArray = formData.zip_codes.split(',').map(zip => zip.trim()).filter(zip => zip.length > 0)
    if (zipCodesArray.length === 0) {
      setErrorMessage('Please enter at least one zip code')
      setIsSubmitting(false)
      return
    }

    try {
      const sessionToken = localStorage.getItem('contractor_session_token')
      
      if (!sessionToken) {
        setErrorMessage('Session expired. Please log in again.')
        setIsSubmitting(false)
        return
      }

      const updateData = {
        ...formData,
        zip_codes: zipCodesArray,
        contractor_id: contractor.id,
        session_token: sessionToken
      }

      const response = await fetch('/.netlify/functions/update-contractor-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      
      if (data.success) {
        onSuccess()
        onClose()
      } else {
        setErrorMessage(data.message || 'Failed to update profile')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your business information and service details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                type="text"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                type="text"
                value={formData.contact_name}
                onChange={(e) => handleInputChange('contact_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <IndustryDropdown
            industryValue={formData.industry}
            subServiceValue={formData.sub_service}
            onIndustryChange={handleIndustryChange}
            onSubServiceChange={handleSubServiceChange}
            required={true}
          />

          <div>
            <Label htmlFor="zip_codes">Service Areas (ZIP Codes) *</Label>
            <Input
              id="zip_codes"
              type="text"
              value={formData.zip_codes}
              onChange={(e) => handleInputChange('zip_codes', e.target.value)}
              placeholder="12345, 67890, 54321"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter ZIP codes separated by commas
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="sms_opt_in"
              type="checkbox"
              checked={formData.sms_opt_in}
              onChange={(e) => handleInputChange('sms_opt_in', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="sms_opt_in" className="text-sm">
              I agree to receive SMS notifications about new leads
            </Label>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
