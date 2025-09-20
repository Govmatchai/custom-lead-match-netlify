import { Header } from './Header';
import { Footer } from './Footer';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8"><strong>Effective Date: September 5, 2025</strong></p>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <p>
              At CLM (&quot;CLM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value and protect the privacy of homeowners and users who submit service requests through our landing pages. This Privacy Policy explains how we collect, use, and safeguard your personal information.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">1. Information We Collect</h2>
              <p>When you request plumbing or home services through our site, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> name, phone number, email address, ZIP code, and service details.</li>
                <li><strong>Technical Information:</strong> browser type, IP address, and device data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">2. How We Use Information</h2>
              <p>We use the information you provide to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Match your request with a qualified contractor in your area.</li>
                <li>Send you confirmations and updates regarding your service request.</li>
                <li>Improve and secure our platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">3. Sharing Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your information is shared only with contractors eligible to service your request.</li>
                <li>We do not sell or rent your personal data to third parties.</li>
                <li>Contractors who receive your information are independent businesses, not employees or agents of CLM.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">4. Data Protection</h2>
              <p>We use encryption, secure servers, and industry-standard safeguards to protect your personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">5. Liability</h2>
              <p>By submitting your information, you understand and agree:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>CLM is <strong>not responsible for the quality, pricing, or outcome</strong> of services performed by contractors.</li>
                <li>CLM only connects you with independent service providers.</li>
                <li>All work, agreements, and payments are solely between you and the contractor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">6. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may request deletion of your personal information at any time by contacting <strong>support@customleadmatch.com</strong>.</li>
                <li>You may also opt out of marketing emails by clicking unsubscribe.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">7. Updates</h2>
              <p>We may revise this Privacy Policy. Updates will be posted here with a new effective date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">8. Contact</h2>
              <p>For questions or concerns, contact: <strong>support@customleadmatch.com</strong></p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
