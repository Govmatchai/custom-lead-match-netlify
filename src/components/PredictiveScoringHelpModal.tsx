import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PredictiveScoringHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PredictiveScoringHelpModal = ({ isOpen, onClose }: PredictiveScoringHelpModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔮 Predictive Lead Scoring
          </DialogTitle>
          <DialogDescription>
            Understanding how we score leads to help you prioritize your time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">How Lead Scoring Works</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our AI analyzes multiple factors to predict how likely a lead is to convert into a paying customer. 
              Each lead receives a score from 0-100 and is assigned to a quality band.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 border rounded-lg">
                <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">A (80-100)</Badge>
                <p className="text-sm font-medium">Hot Leads</p>
                <p className="text-xs text-gray-500">High conversion probability</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-2">B (60-79)</Badge>
                <p className="text-sm font-medium">Warm Leads</p>
                <p className="text-xs text-gray-500">Good conversion potential</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Badge className="bg-gray-100 text-gray-800 border-gray-200 mb-2">C (0-59)</Badge>
                <p className="text-sm font-medium">Cold Leads</p>
                <p className="text-xs text-gray-500">Lower conversion likelihood</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Scoring Factors</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>✅ Valid phone & email</span>
                <span className="text-green-600">+40 points</span>
              </div>
              <div className="flex justify-between">
                <span>📍 In your service area</span>
                <span className="text-green-600">+20 points</span>
              </div>
              <div className="flex justify-between">
                <span>🏆 High-conversion category</span>
                <span className="text-green-600">+15 points</span>
              </div>
              <div className="flex justify-between">
                <span>🕒 Business hours submission</span>
                <span className="text-green-600">+10 points</span>
              </div>
              <div className="flex justify-between">
                <span>⚠️ Invalid contact info</span>
                <span className="text-red-600">-30 points</span>
              </div>
              <div className="flex justify-between">
                <span>🔄 Duplicate risk</span>
                <span className="text-red-600">-15 points</span>
              </div>
              <div className="flex justify-between">
                <span>📧 Disposable email</span>
                <span className="text-red-600">-10 points</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">How to Use Scoring</h3>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Focus on A-band leads first for highest ROI</li>
              <li>• Use sorting to see best leads at the top</li>
              <li>• Filter by bands to match your capacity</li>
              <li>• Check score explanations for context</li>
              <li>• Scores update automatically as new data comes in</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
