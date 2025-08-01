import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="disclaimer-content">
              <p className="text-gray-600 text-center py-8">
                Disclaimer content coming soon. We will provide clear information about our services and limitations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
