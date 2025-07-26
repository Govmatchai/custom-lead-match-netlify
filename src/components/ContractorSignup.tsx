import { useState, useEffect } from 'react'
import { CheckCircle, Edit, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Industry {
  value: string
  label: string
}

interface SubService {
  value: string
  label: string
}

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

  const [industries, setIndustries] = useState<Industry[]>([])
  const [subServices, setSubServices] = useState<SubService[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchIndustries()
  }, [])

  useEffect(() => {
    if (formData.industry) {
      fetchSubServices(formData.industry)
    } else {
      setSubServices([])
    }
  }, [formData.industry])

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/.netlify/functions/industries')
      const data = await response.json()
      setIndustries(data)
    } catch (error) {
      console.error('Failed to fetch industries:', error)
    }
  }

  const fetchSubServices = async (industry: string) => {
    try {
      const response = await fetch(`/.netlify/functions/sub-services?industry=${industry}`)
      const data = await response.json()
      setSubServices(data)
    } catch (error) {
      console.error('Failed to fetch sub-services:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`Field ${field} changed to:`, value)
    
    if (field === 'industry' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        industry: value,
        sub_service: ''
      }))
      fetchSubServices(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    console.log('Form data on submit:', formData)
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
      const response = await fetch('/.netlify/functions/contractors-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
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


  const howItWorksSteps = [
    {
      icon: Edit,
      title: "Create a free account",
      description: "Sign up in minutes with your business details"
    },
    {
      icon: Zap,
      title: "Get instant SMS alerts when new leads come in",
      description: "Receive notifications for matching opportunities"
    },
    {
      icon: Users,
      title: "View lead details and claim it on a first-come basis",
      description: "Review and claim leads that match your services"
    }
  ]

  const benefits = [
    "3 Free Leads — No Strings Attached",
    "Exclusive Leads (Only One Contractor Can Claim)",
    "SMS Notifications for Instant Alerts",
    "Industry & Service-Type Matching",
    "First-Come, First-Serve Claim System",
    "Pre-Screened & Validated Leads Only — No Spam or Junk"
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
    <div className="min-h-screen bg-white font-['Inter',_'Roboto',_'Open_Sans',_sans-serif]">
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

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => {
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Service Category *</Label>
                  <Select 
                    value={formData.industry || ""} 
                    onValueChange={(value) => {
                      console.log('Industry Select onValueChange triggered with:', value)
                      handleInputChange('industry', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sub_service">Sub-Service *</Label>
                  <Select 
                    value={formData.sub_service || ""} 
                    onValueChange={(value) => {
                      console.log('Sub-Service Select onValueChange triggered with:', value)
                      handleInputChange('sub_service', value)
                    }}
                    disabled={!formData.industry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-service" />
                    </SelectTrigger>
                    <SelectContent>
                      {subServices.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create My Free Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContractorSignup
