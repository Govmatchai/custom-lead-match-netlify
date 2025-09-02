import React, { useState } from 'react'
import { CheckCircle, Send, Phone, Wrench, Users, Star } from 'lucide-react'

const HVACLandingPage = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    street_address: '',
    city: '',
    zip_code: '',
    phone: '',
    email: '',
    issue_type: '',
    urgency: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const scrollToForm = () => {
    const formElement = document.getElementById('hvac-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const description = `Issue: ${formData.issue_type}, Urgency: ${formData.urgency}, Address: ${formData.street_address}, ${formData.city}, ${formData.zip_code}`
      
      const submitData = {
        customer_name: formData.customer_name,
        service_category: 'home_services',
        sub_service: 'hvac',
        zip_code: formData.zip_code,
        phone: formData.phone,
        email: formData.email,
        description: description
      }

      const response = await fetch(import.meta.env.VITE_CLM_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowConfirmation(true)
        setFormData({
          customer_name: '',
          street_address: '',
          city: '',
          zip_code: '',
          phone: '',
          email: '',
          issue_type: '',
          urgency: ''
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

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-4">Thank You!</h2>
          <p className="text-lg mb-6">
            We're contacting certified HVAC pros in your area right now. Expect a call shortly to schedule your service.
          </p>
          <button 
            onClick={() => setShowConfirmation(false)} 
            className="btn-primary w-full"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 102, 204, 0.8), rgba(0, 102, 204, 0.8)), url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')`
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🔧</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trusted Local Heating & Cooling Experts — Available 24/7
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Whether your AC has stopped working, your furnace won't start, or you need urgent HVAC service, we'll connect you with a certified technician near you right away.
            </p>
            <button 
              onClick={scrollToForm}
              className="btn-primary text-lg px-8 py-4"
            >
              Find My HVAC Pro Now
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="font-semibold">Licensed & Insured</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="font-semibold">Background-Checked Technicians</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="font-semibold">Same-Day Service Available</span>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-4">
              Join thousands of homeowners who rely on our trusted network of HVAC professionals.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div id="hvac-form" className="bg-white rounded-lg shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-4 text-hvac-blue">
              Get Your HVAC Fixed Fast
            </h2>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Tell us about your heating or cooling issue, and we'll match you with a qualified, local HVAC technician right away.
            </p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    id="street_address"
                    type="text"
                    required
                    value={formData.street_address}
                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Your city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    id="zip_code"
                    type="text"
                    required
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-2">
                  What's your issue? *
                </label>
                <select
                  id="issue_type"
                  required
                  value={formData.issue_type}
                  onChange={(e) => handleInputChange('issue_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                >
                  <option value="">Select your issue</option>
                  <option value="No Cooling">No Cooling</option>
                  <option value="No Heating">No Heating</option>
                  <option value="Strange Noises">Strange Noises</option>
                  <option value="System Won't Turn On">System Won't Turn On</option>
                  <option value="Maintenance Request">Maintenance Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  id="urgency"
                  required
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hvac-blue focus:border-transparent"
                >
                  <option value="">Select urgency</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Same-Day">Same-Day</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary text-lg py-4 flex items-center justify-center"
                disabled={isSubmitting}
              >
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Connecting You With a Technician...' : 'Connect Me With a Technician Now'}
              </button>
            </form>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-12 text-hvac-blue">Fast & Simple — Here's How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-hvac-blue rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tell Us Your Problem</h3>
                <p className="text-gray-600">Fill out the quick form in less than a minute.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-hvac-blue rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">We Alert Local HVAC Pros</h3>
                <p className="text-gray-600">Only licensed, insured technicians.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-hvac-blue rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Help Fast</h3>
                <p className="text-gray-600">A professional HVAC technician calls you within minutes.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 mb-16">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-hvac-blue">
                Serving Homeowners in Your City and Surrounding Areas
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                We work with a trusted network of certified HVAC professionals near you. Whether it's emergency service, routine repair, or seasonal maintenance, you can rest assured that help is close by.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-hvac-blue">What Homeowners Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "My AC went out at midnight. Within 30 minutes I had a call from a technician who was at my house in under an hour."
                </blockquote>
                <cite className="text-gray-600 font-medium">– Sarah M., Jacksonville</cite>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "Fast, reliable, and professional. My furnace was fixed the same day I called."
                </blockquote>
                <cite className="text-gray-600 font-medium">– James R., Orlando</cite>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "The process was so easy. Filled out the form and got a call almost instantly."
                </blockquote>
                <cite className="text-gray-600 font-medium">– Carla T., Tampa</cite>
              </div>
            </div>
          </div>

          <div className="bg-hvac-orange rounded-lg p-8 text-center text-white mb-16">
            <h2 className="text-3xl font-bold mb-4">Don't Wait — Get Your HVAC Fixed Today</h2>
            <button 
              onClick={scrollToForm}
              className="bg-white text-hvac-orange font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Find My HVAC Pro Now
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">Your Trusted Heating & Cooling</h3>
          <p className="text-gray-400 mb-4">
            Serving homeowners nationwide with trusted local HVAC professionals.
          </p>
          <p className="text-sm text-gray-500">
            Disclaimer: Your Trusted Heating & Cooling connects homeowners with licensed HVAC contractors. We are not the service provider but match you with qualified professionals in your area.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HVACLandingPage
