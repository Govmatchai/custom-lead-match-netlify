import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const PredictiveScoringBanner = () => {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>🔮 Predictive Lead Scoring is now active!</strong> Leads are automatically scored 0-100 based on conversion likelihood. 
        Focus on A-band leads (80-100) for the highest ROI.
      </AlertDescription>
    </Alert>
  )
}
