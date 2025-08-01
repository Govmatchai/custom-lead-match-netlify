import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="privacy-policy-content">
              <p className="text-gray-600 text-center py-8">
                Privacy Policy content coming soon. We are committed to protecting your privacy and will update this page with our comprehensive privacy policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
