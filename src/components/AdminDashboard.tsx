import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Users, FileText, CheckCircle, Clock, Eye, EyeOff, DollarSign, Settings, Plus, Download, Mail, Trash2, MessageSquare, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Logo } from './ui/Logo'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { MetricCard } from './admin/MetricCard'
import { AlertsPanel } from './admin/AlertsPanel'
import { DateRangeFilter } from './admin/DateRangeFilter'

interface AdminStats {
  total_contractors: number
  total_leads: number
  claimed_leads: number
  unclaimed_leads: number
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
  wallet_balance: number
  created_at: string
}

interface Lead {
  id: string
  customer_name: string
  service_category: string
  sub_service: string
  zip_code: string
  phone: string
  email?: string
  description: string
  status: string
  validation_flags: any
  claimed: boolean
  claimed_by: string | null
  claimed_at?: string
  is_archived: boolean
  created_at: string
  lead_score?: number
  lead_score_updated_at?: string
}

interface Transaction {
  id: string
  contractor_id: string
  lead_id: string
  amount: number
  purchased_at: string
  contractors: {
    business_name: string
    contact_name: string
  }
  leads: {
    customer_name: string
    service_category: string
    sub_service: string
  }
}

interface PricingSettings {
  category_pricing: { [key: string]: number }
  categories: string[]
}

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'stats' | 'contractors' | 'leads' | 'transactions' | 'pricing' | 'utilities' | 'sms-controls' | 'launch-queue'>('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState<string>('0.00')
  const [pricing, setPricing] = useState<PricingSettings | null>(null)
  const [categoryPrices, setCategoryPrices] = useState<{ [key: string]: string }>({})
  const [walletAdjustment, setWalletAdjustment] = useState({ contractor_id: '', amount: '', notes: '' })
  const [manualNotification, setManualNotification] = useState<{ lead_id: string; contractor_ids: string[] }>({ lead_id: '', contractor_ids: [] })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [newLead, setNewLead] = useState({
    customer_name: '', phone: '', email: '', service_category: '', sub_service: '', zip_code: '', description: ''
  })
  const [dateRange, setDateRange] = useState('30')
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [notificationStats, setNotificationStats] = useState<any>(null)
  const [waitlistAnalytics, setWaitlistAnalytics] = useState<any>(null)
  const [emailVerificationStats, setEmailVerificationStats] = useState<any>(null)
  const [selectedContractors, setSelectedContractors] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [smsConfig, setSmsConfig] = useState<any>(null)
  const [smsAnalytics, setSmsAnalytics] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setLoading(true)

    try {
      const response = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchAdminData()
      } else {
        setAuthError('Invalid password')
      }
    } catch (error) {
      setAuthError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [statsResponse, contractorsResponse, leadsResponse, transactionsResponse, pricingResponse, dashboardResponse, notificationResponse, waitlistResponse, emailVerificationResponse] = await Promise.all([
        fetch('/.netlify/functions/admin-stats'),
        fetch('/.netlify/functions/admin-contractors'),
        fetch('/.netlify/functions/admin-leads'),
        fetch('/.netlify/functions/admin-transactions'),
        fetch('/.netlify/functions/admin-pricing'),
        fetch('/.netlify/functions/admin-dashboard-stats'),
        fetch('/.netlify/functions/admin-notification-stats'),
        fetch('/.netlify/functions/admin-waitlist-analytics'),
        fetch('/.netlify/functions/admin-email-verification')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (contractorsResponse.ok) {
        const contractorsData = await contractorsResponse.json()
        setContractors(contractorsData)
      }

      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json()
        setLeads(leadsData)
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
        setTotalRevenue(transactionsData.total_revenue || '0.00')
      }

      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json()
        setPricing(pricingData)
      }

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setDashboardStats(dashboardData)
      }

      if (notificationResponse.ok) {
        const notificationData = await notificationResponse.json()
        setNotificationStats(notificationData)
      }

      if (waitlistResponse.ok) {
        const waitlistData = await waitlistResponse.json()
        setWaitlistAnalytics(waitlistData)
      }

      if (emailVerificationResponse.ok) {
        const emailData = await emailVerificationResponse.json()
        setEmailVerificationStats(emailData)
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualNotification = async () => {
    setLoading(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const response = await fetch('/.netlify/functions/send-manual-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualNotification)
      })
      
      if (response.ok) {
        setSuccessMessage('Notifications sent successfully!')
        setManualNotification({ lead_id: '', contractor_ids: [] })
      } else {
        setErrorMessage('Failed to send notifications')
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      setErrorMessage('Error sending notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async () => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_lead', ...newLead })
      })
      if (response.ok) {
        setSuccessMessage('Lead created successfully!')
        setNewLead({ customer_name: '', phone: '', email: '', service_category: '', sub_service: '', zip_code: '', description: '' })
        fetchAdminData()
      } else {
        setErrorMessage('Failed to create lead')
      }
    } catch (error) {
      setErrorMessage('Error creating lead')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectContractor = (contractorId: string) => {
    setManualNotification(prev => ({
      ...prev,
      contractor_ids: prev.contractor_ids.includes(contractorId)
        ? prev.contractor_ids.filter(id => id !== contractorId)
        : [...prev.contractor_ids, contractorId]
    }))
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContractors([])
    } else {
      setSelectedContractors(contractors.map(c => c.id))
    }
    setSelectAll(!selectAll)
  }

  const handleBulkDeleteContractors = async () => {
    if (selectedContractors.length === 0) {
      setErrorMessage('No contractors selected for deletion')
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedContractors.length} contractor(s)? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/.netlify/functions/admin-bulk-delete-contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_ids: selectedContractors })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage(`Successfully deleted ${result.deleted_count} contractor(s)`)
        setSelectedContractors([])
        setSelectAll(false)
        await fetchAdminData()
      } else {
        setErrorMessage(result.detail || 'Failed to delete contractors')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      setErrorMessage('Failed to delete contractors')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContractor = async (contractorId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this contractor? This action cannot be undone.')
    if (!confirmDelete) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-delete-contractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId })
      })

      if (response.ok) {
        setSuccessMessage('Contractor deleted successfully')
        await fetchAdminData()
      } else {
        const error = await response.json()
        setErrorMessage(error.detail || 'Failed to delete contractor')
      }
    } catch (error) {
      console.error('Delete contractor error:', error)
      setErrorMessage('Failed to delete contractor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')
    if (!confirmDelete) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-delete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId })
      })

      if (response.ok) {
        setSuccessMessage('Lead deleted successfully')
        await fetchAdminData()
      } else {
        const error = await response.json()
        setErrorMessage(error.detail || 'Failed to delete lead')
      }
    } catch (error) {
      console.error('Delete lead error:', error)
      setErrorMessage('Failed to delete lead')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      await fetchAdminData()
      setSuccessMessage('Dashboard data refreshed successfully')
    } catch (error) {
      setErrorMessage('Failed to refresh dashboard data')
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the admin password to access the dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Admin password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="text-red-600 text-sm">{authError}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('contractors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contractors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contractors
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'leads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setActiveTab('utilities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'utilities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admin Utilities
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transaction Logs
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pricing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lead Pricing
              </button>
              <button
                onClick={() => setActiveTab('sms-controls')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sms-controls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                SMS & Notifications
              </button>
              <button
                onClick={() => setActiveTab('launch-queue')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'launch-queue'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Launch Invite Queue
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            <AlertsPanel 
              inactiveContractors={dashboardStats?.inactiveContractors || 0}
              unclaimedLeads={dashboardStats?.unclaimedLeads || 0}
              lowWalletBalances={dashboardStats?.lowWalletBalances || 0}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Contractors"
                value={dashboardStats?.activeContractors || 0}
                trend={dashboardStats?.contractorGrowth}
                icon={<Users className="h-4 w-4" />}
                color="green"
              />
              <MetricCard
                title="Total Revenue"
                value={`$${dashboardStats?.totalRevenue || '0.00'}`}
                trend={dashboardStats?.revenueGrowth}
                icon={<DollarSign className="h-4 w-4" />}
                color="green"
              />
              <MetricCard
                title="Avg Time to Claim"
                value={`${dashboardStats?.avgTimeToClaimHours || 0}h`}
                trend={dashboardStats?.claimTimeImprovement}
                icon={<Clock className="h-4 w-4" />}
                color="blue"
              />
              <MetricCard
                title="Email Delivery Rate"
                value={`${notificationStats?.overall_delivery_rate || dashboardStats?.emailDeliveryRate || 0}%`}
                trend={dashboardStats?.deliveryRateChange}
                icon={<Mail className="h-4 w-4" />}
                color="green"
              />
            </div>
          </div>
        )}

        {activeTab === 'contractors' && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Contractors</CardTitle>
              <CardDescription>
                Manage contractor accounts and view registration details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractors.length > 0 && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Select All</span>
                    </label>
                    {selectedContractors.length > 0 && (
                      <Button
                        onClick={handleBulkDeleteContractors}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedContractors.length})
                      </Button>
                    )}
                  </div>
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ZIP Codes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wallet Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contractors.map((contractor) => (
                      <tr key={contractor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedContractors.includes(contractor.id)}
                            onChange={() => handleSelectContractor(contractor.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contractor.business_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.contact_name}</div>
                          <div className="text-sm text-gray-500">{contractor.email}</div>
                          <div className="text-sm text-gray-500">{contractor.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.industry}</div>
                          <div className="text-sm text-gray-500">{contractor.sub_service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.zip_codes?.join(', ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">${contractor.wallet_balance?.toFixed(2) || '0.00'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(contractor.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => handleDeleteContractor(contractor.id)}
                            variant="destructive"
                            size="sm"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {contractors.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contractors</h3>
                  <p className="mt-1 text-sm text-gray-500">No contractors have registered yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'leads' && (
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                View and manage all customer leads in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lead.customer_name}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                          {lead.email && <div className="text-sm text-gray-500">{lead.email}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.service_category}</div>
                          <div className="text-sm text-gray-500">{lead.sub_service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.zip_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.claimed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lead.claimed ? 'Claimed' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => handleDeleteLead(lead.id)}
                            variant="destructive"
                            size="sm"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {leads.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No leads</h3>
                  <p className="mt-1 text-sm text-gray-500">No customer leads have been submitted yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>
                View all lead purchase transactions and revenue data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">${totalRevenue}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contractor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.contractors?.business_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.contractors?.contact_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction.leads?.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.leads?.service_category} - {transaction.leads?.sub_service}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.purchased_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                  <p className="mt-1 text-sm text-gray-500">No lead purchases have been made yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'pricing' && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Pricing Management</CardTitle>
              <CardDescription>
                Configure pricing for different service categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricing?.categories?.map((category) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <p className="text-sm text-gray-500">Current price: ${pricing.category_pricing[category] || '0.00'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={categoryPrices[category] || ''}
                        onChange={(e) => setCategoryPrices({
                          ...categoryPrices,
                          [category]: e.target.value
                        })}
                        placeholder="New price"
                        className="w-24"
                      />
                      <Button
                        onClick={() => {
                        }}
                        size="sm"
                        disabled={!categoryPrices[category]}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!pricing?.categories || pricing.categories.length === 0) && (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pricing configured</h3>
                  <p className="mt-1 text-sm text-gray-500">Service category pricing has not been set up yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'sms-controls' && (
          <Card>
            <CardHeader>
              <CardTitle>SMS & Notification Controls</CardTitle>
              <CardDescription>
                Manage SMS delivery settings and notification analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {smsAnalytics?.total_sent || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total SMS Sent</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {smsAnalytics?.delivered || 0}
                    </div>
                    <div className="text-sm text-gray-600">Delivered</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {smsAnalytics?.failed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
                
                {smsConfig && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">SMS Configuration</h4>
                    <div className="text-sm text-gray-600">
                      <p>Provider: {smsConfig.provider}</p>
                      <p>Status: {smsConfig.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'launch-queue' && (
          <Card>
            <CardHeader>
              <CardTitle>Launch Invite Queue</CardTitle>
              <CardDescription>
                Manage contractor waitlist and launch notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {waitlistAnalytics?.total_waitlist || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Waitlist</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {waitlistAnalytics?.converted || 0}
                    </div>
                    <div className="text-sm text-gray-600">Converted</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {waitlistAnalytics?.pending_notification || 0}
                    </div>
                    <div className="text-sm text-gray-600">Pending Notification</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {waitlistAnalytics?.notified || 0}
                    </div>
                    <div className="text-sm text-gray-600">Notified</div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                    }}
                    disabled={loading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Launch Notifications
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Waitlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Test Lead</CardTitle>
                <CardDescription>Generate test leads for development and testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name</Label>
                    <Input
                      id="customer_name"
                      type="text"
                      value={newLead.customer_name}
                      onChange={(e) => setNewLead({...newLead, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="text"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service_category">Service Category</Label>
                    <Select value={newLead.service_category} onValueChange={(value) => setNewLead({...newLead, service_category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Service Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sub_service">Sub Service</Label>
                    <Input
                      id="sub_service"
                      type="text"
                      value={newLead.sub_service}
                      onChange={(e) => setNewLead({...newLead, sub_service: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      type="text"
                      value={newLead.zip_code}
                      onChange={(e) => setNewLead({...newLead, zip_code: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={newLead.description}
                      onChange={(e) => setNewLead({...newLead, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateLead}
                  disabled={loading}
                  className="mt-4"
                >
                  {loading ? 'Creating...' : 'Create Lead'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Manual Notification</CardTitle>
                <CardDescription>Send lead notifications to specific contractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lead_select">Select Lead</Label>
                    <Select value={manualNotification.lead_id} onValueChange={(value) => setManualNotification({...manualNotification, lead_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lead..." />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.customer_name} - {lead.service_category} - {lead.zip_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Select Contractors</Label>
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 mt-2">
                      {contractors.map(contractor => (
                        <label key={contractor.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={manualNotification.contractor_ids.includes(contractor.id)}
                            onChange={() => handleSelectContractor(contractor.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">
                            {contractor.business_name} ({contractor.contact_name}) - {contractor.industry || 'No industry'} - {contractor.sub_service || 'No sub-service'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleManualNotification}
                    disabled={!manualNotification.lead_id || manualNotification.contractor_ids.length === 0 || loading}
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
