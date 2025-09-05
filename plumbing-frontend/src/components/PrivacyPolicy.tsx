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
              At Custom Lead Match (&quot;CLM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we respect and protect your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use 
              our services, including our contractor marketplace and homeowner lead request platform.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">1. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> name, email, phone number, ZIP code, and payment details.</li>
                <li><strong>Business Information:</strong> contractor company name, trade category, service area.</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device info, cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">2. How We Use Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To verify lead submissions (phone, email, postal code).</li>
                <li>To deliver and distribute leads to contractors.</li>
                <li>To process payments and manage contractor wallets.</li>
                <li>To send important notifications (lead alerts, account updates).</li>
                <li>To improve our platform performance and security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">3. Information Sharing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Leads submitted are shared only with eligible contractors.</li>
                <li>We do not sell personal data to third parties.</li>
                <li>We may share limited data with trusted service providers (e.g., payment processors, verification services).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">4. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Lead data is retained as long as required for business purposes.</li>
                <li>Contractors may request account closure and deletion of data (except data required by law).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">5. Security</h2>
              <p>We use encryption, access controls, and industry-standard safeguards to protect your data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">6. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may request a copy or deletion of your personal data by contacting <strong>support@govmatchai.com</strong>.</li>
                <li>You may opt out of marketing communications at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">7. Changes</h2>
              <p>We may update this policy periodically. Updates will be posted with a new effective date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">8. Contact</h2>
              <p>If you have questions, contact us at: <strong>support@govmatchai.com</strong></p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
