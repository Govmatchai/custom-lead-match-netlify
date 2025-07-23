import React, { useState } from 'react'
import { Users, FileText, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  lead_credits: number
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
  is_archived: boolean
  created_at: string
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
  const [activeTab, setActiveTab] = useState<'stats' | 'contractors' | 'leads' | 'lead-management'>('stats')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')

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
      const [statsResponse, contractorsResponse, leadsResponse] = await Promise.all([
        fetch('/.netlify/functions/admin-stats'),
        fetch('/.netlify/functions/admin-contractors'),
        fetch('/.netlify/functions/admin-leads')
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
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetCredits = async (contractorId: string) => {
    try {
      const response = await fetch('/.netlify/functions/admin-reset-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractor_id: contractorId, credits: 3 })
      })

      if (response.ok) {
        fetchAdminData()
      }
    } catch (error) {
      console.error('Failed to reset credits:', error)
    }
  }

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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage contractors and leads</p>
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
            </nav>
          </div>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_contractors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_leads}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Claimed Leads</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.claimed_leads}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unclaimed Leads</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unclaimed_leads}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contractors' && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Contractors</CardTitle>
              <CardDescription>Manage contractor accounts and credits</CardDescription>
            </CardHeader>
            <CardContent>
              {contractors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No contractors registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {contractors.map((contractor) => (
                    <div key={contractor.id} className="border rounded-lg p-4">
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
                          <span className="font-medium">Credits:</span>
                          <p className="text-lg font-bold text-blue-600">{contractor.lead_credits}</p>
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
                        <Button
                          onClick={() => handleResetCredits(contractor.id)}
                          variant="outline"
                          size="sm"
                        >
                          Reset Credits to 3
                        </Button>
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
                        {lead.claimed && lead.claimed_by && (
                          <span>Claimed by: {lead.claimed_by}</span>
                        )}
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
              <CardTitle>Lead Management & Validation</CardTitle>
              <CardDescription>View leads with validation status and manage quality</CardDescription>
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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="font-medium">Customer:</span>
                          <p>{lead.customer_name}</p>
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
                        {lead.claimed && lead.claimed_by && (
                          <span>Claimed by: {lead.claimed_by}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
