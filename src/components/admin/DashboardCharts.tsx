import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function LeadsByServiceChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Service Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WalletDistributionChart({ data }: { data: any[] }) {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contractor Wallet Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              outerRadius={80} 
              fill="#8884d8" 
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopContractorsCard({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contractors by Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((contractor, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                <span className="text-sm">{contractor.name}</span>
              </div>
              <span className="font-bold text-green-600">${contractor.spent.toFixed(2)}</span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-gray-500 text-sm">No contractor data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
