import React, { useState } from 'react'
import { CheckCircle, Send, AlertCircle, Shield, Lock, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const MortgageRefinanceLanding = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    zip_code: '',
    current_rate: '',
    credit_score: '',
    is_homeowner: '',
    contact_time: ''
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

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.customer_name && formData.email && formData.phone
      case 2:
        return formData.zip_code && formData.current_rate && formData.credit_score
      case 3:
        return formData.is_homeowner && formData.contact_time
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const description = `Mortgage refinance inquiry - Current rate: ${formData.current_rate}%, Credit score: ${formData.credit_score}, Homeowner: ${formData.is_homeowner}, Best contact time: ${formData.contact_time}`

      const submitData = {
        customer_name: formData.customer_name,
        service_category: 'Mortgage Refinance',
        sub_service: 'Home Refi',
        zip_code: formData.zip_code,
        phone: formData.phone,
        email: formData.email,
        description: description
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
        setSuccessMessage('Thanks! A verified loan officer may reach out shortly.')
        setFormData({
          customer_name: '',
          email: '',
          phone: '',
          zip_code: '',
          current_rate: '',
          credit_score: '',
          is_homeowner: '',
          contact_time: ''
        })
        setCurrentStep(1)
      } else {
        setErrorMessage(data.detail || data.message || 'An error occurred while submitting your request')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-700">Request Submitted!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg mb-4">{successMessage}</p>
              <Button onClick={() => setSuccessMessage('')} className="w-full">
                Check Another Rate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1655759738595-d0b7b0e5b6b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)'
          }}
        >
          <div className="relative bg-gradient-to-r from-blue-900/90 to-indigo-900/90">
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Still Paying a 6% Mortgage? You May Qualify for a Better Rate.
              </h1>
              <p className="text-xl mb-8">
                Check if you qualify for lower monthly payments in under 60 seconds.
              </p>
              <Button 
                onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
              >
                Start My Free Refinance Check
              </Button>
              
              {/* Trust Badges */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium">Safe & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium">Licensed Lenders Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="form-section" className="max-w-4xl mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get Your Free Rate Quote</CardTitle>
            <CardDescription className="text-center">
              Complete the form below to see if you qualify for a lower rate
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Step {currentStep} of 3
            </p>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div>
                    <Label htmlFor="customer_name">Full Name *</Label>
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
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
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
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Mortgage Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Mortgage Information</h3>
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
                      pattern="[0-9]{5}"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_rate">Current Mortgage Rate *</Label>
                    <Select value={formData.current_rate} onValueChange={(value) => handleInputChange('current_rate', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.0-3.5">3.0% - 3.5%</SelectItem>
                        <SelectItem value="3.5-4.0">3.5% - 4.0%</SelectItem>
                        <SelectItem value="4.0-4.5">4.0% - 4.5%</SelectItem>
                        <SelectItem value="4.5-5.0">4.5% - 5.0%</SelectItem>
                        <SelectItem value="5.0-5.5">5.0% - 5.5%</SelectItem>
                        <SelectItem value="5.5-6.0">5.5% - 6.0%</SelectItem>
                        <SelectItem value="6.0-6.5">6.0% - 6.5%</SelectItem>
                        <SelectItem value="6.5-7.0">6.5% - 7.0%</SelectItem>
                        <SelectItem value="7.0+">7.0%+</SelectItem>
                        <SelectItem value="not-sure">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credit_score">Estimated Credit Score *</Label>
                    <Select value={formData.credit_score} onValueChange={(value) => handleInputChange('credit_score', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your credit score range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent (750+)</SelectItem>
                        <SelectItem value="good">Good (700-749)</SelectItem>
                        <SelectItem value="fair">Fair (650-699)</SelectItem>
                        <SelectItem value="poor">Poor (Below 650)</SelectItem>
                        <SelectItem value="not-sure">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Final Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Final Details</h3>
                  <div>
                    <Label htmlFor="is_homeowner">Are you the homeowner? *</Label>
                    <Select value={formData.is_homeowner} onValueChange={(value) => handleInputChange('is_homeowner', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact_time">Best time to contact *</Label>
                    <Select value={formData.contact_time} onValueChange={(value) => handleInputChange('contact_time', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred contact time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="ml-auto bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="ml-auto bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg"
                    disabled={isSubmitting || !validateStep(currentStep)}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Get My Rate Quote'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
