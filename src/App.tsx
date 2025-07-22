import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ContractorSignup from './components/ContractorSignup'
import ClaimLead from './components/ClaimLead'
import ContractorDashboard from './components/ContractorDashboard'
import AdminDashboard from './components/AdminDashboard'
import LeadIntake from './components/LeadIntake'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ContractorSignup />} />
          <Route path="/claim/:token" element={<ClaimLead />} />
          <Route path="/contractor/:contractorId" element={<ContractorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/lead-intake" element={<LeadIntake />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
