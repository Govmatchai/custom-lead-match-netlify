import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CreditCard, MapPin, Phone, Calendar, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Lead {
  id: string
  customer_name: string
  service_category: string
  sub_service: string
  zip_code: string
  phone: string
  description: string
  claimed_at: string
}

interface Contractor {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  industry: string
  sub_service: string
  zip_codes: string[]
  lead_credits: number
}

interface DashboardData {
  contractor: Contractor
  claimed_leads: Lead[]
  total_claimed: number
}

const ContractorDashboard = () => {
  const { contractorId } = useParams<{ contractorId: string }>()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (contractorId) {
      fetchDashboardData()
    }
  }, [contractorId])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/.netlify/functions/contractors-dashboard?contractor_id=${contractorId}`)
      const data = await response.json()
      
      if (response.ok) {
        setDashboardData(data)
      } else {
        setErrorMessage(data.detail || 'Failed to load dashboard data')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseCredits = async () => {
    setPurchasing(true)
    try {
      const response = await fetch('/.netlify/functions/contractors-purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractor_id: contractorId, credits: 1 })
      })

      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.payment_url
      } else {
        setErrorMessage(data.detail || 'Failed to initiate payment')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  const { contractor, claimed_leads, total_claimed } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {contractor.contact_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractor.lead_credits}</div>
              <p className="text-xs text-muted-foreground">
                Available credits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Claimed</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_claimed}</div>
              <p className="text-xs text-muted-foreground">
                Leads claimed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Areas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contractor.zip_codes.length}</div>
              <p className="text-xs text-muted-foreground">
                ZIP codes covered
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Your registered business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Business:</span>
                <span>{contractor.business_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Contact:</span>
                <span>{contractor.contact_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span>{contractor.phone}</span>
              </div>
              <div>
                <span className="font-medium">Industry:</span>
                <span className="ml-2">{contractor.industry} - {contractor.sub_service}</span>
              </div>
              <div>
                <span className="font-medium">Service Areas:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {contractor.zip_codes.map((zip, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {zip}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase More Credits</CardTitle>
              <CardDescription>Buy additional lead credits to continue receiving leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Lead Credit Pricing</h4>
                  <p className="text-2xl font-bold text-blue-600">$10 <span className="text-sm font-normal text-gray-600">per lead</span></p>
                  <p className="text-sm text-gray-600 mt-1">Only pay when you claim a lead</p>
                </div>
                <Button 
                  onClick={handlePurchaseCredits}
                  disabled={purchasing}
                  className="w-full"
                >
                  {purchasing ? 'Processing...' : 'Purchase 1 Credit ($10)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Claimed Leads</CardTitle>
            <CardDescription>Your recently claimed leads and customer information</CardDescription>
          </CardHeader>
          <CardContent>
            {claimed_leads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No leads claimed yet. You'll see them here once you start claiming leads.</p>
            ) : (
              <div className="space-y-4">
                {claimed_leads.map((lead) => (
                  <div key={lead.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Customer:</span>
                        <span>{lead.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Location:</span>
                        <span>{lead.zip_code}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Claimed:</span>
                        <span>{new Date(lead.claimed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium">Service:</span>
                      <span className="ml-2">{lead.service_category} - {lead.sub_service}</span>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-gray-700">{lead.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContractorDashboard
