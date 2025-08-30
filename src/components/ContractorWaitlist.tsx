import React, { useState, useEffect } from 'react'
import { Search, MessageSquare, Briefcase, CheckCircle, Shield, Zap, Award } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Logo } from './ui/Logo'
import { Footer } from './Footer'

const ContractorWaitlist = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    trade: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch('/.netlify/functions/track-page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_path: '/launch-soon' })
        })
      } catch (error) {
        console.log('Page tracking failed:', error)
      }
    }
    trackPageView()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/.netlify/functions/contractor-waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.redirect_url) {
          window.location.href = result.redirect_url
        } else {
          window.location.href = '/contractor-waitlist-confirmed'
        }
      } else {
        setErrorMessage(result.message || 'Failed to join waitlist. Please try again.')
      }
    } catch (error) {
      console.error('Waitlist signup error:', error)
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen bg-white font-['Inter',_'Roboto',_'Open_Sans',_sans-serif]">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-6 py-20 text-center text-white relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-12">
              <Logo 
                width={350} 
                height={105} 
                withBadge={true}
                clickable={false}
              />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Be the First to Access Real-Time Leads in Your Trade
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-95 leading-relaxed">
              Join our early access list to receive quality leads before anyone else. Limited spots available per trade and location.
            </p>
            
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-0"
            >
              Join Early Access List
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start winning more business</p>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">🔎 Step 1: Sign Up</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Tell us about your trade and location preferences.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">📲 Step 2: Get Real-Time Leads</h3>
              <p className="text-lg text-gray-600 leading-relaxed">We'll notify you the moment a new job lead becomes available.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">💼 Step 3: Win More Business</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Claim leads and grow your business directly from your dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Signals Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Trusted by Contractors in Over 50 U.S. Cities</h2>
            <p className="text-lg text-gray-600">Backed by AI • Secure & Private</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 mb-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-purple-600" />
              <span className="text-lg font-semibold text-gray-700">TCPA Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-700">Verified Leads</span>
            </div>
          </div>
        </div>
      </div>

      <div id="signup-form" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-12">
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4">Join Early Access List</CardTitle>
                <p className="text-xl opacity-95">Get started with quality leads in your area</p>
              </CardHeader>
              <CardContent className="p-12">
                {errorMessage && (
                  <Alert className="mb-8 border-red-200 bg-red-50 rounded-2xl">
                    <AlertDescription className="text-red-700 text-lg">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-lg font-semibold text-gray-700">First Name *</Label>
                      <Input
                        id="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="John"
                        className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-lg font-semibold text-gray-700">Last Name *</Label>
                      <Input
                        id="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Smith"
                        className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-lg font-semibold text-gray-700">Company Name *</Label>
                    <Input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Smith Construction LLC"
                      className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-lg font-semibold text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@smithconstruction.com"
                        className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trade" className="text-lg font-semibold text-gray-700">Trade *</Label>
                    <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
                      <SelectTrigger className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Select your trade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="roofing">Roofing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining Early Access List...' : 'Join Early Access List'}
                  </Button>
                  
                  <div className="text-center mt-6">
                    <p className="text-lg text-gray-600">
                      💰 <strong>Contractors who sign up now get $25 in free lead credits at launch.</strong>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      <Footer />
    </div>
  )
}

export default ContractorWaitlist
