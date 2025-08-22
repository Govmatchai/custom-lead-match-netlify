import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ContractorWaitlistRedirect = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate('/launch-soon', { replace: true })
  }, [navigate])
  
  return null
}

export default ContractorWaitlistRedirect
