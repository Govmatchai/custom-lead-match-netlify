import React, { useState, useEffect } from 'react'
import { MapPin, Handshake, Settings, CheckCircle, CreditCard, Star, Phone, Lock } from 'lucide-react'
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

  const trustBadges = [
    { icon: CheckCircle, text: "TCPA Compliant" },
    { icon: Lock, text: "SSL Secured" },
    { icon: Star, text: "Exclusive Leads" },
    { icon: Phone, text: "Real-time Alerts" },
    { icon: CreditCard, text: "Pay-as-you-go" }
  ]

  return (
    <div className="min-h-screen bg-white font-['Inter',_'Roboto',_'Open_Sans',_sans-serif]">
      {/* Hero Section */}
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8)), url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center text-white relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <Logo 
                width={350} 
                height={105} 
                withBadge={true}
                clickable={false}
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Be the First to Get Matched When We Launch
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Join our pre-launch list and lock in a $25 lead credit. We'll notify you the moment your trade goes live—no spam, no catch.
            </p>
            
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Join Now – Get $25 in Lead Credit
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What You'll Get</h2>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">$25 free credit in your contractor wallet</h3>
                <p className="text-gray-600">(no payment required)</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Early access to the platform</h3>
                <p className="text-gray-600">before public launch</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">A chance to preview</h3>
                <p className="text-gray-600">how lead matching works</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Priority onboarding</h3>
                <p className="text-gray-600">for your trade and zip code</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Local-Only Leads</h3>
              <p className="text-gray-600">Get matched to nearby jobs—we don't sell national leads.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real Buyers, Not Clicks</h3>
              <p className="text-gray-600">Homeowners come to us to hire, not browse.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Full Control</h3>
              <p className="text-gray-600">Choose your budget, service area, and availability.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Zero Risk. All Reward.</h2>
            <p className="text-xl text-gray-600 mb-8">We'll never share your info. Cancel anytime. This is your chance to get ahead—before your competitors do.</p>
          </div>
        </div>
      </div>

      <div id="signup-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Join the Pre-Launch List – Free $25 Credit</CardTitle>
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
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Smith Construction LLC"
                    />
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

                  <div>
                    <Label htmlFor="trade">Trade *</Label>
                    <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
                      <SelectTrigger>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Joining Pre-Launch List...' : 'Join Now – Get $25 in Lead Credit'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-75">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md border border-gray-200">
                <badge.icon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ContractorWaitlist
