import { SignupForm } from '../components/SignupForm'
import { useEffect, useState } from 'react'

const Signup = () => {
  const [prefilledData, setPrefilledData] = useState<{
    email?: string
    zip?: string
    trade?: string
  }>({})

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email')
    const zip = urlParams.get('zip')
    const trade = urlParams.get('trade')

    if (email || zip || trade) {
      setPrefilledData({
        email: email || undefined,
        zip: zip || undefined,
        trade: trade || undefined
      })
    }
  }, [])

  return <SignupForm prefilledData={prefilledData} />
}

export default Signup
