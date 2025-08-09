import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

interface PredictiveScoringHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PredictiveScoringHelpModal({ isOpen, onClose }: PredictiveScoringHelpModalProps) {
  const navigate = useNavigate()

  const handleLearnMore = () => {
    onClose()
    navigate('/help/predictive-scoring')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>What is Predictive Lead Scoring?</DialogTitle>
          <DialogDescription>
            Focus on leads that are most likely to close.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p>
            Predictive Lead Scoring analyzes each lead the moment it arrives and assigns a 0&ndash;100 score using factors like:
          </p>
          
          <ul className="list-disc pl-6 space-y-1">
            <li>Urgency &amp; intent (emergency vs. planned work)</li>
            <li>Service &amp; job value (based on category/sub-service)</li>
            <li>Location match (within your active ZIPs)</li>
            <li>Historical outcomes (how similar leads performed)</li>
          </ul>

          <div>
            <h4 className="font-semibold mb-2">How to use it:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prioritize 🔥 Hot leads first for fastest wins.</li>
              <li>Work 👍 Warm leads next&mdash;great pipeline fillers.</li>
              <li>Review 💤 Cold leads last or when you have capacity.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Notes:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Scores are guidance, not guarantees.</li>
              <li>As data grows, the model improves continuously.</li>
              <li>You can still purchase any lead regardless of score.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleLearnMore}>
            Learn more
          </Button>
          <Button onClick={onClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
