import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { IndustryDropdown } from './shared/IndustryDropdown'
import { getApiUrl } from '../lib/api'

interface SignupFormProps {
  prefilledData?: {
    email?: string
    zip?: string
    trade?: string
  }
}

export const SignupForm = ({ prefilledData }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    contact_name: '',
    business_name: '',
    email: prefilledData?.email || '',
    phone: '',
    industry: prefilledData?.trade || '',
    sub_service: '',
    username: '',
    password: '',
    confirm_password: '',
    zip_codes: prefilledData?.zip || '',
    sms_opt_in: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIndustryChange = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industry,
      sub_service: ''
    }))
  }

  const handleSubServiceChange = (subService: string) => {
    setFormData(prev => ({
      ...prev,
      sub_service: subService
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(getApiUrl('contractors-signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.contractor_id && result.session_token) {
          localStorage.setItem("contractor_id", result.contractor_id);
          localStorage.setItem("contractor_session_token", result.session_token);
        }
        
        if (result.redirect_url) {
          window.location.href = result.redirect_url
        } else {
          window.location.href = '/contractor-dashboard'
        }
      } else {
        setErrorMessage(result.detail || result.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create Your Free Account
          </h1>
          <p className="text-xl text-gray-600">
            Start receiving exclusive leads in your area today
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign Up Free</CardTitle>
            <CardDescription className="text-center">
              Join thousands of contractors growing their business
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
                  <Label htmlFor="contact_name">Name *</Label>
                  <Input
                    id="contact_name"
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="business_name">Company *</Label>
                  <Input
                    id="business_name"
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Smith Construction LLC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@smithconstruction.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Choose a unique username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter secure password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirm_password">Confirm Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <Label htmlFor="zip_codes">ZIP Codes (comma-separated) *</Label>
                <Input
                  id="zip_codes"
                  type="text"
                  required
                  value={formData.zip_codes}
                  onChange={(e) => handleInputChange('zip_codes', e.target.value)}
                  placeholder="12345, 12346, 12347"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the ZIP codes where you provide services, separated by commas
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms_opt_in"
                  checked={formData.sms_opt_in}
                  onChange={(e) => handleInputChange('sms_opt_in', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="sms_opt_in" className="text-sm">
                  Yes, send me SMS alerts for new leads
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create My Free Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/contractor-login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
