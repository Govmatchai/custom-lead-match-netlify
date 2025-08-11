import React, { useState } from 'react'
import { CheckCircle, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IndustryDropdown } from '@/components/shared/IndustryDropdown'

interface LeadFormProps {
  industry: string
  defaultSubService?: string
  contractorId?: string
}

export const LeadForm: React.FC<LeadFormProps> = ({ industry, defaultSubService, contractorId }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    service_category: industry,
    sub_service: defaultSubService || '',
    zip_code: '',
    phone: '',
    email: '',
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [validationSummary, setValidationSummary] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      service_category: value,
      sub_service: ''
    }))
  }

  const handleSubServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sub_service: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')
    setValidationSummary(null)

    try {
      const submitData: any = { ...formData }
      if (contractorId) {
        submitData.contractor_id = contractorId
      }

      const response = await fetch('/.netlify/functions/leads-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        setValidationSummary(data.validation_summary)
        if (data.status === 'valid') {
          setFormData({
            customer_name: '',
            service_category: industry,
            sub_service: defaultSubService || '',
            zip_code: '',
            phone: '',
            email: '',
            description: ''
          })
        }
      } else {
        setErrorMessage(data.detail || data.message || 'An error occurred while submitting the lead')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-700">Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-4">{successMessage}</p>
          {validationSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Validation Summary:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>✅ Phone: {validationSummary.phone_valid ? 'Valid' : 'Invalid'}</div>
                <div>✅ Email: {validationSummary.email_valid ? 'Valid' : 'Invalid'}</div>
                <div>✅ Content: {validationSummary.content_valid ? 'Valid' : 'Needs Review'}</div>
                <div>✅ Duplicate Check: {validationSummary.is_duplicate ? 'Duplicate Found' : 'Unique'}</div>
              </div>
            </div>
          )}
          <Button onClick={() => setSuccessMessage('')} className="w-full">
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Tell Us About Your Project</CardTitle>
        <CardDescription className="text-center">
          Fill out the form below and we'll connect you with qualified contractors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            ✅ Every lead is pre-screened and validated before being sent to contractors. 
            We reject spam, invalid numbers, duplicates, and junk leads—so you only get high-quality opportunities.
          </p>
        </div>

        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Your Name *</Label>
              <Input
                id="customer_name"
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="zip_code">ZIP Code *</Label>
              <Input
                id="zip_code"
                type="text"
                required
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="12345"
                maxLength={5}
              />
            </div>
          </div>

          <IndustryDropdown
            industryValue={formData.service_category}
            subServiceValue={formData.sub_service}
            onIndustryChange={handleServiceCategoryChange}
            onSubServiceChange={handleSubServiceChange}
            required={true}
          />

          <div>
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please describe your project in detail, including any specific requirements, timeline, or budget considerations..."
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Provide as much detail as possible to help contractors understand your needs
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            disabled={isSubmitting}
          >
            <Send className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Submitting Request...' : 'Submit Service Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
