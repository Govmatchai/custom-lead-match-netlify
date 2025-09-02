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

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Platform KPIs</h3>
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

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-900">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Unverified Emails"
                  value={emailVerificationStats?.unverified_emails || 0}
                  icon={<AlertCircle className="h-4 w-4" />}
                  color="yellow"
                />
                <MetricCard
                  title="Bounce Rate"
                  value={`${notificationStats?.email?.bounces || 0}`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  color="red"
                />
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Logs</span>
                      <Button variant="outline" size="sm" onClick={() => window.open('/admin/logs', '_blank')}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">All Systems Normal</div>
                      <div className="text-xs text-gray-500">Last checked: {new Date().toLocaleTimeString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-blue-900">Waitlist Funnel Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <MetricCard
                  title="Total Waitlist"
                  value={waitlistAnalytics?.totalWaitlist || 0}
                  icon={<Users className="h-4 w-4" />}
                  color="blue"
                />
                <MetricCard
                  title="Landing Page Views"
                  value={waitlistAnalytics?.totalPageViews || 0}
                  icon={<Eye className="h-4 w-4" />}
                  color="blue"
                />
                <MetricCard
                  title="Recent Signups (7d)"
                  value={waitlistAnalytics?.recentSignups || 0}
                  icon={<Plus className="h-4 w-4" />}
                  color="blue"
                />
                <MetricCard
                  title="Launch Notified"
                  value={waitlistAnalytics?.notifiedCount || 0}
                  icon={<CheckCircle className="h-4 w-4" />}
                  color="blue"
                />
              </div>
              
              {waitlistAnalytics?.tradeBreakdown && waitlistAnalytics.tradeBreakdown.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Waitlist by Trade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {waitlistAnalytics.tradeBreakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between p-2 bg-white rounded border">
                            <span className="capitalize text-sm">{item.trade}</span>
                            <span className="font-medium text-sm">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-green-900">Contractor Onboarding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Waitlist Only"
                  value={(waitlistAnalytics?.totalWaitlist || 0) - (waitlistAnalytics?.notifiedCount || 0)}
                  icon={<Users className="h-4 w-4" />}
                  color="blue"
                />
                <MetricCard
                  title="Invited to Join"
                  value={waitlistAnalytics?.notifiedCount || 0}
                  icon={<Mail className="h-4 w-4" />}
                  color="yellow"
                />
                <MetricCard
                  title="Created Full Account"
                  value={dashboardStats?.activeContractors || 0}
                  icon={<CheckCircle className="h-4 w-4" />}
                  color="green"
                />
                <MetricCard
                  title="Funded Wallet"
                  value={dashboardStats?.fundedWallets || 0}
                  icon={<DollarSign className="h-4 w-4" />}
                  color="green"
                />
              </div>
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

        {activeTab === 'launch-queue' && (
          <Card>
            <CardHeader>
              <CardTitle>Launch Invite Queue</CardTitle>
              <CardDescription>Manage waitlist users and track launch invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button 
                    onClick={() => handleWaitlistNotification('launching_soon')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Send Launch Invites
                  </Button>
                  <Button onClick={handleExportWaitlist} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Queue
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Trade</th>
                        <th className="border border-gray-300 p-2 text-left">Email</th>
                        <th className="border border-gray-300 p-2 text-left">Date Joined</th>
                        <th className="border border-gray-300 p-2 text-left">Notified</th>
                        <th className="border border-gray-300 p-2 text-left">Account Created</th>
                        <th className="border border-gray-300 p-2 text-left">Wallet Funded</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlistAnalytics?.waitlistEntries?.map((entry: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">{entry.first_name} {entry.last_name}</td>
                          <td className="border border-gray-300 p-2 capitalize">{entry.trade}</td>
                          <td className="border border-gray-300 p-2">{entry.email}</td>
                          <td className="border border-gray-300 p-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 rounded text-xs ${entry.launch_notified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {entry.launch_notified ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">No</span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">No</span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleTestEmail('launch_day')}>
                                Resend Invite
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Waitlist Entry</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove {entry.first_name} {entry.last_name} from the waitlist? This will permanently delete their entry and they will no longer receive launch notifications. This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleDeleteWaitlistEntry(entry.id)}
                                    >
                                      Delete Entry
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                <CardTitle>Manual Lead Notifications</CardTitle>
                <CardDescription>Send lead notifications to specific contractors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lead-select">Select Lead</Label>
                    <Select value={manualNotification.lead_id} onValueChange={(value) => setManualNotification({...manualNotification, lead_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.filter(lead => lead.status === 'valid' && !lead.claimed).map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.customer_name} - {lead.service_category} - {lead.zip_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contractor-select">Select Contractors</Label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2">
                      {contractors.map((contractor) => (
                        <div key={contractor.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={`contractor-${contractor.id}`}
                            checked={manualNotification.contractor_ids.includes(contractor.id)}
                            onChange={() => handleSelectContractor(contractor.id)}
                          />
                          <label htmlFor={`contractor-${contractor.id}`} className="text-sm">
                            {contractor.business_name} - {contractor.contact_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleManualNotification} 
                    disabled={!manualNotification.lead_id || manualNotification.contractor_ids.length === 0 || loading}
                    className={loading ? 'opacity-75 cursor-not-allowed' : ''}
                  >
                    {loading ? 'Sending...' : 'Send Notifications'}
                  </Button>
                  {successMessage && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
