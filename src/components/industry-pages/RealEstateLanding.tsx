import { LeadForm } from '../LeadForm'

export const RealEstateLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ready to Buy or Sell? Connect with Top Real Estate Agents
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            🏠 Every real estate inquiry is pre-screened and validated before being sent to agents. 
            We reject spam, invalid contacts, duplicates, and junk requests—so you only get serious buyers and sellers.
          </p>
        </div>
        <LeadForm industry="Real Estate" />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Real Estate Need</h3>
              <p className="text-gray-600">Tell us if you're buying, selling, or need property management</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">We Validate & Match</h3>
              <p className="text-gray-600">Pre-screened real estate agents in your area are notified instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Get Connected</h3>
              <p className="text-gray-600">The first available agent will contact you to discuss your needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
