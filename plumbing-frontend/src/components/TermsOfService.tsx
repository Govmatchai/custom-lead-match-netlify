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
              These Terms of Service (&quot;Terms&quot;) govern your use of Custom Lead Match (&quot;CLM&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). 
              By using our website, contractor dashboard, or services, you agree to these Terms.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">1. Services</h2>
              <p>
                CLM provides an online platform that connects homeowners seeking services with contractors. 
                Contractors purchase leads on a per-lead basis. All leads are exclusive (sold to one contractor only).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">2. Contractor Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contractors must provide accurate business information during signup.</li>
                <li>Contractors are responsible for maintaining sufficient wallet funds to purchase leads.</li>
                <li>Contractors are solely responsible for following up with leads and providing services.</li>
                <li>CLM is not liable for work performed between contractors and homeowners.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">3. Lead Quality &amp; Refunds</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All leads are verified for phone, email, and ZIP before delivery.</li>
                <li>Refunds are provided only for invalid leads (wrong contact info, not a real homeowner).</li>
                <li>Refunds are issued as wallet credits only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">4. Payments</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contractors pre-pay into wallets via Stripe.</li>
                <li>Lead costs vary based on category and urgency (Standard, Premium, Emergency).</li>
                <li>No refunds are provided for purchased valid leads.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">5. Liability Disclaimer</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>CLM is a lead generation platform only.</li>
                <li>We do not guarantee job outcomes, contractor performance, or homeowner payments.</li>
                <li>CLM is not liable for damages, losses, or disputes arising from contractor-homeowner relationships.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">6. Termination</h2>
              <p>We reserve the right to suspend or terminate contractor accounts for fraud, abuse, or non-compliance.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">7. Governing Law</h2>
              <p>These Terms are governed by the laws of the State of Florida, without regard to conflict of laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">8. Contact</h2>
              <p><strong>support@govmatchai.com</strong></p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
