import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="terms-of-service-content">
              <p className="text-gray-600 text-center py-8">
                Terms of Service content coming soon. We are working on comprehensive terms that protect both contractors and customers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
