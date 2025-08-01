import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="privacy-policy-content space-y-6">
              <p className="text-sm text-gray-600">Last updated: [Insert Date]</p>
              
              <p>
                Custom Lead Match ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website customleadmatch.com or interact with our platform.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal information (name, email, phone, zip code, etc.)</li>
                  <li>Lead interaction data</li>
                  <li>Payment and transaction information via third-party processors (e.g., Stripe)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To match contractors with potential leads</li>
                  <li>To deliver SMS or email notifications</li>
                  <li>To process payments</li>
                  <li>To improve our services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Sharing Your Information</h2>
                <p>
                  We do not sell your information. We may share limited data with subcontractors or service providers as required to deliver the service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                <p>
                  You may request to review, update, or delete your personal data at any time by contacting us.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Contact</h2>
                <p>
                  If you have questions about this policy, please email us at: support@customleadmatch.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
