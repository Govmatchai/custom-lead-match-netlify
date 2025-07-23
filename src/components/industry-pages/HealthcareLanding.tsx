import { LeadForm } from '../LeadForm'

export const HealthcareLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Need Healthcare Services? Connect with Medical Professionals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            🏥 Every healthcare inquiry is pre-screened and validated before being sent to providers. 
            We reject spam, invalid contacts, duplicates, and junk requests—so you only get serious healthcare needs.
          </p>
        </div>
        <LeadForm industry="Healthcare" />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Healthcare Need</h3>
              <p className="text-gray-600">Tell us what type of medical care or service you need</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">We Validate & Match</h3>
              <p className="text-gray-600">Pre-screened healthcare providers in your area are notified instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Care</h3>
              <p className="text-gray-600">The first available provider will contact you to schedule</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
