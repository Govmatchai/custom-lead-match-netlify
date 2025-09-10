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
              Get Exclusive Leads in Your Area — Before Your Competitor Does
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto opacity-95 leading-relaxed">
              We only send each lead to one contractor. Be the first to know when we launch in your service area.
            </p>
            
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-0"
            >
              Join the Waitlist — Only 5 Spots Per Trade Per Zip Code
            </Button>
          </div>
        </div>
      </div>

      {/* Why CLM Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Why Contractors Are Switching to CLM</h2>
            <p className="text-xl text-gray-600">The lead generation platform built for professionals</p>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Exclusive Leads Only</h3>
              <p className="text-lg text-gray-600 leading-relaxed">One contractor per lead — no competition or bidding wars.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Zap className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Instant SMS & Email Notifications</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Real-time lead alerts so you're always first to respond.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Built for Pros Who Deliver</h3>
              <p className="text-lg text-gray-600 leading-relaxed">No middlemen or wasted time — direct access to ready customers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
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
              <h3 className="text-2xl font-bold mb-4 text-gray-900">1. Join the Waitlist</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Tell us about your trade and location preferences.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">2. Launch Notification</h3>
              <p className="text-lg text-gray-600 leading-relaxed">We'll notify you the moment we launch in your service area.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Briefcase className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">3. Verify & Start Claiming Leads</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Get $25 credit at launch and start claiming exclusive leads.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Block */}
      <div className="py-20 bg-gradient-to-r from-orange-50 to-red-50 border-t-4 border-orange-400">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-orange-200">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Limited Availability</h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                We're limiting early access to 5 contractors per trade, per zip code. Once full, you'll be on standby.
              </p>
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-2 border-green-200">
                <p className="text-lg font-semibold text-gray-800">
                  🎁 Waitlist members get $25 in lead credit at launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What Contractors Are Saying</h2>
            <p className="text-lg text-gray-600">Real feedback from professionals like you</p>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Mike R.</h4>
                  <p className="text-gray-600">Plumbing Contractor</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Finally a platform that respects real contractors. No more competing with 10 other guys for the same job."
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah T.</h4>
                  <p className="text-gray-600">HVAC Pro</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Instant alerts are game-changing. I'm always the first to respond and my close rate has doubled."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to get exclusive leads before your competition does?
            </h2>
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl border-0"
            >
              Join the Waitlist Now
            </Button>
          </div>
        </div>
      </div>

      <div id="signup-form" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-12">
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4">Join the Waitlist</CardTitle>
                <p className="text-xl opacity-95">Get exclusive leads in your area before your competitors</p>
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
                    {isSubmitting ? 'Joining Waitlist...' : 'Join the Waitlist Now'}
                  </Button>
                  
                  <div className="text-center mt-6">
                    <p className="text-lg text-gray-600">
                      💰 <strong>Waitlist members get $25 in free lead credits at launch.</strong>
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
