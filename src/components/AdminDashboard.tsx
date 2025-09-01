import React, { useState, useEffect } from 'react'
import { Users, DollarSign, Clock, Mail, Eye, TrendingUp, AlertTriangle, CheckCircle, XCircle, Download, Trash2, Send, RefreshCw } from 'lucide-react'
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
  service_categories: string[]
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
  email: string
  description: string
  urgency: string
  status: string
  claimed: boolean
  claimed_by?: string
  purchased_by?: string
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
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalRevenue, setTotalRevenue] = useState('0.00')
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({ category_pricing: {}, categories: [] })
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
  const [smsConfig, setSmsConfig] = useState<any>(null)
  const [smsAnalytics, setSmsAnalytics] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
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
        setPricingSettings(pricingData)
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

        {activeTab === 'utilities' && (
          <div className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Lead</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newLead.customer_name}
                  onChange={(e) => setNewLead({...newLead, customer_name: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <select
                  value={newLead.service_category}
                  onChange={(e) => setNewLead({...newLead, service_category: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Service Category</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
                <input
                  type="text"
                  placeholder="Sub Service"
                  value={newLead.sub_service}
                  onChange={(e) => setNewLead({...newLead, sub_service: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={newLead.zip_code}
                  onChange={(e) => setNewLead({...newLead, zip_code: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
                <textarea
                  placeholder="Description"
                  value={newLead.description}
                  onChange={(e) => setNewLead({...newLead, description: e.target.value})}
                  className="border border-gray-300 rounded-md px-3 py-2 md:col-span-2"
                  rows={3}
                />
              </div>
              <button
                onClick={handleCreateLead}
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Lead Notifications</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Lead</label>
                  <select
                    value={manualNotification.lead_id}
                    onChange={(e) => setManualNotification({...manualNotification, lead_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Choose a lead...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.customer_name} - {lead.service_category} - {lead.zip_code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Contractors</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
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

                <button
                  onClick={handleManualNotification}
                  disabled={!manualNotification.lead_id || manualNotification.contractor_ids.length === 0 || loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Notifications'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
