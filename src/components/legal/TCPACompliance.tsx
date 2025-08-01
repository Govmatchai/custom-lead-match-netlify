import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const TCPACompliance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">TCPA Compliance Notice</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="tcpa-compliance-content space-y-6">
              <p>
                By submitting your contact information through Custom Lead Match, you expressly consent to receive phone calls, emails, and SMS/text messages from Custom Lead Match and its service providers at the phone number and email address provided.
              </p>

              <p>
                This consent includes communication related to lead notifications, account activity, and service updates. Standard carrier rates may apply.
              </p>

              <p>
                Your consent is not a condition of any purchase. You may opt out at any time by replying "STOP" to any message or contacting support@customleadmatch.com.
              </p>

              <p>
                Custom Lead Match is committed to maintaining full compliance with the Telephone Consumer Protection Act (TCPA).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
