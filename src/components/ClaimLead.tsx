import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Lead {
  id: string
  customer_name: string
  service_category: string
  sub_service: string
  zip_code: string
  phone: string
  description: string
  created_at: string
}

interface ClaimResponse {
  success: boolean
  message: string
  lead?: Lead
}

const ClaimLead = () => {
  const { token } = useParams<{ token: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [contractorId, setContractorId] = useState('')

  useEffect(() => {
    if (token) {
      checkLeadAvailability()
    }
  }, [token])

  const checkLeadAvailability = async () => {
    try {
      const response = await fetch(`/.netlify/functions/leads-claim-get?token=${token}`)
      const data: ClaimResponse = await response.json()
      
      if (data.success && data.lead) {
        setLead(data.lead)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Error loading lead information')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!contractorId.trim()) {
      setMessage('Please enter your contractor ID')
      return
    }

    setClaiming(true)
    try {
      const response = await fetch('/.netlify/functions/leads-claim-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, contractor_id: contractorId })
      })

      const data: ClaimResponse = await response.json()
      setMessage(data.message)
      setSuccess(data.success)
      
      if (data.success) {
        setLead(data.lead || null)
      }
    } catch (error) {
      setMessage('Error claiming lead')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading lead information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Lead Claimed Successfully!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          {lead && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Customer:</span>
                    <span>{lead.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{lead.zip_code}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Service:</span>
                  <span className="ml-2">{lead.service_category} - {lead.sub_service}</span>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{lead.phone}</span>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-700">{lead.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Lead created: {new Date(lead.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-700">Lead Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => window.location.href = '/'}>
              Back to Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Claim This Lead</CardTitle>
          <CardDescription>
            Review the lead details below and enter your contractor ID to claim it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Lead Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Customer:</span>
                    <span>{lead.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{lead.zip_code}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Service:</span>
                  <span className="ml-2">{lead.service_category} - {lead.sub_service}</span>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{lead.phone}</span>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-700">{lead.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Lead created: {new Date(lead.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="contractorId" className="block text-sm font-medium text-gray-700 mb-2">
                Your Contractor ID *
              </label>
              <input
                type="text"
                id="contractorId"
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                placeholder="Enter your contractor ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                This was provided when you signed up. Check your email or SMS.
              </p>
            </div>

            <Button 
              onClick={handleClaim}
              disabled={claiming || !contractorId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {claiming ? 'Claiming Lead...' : 'Claim This Lead'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClaimLead
