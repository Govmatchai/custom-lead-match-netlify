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
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'stats' | 'contractors' | 'leads' | 'transactions' | 'pricing' | 'utilities' | 'sms-controls' | 'launch-queue'>('stats')
  const [emailVerificationStats, setEmailVerificationStats] = useState<any>(null)
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
  const [selectedContractors, setSelectedContractors] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [smsConfig, setSmsConfig] = useState<any>(null)
  const [smsAnalytics, setSmsAnalytics] = useState<any>(null)
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
        if (pricingData.category_pricing) {
          const prices: { [key: string]: string } = {}
          Object.entries(pricingData.category_pricing).forEach(([key, value]) => {
            prices[key] = String(value)
          })
          setCategoryPrices(prices)
        }
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

  const fetchSmsConfig = async () => {
    try {
      const response = await fetch('/.netlify/functions/sms-config')
      if (response.ok) {
        const data = await response.json()
        setSmsConfig(data)
      }
    } catch (error) {
      console.error('Error fetching SMS config:', error)
    }
  }

  const fetchSmsAnalytics = async () => {
    try {
      const response = await fetch('/.netlify/functions/sms-analytics')
      if (response.ok) {
        const data = await response.json()
        setSmsAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching SMS analytics:', error)
    }
  }

  const handleManualNotification = async () => {
    if (!manualNotification.lead_id || !manualNotification.contractor_ids?.length) {
      setErrorMessage('Please select a lead and at least one contractor')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    setLoading(true)
    try {
      console.log('Sending manual notification:', manualNotification)
      const response = await fetch('/.netlify/functions/send-manual-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualNotification)
      })
      
      const responseData = await response.json()
      console.log('Manual notification response:', responseData)
      
      if (response.ok) {
        setSuccessMessage('Notifications sent successfully!')
        setManualNotification({ lead_id: '', contractor_ids: [] })
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(`Failed to send notifications: ${responseData.detail || 'Unknown error'}`)
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      setErrorMessage('Error sending notifications')
      setTimeout(() => setErrorMessage(''), 5000)
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
        setSuccessMessage('Test lead created successfully!')
        setNewLead({ customer_name: '', phone: '', email: '', service_category: '', sub_service: '', zip_code: '', description: '' })
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to create test lead')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error creating test lead')
      setTimeout(() => setErrorMessage(''), 5000)
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
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedContractors.length} contractor(s)? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-bulk-delete-contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_ids: selectedContractors })
      })

      if (response.ok) {
        setSuccessMessage(`Successfully deleted ${selectedContractors.length} contractor(s)`)
        setSelectedContractors([])
        setSelectAll(false)
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to delete contractors')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error deleting contractors')
      setTimeout(() => setErrorMessage(''), 5000)
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
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to delete contractor')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error deleting contractor')
      setTimeout(() => setErrorMessage(''), 5000)
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
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to delete lead')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error deleting lead')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLastActivity(Date.now())
    try {
      await fetchAdminData()
      await fetchSmsConfig()
      await fetchSmsAnalytics()
      setSuccessMessage('Dashboard refreshed successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage('Failed to refresh dashboard')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setIsRefreshing(false)
    }
  }

  const resetSessionTimeout = () => {
    setLastActivity(Date.now())
    if (sessionTimeout) {
      clearTimeout(sessionTimeout)
    }
    const timeout = setTimeout(() => {
      setIsAuthenticated(false)
      setPassword('')
      alert('Session expired due to inactivity. Please log in again.')
    }, 10 * 60 * 1000)
    setSessionTimeout(timeout)
  }

  const handleUserActivity = () => {
    resetSessionTimeout()
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData()
      fetchSmsConfig()
      fetchSmsAnalytics()
      resetSessionTimeout()
      
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true)
      })
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true)
        })
        if (sessionTimeout) {
          clearTimeout(sessionTimeout)
        }
      }
    }
  }, [isAuthenticated, dateRange])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter the admin password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>
        
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          userType="admin"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last refreshed: {new Date(lastActivity).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button 
              onClick={() => {
                setIsAuthenticated(false)
                setPassword('')
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {successMessage && (
        <Alert className="mx-6 mt-4 border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert className="mx-6 mt-4 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <Logo className="max-w-xs" width={200} height={60} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage contractors and leads</p>
          </div>
        </div>

        <div className="mb-6">
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
                Statistics
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

            {waitlistAnalytics && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Pre-Launch Waitlist Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Waitlist"
                    value={waitlistAnalytics.totalWaitlist || 0}
                    icon={<Users className="h-4 w-4" />}
                    color="blue"
                  />
                  <MetricCard
                    title="Landing Page Views"
                    value={waitlistAnalytics.totalPageViews || 0}
                    icon={<Eye className="h-4 w-4" />}
                    color="green"
                  />
                  <MetricCard
                    title="Recent Signups (7d)"
                    value={waitlistAnalytics.recentSignups || 0}
                    icon={<Plus className="h-4 w-4" />}
                    color="blue"
                  />
                  <MetricCard
                    title="Launch Notified"
                    value={waitlistAnalytics.notifiedCount || 0}
                    icon={<CheckCircle className="h-4 w-4" />}
                    color="green"
                  />
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Platform KPIs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Contractors"
                  value={stats?.total_contractors || 0}
                  icon={<Users className="h-4 w-4" />}
                  color="blue"
                />
                <MetricCard
                  title="Total Leads"
                  value={stats?.total_leads || 0}
                  icon={<FileText className="h-4 w-4" />}
                  color="green"
                />
                <MetricCard
                  title="Claimed Leads"
                  value={stats?.claimed_leads || 0}
                  icon={<CheckCircle className="h-4 w-4" />}
                  color="green"
                />
                <MetricCard
                  title="Unclaimed Leads"
                  value={stats?.unclaimed_leads || 0}
                  icon={<Clock className="h-4 w-4" />}
                  color="yellow"
                />
              </div>
            </div>

            {emailVerificationStats && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-4 text-blue-900">Email Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Verified Emails"
                    value={emailVerificationStats.verified || 0}
                    icon={<CheckCircle className="h-4 w-4" />}
                    color="green"
                  />
                  <MetricCard
                    title="Unverified Emails"
                    value={emailVerificationStats.unverified || 0}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color="yellow"
                  />
                  <MetricCard
                    title="Invalid Emails"
                    value={emailVerificationStats.invalid || 0}
                    icon={<XCircle className="h-4 w-4" />}
                    color="red"
                  />
                </div>
              </div>
            )}
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
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Selected ({selectedContractors.length})</span>
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {contractors.length} total contractors
                  </div>
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
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ZIP Codes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wallet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
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
                            onChange={() => {
                              setSelectedContractors(prev => 
                                prev.includes(contractor.id)
                                  ? prev.filter(id => id !== contractor.id)
                                  : [...prev, contractor.id]
                              )
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {contractor.business_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.contact_name}</div>
                          <div className="text-sm text-gray-500">{contractor.email}</div>
                          <div className="text-sm text-gray-500">{contractor.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.industry || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contractor.sub_service || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Array.isArray(contractor.zip_codes) ? contractor.zip_codes.join(', ') : contractor.zip_codes}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${contractor.wallet_balance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(contractor.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => handleDeleteContractor(contractor.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
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
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                View and manage customer leads
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
                        Score
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.zip_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.claimed 
                              ? 'bg-green-100 text-green-800' 
                              : lead.is_archived 
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lead.claimed ? 'Claimed' : lead.is_archived ? 'Archived' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.lead_score ? `${lead.lead_score}/100` : 'Not scored'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => handleDeleteLead(lead.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
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
                  <p className="mt-1 text-sm text-gray-500">No leads have been submitted yet.</p>
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
                View revenue and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  Total Revenue: ${totalRevenue}
                </div>
                <div className="text-sm text-gray-600">
                  From {transactions.length} transactions
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.contractors?.business_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.contractors?.contact_name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction.leads?.customer_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.leads?.service_category || 'Unknown'} - {transaction.leads?.sub_service || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            ${transaction.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.purchased_at).toLocaleDateString()}
                          </div>
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
              <div className="space-y-6">
                {pricing?.categories?.map((category) => (
                  <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <p className="text-sm text-gray-500">Current price per lead</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        type="number"
                        value={categoryPrices[category] || ''}
                        onChange={(e) => setCategoryPrices(prev => ({
                          ...prev,
                          [category]: e.target.value
                        }))}
                        className="w-20"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        onClick={() => {
                        }}
                        size="sm"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!pricing?.categories || pricing.categories.length === 0) && (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pricing configured</h3>
                    <p className="mt-1 text-sm text-gray-500">Configure pricing for service categories.</p>
                  </div>
                )}
              </div>
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
