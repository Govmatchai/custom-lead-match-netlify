import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { CheckCircle, ArrowRight, Smartphone, Shield } from 'lucide-react'
import { Logo } from './ui/Logo'

interface Contractor {
  id: string
  business_name: string
  contact_name: string
  industry: string
  sub_service: string
  lead_credits: number
}

export default function WelcomePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)
  const contractorId = searchParams.get('contractor_id')

  useEffect(() => {
    if (!contractorId) {
      navigate('/')
      return
    }

    fetchContractorData()
  }, [contractorId])

  const fetchContractorData = async () => {
    try {
      const sessionToken = localStorage.getItem('contractor_session_token')
      
      if (!sessionToken) {
        console.error('No session token found')
        navigate('/')
        return
      }
      
      const response = await fetch(`/.netlify/functions/contractors-dashboard?contractor_id=${contractorId}&session_token=${sessionToken}`)
      const data = await response.json()
      
      if (response.ok) {
        setContractor(data.contractor)
      } else {
        console.error('Failed to fetch contractor data:', data.detail)
        navigate('/')
      }
    } catch (error) {
      console.error('Error fetching contractor data:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    if (contractorId) {
      localStorage.setItem('contractor_id', contractorId)
    }
    navigate(`/contractor/${contractorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Account not found. Please try signing up again.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="max-w-sm" width={300} height={90} />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to our platform!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Thanks for signing up — you're now part of our exclusive contractor network.
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-lg max-w-2xl mx-auto">
            <div className="text-green-700 space-y-2">
              <div>🎁 Your first 3 leads are completely FREE — no strings attached.</div>
              <div>📬 You'll receive a text message when a new lead is available that matches your industry and area.</div>
              <div>📭 If you don't see leads in your dashboard yet, hang tight — our system is working to find you the right match.</div>
              <div>🚀 Be ready! Leads go quickly and are only sent to a limited number of contractors.</div>
            </div>
          </div>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">SMS Alerts Are Active</h4>
                    <p className="text-gray-600">
                      You'll receive instant SMS notifications when new {contractor.sub_service} leads come in for your service areas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">First-Come, First-Serve</h4>
                    <p className="text-gray-600">
                      When you get an alert, click the link quickly - leads are exclusive and only one contractor can claim each lead.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Get Full Contact Details</h4>
                    <p className="text-gray-600">
                      Once you claim a lead, you'll get the customer's full contact information and project details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Assurance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Lead Quality Guarantee</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Contact information verified for validity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Email addresses validated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Duplicate detection (30-day window)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Content filtered for spam and junk</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">IP rate limiting prevents abuse</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Exclusive leads - sold only once</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Button 
              onClick={handleGoToDashboard}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Go to My Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              You can access your dashboard anytime to view available leads and manage your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
