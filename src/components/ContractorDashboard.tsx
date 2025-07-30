import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  email?: string
  description: string
  claimed: boolean
  claimed_by?: string
  claimed_at?: string
  is_archived?: boolean
  created_at: string
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
  available_leads: Lead[]
  archived_leads: Lead[]
  total_claimed: number
  total_available: number
  total_archived: number
  wallet_balance: string
}

const ContractorDashboard = () => {
  const { contractorId } = useParams<{ contractorId: string }>()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [activeTab, setActiveTab] = useState('available')
  const [fundAmount, setFundAmount] = useState('')
  const [fundAmountError, setFundAmountError] = useState('')

  useEffect(() => {
    if (contractorId) {
      checkAuthAndFetchData()
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    
    if (paymentStatus === 'success') {
      setFundAmount('')
      setFundAmountError('')
      setTimeout(() => {
        fetchDashboardData()
      }, 2000)
    } else if (paymentStatus === 'cancelled') {
      setFundAmountError('Payment was cancelled')
    }
    
    if (paymentStatus) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [contractorId])

  const checkAuthAndFetchData = async () => {
    const sessionToken = localStorage.getItem('contractor_session_token')
    const storedContractorId = localStorage.getItem('contractor_id')
    
    if (!sessionToken || storedContractorId !== contractorId) {
      navigate('/contractor-login')
      return
    }

    try {
      const authResponse = await fetch('/.netlify/functions/contractor-auth-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: sessionToken })
      })

      if (!authResponse.ok) {
        localStorage.removeItem('contractor_session_token')
        localStorage.removeItem('contractor_id')
        navigate('/contractor-login')
        return
      }

      fetchDashboardData()
    } catch (error) {
      console.error('Auth check failed:', error)
      navigate('/contractor-login')
    }
  }

  const fetchDashboardData = async () => {
    const sessionToken = localStorage.getItem('contractor_session_token')
    
    try {
      const [dashboardResponse, availableResponse] = await Promise.all([
        fetch(`/.netlify/functions/contractors-dashboard?contractor_id=${contractorId}&session_token=${sessionToken}`),
        fetch(`/.netlify/functions/contractors-available-leads?contractor_id=${contractorId}&session_token=${sessionToken}`)
      ])
      
      const [dashboardData, availableData] = await Promise.all([
        dashboardResponse.json(),
        availableResponse.json()
      ])
      
      if (dashboardResponse.ok && availableResponse.ok) {
        const archivedLeads = dashboardData.claimed_leads.filter((lead: Lead) => lead.is_archived)
        const activeClaimedLeads = dashboardData.claimed_leads.filter((lead: Lead) => !lead.is_archived)
        
        setDashboardData({
          contractor: dashboardData.contractor,
          claimed_leads: activeClaimedLeads,
          available_leads: availableData.available_leads,
          archived_leads: archivedLeads,
          total_claimed: activeClaimedLeads.length,
          total_available: availableData.total_available,
          total_archived: archivedLeads.length,
          wallet_balance: dashboardData.wallet_balance
        })
      } else {
        setErrorMessage(dashboardData.detail || availableData.detail || 'Failed to load dashboard data')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('contractor_session_token')
    localStorage.removeItem('contractor_id')
    navigate('/contractor-login')
  }

  const handleFundWallet = async () => {
    setFundAmountError('')
    
    const amount = parseFloat(fundAmount)
    if (!fundAmount || isNaN(amount)) {
      setFundAmountError('Please enter a valid amount')
      return
    }
    
    if (amount < 10) {
      setFundAmountError('Minimum funding amount is $10')
      return
    }
    
    if (amount > 10000) {
      setFundAmountError('Maximum funding amount is $10,000')
      return
    }
    
    setPurchasing(true)
    try {
      const response = await fetch('/.netlify/functions/contractors-purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contractor_id: contractorId, 
          amount: amount 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.payment_url
      } else {
        setFundAmountError(data.detail || 'Failed to initiate payment')
      }
    } catch (error) {
      setFundAmountError('Network error. Please try again.')
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

  const { contractor, claimed_leads, available_leads, archived_leads, total_claimed, total_available, total_archived } = dashboardData

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
            <p className="text-gray-600">Welcome back, {contractor.contact_name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData.wallet_balance}</div>
              <p className="text-xs text-muted-foreground">
                Available balance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Leads</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_available}</div>
              <p className="text-xs text-muted-foreground">
                Ready to claim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed Leads</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_claimed}</div>
              <p className="text-xs text-muted-foreground">
                Active leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_archived}</div>
              <p className="text-xs text-muted-foreground">
                Completed leads
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
              <CardTitle>Fund Wallet</CardTitle>
              <CardDescription>Add funds to your wallet balance for purchasing leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Lead Pricing</h4>
                  <p className="text-sm text-gray-600">Lead prices vary based on industry and service type.</p>
                  <p className="text-sm text-gray-600 mt-1">Only pay when you claim a lead</p>
                </div>
                <div>
                  <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Add (minimum $10)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      id="fundAmount"
                      type="number"
                      min="10"
                      step="1"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                  {fundAmountError && (
                    <p className="text-red-600 text-sm mt-1">{fundAmountError}</p>
                  )}
                </div>
                <Button 
                  onClick={handleFundWallet}
                  disabled={purchasing || !fundAmount || parseFloat(fundAmount) < 10}
                  className="w-full"
                >
                  {purchasing ? 'Processing...' : `Add $${fundAmount || '0'} to Wallet`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex space-x-1 border-b">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Available Leads ({total_available})
              </button>
              <button
                onClick={() => setActiveTab('claimed')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'claimed'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Claimed Leads ({total_claimed})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'archived'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Archived Leads ({total_archived})
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'available' && (
              <div>
                {available_leads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No available leads matching your services and location.</p>
                ) : (
                  <div className="space-y-4">
                    {available_leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Service Type:</span>
                            <span>{lead.service_category} - {lead.sub_service}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">ZIP Code:</span>
                            <span>{lead.zip_code}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium">Project Summary:</span>
                          <p className="mt-1 text-gray-700">{lead.description.length > 150 ? lead.description.substring(0, 150) + '...' : lead.description}</p>
                        </div>
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            🔒 <strong>Contact details hidden until claimed.</strong> Customer name, phone, and email will be revealed after you claim this lead.
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Submitted: {new Date(lead.created_at).toLocaleDateString()}</span>
                          <span className="text-green-600 font-medium">Available to Claim</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'claimed' && (
              <div>
                {claimed_leads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No leads claimed yet. You'll see them here once you start claiming leads.</p>
                ) : (
                  <div className="space-y-4">
                    {claimed_leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4 bg-blue-50">
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
                            <span>{lead.claimed_at ? new Date(lead.claimed_at).toLocaleDateString() : 'N/A'}</span>
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
              </div>
            )}

            {activeTab === 'archived' && (
              <div>
                {archived_leads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No archived leads yet.</p>
                ) : (
                  <div className="space-y-4">
                    {archived_leads.map((lead) => (
                      <div key={lead.id} className="border rounded-lg p-4 bg-gray-50">
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
                            <span>{lead.claimed_at ? new Date(lead.claimed_at).toLocaleDateString() : 'N/A'}</span>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContractorDashboard
