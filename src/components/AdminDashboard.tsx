import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Trash2, Download, RefreshCw, Mail, AlertTriangle, Users, DollarSign, FileText, TrendingUp } from 'lucide-react'

interface Lead {
  id: string
  customer_name: string
  phone: string
  email: string
  service_category: string
  sub_service?: string
  zip_code: string
  description: string
  urgency?: string
  status: string
  created_at: string
  contractor_leads?: Array<{
    id: string
    contractor_id: string
    status: string
    purchased_at?: string
    contractors: {
      business_name: string
      contact_name: string
    }
  }>
}

interface Contractor {
  id: string
  business_name: string
  contact_name: string
  email: string
  phone: string
  industry: string
  zip_codes: string[]
  wallet_balance: number
  created_at: string
  total_leads_purchased?: number
  total_spend?: number
  sms_opt_in?: boolean
}

interface Transaction {
  id: string
  type: string
  contractor_id: string
  amount: number
  description: string
  date: string
  contractors: {
    business_name: string
    contact_name: string
  }
}

interface AdminStats {
  totalLeads: number
  totalContractors: number
  totalRevenue: number
  activeContractors: number
}

const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  const [leads, setLeads] = useState<Lead[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalLeads: 0,
    totalContractors: 0,
    totalRevenue: 0,
    activeContractors: 0
  })
  
  const [newLead, setNewLead] = useState({
    customer_name: '',
    phone: '',
    email: '',
    service_category: '',
    sub_service: '',
    zip_code: '',
    description: ''
  })
  
  const [walletAdjustment, setWalletAdjustment] = useState({
    contractor_id: '',
    amount: '',
    notes: ''
  })
  
  const [leadSearch, setLeadSearch] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [contractorSearch, setContractorSearch] = useState('')
  
  const [selectedContractors, setSelectedContractors] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const handleLogin = async () => {
    if (password === 'admin123') {
      setIsLoggedIn(true)
      fetchAdminData()
    } else {
      setErrorMessage('Invalid password')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [
        contractorsResponse,
        leadsResponse,
        transactionsResponse
      ] = await Promise.all([
        fetch('/.netlify/functions/admin-contractors'),
        fetch('/.netlify/functions/admin-leads'),
        fetch('/.netlify/functions/admin-transactions')
      ])

      let contractorsData = []
      let leadsData = []
      let transactionsData = { transactions: [], total_revenue: 0 }

      if (contractorsResponse.ok) {
        contractorsData = await contractorsResponse.json()
        setContractors(contractorsData)
      }

      if (leadsResponse.ok) {
        leadsData = await leadsResponse.json()
        setLeads(leadsData)
      }

      if (transactionsResponse.ok) {
        transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }

      const totalLeads = leadsData.length || 0
      const totalContractors = contractorsData.length || 0
      const totalRevenue = parseFloat(transactionsData.total_revenue || '0')
      const activeContractors = contractorsData.filter(c => c.wallet_balance > 0).length || 0

      setAdminStats({
        totalLeads,
        totalContractors,
        totalRevenue,
        activeContractors
      })

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setErrorMessage('Failed to fetch admin data')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAdminData()
  }

  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      setErrorMessage('No data to export')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    
    setSuccessMessage(`${filename} exported successfully!`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleWalletAdjustment = async () => {
    if (!walletAdjustment.contractor_id || !walletAdjustment.amount) {
      setErrorMessage('Contractor ID and amount are required')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-wallet-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletAdjustment)
      })

      if (response.ok) {
        setSuccessMessage('Wallet balance adjusted successfully!')
        setWalletAdjustment({ contractor_id: '', amount: '', notes: '' })
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to adjust wallet balance')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error adjusting wallet balance')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContractor = async (contractorId: string) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-delete-contractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId })
      })

      if (response.ok) {
        setSuccessMessage('Contractor deleted successfully!')
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

  const handleBulkDeleteContractors = async () => {
    if (selectedContractors.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedContractors.length} contractors?`)) return

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-bulk-delete-contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_ids: selectedContractors })
      })

      if (response.ok) {
        setSuccessMessage(`${selectedContractors.length} contractors deleted successfully!`)
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

  const handleSelectContractor = (contractorId: string) => {
    setSelectedContractors(prev => 
      prev.includes(contractorId) 
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContractors([])
    } else {
      setSelectedContractors(filteredContractors.map(c => c.id))
    }
    setSelectAll(!selectAll)
  }

  const handleCreateLead = async () => {
    if (!newLead.customer_name || !newLead.phone || !newLead.service_category || !newLead.zip_code) {
      setErrorMessage('Please fill in all required fields')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/admin-utilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_lead', ...newLead })
      })

      if (response.ok) {
        setSuccessMessage('Test lead created successfully!')
        setNewLead({
          customer_name: '',
          phone: '',
          email: '',
          service_category: '',
          sub_service: '',
          zip_code: '',
          description: ''
        })
        fetchAdminData()
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage('Failed to create lead')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      setErrorMessage('Error creating lead')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !leadSearch || 
      lead.customer_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.service_category.toLowerCase().includes(leadSearch.toLowerCase()) ||
      lead.zip_code.includes(leadSearch)
    
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredContractors = contractors.filter(contractor => {
    return !contractorSearch || 
      contractor.business_name.toLowerCase().includes(contractorSearch.toLowerCase()) ||
      contractor.contact_name.toLowerCase().includes(contractorSearch.toLowerCase()) ||
      contractor.email.toLowerCase().includes(contractorSearch.toLowerCase())
  })

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(fetchAdminData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter the admin password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Admin password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CLM</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage contractors and leads</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <Button onClick={() => setIsLoggedIn(false)} variant="outline" size="sm">
                Logout
              </Button>
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
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{adminStats.totalLeads}</div>
                      <div className="text-sm text-gray-500">Total Leads</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{adminStats.totalContractors}</div>
                      <div className="text-sm text-gray-500">Total Contractors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">${adminStats.totalRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-2xl font-bold text-gray-900">{adminStats.activeContractors}</div>
                      <div className="text-sm text-gray-500">Active Contractors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'contractors' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Management</CardTitle>
                <CardDescription>
                  View and manage all contractors with wallet balances and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Search contractors..."
                      value={contractorSearch}
                      onChange={(e) => setContractorSearch(e.target.value)}
                      className="w-64"
                    />
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
                  <Button
                    onClick={() => handleExportCSV(filteredContractors, `contractors-${new Date().toISOString().split('T')[0]}.csv`)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Industry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leads Purchased
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContractors.map((contractor) => (
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
                            <div className="text-sm text-gray-500">{contractor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contractor.contact_name}</div>
                            <div className="text-sm text-gray-500">{contractor.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contractor.industry}</div>
                            <div className="text-sm text-gray-500">{contractor.zip_codes?.join(', ')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${contractor.wallet_balance?.toFixed(2) || '0.00'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{contractor.total_leads_purchased || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${contractor.total_spend?.toFixed(2) || '0.00'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adjust Contractor Wallet Balance</CardTitle>
                <CardDescription>
                  Add or deduct funds from a contractor's wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contractor_select">Select Contractor</Label>
                    <Select value={walletAdjustment.contractor_id} onValueChange={(value) => setWalletAdjustment({...walletAdjustment, contractor_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose contractor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map(contractor => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.business_name} - ${contractor.wallet_balance?.toFixed(2) || '0.00'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="adjustment_amount">Amount ($)</Label>
                    <Input
                      id="adjustment_amount"
                      type="number"
                      step="0.01"
                      value={walletAdjustment.amount}
                      onChange={(e) => setWalletAdjustment({...walletAdjustment, amount: e.target.value})}
                      placeholder="Enter amount (+ or -)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adjustment_notes">Notes</Label>
                    <Input
                      id="adjustment_notes"
                      type="text"
                      value={walletAdjustment.notes}
                      onChange={(e) => setWalletAdjustment({...walletAdjustment, notes: e.target.value})}
                      placeholder="Reason for adjustment"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleWalletAdjustment}
                  disabled={!walletAdjustment.contractor_id || !walletAdjustment.amount || loading}
                  className="mt-4"
                >
                  {loading ? 'Adjusting...' : 'Adjust Wallet Balance'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'leads' && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                View and manage customer leads with contractor assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search leads..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-64"
                  />
                  <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="purchased">Purchased</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleExportCSV(filteredLeads, `leads-${new Date().toISOString().split('T')[0]}.csv`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>

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
                        Assigned Contractors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lead.customer_name}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
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
                            lead.status === 'available' ? 'bg-green-100 text-green-800' :
                            lead.status === 'purchased' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.contractor_leads?.map(cl => (
                              <div key={cl.id} className="mb-1">
                                <span className="font-medium">{cl.contractors.business_name}</span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                  cl.status === 'purchased' ? 'bg-blue-100 text-blue-800' :
                                  cl.status === 'available' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {cl.status}
                                </span>
                              </div>
                            )) || 'No assignments'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div className="mb-4 flex items-center justify-between">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    Total Revenue: ${adminStats.totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    From {transactions.length} transactions
                  </div>
                </div>
                <Button
                  onClick={() => handleExportCSV(transactions, `transactions-${new Date().toISOString().split('T')[0]}.csv`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contractor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.length > 0 ? transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.contractors?.business_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.contractors?.contact_name || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'wallet_funding' ? 'bg-green-100 text-green-800' :
                            transaction.type === 'lead_purchase' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.type === 'wallet_funding' ? 'Wallet Funding' : 'Lead Purchase'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <DollarSign className="h-12 w-12 text-gray-300 mb-2" />
                            <div>No transactions</div>
                            <div className="text-sm">No lead purchases have been made yet.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
