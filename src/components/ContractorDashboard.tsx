import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, Phone, Calendar, User, Building, Eye, ShoppingCart, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EditProfileModal } from './EditProfileModal'

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

interface PurchasedLead {
  id: string
  contractor_id: string
  lead_id: string
  price_paid: number
  zip_code: string
  purchased_at: string
  created_at: string
  status: string
  leads: {
    id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    service_category: string
    sub_service: string
    zip_code: string
    description: string
    created_at: string
    is_archived: boolean
  }
}

interface DashboardData {
  contractor: Contractor
  claimed_leads: Lead[]
  available_leads: Lead[]
  archived_leads: Lead[]
  purchased_leads: PurchasedLead[]
  archived_purchased_leads: PurchasedLead[]
  completed_leads: PurchasedLead[]
  total_claimed: number
  total_available: number
  total_archived: number
  total_purchased: number
  total_archived_purchased: number
  total_completed: number
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
  const [purchasingLead, setPurchasingLead] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedPurchasedLead, setSelectedPurchasedLead] = useState<PurchasedLead | null>(null)
  const [confirmPurchase, setConfirmPurchase] = useState<Lead | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [archivingLead, setArchivingLead] = useState<string | null>(null)
  const [completingLead, setCompletingLead] = useState<string | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

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
      const [dashboardResponse, availableResponse, purchasedResponse] = await Promise.all([
        fetch(`/.netlify/functions/contractors-dashboard?contractor_id=${contractorId}&session_token=${sessionToken}`),
        fetch(`/.netlify/functions/contractors-available-leads?contractor_id=${contractorId}&session_token=${sessionToken}`),
        fetch(`/.netlify/functions/get-purchased-leads?contractor_id=${contractorId}&session_token=${sessionToken}`)
      ])
      
      const [dashboardData, availableData, purchasedData] = await Promise.all([
        dashboardResponse.json(),
        availableResponse.json(),
        purchasedResponse.json()
      ])
      
      if (dashboardResponse.ok && availableResponse.ok && purchasedResponse.ok) {
        const archivedLeads = dashboardData.claimed_leads.filter((lead: Lead) => lead.is_archived)
        const activeClaimedLeads = dashboardData.claimed_leads.filter((lead: Lead) => !lead.is_archived)
        
        setDashboardData({
          contractor: dashboardData.contractor,
          claimed_leads: activeClaimedLeads,
          available_leads: availableData.available_leads,
          archived_leads: archivedLeads,
          purchased_leads: purchasedData.purchased_leads || [],
          archived_purchased_leads: purchasedData.archived_leads || [],
          completed_leads: purchasedData.completed_leads || [],
          total_claimed: activeClaimedLeads.length,
          total_available: availableData.total_available,
          total_archived: archivedLeads.length,
          total_purchased: purchasedData.purchased_leads?.length || 0,
          total_archived_purchased: purchasedData.archived_leads?.length || 0,
          total_completed: purchasedData.completed_leads?.length || 0,
          wallet_balance: dashboardData.wallet_balance
        })
      } else {
        setErrorMessage(dashboardData.detail || availableData.detail || purchasedData.message || 'Failed to load dashboard data')
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

  const handlePurchaseLead = async (lead: Lead) => {
    const sessionToken = localStorage.getItem('contractor_session_token')
    
    if (!sessionToken) {
      setErrorMessage('Session expired. Please log in again.')
      return
    }
    
    setPurchasingLead(lead.id)
    try {
      const response = await fetch('/.netlify/functions/purchase-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lead_id: lead.id, 
          contractor_id: contractorId,
          session_token: sessionToken
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Lead purchased! Check your dashboard for details.')
        setConfirmPurchase(null)
        await fetchDashboardData()
        setErrorMessage('')
        
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to purchase lead')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setPurchasingLead(null)
    }
  }

  const handleArchiveLead = async (leadId: string) => {
    const sessionToken = localStorage.getItem('contractor_session_token')
    
    if (!sessionToken) {
      setErrorMessage('Session expired. Please log in again.')
      return
    }
    
    setArchivingLead(leadId)
    try {
      const response = await fetch('/.netlify/functions/archive-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lead_id: leadId, 
          contractor_id: contractorId,
          session_token: sessionToken
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Lead archived successfully!')
        await fetchDashboardData()
        setErrorMessage('')
        
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to archive lead')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setArchivingLead(null)
    }
  }

  const handleCompleteLead = async (leadId: string) => {
    const sessionToken = localStorage.getItem('contractor_session_token')
    
    if (!sessionToken) {
      setErrorMessage('Session expired. Please log in again.')
      return
    }
    
    setCompletingLead(leadId)
    try {
      const response = await fetch('/.netlify/functions/complete-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          lead_id: leadId, 
          contractor_id: contractorId,
          session_token: sessionToken
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Lead marked as completed!')
        await fetchDashboardData()
        setErrorMessage('')
        
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to complete lead')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setCompletingLead(null)
    }
  }

  const handleProfileUpdateSuccess = () => {
    setSuccessMessage('Profile updated successfully!')
    fetchDashboardData()
    setTimeout(() => setSuccessMessage(''), 5000)
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

  const { contractor, claimed_leads, available_leads, archived_leads, purchased_leads, archived_purchased_leads, completed_leads, total_claimed, total_available, total_archived, total_purchased, total_archived_purchased, total_completed } = dashboardData

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your registered business details</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditProfileOpen(true)}
                className="flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
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
                onClick={() => setActiveTab('purchased')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'purchased'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Purchased Leads ({total_purchased})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed Leads ({total_completed})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'archived'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Archived Leads ({total_archived + total_archived_purchased})
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
                    {available_leads.map((lead) => {
                      const leadPrice = 10.00
                      const walletBalance = parseFloat(dashboardData?.wallet_balance || '0')
                      const canPurchase = walletBalance >= leadPrice
                      
                      return (
                        <div key={lead.id} className="border rounded-lg p-4 bg-green-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Customer:</span>
                              <span>New Lead</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">ZIP Code:</span>
                              <span>{lead.zip_code}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Service:</span>
                              <span>{lead.sub_service}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Cost:</span>
                              <span className="font-bold text-blue-600">💸 ${leadPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="font-medium">Project Summary:</span>
                            <p className="mt-1 text-gray-700">
                              {lead.description.length > 100 ? lead.description.substring(0, 100) + '...' : lead.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Submitted: {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Lead Details</DialogTitle>
                                    <DialogDescription>
                                      Complete information for this lead opportunity
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedLead && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="font-medium">Service:</span>
                                          <p>{selectedLead.service_category} - {selectedLead.sub_service}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Location:</span>
                                          <p>{selectedLead.zip_code}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Project Description:</span>
                                        <p className="mt-1 text-gray-700">{selectedLead.description}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="font-medium">Cost:</span>
                                          <p className="font-bold text-blue-600">${leadPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Submitted:</span>
                                          <p>{new Date(selectedLead.created_at).toLocaleString()}</p>
                                        </div>
                                      </div>
                                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                          🔒 <strong>Contact details will be revealed after purchase.</strong> Customer name, phone, and email will be available once you purchase this lead.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button
                                      onClick={() => selectedLead && setConfirmPurchase(selectedLead)}
                                      disabled={!canPurchase || purchasingLead === selectedLead?.id}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {purchasingLead === selectedLead?.id ? 'Purchasing...' : `Purchase Lead ($${leadPrice.toFixed(2)})`}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                onClick={() => setConfirmPurchase(lead)}
                                disabled={!canPurchase || purchasingLead === lead.id}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {purchasingLead === lead.id ? (
                                  'Purchasing...'
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4 mr-1" />
                                    Purchase Lead
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          {!canPurchase && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-700">
                                Insufficient wallet balance. Add funds to purchase this lead.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
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

            {activeTab === 'purchased' && (
              <div>
                {purchased_leads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No purchased leads yet. Purchase leads from the Available Leads tab to see them here.</p>
                ) : (
                  <div className="space-y-4">
                    {purchased_leads.map((purchasedLead) => (
                      <div key={purchasedLead.id} className="border rounded-lg p-4 bg-purple-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Customer:</span>
                            <span>{purchasedLead.leads.customer_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Service:</span>
                            <span>{purchasedLead.leads.service_category} - {purchasedLead.leads.sub_service}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">ZIP Code:</span>
                            <span>{purchasedLead.leads.zip_code}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Purchase Date:</span>
                            <span>{new Date(purchasedLead.purchased_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Price Paid:</span>
                          <span className="font-bold text-green-600">${purchasedLead.price_paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Lead submitted: {new Date(purchasedLead.leads.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedPurchasedLead(purchasedLead)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Purchased Lead Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for this purchased lead
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedPurchasedLead && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Customer Name:</span>
                                        <p>{selectedPurchasedLead.leads.customer_name}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Customer Phone:</span>
                                        <p>{selectedPurchasedLead.leads.customer_phone}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Customer Email:</span>
                                        <p>{selectedPurchasedLead.leads.customer_email}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Location:</span>
                                        <p>{selectedPurchasedLead.leads.zip_code}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Service:</span>
                                        <p>{selectedPurchasedLead.leads.service_category} - {selectedPurchasedLead.leads.sub_service}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Price Paid:</span>
                                        <p className="font-bold text-green-600">${selectedPurchasedLead.price_paid.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Project Description:</span>
                                      <p className="mt-1 text-gray-700">{selectedPurchasedLead.leads.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Lead Submitted:</span>
                                        <p>{new Date(selectedPurchasedLead.leads.created_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Purchased:</span>
                                        <p>{new Date(selectedPurchasedLead.purchased_at).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => handleCompleteLead(purchasedLead.lead_id)}
                              disabled={completingLead === purchasedLead.lead_id}
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-800"
                            >
                              {completingLead === purchasedLead.lead_id ? 'Completing...' : 'Mark as Completed'}
                            </Button>
                            <Button
                              onClick={() => handleArchiveLead(purchasedLead.lead_id)}
                              disabled={archivingLead === purchasedLead.lead_id}
                              size="sm"
                              variant="outline"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {archivingLead === purchasedLead.lead_id ? 'Archiving...' : 'Archive'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div>
                {completed_leads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No completed leads yet. Mark purchased leads as completed to see them here.</p>
                ) : (
                  <div className="space-y-4">
                    {completed_leads.map((purchasedLead) => (
                      <div key={purchasedLead.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Customer:</span>
                            <span>{purchasedLead.leads.customer_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Service:</span>
                            <span>{purchasedLead.leads.service_category} - {purchasedLead.leads.sub_service}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">ZIP Code:</span>
                            <span>{purchasedLead.leads.zip_code}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Purchase Date:</span>
                            <span>{new Date(purchasedLead.purchased_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Price Paid:</span>
                          <span className="font-bold text-green-600">${purchasedLead.price_paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Lead submitted: {new Date(purchasedLead.leads.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedPurchasedLead(purchasedLead)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Completed Lead Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for this completed lead
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedPurchasedLead && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Customer Name:</span>
                                        <p>{selectedPurchasedLead.leads.customer_name}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Customer Phone:</span>
                                        <p>{selectedPurchasedLead.leads.customer_phone}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Customer Email:</span>
                                        <p>{selectedPurchasedLead.leads.customer_email}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Location:</span>
                                        <p>{selectedPurchasedLead.leads.zip_code}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Service:</span>
                                        <p>{selectedPurchasedLead.leads.service_category} - {selectedPurchasedLead.leads.sub_service}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Price Paid:</span>
                                        <p className="font-bold text-green-600">${selectedPurchasedLead.price_paid.toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Project Description:</span>
                                      <p className="mt-1 text-gray-700">{selectedPurchasedLead.leads.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Lead Submitted:</span>
                                        <p>{new Date(selectedPurchasedLead.leads.created_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Purchased:</span>
                                        <p>{new Date(selectedPurchasedLead.purchased_at).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'archived' && (
              <div>
                {(archived_leads.length === 0 && archived_purchased_leads.length === 0) ? (
                  <p className="text-gray-500 text-center py-8">No leads found in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {archived_leads.map((lead) => (
                      <div key={`claimed-${lead.id}`} className="border rounded-lg p-4 bg-gray-50">
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
                        <div className="mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Claimed Lead</span>
                        </div>
                      </div>
                    ))}
                    {archived_purchased_leads.map((purchasedLead) => (
                      <div key={`purchased-${purchasedLead.id}`} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Customer:</span>
                            <span>{purchasedLead.leads.customer_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span>{purchasedLead.leads.customer_phone}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Location:</span>
                            <span>{purchasedLead.leads.zip_code}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Purchased:</span>
                            <span>{new Date(purchasedLead.purchased_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Service:</span>
                            <span>{purchasedLead.leads.service_category} - {purchasedLead.leads.sub_service}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Price Paid:</span>
                            <span className="font-bold text-green-600">${purchasedLead.price_paid.toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="mt-1 text-gray-700">{purchasedLead.leads.description}</p>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Purchased Lead</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Confirmation Modal */}
        {confirmPurchase && (
          <Dialog open={!!confirmPurchase} onOpenChange={() => setConfirmPurchase(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
                <DialogDescription>
                  Are you sure you want to purchase this lead for $10.00?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <span className="font-medium">Service:</span>
                  <p>{confirmPurchase.service_category} - {confirmPurchase.sub_service}</p>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <p>{confirmPurchase.zip_code}</p>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-700">{confirmPurchase.description}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmPurchase(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePurchaseLead(confirmPurchase)}
                  disabled={purchasingLead === confirmPurchase.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {purchasingLead === confirmPurchase.id ? 'Purchasing...' : 'Confirm Purchase'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          contractor={contractor}
          onSuccess={handleProfileUpdateSuccess}
        />
      </div>
    </div>
  )
}

export default ContractorDashboard
