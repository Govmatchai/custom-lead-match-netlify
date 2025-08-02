import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'contractor' | 'admin'
}

export function ForgotPasswordModal({ isOpen, onClose, userType }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/.netlify/functions/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          user_type: userType,
          redirect_url: `${window.location.origin}/reset-password?type=${userType}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Check your email</h3>
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to {email}
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <p className="text-sm text-gray-600">
              Enter the email address associated with your {userType} account and we'll send you a link to reset your password.
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
