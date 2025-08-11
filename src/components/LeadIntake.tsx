import React, { useState } from 'react'
import { CheckCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IndustryDropdown } from '@/components/shared/IndustryDropdown'
import { getApiUrl } from '@/lib/api'

const LeadIntake = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    service_category: '',
    sub_service: '',
    zip_code: '',
    phone: '',
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

    try {
      const response = await fetch(getApiUrl('leads-submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Lead submitted successfully! Matching contractors will be notified via SMS.')
        setFormData({
          customer_name: '',
          service_category: '',
          sub_service: '',
          zip_code: '',
          phone: '',
          description: ''
        })
      } else {
        setErrorMessage(data.detail || 'An error occurred while submitting the lead')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Lead Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">{successMessage}</p>
            <Button onClick={() => setSuccessMessage('')} className="w-full">
              Submit Another Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Submit a Service Request
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get connected with qualified contractors in your area
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tell Us About Your Project</CardTitle>
            <CardDescription className="text-center">
              Fill out the form below and we'll connect you with qualified contractors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert className="mb-6 border-red-200 bg-red-50">
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

              <IndustryDropdown
                industryValue={formData.service_category}
                subServiceValue={formData.sub_service}
                onIndustryChange={handleServiceCategoryChange}
                onSubServiceChange={handleSubServiceChange}
                required={true}
              />

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
                <p className="text-sm text-gray-500 mt-1">
                  Enter your ZIP code to find contractors in your area
                </p>
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please describe your project, including any specific requirements, timeline, or budget considerations..."
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

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Request</h3>
              <p className="text-gray-600">Tell us about your project and what you need</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">We Find Contractors</h3>
              <p className="text-gray-600">Qualified contractors in your area are notified instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Connected</h3>
              <p className="text-gray-600">The first available contractor will contact you directly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadIntake
