import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Users, FileText, CheckCircle, Clock, Eye, EyeOff, DollarSign, Settings, Plus, Download, Mail, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Logo } from '@/components/ui/Logo'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { MetricCard } from './admin/MetricCard'
import { LeadsByServiceChart, WalletDistributionChart, RevenueChart, TopContractorsCard } from './admin/DashboardCharts'
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
  lead_score_band?: string
  lead_score_reason?: string
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
  const [activeTab, setActiveTab] = useState<'stats' | 'contractors' | 'leads' | 'lead-management' | 'scoring-config' | 'transactions' | 'pricing' | 'utilities' | 'sms-controls'>('stats')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState<string>('0.00')
  const [pricing, setPricing] = useState<PricingSettings | null>(null)
  const [categoryPrices, setCategoryPrices] = useState<{ [key: string]: string }>({})
  const [walletAdjustment, setWalletAdjustment] = useState({ contractor_id: '', amount: '', notes: '' })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [newLead, setNewLead] = useState({
    customer_name: '', phone: '', email: '', service_category: '', sub_service: '', zip_code: '', description: ''
  })
  const [dateRange, setDateRange] = useState('30')
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [notificationStats, setNotificationStats] = useState<any>(null)
  const [selectedContractors, setSelectedContractors] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [smsConfig, setSmsConfig] = useState<any>(null)
  const [smsAnalytics, setSmsAnalytics] = useState<any>(null)
  const [waitlistAnalytics, setWaitlistAnalytics] = useState<any>(null)
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
      const [statsResponse, contractorsResponse, leadsResponse, transactionsResponse, pricingResponse, dashboardResponse, notificationResponse, waitlistResponse] = await Promise.all([
        fetch('/.netlify/functions/admin-stats'),
        fetch('/.netlify/functions/admin-contractors'),
        fetch('/.netlify/functions/admin-leads'),
        fetch('/.netlify/functions/admin-transactions'),
        fetch('/.netlify/functions/admin-pricing'),
        fetch(`/.netlify/functions/admin-dashboard-stats?dateRange=${dateRange}`),
        fetch(`/.netlify/functions/admin-notification-stats?dateRange=${dateRange}`),
        fetch('/.netlify/functions/admin-waitlist-analytics')
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
        const initialPrices: { [key: string]: string } = {}
        Object.entries(pricingData.category_pricing).forEach(([category, price]) => {
          initialPrices[category] = (price as number).toString()
        })
        setCategoryPrices(initialPrices)
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
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategoryPricing = async (category: string) => {
    try {
      const price = parseFloat(categoryPrices[category])
      if (isNaN(price) || price < 0) {
        alert('Please enter a valid price')
        return
      }

      const response = await fetch('/.netlify/functions/admin-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, price })
      })
      
      if (response.ok) {
        fetchAdminData()
        alert(`${category} pricing updated successfully`)
      } else {
        alert('Failed to update pricing')
      }
    } catch (error) {
      console.error('Failed to update pricing:', error)
      alert('Failed to update pricing')
    }
  }

  const handleWaitlistNotification = async (notificationType: string) => {
    try {
      const response = await fetch('/.netlify/functions/admin-waitlist-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_notifications',
          notification_type: notificationType
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setSuccessMessage(`${result.message}. Sent: ${result.total_sent}, Errors: ${result.total_errors}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(result.message || 'Failed to send notifications')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error sending waitlist notifications:', error)
      setErrorMessage('Error sending notifications')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleTestEmail = async (type: string) => {
    try {
      const endpoint = type === 'launching_soon' ? 'email-launching-soon' : 'email-launch-day'
      
      const response = await fetch(`/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: 'freshsaltyair@gmail.com',
          first_name: 'Test User',
          company: 'Test Company',
          trade: 'Test Trade'
        })
      })
      
      if (response.ok) {
        setSuccessMessage(`Successfully sent test ${type === 'launching_soon' ? 'launching soon' : 'launch day'} email to freshsaltyair@gmail.com`)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const error = await response.json()
        setErrorMessage(`Error sending test email: ${error.error || 'Failed to send test email'}`)
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setErrorMessage('Error sending test email')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/.netlify/functions/admin-wallet-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletAdjustment)
      })
      if (response.ok) {
        setWalletAdjustment({ contractor_id: '', amount: '', notes: '' })
        fetchAdminData()
      }
    } catch (error) {
      console.error('Failed to adjust wallet:', error)
    }
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/.netlify/functions/admin-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_lead', ...newLead })
      })
      if (response.ok) {
        setNewLead({ customer_name: '', phone: '', email: '', service_category: '', sub_service: '', zip_code: '', description: '' })
        fetchAdminData()
      }
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  const handleSeedTestLeads = async () => {
    try {
      const response = await fetch('/.netlify/functions/admin-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_test_leads' })
      })
      if (response.ok) {
        fetchAdminData()
      }
    } catch (error) {
      console.error('Failed to seed test leads:', error)
    }
  }

  const handleSeedTestContractors = async () => {
    try {
      const response = await fetch('/.netlify/functions/admin-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_test_contractors' })
      })
      if (response.ok) {
        fetchAdminData()
      }
    } catch (error) {
      console.error('Failed to seed test contractors:', error)
    }
  }

  const handleExportCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportWaitlist = async () => {
    try {
      const response = await fetch('/.netlify/functions/admin-waitlist-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export_waitlist' })
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export waitlist:', error)
    }
  }


  const handleDeleteContractor = async (contractorId: string) => {
    try {
      const response = await fetch('/.netlify/functions/admin-delete-contractor', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractor_id: contractorId })
      })

      if (response.ok) {
        fetchAdminData()
      } else {
        console.error('Failed to delete contractor')
      }
    } catch (error) {
      console.error('Failed to delete contractor:', error)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch('/.netlify/functions/admin-delete-lead', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lead_id: leadId })
      })

      if (response.ok) {
        fetchAdminData()
      } else {
        console.error('Failed to delete lead')
      }
    } catch (error) {
      console.error('Failed to delete lead:', error)
    }
  }

  const handleSelectContractor = (contractorId: string) => {
    setSelectedContractors(prev => {
      if (prev.includes(contractorId)) {
        return prev.filter(id => id !== contractorId)
      } else {
        return [...prev, contractorId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContractors([])
    } else {
      setSelectedContractors(contractors.map(c => c.id))
    }
    setSelectAll(!selectAll)
  }

  const fetchSmsConfig = async () => {
    try {
      const response = await fetch('/.netlify/functions/sms-config')
      if (response.ok) {
        const data = await response.json()
        setSmsConfig(data.configs)
      }
    } catch (error) {
      console.error('Error fetching SMS config:', error)
    }
  }

  const updateSmsConfig = async (configKey: string, configValue: any) => {
    try {
      const response = await fetch('/.netlify/functions/sms-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_key: configKey, config_value: configValue })
      })
      if (response.ok) {
        await fetchSmsConfig()
        setSuccessMessage('SMS configuration updated successfully')
      }
    } catch (error) {
      console.error('Error updating SMS config:', error)
      setErrorMessage('Failed to update SMS configuration')
    }
  }

  const fetchSmsAnalytics = async () => {
    try {
      const response = await fetch('/.netlify/functions/sms-analytics?period=month')
      if (response.ok) {
        const data = await response.json()
        setSmsAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching SMS analytics:', error)
    }
  }

  const handleTestSms = async (phoneNumber: string) => {
    try {
      const response = await fetch('/.netlify/functions/test-sms-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          message: '🧪 Test SMS from Custom Lead Match admin panel'
        })
      })
      if (response.ok) {
        setSuccessMessage('Test SMS sent successfully')
        await fetchSmsAnalytics()
      } else {
        setErrorMessage('Failed to send test SMS')
      }
    } catch (error) {
      console.error('Error sending test SMS:', error)
      setErrorMessage('Failed to send test SMS')
    }
  }

  const handleExportSmsAnalytics = async () => {
    try {
      const response = await fetch('/.netlify/functions/sms-analytics?period=month&export=true')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sms-analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccessMessage('SMS analytics exported successfully')
      }
    } catch (error) {
      console.error('Error exporting SMS analytics:', error)
      setErrorMessage('Failed to export SMS analytics')
    }
  }

  const handleBulkDeleteContractors = async () => {
    if (selectedContractors.length === 0) {
      alert('Please select contractors to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedContractors.length} contractors? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/.netlify/functions/admin-bulk-delete-contractors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractor_ids: selectedContractors })
      })

      if (response.ok) {
        const result = await response.json()
        setContractors(contractors.filter(c => !selectedContractors.includes(c.id)))
        setSelectedContractors([])
        setSelectAll(false)
        alert(`Successfully deleted ${result.successful.length} contractors`)
      } else {
        alert('Failed to delete contractors')
      }
    } catch (error) {
      console.error('Error deleting contractors:', error)
      alert('Error deleting contractors')
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
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{errorMessage}</AlertDescription>
          </Alert>
        )}
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
                onClick={() => setActiveTab('lead-management')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lead-management'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lead Management
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
                onClick={() => setActiveTab('scoring-config')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scoring-config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scoring Config
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
                
                {waitlistAnalytics.tradeBreakdown && waitlistAnalytics.tradeBreakdown.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Waitlist by Trade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {waitlistAnalytics.tradeBreakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span className="capitalize">{item.trade}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadsByServiceChart data={dashboardStats?.leadsByService || []} />
              <WalletDistributionChart data={dashboardStats?.walletDistribution || []} />
              <RevenueChart data={dashboardStats?.revenueData || []} />
              <TopContractorsCard data={dashboardStats?.topContractors || []} />
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_contractors}</div>
                    <p className="text-xs text-muted-foreground">
                      Active businesses registered
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_leads}</div>
                    <p className="text-xs text-muted-foreground">
                      Customer inquiries received
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Claimed Leads</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.claimed_leads}</div>
                    <p className="text-xs text-muted-foreground">
                      Leads purchased by contractors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unclaimed Leads</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.unclaimed_leads}</div>
                    <p className="text-xs text-muted-foreground">
                      Available for contractors
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contractors' && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Contractors</CardTitle>
              <CardDescription>Manage contractor accounts and credits</CardDescription>
              {contractors.length > 0 && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                      Select All ({contractors.length})
                    </label>
                  </div>
                  {selectedContractors.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDeleteContractors}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected ({selectedContractors.length})
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {contractors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No contractors registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {contractors.map((contractor) => (
                    <div key={contractor.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedContractors.includes(contractor.id)}
                          onChange={() => handleSelectContractor(contractor.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="font-medium">Business:</span>
                              <p>{contractor.business_name}</p>
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span>
                              <p>{contractor.contact_name}</p>
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>
                              <p>{contractor.phone}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <span className="font-medium">Email:</span>
                              <p>{contractor.email}</p>
                            </div>
                            <div>
                              <span className="font-medium">Industry:</span>
                              <p>{contractor.industry} - {contractor.sub_service}</p>
                            </div>
                            <div>
                              <span className="font-medium">Wallet Balance:</span>
                              <p className="text-lg font-bold text-blue-600">${contractor.wallet_balance}</p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="font-medium">Service Areas:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {contractor.zip_codes.map((zip, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {zip}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Registered: {new Date(contractor.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Contractor</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete {contractor.business_name}? This will permanently delete the contractor account and all associated data including transactions, purchased leads, and wallet balance. This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleDeleteContractor(contractor.id)}
                                    >
                                      Delete Contractor
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'leads' && (
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>View and manage submitted leads</CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No leads submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Customer:</span>
                          <p>{lead.customer_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>
                          <p>{lead.phone}</p>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <p>{lead.zip_code}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Service:</span>
                          <p>{lead.service_category} - {lead.sub_service}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            lead.claimed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lead.claimed ? 'Claimed' : 'Available'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-gray-700">{lead.description}</p>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Submitted: {new Date(lead.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          {lead.claimed && lead.claimed_by && lead.claimed_at && (
                            <span>Claimed by: {lead.claimed_by} on {new Date(lead.claimed_at).toLocaleDateString()}</span>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Lead</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this lead from {lead.customer_name}? This will permanently delete the lead and all associated data including any purchases and sales records. This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteLead(lead.id)}
                                >
                                  Delete Lead
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'lead-management' && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Management & Scoring</CardTitle>
              <CardDescription>View leads with AI scores, validation status and manage quality</CardDescription>
              <div className="flex gap-4 mt-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="invalid">Invalid</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Home Services">Home Services</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleExportCSV(leads, `leads-with-scores-${new Date().toISOString().split('T')[0]}.csv`)} variant="outline">
                  Export CSV with Scores
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No leads found.</p>
              ) : (
                <div className="space-y-4">
                  {leads
                    .filter(lead => statusFilter === 'all' || lead.status === statusFilter)
                    .filter(lead => industryFilter === 'all' || lead.service_category === industryFilter)
                    .map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Customer:</span>
                          <p>{lead.customer_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Score:</span>
                          <p className={`font-bold ${
                            (lead.lead_score || 0) >= 80 ? 'text-green-600' :
                            (lead.lead_score || 0) >= 60 ? 'text-amber-600' : 'text-gray-600'
                          }`}>
                            {lead.lead_score || 'N/A'} ({lead.lead_score_band || 'N/A'})
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>
                          <p>{lead.phone}</p>
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{lead.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <p>{lead.zip_code}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Service:</span>
                          <p>{lead.service_category} - {lead.sub_service}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            lead.status === 'valid' ? 'bg-green-100 text-green-800' :
                            lead.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'duplicate' ? 'bg-orange-100 text-orange-800' :
                            lead.status === 'invalid' ? 'bg-red-100 text-red-800' :
                            lead.claimed ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status === 'valid' ? 'Valid' :
                             lead.status === 'pending_review' ? 'Pending Review' :
                             lead.status === 'duplicate' ? 'Duplicate' :
                             lead.status === 'invalid' ? 'Invalid' :
                             lead.claimed ? 'Claimed' : 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Archived:</span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            lead.is_archived ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {lead.is_archived ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      {lead.validation_flags && Object.keys(lead.validation_flags).length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium">Validation Flags:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(lead.validation_flags).map(([key, value]) => (
                              <span key={key} className={`inline-block text-xs px-2 py-1 rounded ${
                                value === true ? 'bg-green-100 text-green-800' :
                                value === false ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mb-3">
                        <span className="font-medium">Description:</span>
                        <p className="mt-1 text-gray-700">{lead.description}</p>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Submitted: {new Date(lead.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          {lead.claimed && lead.claimed_by && lead.claimed_at && (
                            <span>Claimed by: {lead.claimed_by} on {new Date(lead.claimed_at).toLocaleDateString()}</span>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Lead</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this lead from {lead.customer_name}? This will permanently delete the lead and all associated data including any purchases and sales records. This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteLead(lead.id)}
                                >
                                  Delete Lead
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>View all lead purchase transactions and revenue</CardDescription>
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Total Revenue: <span className="text-green-600">${totalRevenue}</span>
                </div>
                <Button onClick={() => handleExportCSV(transactions, 'transactions.csv')} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions found.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Contractor:</span>
                          <p>{transaction.contractors.business_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Lead:</span>
                          <p>{transaction.leads.customer_name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Service:</span>
                          <p>{transaction.leads.service_category} - {transaction.leads.sub_service}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p className="text-lg font-bold text-green-600">${transaction.amount}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Purchased: {new Date(transaction.purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'pricing' && pricing && (
          <Card>
            <CardHeader>
              <CardTitle>Category-Specific Lead Pricing</CardTitle>
              <CardDescription>Set different prices for each lead category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Category Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(pricing.category_pricing).map(([category, price]) => (
                      <div key={category} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm text-gray-700 capitalize">
                          {category.replace('_', ' ')}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Update Category Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pricing.categories.map((category) => (
                      <div key={category} className="border rounded-lg p-4">
                        <label className="block text-sm font-medium mb-2 capitalize">
                          {category.replace('_', ' ')} Lead Price
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={categoryPrices[category] || ''}
                            onChange={(e) => setCategoryPrices({
                              ...categoryPrices,
                              [category]: e.target.value
                            })}
                            placeholder="Enter price"
                          />
                          <Button 
                            onClick={() => handleUpdateCategoryPricing(category)}
                            size="sm"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'scoring-config' && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Distribution Configuration</CardTitle>
              <CardDescription>Adjust scoring thresholds and timing rules for internal lead distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="high-threshold">High Priority Threshold (≥)</Label>
                  <Input 
                    id="high-threshold"
                    type="number" 
                    defaultValue="85" 
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Instant/exclusive release to top contractors
                  </p>
                </div>
                <div>
                  <Label htmlFor="medium-threshold">Medium Priority Threshold (≥)</Label>
                  <Input 
                    id="medium-threshold"
                    type="number" 
                    defaultValue="70" 
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    2-4 hour delay before distribution
                  </p>
                </div>
                <div>
                  <Label htmlFor="low-delay">Low Priority Delay (hours)</Label>
                  <Input 
                    id="low-delay"
                    type="number" 
                    defaultValue="12" 
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    12-24 hour delay or bundled offers
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button className="mr-4">Save Configuration</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Distribution Rules</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• High-score leads (≥85%): Instant release to verified contractors with 1-2 hour exclusivity</li>
                  <li>• Medium-score leads (70-84%): Released after 2-4 hour delay to all matching contractors</li>
                  <li>• Low-score leads (&lt;70%): Released after 12-24 hours or included in bundled offers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Management</CardTitle>
                <CardDescription>Adjust contractor wallet balances</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWalletAdjustment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contractor</label>
                    <Select value={walletAdjustment.contractor_id} onValueChange={(value) => setWalletAdjustment({...walletAdjustment, contractor_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map((contractor) => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.business_name} - {contractor.contact_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (+ to add, - to subtract)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={walletAdjustment.amount}
                      onChange={(e) => setWalletAdjustment({...walletAdjustment, amount: e.target.value})}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <Input
                      value={walletAdjustment.notes}
                      onChange={(e) => setWalletAdjustment({...walletAdjustment, notes: e.target.value})}
                      placeholder="Reason for adjustment"
                    />
                  </div>
                  <Button type="submit">
                    <Settings className="w-4 h-4 mr-2" />
                    Adjust Balance
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Create leads manually and manage test data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Button onClick={handleSeedTestLeads} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Seed Test Leads
                    </Button>
                    <Button onClick={handleSeedTestContractors} variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
                      <Plus className="w-4 h-4 mr-2" />
                      Seed Test Contractors
                    </Button>
                  </div>
                  
                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <h4 className="font-semibold">Create New Lead</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={newLead.customer_name}
                        onChange={(e) => setNewLead({...newLead, customer_name: e.target.value})}
                        placeholder="Customer Name"
                        required
                      />
                      <Input
                        value={newLead.phone}
                        onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                        placeholder="Phone"
                        required
                      />
                      <Input
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                        placeholder="Email"
                        type="email"
                      />
                      <Input
                        value={newLead.zip_code}
                        onChange={(e) => setNewLead({...newLead, zip_code: e.target.value})}
                        placeholder="Zip Code"
                        required
                      />
                      <Input
                        value={newLead.service_category}
                        onChange={(e) => setNewLead({...newLead, service_category: e.target.value})}
                        placeholder="Service Category"
                        required
                      />
                      <Input
                        value={newLead.sub_service}
                        onChange={(e) => setNewLead({...newLead, sub_service: e.target.value})}
                        placeholder="Sub Service"
                        required
                      />
                    </div>
                    <Input
                      value={newLead.description}
                      onChange={(e) => setNewLead({...newLead, description: e.target.value})}
                      placeholder="Description"
                      required
                    />
                    <Button type="submit">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lead
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Export platform data as CSV files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-x-4">
                  <Button onClick={() => handleExportCSV(contractors, 'contractors.csv')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Contractors
                  </Button>
                  <Button onClick={() => handleExportCSV(leads, 'leads.csv')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Leads
                  </Button>
                  <Button onClick={() => handleExportWaitlist()} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Waitlist Management Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-Launch Waitlist Management</CardTitle>
                <CardDescription>Manage contractor waitlist and send launch notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => handleWaitlistNotification('launching_soon')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Send "Launching Soon" Emails
                    </Button>
                    <Button 
                      onClick={() => handleWaitlistNotification('launch_day')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Send "Launch Day" Emails
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Test Email Functions</h4>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleTestEmail('launching_soon')}
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        Send Test – Launching Soon
                      </Button>
                      <Button 
                        onClick={() => handleTestEmail('launch_day')}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Send Test – Launch Day
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Test emails sent to freshsaltyair@gmail.com (no database updates)
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>• "Launching Soon" emails can be sent multiple times</p>
                    <p>• "Launch Day" emails mark entries as notified and should only be sent once</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'sms-controls' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Notification Limits</CardTitle>
                <CardDescription>Set maximum number of contractors to notify per lead</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Maximum Contractors</label>
                    <Input 
                      type="number" 
                      placeholder="5" 
                      defaultValue={smsConfig?.notification_limits?.default_max_contractors || 5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category Overrides</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Home Services: 7" />
                      <Input placeholder="Legal: 3" />
                    </div>
                  </div>
                  <Button onClick={() => updateSmsConfig('notification_limits', {
                    default_max_contractors: 5,
                    category_overrides: { "Home Services": 7, "Legal": 3 }
                  })}>
                    Update Limits
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contractor Eligibility Controls</CardTitle>
                <CardDescription>Manage contractor activity and auto-disable settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="auto-disable" 
                      defaultChecked={smsConfig?.eligibility_rules?.auto_disable_inactive || true}
                    />
                    <label htmlFor="auto-disable" className="text-sm font-medium">Auto-disable inactive contractors</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Inactivity Threshold (days)</label>
                    <Input 
                      type="number" 
                      placeholder="14" 
                      defaultValue={smsConfig?.eligibility_rules?.inactivity_threshold_days || 14}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Wallet Balance</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="1.00" 
                      defaultValue={smsConfig?.eligibility_rules?.minimum_wallet_balance || 1.00}
                    />
                  </div>
                  <Button onClick={() => updateSmsConfig('eligibility_rules', {
                    auto_disable_inactive: true,
                    inactivity_threshold_days: 14,
                    minimum_wallet_balance: 1.00,
                    send_reactivation_email: true
                  })}>
                    Update Eligibility Rules
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Budget Cap</CardTitle>
                <CardDescription>Control monthly SMS spending and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly SMS Limit ($)</label>
                    <Input 
                      type="number" 
                      placeholder="500" 
                      defaultValue={smsConfig?.sms_budget?.monthly_limit_dollars || 500}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="auto-pause" 
                      defaultChecked={smsConfig?.sms_budget?.auto_pause_on_limit || true}
                    />
                    <label htmlFor="auto-pause" className="text-sm font-medium">Auto pause SMS when limit reached</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Alert Threshold (%)</label>
                    <Input 
                      type="number" 
                      placeholder="80" 
                      defaultValue={(smsConfig?.sms_budget?.admin_alert_threshold || 0.8) * 100}
                    />
                  </div>
                  <Button onClick={() => updateSmsConfig('sms_budget', {
                    monthly_limit_dollars: 500,
                    auto_pause_on_limit: true,
                    admin_alert_threshold: 0.8
                  })}>
                    Update Budget Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Delivery Rules</CardTitle>
                <CardDescription>Configure email-first delivery and timing settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="email-first" 
                      defaultChecked={smsConfig?.delivery_rules?.email_first_enabled || false}
                    />
                    <label htmlFor="email-first" className="text-sm font-medium">Send email first, then SMS after delay</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email to SMS Delay (minutes)</label>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      defaultValue={smsConfig?.delivery_rules?.email_to_sms_delay_minutes || 10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Retries</label>
                    <Input 
                      type="number" 
                      placeholder="3" 
                      defaultValue={smsConfig?.delivery_rules?.max_retries || 3}
                    />
                  </div>
                  <Button onClick={() => updateSmsConfig('delivery_rules', {
                    email_first_enabled: false,
                    email_to_sms_delay_minutes: 10,
                    max_retries: 3,
                    cost_per_message_cents: 79
                  })}>
                    Update Delivery Rules
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Usage Report</CardTitle>
                <CardDescription>View SMS analytics and export data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{smsAnalytics?.summary?.total_messages || 0}</div>
                      <div className="text-sm text-gray-600">SMS Sent This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${smsAnalytics?.summary?.total_cost_dollars?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-gray-600">Estimated Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-sm text-gray-600">Delivery Rate</div>
                    </div>
                  </div>
                  
                  {smsAnalytics?.breakdowns && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">By Category</h4>
                        <div className="space-y-1">
                          {smsAnalytics.breakdowns.by_category?.slice(0, 5).map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.category}</span>
                              <span>{item.count} messages (${item.cost_dollars?.toFixed(2)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">By Location</h4>
                        <div className="space-y-1">
                          {smsAnalytics.breakdowns.by_location?.slice(0, 5).map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.location}</span>
                              <span>{item.count} messages (${item.cost_dollars?.toFixed(2)})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportSmsAnalytics}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const phone = prompt('Enter phone number for test SMS (e.g., +1234567890):')
                      if (phone) handleTestSms(phone)
                    }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Test SMS Send
                    </Button>
                    <Button variant="outline" onClick={() => {
                      fetch('/.netlify/functions/contractor-eligibility', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'auto_disable_check' })
                      }).then(() => {
                        setSuccessMessage('Auto-disable check completed')
                        fetchAdminData()
                      })
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Run Auto-Disable Check
                    </Button>
                  </div>
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
