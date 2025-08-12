import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Logo } from './ui/Logo'
import { Footer } from './Footer'

export default function AboutUs() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="max-w-xs" width={250} height={75} withBadge={true} withTagline={true} clickable={false} />
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-6"
          >
            ← Return to Homepage
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">About Custom Lead Match</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  Custom Lead Match was created to fix what's broken in the lead generation industry. 
                  We're not a list broker or middleman — we're a real-time match platform built 
                  specifically for small business contractors who need quality leads, not quantity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">What Makes Us Different</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">No Monthly Fees</h3>
                    <p className="text-blue-800">Pay only for the leads you actually receive. No subscriptions, no contracts.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Exclusive Leads</h3>
                    <p className="text-green-800">Each lead is sold to only one contractor. No competition, no bidding wars.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Real-Time Delivery</h3>
                    <p className="text-purple-800">Leads are delivered instantly to your phone when customers are ready to hire.</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Quality Guaranteed</h3>
                    <p className="text-orange-800">Every lead is screened and validated before delivery. Real customers, real projects.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Built for Contractors</h2>
                <p className="text-gray-700 leading-relaxed">
                  We understand the challenges small business contractors face. That's why we've built 
                  a platform that puts you in control. Set your service areas, choose your lead types, 
                  and only pay for leads that match your exact criteria.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Join thousands of contractors who are already growing their business with Custom Lead Match. 
                  Sign up today and get your first 3 leads absolutely free.
                </p>
                <div className="text-center">
                  <Button 
                    onClick={() => navigate('/')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Getting Leads Today
                  </Button>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
