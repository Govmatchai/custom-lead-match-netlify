import { Wrench } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wrench className="h-6 w-6" />
              <span className="text-xl font-bold">TrustedPlumbing</span>
            </div>
            <p className="text-blue-200 mb-4">
              Your trusted local plumbing experts, available 24/7 for all your plumbing needs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-blue-200">
              <li>Emergency Plumbing</li>
              <li>Leak Repair</li>
              <li>Drain Cleaning</li>
              <li>Water Heater Service</li>
              <li>Pipe Installation</li>
              <li>Sewer Line Repair</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Why Choose Us</h3>
            <ul className="space-y-2 text-blue-200">
              <li>Licensed & Insured</li>
              <li>24/7 Emergency Service</li>
              <li>Upfront Pricing</li>
              <li>5-Star Rated Service</li>
              <li>Expert Technicians</li>
              <li>Satisfaction Guaranteed</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-blue-200 text-sm">
              © 2024 TrustedPlumbing. All rights reserved.
            </div>
            <div className="flex space-x-6 text-blue-200 text-sm mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">License Info</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
