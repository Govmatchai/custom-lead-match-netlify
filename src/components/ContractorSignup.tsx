import { useState } from 'react'
import { CheckCircle, Zap, Star, DollarSign, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IndustryDropdown } from '@/components/shared/IndustryDropdown'
import { Footer } from './Footer'
import { Logo } from '@/components/ui/Logo'
import { getApiUrl } from '@/lib/api'
import { AnimatedStats } from './AnimatedStats'
import { TestimonialsCarousel } from './TestimonialsCarousel'

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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [stickyCtaDismissed, setStickyCtaDismissed] = useState(localStorage.getItem('dismiss_sticky_signup') === 'true')

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
      
      const response = await fetch(getApiUrl('contractors-signup'), {
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
    <div className="min-h-screen bg-white font-['Inter',_'Roboto',_'Open_Sans',_sans-serif]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo className="max-w-xs" width={150} height={45} />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/contractor-login'}
                className="hover:bg-gray-50 border-gray-300"
                aria-label="Contractor Login"
              >
                Login
              </Button>
              <Button 
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label="Contractor Sign Up"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200 transform hover:scale-102 shadow-lg"
              >
                Sign Up Free
              </Button>
            </div>
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                Menu
              </Button>
            </div>
          </div>
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => window.location.href = '/contractor-login'}
                  aria-label="Contractor Login"
                >
                  Login
                </Button>
                <Button 
                  className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label="Contractor Sign Up"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8)), url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center text-white relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              More High-Quality Leads. Less Hassle.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Connect directly with ready-to-hire customers — no shared leads, no wasted time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg"
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Up Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/contractor-login'}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-xl font-bold transition-all duration-300"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 opacity-60">
            <div className="text-gray-600 font-semibold">BBB Accredited</div>
            <div className="text-gray-600 font-semibold">Google Partner</div>
            <div className="text-gray-600 font-semibold">Verified Leads Guaranteed</div>
            <div className="text-gray-600 font-semibold">SSL Secured</div>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-6">Trusted by thousands of contractors nationwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-500">LOGO</div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-500">LOGO</div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-500">LOGO</div>
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-500">LOGO</div>
            </div>
          </div>
        </div>
      </div>

      <AnimatedStats />

      <TestimonialsCarousel />

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  <span>📝</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Sign Up & Create Profile</h3>
                <p className="text-gray-600 text-lg">Set up your contractor profile with your services, coverage areas, and preferences in minutes.</p>
                <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>
              
              <div className="text-center relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  <span>🤝</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Get Matched With Exclusive Leads</h3>
                <p className="text-gray-600 text-lg">Our AI matches you with high-quality leads in your area. No bidding wars - each lead goes to one contractor.</p>
                <div className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                  <span>📈</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Close More Jobs & Grow</h3>
                <p className="text-gray-600 text-lg">Focus on what you do best - completing quality work and growing your business with consistent leads.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Custom Lead Match</h2>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  🎯
                </div>
                <h3 className="text-xl font-bold mb-4">AI-Powered Lead Matching</h3>
                <p className="text-gray-600">Our smart algorithm matches you with leads that fit your expertise and location perfectly.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  🛡️
                </div>
                <h3 className="text-xl font-bold mb-4">Exclusive Leads Only</h3>
                <p className="text-gray-600">No bidding wars. Each lead is sold to only one contractor, giving you the best chance to close.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  📱
                </div>
                <h3 className="text-xl font-bold mb-4">Direct Customer Contact</h3>
                <p className="text-gray-600">Get customer contact info immediately. No middleman, no delays - just direct communication.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-4">Faster Close Times</h3>
                <p className="text-gray-600">Get leads in real-time with instant notifications, so you can respond within minutes.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  🎛️
                </div>
                <h3 className="text-xl font-bold mb-4">Job-Type & Location Filters</h3>
                <p className="text-gray-600">Set your preferences for job types, budget ranges, and service areas to get perfect matches.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  📊
                </div>
                <h3 className="text-xl font-bold mb-4">Mobile-Friendly Dashboard</h3>
                <p className="text-gray-600">Manage your leads, track performance, and update your profile from anywhere with our mobile app.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How We Compare</h2>
          
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-xl rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="p-4 text-left font-bold">Feature</th>
                  <th className="p-4 text-center font-bold">Custom Lead Match</th>
                  <th className="p-4 text-center font-bold">Angi</th>
                  <th className="p-4 text-center font-bold">HomeAdvisor</th>
                  <th className="p-4 text-center font-bold">Thumbtack</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold">Exclusive Leads</td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold">No Monthly Fees</td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold">AI Lead Scoring</td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                  <td className="p-4 text-center"><span className="text-red-500 text-2xl">✗</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold">Real-Time Notifications</td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold">Direct Customer Contact</td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                  <td className="p-4 text-center"><span className="text-yellow-500 text-2xl">~</span></td>
                  <td className="p-4 text-center"><span className="text-yellow-500 text-2xl">~</span></td>
                  <td className="p-4 text-center"><span className="text-green-500 text-2xl">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">See How It Works</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Watch how contractors like you are growing their business with Custom Lead Match
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                </div>
                <p className="text-lg opacity-75">Video Coming Soon</p>
                <p className="text-sm opacity-50">45-60 second explainer video</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Predictive Lead Scoring – Powered by AI</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI rates each lead on how well it fits your expertise and service area — so you spend time on jobs you'll actually win.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset="85"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">85</div>
                      <div className="text-sm text-gray-600">Lead Score</div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">Circular gauge graphic showing 0–100 scoring</p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Work Smarter, Not Harder</h3>
                    <p className="text-gray-600">Our AI instantly analyzes every incoming lead to predict its likelihood of becoming a paying job.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">See the Score, Make the Call</h3>
                    <p className="text-gray-600">Each lead is tagged as Hot, Warm, or Cold so you know exactly where to focus your time.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Maximize ROI</h3>
                    <p className="text-gray-600">Spend less time chasing low-quality jobs and more time closing the high-value work.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Your Next Job Is Waiting — Claim It Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of contractors who are growing their business with exclusive, high-quality leads.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign Up Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/contractor-login'}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-xl font-bold transition-all duration-300"
            >
              Access Dashboard
            </Button>
          </div>
          
          <p className="text-sm opacity-75">
            Questions? Call us at <span className="font-semibold">(555) 123-4567</span>
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="signup-form">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of contractors who are growing their business with exclusive, high-quality leads.
          </p>
        </div>

        {/* About Us Section */}
        <div className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-6">About Us</h3>
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

        {/* Predictive Lead Scoring Section */}
        <div className="mb-16 bg-gradient-to-r from-blue-50 to-white p-8 rounded-xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Predictive Lead Scoring – Powered by AI
            </h3>
            <p className="text-xl text-center text-gray-700 mb-8 max-w-2xl mx-auto">
              "Stop chasing dead-end leads. Focus on the ones that close."
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Mock Dashboard Visual */}
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Leads</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">Kitchen Renovation</span>
                        <p className="text-sm text-gray-600">ZIP: 12345</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">85</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full" style={{backgroundColor: '#28a745', color: 'white'}}>
                          🔥 Hot
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">Bathroom Repair</span>
                        <p className="text-sm text-gray-600">ZIP: 12346</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">65</span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#ffc107', color: '#000'}}>
                          👍 Warm
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">General Maintenance</span>
                        <p className="text-sm text-gray-600">ZIP: 12347</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">25</span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: '#dc3545', color: 'white'}}>
                          💤 Cold
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Contractor dashboard showing AI Predictive Lead Scores for incoming leads.
                </p>
              </div>
              
              {/* Right: Benefits + CTA */}
              <div>
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Work Smarter, Not Harder</h4>
                      <p className="text-gray-700">Our AI instantly analyzes every incoming lead to predict its likelihood of becoming a paying job.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">See the Score, Make the Call</h4>
                      <p className="text-gray-700">Each lead is tagged as Hot, Warm, or Cold so you know exactly where to focus your time.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Maximize ROI</h4>
                      <p className="text-gray-700">Spend less time chasing low-quality jobs and more time closing the high-value work.</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg"
                  onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-xl font-bold transition-all duration-200 transform hover:scale-105"
                >
                  Get Leads Now
                </Button>
              </div>
            </div>
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

        <Card id="signup-form" className="max-w-2xl mx-auto border-2 shadow-lg">
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
      
      {/* Sticky Mobile CTA */}
      {!stickyCtaDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 text-lg"
              onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Contractor Sign Up"
            >
              Get Leads Now
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                localStorage.setItem('dismiss_sticky_signup', 'true')
                setStickyCtaDismissed(true)
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}

export default ContractorSignup
