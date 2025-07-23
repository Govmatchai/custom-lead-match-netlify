import { LeadForm } from '../LeadForm'

export const FinanceLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Need Financial Services? Connect with Trusted Advisors
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            💰 Every financial inquiry is pre-screened and validated before being sent to advisors. 
            We reject spam, invalid contacts, duplicates, and junk requests—so you only get serious financial needs.
          </p>
        </div>
        <LeadForm industry="Finance" />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Financial Need</h3>
              <p className="text-gray-600">Tell us about your financial planning, investment, or loan needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">We Validate & Match</h3>
              <p className="text-gray-600">Pre-screened financial advisors in your area are notified instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Financial Help</h3>
              <p className="text-gray-600">The first available advisor will contact you for consultation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
