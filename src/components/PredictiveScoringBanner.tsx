import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface PredictiveScoringBannerProps {
  onSortByScore: () => void
}

export function PredictiveScoringBanner({ onSortByScore }: PredictiveScoringBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('dismiss_scoring_banner')
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('dismiss_scoring_banner', 'true')
    setIsVisible(false)
  }

  const handleSortByScore = () => {
    onSortByScore()
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">New: Predictive Lead Scoring</h3>
          <p className="text-blue-800 mb-3">
            We'll highlight leads most likely to close so you can move faster on high-value opportunities. Sort by Score to prioritize your outreach.
          </p>
          <Button onClick={handleSortByScore} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Sort by Score
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-blue-600 hover:text-blue-800">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
