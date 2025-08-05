import { useEffect } from 'react'
import { CheckCircle, ArrowLeft, Phone } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { useNavigate, useLocation } from 'react-router-dom'
import { Logo } from './ui/Logo'

const ThankYou = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const service = location.state?.service || 'service'

  useEffect(() => {
    document.title = 'Request Submitted - Custom Lead Match'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Your service request has been submitted successfully. Licensed professionals will contact you shortly.')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Request Submitted Successfully!
                </h1>
                <p className="text-lg text-gray-600">
                  Your {service} request has been sent to licensed professionals in your area.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">What Happens Next?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                    <p className="text-gray-700">Licensed professionals in your area are being notified right now</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                    <p className="text-gray-700">You'll receive calls or texts within the next few minutes</p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                    <p className="text-gray-700">Compare quotes and choose the best professional for your needs</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Phone className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-semibold text-yellow-800">Keep Your Phone Nearby</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  Professionals typically respond within 5-15 minutes. Make sure your phone is available to receive calls.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services/plumbing')}
                  className="w-full"
                >
                  Submit Another Request
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@customleadmatch.com" className="text-blue-600 hover:underline">
                    support@customleadmatch.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ThankYou
