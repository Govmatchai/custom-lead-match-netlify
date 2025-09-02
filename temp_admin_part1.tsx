import React, { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Users, FileText, CheckCircle, Clock, Eye, EyeOff, DollarSign, Settings, Plus, Download, Mail, Trash2, MessageSquare, AlertTriangle } from 'lucide-react'
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
        fetch(`/.netlify/functions/admin-dashboard-stats?dateRange=${dateRange}`),
        fetch(`/.netlify/functions/admin-notification-stats?dateRange=${dateRange}`),
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

      if (emailVerificationResponse.ok) {
        const emailVerificationData = await emailVerificationResponse.json()
        setEmailVerificationStats(emailVerificationData)
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

  const handleDeleteWaitlistEntry = async (entryId: string) => {
    try {
      const response = await fetch('/.netlify/functions/admin-delete-waitlist-entry', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry_id: entryId })
      })

      if (response.ok) {
        setSuccessMessage('Waitlist entry deleted successfully')
        fetchAdminData()
      } else {
        setErrorMessage('Failed to delete waitlist entry')
      }
    } catch (error) {
      setErrorMessage('Error deleting waitlist entry')
    }
  }

  const handleSelectContractor = (contractorId: string) => {
    setManualNotification(prev => {
      const currentIds = prev.contractor_ids || []
      if (currentIds.includes(contractorId)) {
        return {
          ...prev,
          contractor_ids: currentIds.filter(id => id !== contractorId)
        }
      } else {
        return {
          ...prev,
          contractor_ids: [...currentIds, contractorId]
        }
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
