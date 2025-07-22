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
  const [testSmsLoading, setTestSmsLoading] = useState(false)
  const [testSmsMessage, setTestSmsMessage] = useState('')

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

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
        setSuccessMessage('✅ You\'re In! You\'ll receive a text when your first matching lead comes in.')
        setFormData({
          business_name: '',
          contact_name: '',
          email: '',
          phone: '',
          industry: '',
          sub_service: '',
          zip_codes: '',
          sms_opt_in: true
        })
      } else {
        setErrorMessage(data.detail || 'An error occurred during signup')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestSms = async () => {
    setTestSmsLoading(true)
    setTestSmsMessage('')

    try {
      const response = await fetch('/.netlify/functions/send-lead-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: 'HVAC',
          location: 'Jacksonville',
          leadType: 'Install',
          link: 'https://customleadmatch.netlify.app/claim/test-lead'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setTestSmsMessage(`✅ Test SMS sent successfully! Message: "${data.smsContent}" sent to ${data.sentTo}`)
      } else {
        setTestSmsMessage(`❌ Failed to send test SMS: ${data.message}`)
      }
    } catch (error) {
      setTestSmsMessage('❌ Network error while sending test SMS')
    } finally {
      setTestSmsLoading(false)
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
    "First-Come, First-Serve Claim System"
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
          
          <div className="mb-6">
            <Button 
              onClick={handleTestSms}
              disabled={testSmsLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium"
            >
              {testSmsLoading ? 'Sending...' : 'Send Test SMS'}
            </Button>
            {testSmsMessage && (
              <div className="mt-3 p-3 bg-gray-100 rounded-lg max-w-2xl mx-auto">
                <p className="text-sm text-gray-700">{testSmsMessage}</p>
              </div>
            )}
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
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
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
                    value={formData.sub_service} 
                    onValueChange={(value) => handleInputChange('sub_service', value)}
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
