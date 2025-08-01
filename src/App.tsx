import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContractorSignup from './components/ContractorSignup'
import ClaimLead from './components/ClaimLead'
import ContractorDashboard from './components/ContractorDashboard'
import AdminDashboard from './components/AdminDashboard'
import LeadIntake from './components/LeadIntake'
import { HVACLanding } from './components/industry-pages/HVACLanding'
import { LegalLanding } from './components/industry-pages/LegalLanding'
import { RealEstateLanding } from './components/industry-pages/RealEstateLanding'
import { FinanceLanding } from './components/industry-pages/FinanceLanding'
import { InsuranceLanding } from './components/industry-pages/InsuranceLanding'
import { HealthcareLanding } from './components/industry-pages/HealthcareLanding'
import { AutoLanding } from './components/industry-pages/AutoLanding'
import WelcomePage from './components/WelcomePage'
import ContractorLogin from './components/ContractorLogin'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ContractorSignup />} />
          <Route path="/claim/:token" element={<ClaimLead />} />
          <Route path="/contractor/:contractorId" element={<ContractorDashboard />} />
          <Route path="/dashboard" element={<ContractorDashboard />} />
          <Route path="/login" element={<ContractorLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/lead-intake" element={<LeadIntake />} />
          <Route path="/hvac" element={<HVACLanding />} />
          <Route path="/legal" element={<LegalLanding />} />
          <Route path="/real-estate" element={<RealEstateLanding />} />
          <Route path="/finance" element={<FinanceLanding />} />
          <Route path="/insurance" element={<InsuranceLanding />} />
          <Route path="/healthcare" element={<HealthcareLanding />} />
          <Route path="/auto" element={<AutoLanding />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/contractor-login" element={<ContractorLogin />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
