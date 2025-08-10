import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Logo } from '../ui/Logo'
import { Footer } from '../Footer'

export default function PredictiveScoring() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="max-w-xs" width={250} height={75} />
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-6"
          >
            ← Return to Homepage
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">Predictive Lead Scoring</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Prioritize your highest-value opportunities with AI-driven insights.
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <p className="text-gray-700 leading-relaxed">
                  Predictive Lead Scoring is a feature that helps you focus your time and resources where they matter most. By analyzing incoming leads in real time, our AI assigns a score between 0 and 100 estimating the likelihood of conversion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">How Scoring Works</h2>
                <p className="text-gray-700 leading-relaxed mb-4">The score is calculated using:</p>
                 <ul className="list-disc pl-6 space-y-2">
                   <li><strong>Urgency &amp; Intent:</strong> Whether the lead is an emergency request or scheduled work.</li>
                   <li><strong>Service &amp; Job Value:</strong> Type of service and potential project value.</li>
                   <li><strong>Location Fit:</strong> How closely the lead&apos;s location matches your active ZIPs.</li>
                   <li><strong>Historical Outcomes:</strong> Success rates for similar past leads.</li>
                 </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Score Ranges & Labels</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🔥</span>
                       <span className="font-semibold text-red-900">Hot (80&ndash;100)</span>
                    </div>
                    <p className="text-red-800 text-sm">High conversion likelihood. Prioritize immediately.</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">👍</span>
                       <span className="font-semibold text-yellow-900">Warm (50&ndash;79)</span>
                    </div>
                    <p className="text-yellow-800 text-sm">Moderate potential. Worth a follow-up soon.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">💤</span>
                       <span className="font-semibold text-gray-900">Cold (0&ndash;49)</span>
                    </div>
                    <p className="text-gray-800 text-sm">Lower likelihood. Consider if time allows.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Save time by working smarter, not harder.</li>
                  <li>Improve close rates by acting fast on the right leads.</li>
                  <li>Let AI continuously improve predictions over time.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
                <div className="space-y-4">
                  <div>
                     <h3 className="font-semibold mb-2">Q: How is the score calculated?</h3>
                     <p className="text-gray-700">A: We combine multiple signals (urgency keywords, service type, distance, historical outcomes) into a single 0&ndash;100 score. Higher = more likely to convert.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Q: Do scores change over time?</h3>
                    <p className="text-gray-700">A: Yes. As more jobs close, the system retrains and future scoring improves.</p>
                  </div>
                  <div>
                     <h3 className="font-semibold mb-2">Q: Can I override the score?</h3>
                     <p className="text-gray-700">A: You can&apos;t edit the score, but you can sort/filter leads and set your own workflow rules.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Q: Will a low score block me from buying a lead?</h3>
                    <p className="text-gray-700">A: Never. Scoring is advisory. You can purchase any lead.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Q: Does scoring affect lead price?</h3>
                    <p className="text-gray-700">A: Not initially. Dynamic pricing may be introduced later with clear notice.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Call to Action</h2>
                <div className="text-center bg-blue-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Start sorting by Score today to see how Predictive Lead Scoring can increase your win rate.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
