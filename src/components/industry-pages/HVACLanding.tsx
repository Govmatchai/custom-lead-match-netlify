import { LeadForm } from '../LeadForm'

export const HVACLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Need HVAC Service? Get Connected Instantly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            🔥 Every lead is pre-screened and validated before being sent to you. 
            We reject spam, invalid numbers, duplicates, and junk leads—so you only get high-quality opportunities.
          </p>
        </div>
        <LeadForm industry="Home Services" defaultSubService="HVAC" />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Submit Your HVAC Request</h3>
              <p className="text-gray-600">Tell us about your heating, cooling, or ventilation needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">We Validate & Match</h3>
              <p className="text-gray-600">Pre-screened HVAC contractors in your area are notified instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Connected</h3>
              <p className="text-gray-600">The first available HVAC contractor will contact you directly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
