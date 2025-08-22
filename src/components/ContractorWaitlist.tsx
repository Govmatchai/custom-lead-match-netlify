import React, { useState } from 'react'
import { CheckCircle, CreditCard, Star, Phone, Lock } from 'lucide-react'
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
              Get Exclusive Leads. No Competition. No Contracts.
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Join the only contractor network where every lead is yours alone. Claim your $25 Free Credit today.
            </p>
            
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Reserve My Spot – Free
            </Button>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                ✅
              </div>
              <h3 className="text-xl font-bold mb-4">Exclusive Leads</h3>
              <p className="text-gray-600">Never shared with competitors</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Notifications</h3>
              <p className="text-gray-600">Real-time SMS &amp; Email alerts</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                💳
              </div>
              <h3 className="text-xl font-bold mb-4">Simple Pricing</h3>
              <p className="text-gray-600">Pay-as-you-go, no monthly fees</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Sign up today and receive $25 in wallet balance.</h2>
            <p className="text-xl text-gray-600 mb-8">Get a Verified Badge to stand out when we launch.</p>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-8 text-left">
              <p className="font-bold text-yellow-800">Offer available only before launch. Limited availability by service area.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  📝
                </div>
                <h3 className="text-2xl font-bold mb-4">Sign Up</h3>
                <p className="text-gray-600 text-lg">Create your free account</p>
                <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>
              
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  🔔
                </div>
                <h3 className="text-2xl font-bold mb-4">Get Notified</h3>
                <p className="text-gray-600 text-lg">Leads matched to your trade &amp; area</p>
                <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  🏆
                </div>
                <h3 className="text-2xl font-bold mb-4">Claim &amp; Win Jobs</h3>
                <p className="text-gray-600 text-lg">Pay only when you see value</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="signup-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Join the Waitlist – Free $25 Credit</CardTitle>
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
                    {isSubmitting ? 'Joining Waitlist...' : 'Join the Waitlist – Free $25 Credit'}
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
