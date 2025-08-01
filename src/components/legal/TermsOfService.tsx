import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="terms-of-service-content space-y-6">
              <p className="text-sm text-gray-600">Last updated: [Insert Date]</p>
              
              <p>
                Welcome to Custom Lead Match. By using our website and services, you agree to be bound by these Terms.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3">Platform Use</h2>
                <p>
                  Custom Lead Match provides access to verified leads for service providers. Users may claim free leads or purchase additional leads via pay-as-you-go payments.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Lead Policy</h2>
                <p>
                  Each lead is sold to only one contractor. We do not guarantee conversion, response, or revenue. Lead quality varies by industry and location.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Payment Terms</h2>
                <p>
                  Payments are processed securely via Stripe. No refunds will be issued once a lead is purchased, except in cases of proven duplicate or invalid leads.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Account Termination</h2>
                <p>
                  We reserve the right to terminate access to any user for misuse, abuse, fraud, or policy violation.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Liability</h2>
                <p>
                  Custom Lead Match is not liable for outcomes related to lead engagement, customer disputes, or resulting job performance.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the State of [Insert State].
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Contact</h2>
                <p>
                  support@customleadmatch.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
