import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const TCPACompliance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">TCPA Compliance Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tcpa-compliance-content">
              <p className="text-gray-600 text-center py-8">
                TCPA Compliance Notice content coming soon. We are committed to following all telecommunications regulations and will provide detailed compliance information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
