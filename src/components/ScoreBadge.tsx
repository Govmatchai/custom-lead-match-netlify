import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ScoreBadgeProps {
  score: number
  label: 'hot' | 'warm' | 'cold'
  showTooltip?: boolean
  reason?: string
}

export const ScoreBadge = ({ score, label, showTooltip = false, reason }: ScoreBadgeProps) => {
  const getBadgeVariant = (label: 'hot' | 'warm' | 'cold') => {
    switch (label) {
      case 'hot':
        return 'default'
      case 'warm':
        return 'secondary'
      case 'cold':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getBadgeColor = (label: 'hot' | 'warm' | 'cold') => {
    switch (label) {
      case 'hot':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warm':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'cold':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBand = (score: number) => {
    if (score >= 80) return 'A'
    if (score >= 60) return 'B'
    return 'C'
  }

  const badge = (
    <Badge 
      variant={getBadgeVariant(label)}
      className={`${getBadgeColor(label)} font-semibold`}
    >
      {getBand(score)} ({score})
    </Badge>
  )

  if (showTooltip && reason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Score: {score}/100</p>
            <p className="text-sm">{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}
