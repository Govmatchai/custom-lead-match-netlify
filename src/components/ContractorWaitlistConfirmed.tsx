import { CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Logo } from './ui/Logo'
import { Footer } from './Footer'

const ContractorWaitlistConfirmed = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <Logo 
              width={286} 
              height={85} 
              withBadge={true}
              clickable={false}
            />
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center text-green-600">You're In!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-xl text-gray-700">
                Welcome to Custom Lead Match! Your $25 Free Credit is reserved.
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg text-left">
                <h3 className="font-bold text-blue-800 mb-3">What happens next:</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• You'll be among the first contractors invited when we launch</li>
                  <li>• Your account will start with $25 in free lead credits</li>
                  <li>• You'll earn a Verified Badge as an early adopter</li>
                  <li>• We'll send you updates about our launch progress</li>
                </ul>
              </div>
              
              <p className="text-gray-600">
                Check your email for a welcome message with more details.
              </p>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-bold"
                >
                  Back to Home
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/contact'}
                  className="w-full"
                >
                  Have Questions? Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default ContractorWaitlistConfirmed
