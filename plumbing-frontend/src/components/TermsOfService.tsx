import { Header } from './Header';
import { Footer } from './Footer';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8"><strong>Effective Date: September 5, 2025</strong></p>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <p>
              These Terms of Service (&quot;Terms&quot;) apply to homeowners and users who submit service requests through Custom Lead Match (&quot;CLM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By submitting your information on our landing page, you agree to these Terms.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">1. Our Role</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>CLM is a <strong>lead generation platform only</strong>.</li>
                <li>We do not provide plumbing or home services.</li>
                <li>We connect your request with contractors who may contact you directly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">2. No Guarantees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee that a contractor will contact you, perform work, or provide services at a specific price or quality.</li>
                <li>We are not liable for delays, damages, or unsatisfactory services provided by contractors.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">3. Contractor Independence</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contractors are independent businesses, not employees or agents of CLM.</li>
                <li>Any agreements, warranties, or disputes are solely between you and the contractor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">4. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>CLM is not liable for property damage, personal injury, or financial loss resulting from contractor services.</li>
                <li>CLM is not responsible for miscommunications, cancellations, or failures by contractors.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">5. Your Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree to provide accurate information when submitting a service request.</li>
                <li>You are responsible for evaluating and choosing whether to hire a contractor who contacts you.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">6. Governing Law</h2>
              <p>These Terms are governed by the laws of the State of Florida.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">7. Contact</h2>
              <p>For questions, email us at: <strong>support@customleadmatch.com</strong></p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
