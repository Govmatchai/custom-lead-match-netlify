import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PlumbingLandingPage } from './components/PlumbingLandingPage'
import { PrivacyPolicy } from './components/PrivacyPolicy'
import { TermsOfService } from './components/TermsOfService'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlumbingLandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </Router>
  )
}

export default App
