import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Footer } from './Footer'
import { Logo } from './ui/Logo'

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('https://formspree.io/f/xdkogkpv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: 'New Contact Form Submission – Custom Lead Match'
        }),
      })

      if (response.ok) {
        setSuccessMessage('Thank you for your message! We\'ll get back to you soon.')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setErrorMessage('Failed to send message. Please try again.')
      }
    } catch (error) {
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ 
      paddingTop: 'env(safe-area-inset-top, 0)',
      scrollPaddingTop: 'var(--header-height, 72px)'
    }}>
      <style>{`
        :root {
          --header-height: 72px;
        }
        
        html, body {
          scroll-padding-top: var(--header-height);
        }
        
        body {
          padding-top: env(safe-area-inset-top, 0);
        }
        
        .contact-header {
          overflow: visible;
        }
        
        .contact-hero {
          overflow: visible;
          padding-top: calc(var(--header-height) + 24px);
        }
        
        @media (max-width: 640px) {
          .contact-hero {
            padding-top: calc(var(--header-height) + 16px);
          }
        }
        
        .contact-brand,
        .brand-badge {
          overflow: visible !important;
          margin-top: 0 !important;
          position: static !important;
          transform: none !important;
        }
        
        .contact-brand {
          display: flex;
          justify-content: center;
        }
        
        .brand-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 16px;
          background: linear-gradient(90deg, #2563eb, #22c55e);
          box-shadow: 0 10px 24px rgba(2, 6, 23, 0.18);
          overflow: visible;
        }
        
        .brand-badge img {
          display: block;
          height: 44px;
          max-width: 100%;
          object-fit: contain;
        }
        
        @media (max-width: 640px) {
          .brand-badge img {
            height: 40px;
          }
        }
      `}</style>
      
      <header className="contact-header bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" style={{ height: 'var(--header-height)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="contact-brand">
              <div className="brand-badge">
                <Logo className="max-w-xs" width={250} height={75} withBadge={true} withTagline={true} clickable={false} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="contact-hero pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              Have questions? We're here to help.
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Contact Us</CardTitle>
              <CardDescription className="text-center">
                Send us a message and we'll respond as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                </Alert>
              )}
              
              {errorMessage && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
