import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

export const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="disclaimer-content space-y-6">
              <p>
                The information provided by Custom Lead Match is for general informational and operational purposes only. While we strive to provide quality lead data, we make no guarantees as to the accuracy, timeliness, or completeness of any leads or information delivered through our platform.
              </p>

              <p>
                You acknowledge and agree that the use of the platform is at your own risk, and Custom Lead Match assumes no liability or responsibility for any outcome related to customer interactions, project estimates, or services rendered.
              </p>

              <p>
                All leads are provided "as-is" and do not constitute a binding guarantee of income or contract work.
              </p>
            </div>
            
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => window.location.href = 'https://www.customleadmatch.com'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                🔙 Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
