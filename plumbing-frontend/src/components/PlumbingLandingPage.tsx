import { Header } from './Header';
import { Hero } from './Hero';
import { LeadForm } from './LeadForm';
import { Benefits } from './Benefits';
import { TrustProof } from './TrustProof';
import { Urgency } from './Urgency';
import { FAQ } from './FAQ';
import { Footer } from './Footer';

export function PlumbingLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <LeadForm />
      <Benefits />
      <TrustProof />
      <Urgency />
      <FAQ />
      <Footer />
    </div>
  );
}
