import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContractorLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('No login token provided')
      setLoading(false)
      return
    }

    processLoginToken()
  }, [token])

  const processLoginToken = async () => {
    try {
      const response = await fetch(`/.netlify/functions/contractor-login?token=${token}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        if (data.redirect_url) {
          window.location.href = data.redirect_url
        } else {
          navigate(`/contractor/${data.contractor_id}`)
        }
      } else {
        setError(data.message || 'Invalid or expired login link')
      }
    } catch (error) {
      console.error('Error processing login token:', error)
      setError('Failed to process login link')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Logging you in...</h2>
              <p className="text-gray-600">Please wait while we verify your login link.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Login Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              This could happen if the login link has expired or has already been used.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Successful!</h2>
            <p className="text-gray-600">Redirecting you to your dashboard...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
