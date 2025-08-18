import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Logo } from './ui/Logo'
import { Footer } from './Footer'
import { Phone, CreditCard, CheckCircle, Users } from 'lucide-react'

export default function HowItWorks() {
  const navigate = useNavigate()

  const steps = [
    {
      icon: Users,
      title: "Sign Up & Set Preferences",
      description: "Create your contractor profile and specify your service areas, lead types, and budget preferences."
    },
    {
      icon: Phone,
      title: "Receive Instant Notifications",
      description: "When a customer in your area needs your services, you'll get an instant notification with lead details."
    },
    {
      icon: CreditCard,
      title: "Purchase Quality Leads",
      description: "Review the lead details and purchase only the leads that match your business needs."
    },
    {
      icon: CheckCircle,
      title: "Connect & Close",
      description: "Contact the customer directly and close the deal. Each lead is exclusive to you - no competition."
    }
  ]

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
            <CardTitle className="text-3xl text-center">How Custom Lead Match Works</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Get exclusive, high-quality leads delivered directly to your phone in 4 simple steps
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <IconComponent className="w-6 h-6 text-blue-600 mr-2" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-center mb-4">Why Contractors Choose Us</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-gray-600">Exclusive Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">$0</div>
                  <div className="text-sm text-gray-600">Monthly Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">$25</div>
                  <div className="text-sm text-gray-600">Free Lead Credit</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started - Claim Your $25 Free Lead Credit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
