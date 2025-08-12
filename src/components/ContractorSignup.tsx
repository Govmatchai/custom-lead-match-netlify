import { useState } from 'react'
import { CheckCircle, Star, DollarSign, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from './Footer'
import { Logo } from '@/components/ui/Logo'
import { AnimatedStats } from './AnimatedStats'
import { TestimonialsCarousel } from './TestimonialsCarousel'

const ContractorSignup = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [stickyCtaDismissed, setStickyCtaDismissed] = useState(localStorage.getItem('dismiss_sticky_signup') === 'true')





  const trustBadges = [
    { icon: CheckCircle, text: "TCPA Compliant" },
    { icon: Lock, text: "SSL Secured" },
    { icon: Star, text: "AI-Powered Matching" },
    { icon: Phone, text: "1 Contractor per Lead" },
    { icon: DollarSign, text: "Pay-as-you-go, no contracts" }
  ]



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
                onClick={() => window.location.href = '/contact'}
                className="hover:bg-gray-50 border-gray-300"
                aria-label="Contact Us"
              >
                Contact Us
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/contractor-login'}
                className="hover:bg-gray-50 border-gray-300"
                aria-label="Contractor Login"
              >
                Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/signup'}
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
                  onClick={() => window.location.href = '/contact'}
                  aria-label="Contact Us"
                >
                  Contact Us
                </Button>
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
                  onClick={() => window.location.href = '/signup'}
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
                onClick={() => window.location.href = '/signup'}
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
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-6">Trusted by thousands of contractors nationwide</p>
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-75">
              <div className="px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
                <span className="text-xs font-medium text-gray-600">BBB Accredited</span>
              </div>
              <div className="px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
                <span className="text-xs font-medium text-gray-600">Google Partner</span>
              </div>
              <div className="px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
                <span className="text-xs font-medium text-gray-600">Verified Leads</span>
              </div>
              <div className="px-3 py-1.5 bg-gray-100 rounded-md border border-gray-200">
                <span className="text-xs font-medium text-gray-600">SSL Secured</span>
              </div>
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
                  <span>🎛️</span>
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
                  <td className="p-4 font-semibold">Smart Matching</td>
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


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="signup-form">

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





      </div>
      
      {/* Sticky Mobile CTA */}
      {!stickyCtaDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 text-lg"
              onClick={() => window.location.href = '/signup'}
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
