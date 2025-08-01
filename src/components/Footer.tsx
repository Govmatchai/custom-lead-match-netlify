import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Custom Lead Match</h3>
            <p className="text-gray-300 mb-4">
              Real-time lead matching for contractors. No subscriptions, no competition - just quality leads delivered directly to you.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy-policy" className="block text-gray-300 hover:text-white">Privacy Policy</Link>
              <Link to="/terms-of-service" className="block text-gray-300 hover:text-white">Terms of Service</Link>
              <Link to="/disclaimer" className="block text-gray-300 hover:text-white">Disclaimer</Link>
              <Link to="/tcpa" className="block text-gray-300 hover:text-white">TCPA Compliance</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-white">About Us</Link>
              <Link to="/how-it-works" className="block text-gray-300 hover:text-white">How It Works</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Custom Lead Match. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
