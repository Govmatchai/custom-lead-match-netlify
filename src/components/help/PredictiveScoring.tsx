import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Target, TrendingUp, Filter, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PredictiveScoring = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔮 Predictive Lead Scoring
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understand how we score leads to help you prioritize your time and maximize conversions
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                How Lead Scoring Works
              </CardTitle>
              <CardDescription>
                Our AI analyzes multiple factors to predict conversion likelihood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Every lead that comes through our platform is automatically analyzed and assigned a score from 0-100. 
                This score represents the likelihood that the lead will convert into a paying customer based on historical data and quality indicators.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg bg-green-50">
                  <Badge className="bg-green-100 text-green-800 border-green-200 mb-3 text-lg px-4 py-2">
                    A Band (80-100)
                  </Badge>
                  <h3 className="font-semibold text-green-800 mb-2">Hot Leads</h3>
                  <p className="text-sm text-green-700">
                    High-quality leads with excellent conversion potential. These should be your top priority.
                  </p>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-amber-50">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-3 text-lg px-4 py-2">
                    B Band (60-79)
                  </Badge>
                  <h3 className="font-semibold text-amber-800 mb-2">Warm Leads</h3>
                  <p className="text-sm text-amber-700">
                    Good quality leads with solid conversion potential. Worth pursuing after A-band leads.
                  </p>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-gray-50">
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200 mb-3 text-lg px-4 py-2">
                    C Band (0-59)
                  </Badge>
                  <h3 className="font-semibold text-gray-800 mb-2">Cold Leads</h3>
                  <p className="text-sm text-gray-700">
                    Lower quality leads that may require more effort to convert. Consider when you have extra capacity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scoring Factors
              </CardTitle>
              <CardDescription>
                What influences a lead's score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-600 mb-3">Positive Factors</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">✅ Valid phone & email</span>
                      <span className="font-semibold text-green-600">+40 points</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">📍 In your service area</span>
                      <span className="font-semibold text-green-600">+20 points</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">🏆 High-conversion category</span>
                      <span className="font-semibold text-green-600">+15 points</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">🕒 Business hours submission</span>
                      <span className="font-semibold text-green-600">+10 points</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-red-600 mb-3">Negative Factors</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">⚠️ Invalid contact info</span>
                      <span className="font-semibold text-red-600">-30 points</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">🔄 Duplicate risk detected</span>
                      <span className="font-semibold text-red-600">-15 points</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">📧 Disposable email address</span>
                      <span className="font-semibold text-red-600">-10 points</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                How to Use Lead Scoring
              </CardTitle>
              <CardDescription>
                Best practices for maximizing your ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Prioritization Strategy</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">1.</span>
                      Focus on A-band leads first (80-100 score)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">2.</span>
                      Work through B-band leads when A-band is exhausted
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-600 font-bold">3.</span>
                      Consider C-band leads when you have extra capacity
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      Use filters to match your current availability
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Dashboard Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Sort by Score:</strong> See highest-scoring leads first</li>
                    <li>• <strong>Band Filters:</strong> Show only A, B, or C band leads</li>
                    <li>• <strong>Score Tooltips:</strong> Hover to see why a lead scored as it did</li>
                    <li>• <strong>Auto-Updates:</strong> Scores refresh automatically every 24 hours</li>
                    <li>• <strong>Color Coding:</strong> Green (A), Amber (B), Gray (C) for quick identification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How often are scores updated?</h4>
                  <p className="text-sm text-gray-600">
                    Scores are calculated immediately when a lead is submitted and refreshed every 24 hours to account for any new data or changes in our scoring model.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I see why a lead received a specific score?</h4>
                  <p className="text-sm text-gray-600">
                    Yes! Hover over any score badge to see a tooltip explaining the key factors that influenced the score.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Should I ignore C-band leads completely?</h4>
                  <p className="text-sm text-gray-600">
                    Not necessarily. While C-band leads have lower conversion probability, they can still be valuable when you have extra capacity or during slower periods.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">How accurate is the scoring?</h4>
                  <p className="text-sm text-gray-600">
                    Our scoring model is continuously improved based on actual conversion data. While no prediction is 100% accurate, our scoring significantly improves lead prioritization effectiveness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/dashboard')} size="lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
