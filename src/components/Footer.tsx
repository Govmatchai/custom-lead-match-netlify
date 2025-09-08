import { Link } from 'react-router-dom'
import { Logo } from './ui/Logo'

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo className="max-w-xs" width={200} height={60} withBadge={true} clickable={true} />
            </div>
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
              <Link to="/tcpa-notice" className="block text-gray-300 hover:text-white">TCPA Notice</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-300 hover:text-white">Contact Us</Link>
              <Link to="/about-us" className="block text-gray-300 hover:text-white">About Us</Link>
              <Link to="/how-it-works" className="block text-gray-300 hover:text-white">How It Works</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center text-gray-400 mb-6">
            <p>&copy; 2024 Custom Lead Match. All rights reserved.</p>
          </div>
          
          {/* SEO Content Block */}
          <div className="bg-gray-800 rounded-lg p-6 text-sm text-gray-300 leading-relaxed">
            <h3 className="text-white font-semibold mb-3">Premium Contractor Lead Generation Services</h3>
            <p className="mb-3">
              Custom Lead Match is the leading platform for <strong>contractor leads</strong>, specializing in connecting qualified <strong>HVAC contractors</strong>, <strong>plumbing contractors</strong>, and <strong>electrical contractors</strong> with ready-to-hire homeowners across the United States. Our exclusive lead generation system ensures you receive high-quality <strong>home service leads</strong> without competition from other contractors.
            </p>
            <p className="mb-3">
              Whether you're looking for <strong>HVAC leads</strong> for heating and cooling installations, <strong>plumbing leads</strong> for emergency repairs and installations, or <strong>electrical leads</strong> for residential and commercial projects, our platform delivers verified, exclusive opportunities directly to your dashboard. Join thousands of successful contractors who have grown their businesses with our premium <strong>contractor marketing</strong> solution.
            </p>
            <p>
              Our pay-per-lead model means no monthly subscriptions, no shared leads, and no wasted marketing spend. Focus on what you do best - providing quality home services - while we handle generating your next customer. Start receiving exclusive <strong>contractor leads</strong> in your service area today.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
