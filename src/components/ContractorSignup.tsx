import { useState } from 'react'
import { CheckCircle, Zap, Star, DollarSign, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IndustryDropdown } from '@/components/shared/IndustryDropdown'
import { Footer } from './Footer'

const ContractorSignup = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirm_password: '',
    industry: '',
    sub_service: '',
    zip_codes: '',
    sms_opt_in: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Field ${field} changed to:`, value)
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    console.log('Form data on submit:', {
      ...formData,
      password: formData.password ? '[REDACTED]' : 'MISSING',
      confirm_password: formData.confirm_password ? '[REDACTED]' : 'MISSING'
    })
    console.log('Password field value:', formData.password ? 'HAS_VALUE' : 'EMPTY')
    console.log('Confirm password field value:', formData.confirm_password ? 'HAS_VALUE' : 'EMPTY')
    console.log('Full formData keys:', Object.keys(formData))
    console.log('Current industry value:', formData.industry)
    console.log('Current sub_service value:', formData.sub_service)

    if (!formData.business_name || !formData.contact_name || !formData.email || !formData.phone || !formData.username || !formData.password || !formData.industry || !formData.sub_service || !formData.zip_codes) {
      console.log('Missing fields:', {
        business_name: !formData.business_name,
        contact_name: !formData.contact_name,
        email: !formData.email,
        phone: !formData.phone,
        username: !formData.username,
        password: !formData.password,
        industry: !formData.industry,
        sub_service: !formData.sub_service,
        zip_codes: !formData.zip_codes
      })
      setErrorMessage('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const requestBody = JSON.stringify(formData)
      console.log('Request body being sent:', requestBody)
      console.log('Request body length:', requestBody.length)
      
      const response = await fetch('/.netlify/functions/contractors-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      })

      const data = await response.json()

      if (response.ok) {
        if (data.contractor_id && data.session_token) {
          localStorage.setItem("contractor_id", data.contractor_id);
          localStorage.setItem("contractor_session_token", data.session_token);
        }
        
        if (data.redirect_url) {
          console.log('Redirecting to:', data.redirect_url)
          window.location.href = data.redirect_url
        } else {
          setSuccessMessage('✅ You\'re In! You\'ll receive a text when your first matching lead comes in.')
          setFormData({
            business_name: '',
            contact_name: '',
            email: '',
            phone: '',
            username: '',
            password: '',
            confirm_password: '',
            industry: '',
            sub_service: '',
            zip_codes: '',
            sms_opt_in: true
          })
        }
      } else {
        setErrorMessage(data.detail || data.message || 'An error occurred during signup')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const benefits = [
    "3 Free Leads — No Strings Attached",
    "Exclusive Leads (Only One Contractor Can Claim)",
    "SMS Notifications for Instant Alerts",
    "Industry & Service-Type Matching",
    "First-Come, First-Serve Claim System",
    "Pre-Screened & Validated Leads Only — No Spam or Junk"
  ]

  const testimonials = [
    {
      name: "Marcus G.",
      title: "HVAC Pro",
      quote: "I stopped buying from [redacted] and switched to CLM full-time.",
      avatar: "MG"
    },
    {
      name: "Denise R.", 
      title: "Roofing Contractor",
      quote: "Real leads, actual jobs, no BS.",
      avatar: "DR"
    },
    {
      name: "Carlos A.",
      title: "General Contractor", 
      quote: "Got a $14,000 kitchen job from my 2nd lead.",
      avatar: "CA"
    }
  ]

  const trustBadges = [
    { icon: CheckCircle, text: "TCPA Compliant" },
    { icon: Lock, text: "SSL Secured" },
    { icon: Star, text: "AI-Powered Matching" },
    { icon: Phone, text: "1 Contractor per Lead" },
    { icon: DollarSign, text: "Pay-as-you-go, no contracts" }
  ]

  const updatedHowItWorksSteps = [
    {
      icon: CheckCircle,
      title: "Claim Your Free Leads",
      description: "No payment needed to get started"
    },
    {
      icon: Zap,
      title: "Get Matched Instantly", 
      description: "New leads sent via text/email in real-time"
    },
    {
      icon: DollarSign,
      title: "Buy More When You're Ready",
      description: "Pay only if the system works for you"
    }
  ]

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Welcome to Custom Lead Match!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">{successMessage}</p>
            <Button onClick={() => setSuccessMessage('')} className="w-full">
              Sign Up Another Contractor
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 font-['Inter',_'Roboto',_'Open_Sans',_sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Custom Lead Match
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get 3 Free Leads — Instantly Connect with High-Intent Customers in Your Industry
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Join thousands of contractors who get exclusive leads delivered directly to their phone. 
            No monthly fees, no contracts — just real customers ready to hire.
          </p>
          
          <div className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-2 text-center">🔥 Lead Quality Guarantee</h3>
            <p className="text-green-700 text-center mb-3">
              Every lead is manually and programmatically screened for validity before being sent to you. We reject spam, invalid numbers, duplicates, and junk leads—so you only get high-quality opportunities that convert better.
            </p>
            <div className="text-sm text-green-600 space-y-1">
              <div>✅ All phone numbers are screened for validity before delivery</div>
              <div>✅ Email format validation and deliverability checks</div>
              <div>✅ Duplicate detection (30-day window)</div>
              <div>✅ Content filtering for spam and junk submissions</div>
              <div>✅ IP rate limiting to prevent abuse and fake leads</div>
              <div>✅ Each lead is sold only once - exclusive to you</div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">💰 Why Clean Data Matters:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• Higher conversion rates from valid contacts</div>
                <div>• Less time wasted on bad leads</div>
                <div>• Better ROI on your lead investment</div>
                <div>• Direct, actionable customer contact information</div>
              </div>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-6">About Custom Lead Match</h3>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-6">
              Custom Lead Match was created to fix what's broken in the lead gen industry. We're not a list broker or middleman — we're a real-time match platform built for small business contractors.
            </p>
            <p className="text-lg text-gray-700">
              We focus on trust, fairness, and transparency — connecting verified customers to only one contractor per lead, with no subscription pressure or shady filters. This is how lead generation should be.
            </p>
          </div>
        </div>

        {/* Why We Built This Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Why We Built This</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6">
                Most platforms charge contractors before they've earned your trust. They deliver recycled or fake leads, and spam multiple companies with the same customer inquiry.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                At Custom Lead Match, we're building a better way:
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">3 free leads to prove we work</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">1 contractor per lead — no competition once it's yours</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">No monthly fees or upfront contracts</span>
              </div>
              <p className="text-lg text-gray-600 italic mt-4">You pay only if we prove our value.</p>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center items-center gap-8 py-8 bg-white border border-gray-200 rounded-lg">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon
              return (
                <div key={index} className="flex items-center space-x-2 text-gray-700">
                  <IconComponent className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{badge.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">What Contractors Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {updatedHowItWorksSteps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Why Contractors Choose Custom Lead Match
          </h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create My Free Account</CardTitle>
            <CardDescription className="text-center">
              Start receiving exclusive leads in your area today
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
      </div>
      <Footer />
    </div>
  )
}

export default ContractorSignup
