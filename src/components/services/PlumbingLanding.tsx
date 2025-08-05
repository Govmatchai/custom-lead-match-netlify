import React, { useState, useEffect } from 'react'
import { CheckCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const PlumbingLanding = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    service_category: 'home_services',
    sub_service: 'plumbing',
    zip_code: '',
    phone: '',
    email: '',
    description: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    document.title = 'Licensed Local Plumbers – Get Help with Plumbing Issues Fast'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'We connect your request to certified local plumbing professionals who can respond quickly. No fees or obligations — just fast, professional help.')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'We connect your request to certified local plumbing professionals who can respond quickly. No fees or obligations — just fast, professional help.'
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
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
    setSuccessMessage('')

    try {
      const response = await fetch('/.netlify/functions/leads-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Your plumbing request has been submitted! Licensed professionals in your area will contact you shortly.')
        setFormData({
          customer_name: '',
          service_category: 'home_services',
          sub_service: 'plumbing',
          zip_code: '',
          phone: '',
          email: '',
          description: ''
        })
      } else {
        setErrorMessage(data.detail || data.message || 'An error occurred while submitting your request')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToForm = () => {
    const formElement = document.getElementById('plumbing-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-4">Request Submitted!</h2>
            <p className="text-lg mb-6">{successMessage}</p>
            <Button 
              onClick={() => setSuccessMessage('')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 153, 204, 0.8), rgba(0, 153, 204, 0.8)), url('https://www.bigstockphoto.com/image-31808645/stock-photo-plumber-fixing-a-pipe-to-a-wall')`
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🚰</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Need a Licensed Plumber Right Now? We've Got You Covered.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Submit your issue and we'll immediately alert trusted, certified plumbing professionals in your area who are ready to help.
            </p>
            <Button 
              onClick={scrollToForm}
              className="text-white px-8 py-4 text-lg font-semibold hover:opacity-90"
              style={{ backgroundColor: '#0099CC' }}
            >
              Get Help from a Certified Plumber
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Only Licensed & Certified Professionals</h3>
            </div>
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Immediate Response - We Alert Nearby Pros Instantly</h3>
            </div>
            <div className="text-center">
              <div className="text-green-500 text-2xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">No Fees, No Hassle, No Obligations</h3>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-12" style={{ color: '#0099CC' }}>How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white"
                  style={{ backgroundColor: '#0099CC' }}
                >
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Tell us what's going on</h3>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white"
                  style={{ backgroundColor: '#0099CC' }}
                >
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">We notify licensed plumbers near you</h3>
              </div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white"
                  style={{ backgroundColor: '#0099CC' }}
                >
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">They reach out to assist, often within minutes</h3>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 mb-16">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
              </div>
              <blockquote className="text-lg italic text-gray-700 mb-4">
                "We had water flooding our basement — someone called me within 5 minutes. Incredible service."
              </blockquote>
              <cite className="text-gray-600 font-medium">– Erica, Tampa</cite>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Only qualified, licensed plumbing professionals are contacted. We never send your request to random contractors.
              </p>
            </div>
          </div>

          <Card id="plumbing-form" className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#0099CC' }}>
                Get Help Now
              </h2>

              {errorMessage && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>

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
                    className="mt-1"
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Brief Description of the Problem *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please describe your plumbing issue (e.g., leaky pipe, clogged drain, water heater problem, etc.)"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full text-white py-4 text-lg font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#0099CC' }}
                  disabled={isSubmitting}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Submitting Your Request...' : 'Submit My Plumbing Request'}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Button 
                  onClick={scrollToForm}
                  variant="outline"
                  className="border-2 hover:bg-blue-50"
                  style={{ borderColor: '#0099CC', color: '#0099CC' }}
                >
                  Get Help from a Certified Plumber
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PlumbingLanding
