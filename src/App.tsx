import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContractorSignup from './components/ContractorSignup'
import ClaimLead from './components/ClaimLead'
import ContractorDashboard from './components/ContractorDashboard'
import AdminDashboard from './components/AdminDashboard'
import ResetPassword from './components/ResetPassword'
import LeadIntake from './components/LeadIntake'
import { HVACLanding } from './components/industry-pages/HVACLanding'
import { LegalLanding } from './components/industry-pages/LegalLanding'
import { RealEstateLanding } from './components/industry-pages/RealEstateLanding'
import { FinanceLanding } from './components/industry-pages/FinanceLanding'
import { InsuranceLanding } from './components/industry-pages/InsuranceLanding'
import { HealthcareLanding } from './components/industry-pages/HealthcareLanding'
import { AutoLanding } from './components/industry-pages/AutoLanding'
import PlumbingLanding from './components/services/PlumbingLanding'
import ThankYou from './components/ThankYou'
import WelcomePage from './components/WelcomePage'
import ContractorLogin from './components/ContractorLogin'
import { PrivacyPolicy } from './components/legal/PrivacyPolicy'
import { TermsOfService } from './components/legal/TermsOfService'
import { Disclaimer } from './components/legal/Disclaimer'
import { TCPACompliance } from './components/legal/TCPACompliance'
import AboutUs from './components/AboutUs'
import HowItWorks from './components/HowItWorks'
import Signup from './pages/Signup'
import { Contact } from './components/Contact'
import ContractorWaitlist from './components/ContractorWaitlist'
import ContractorWaitlistConfirmed from './components/ContractorWaitlistConfirmed'
import ContractorWaitlistRedirect from './components/ContractorWaitlistRedirect'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ContractorSignup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contractors/signup" element={<Signup />} />
          <Route path="/claim/:token" element={<ClaimLead />} />
          <Route path="/contractor/:contractorId" element={<ContractorDashboard />} />
          <Route path="/dashboard" element={<ContractorDashboard />} />
          <Route path="/login" element={<ContractorLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/lead-intake" element={<LeadIntake />} />
          <Route path="/hvac" element={<HVACLanding />} />
          <Route path="/legal" element={<LegalLanding />} />
          <Route path="/real-estate" element={<RealEstateLanding />} />
          <Route path="/finance" element={<FinanceLanding />} />
          <Route path="/insurance" element={<InsuranceLanding />} />
          <Route path="/healthcare" element={<HealthcareLanding />} />
          <Route path="/auto" element={<AutoLanding />} />
          <Route path="/services/plumbing" element={<PlumbingLanding />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/contractor-login" element={<ContractorLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/tcpa-notice" element={<TCPACompliance />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/launch-soon" element={<ContractorWaitlist />} />
          <Route path="/contractor-waitlist" element={<ContractorWaitlistRedirect />} />
          <Route path="/contractor-waitlist-confirmed" element={<ContractorWaitlistConfirmed />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
