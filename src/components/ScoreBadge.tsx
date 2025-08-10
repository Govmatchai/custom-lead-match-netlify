import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface ScoreBadgeProps {
  score: number
  label: 'hot' | 'warm' | 'cold'
}

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const getBadgeConfig = (label: 'hot' | 'warm' | 'cold') => {
    switch (label) {
      case 'hot':
        return {
          emoji: '🔥',
          text: 'Hot',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          tooltip: 'High conversion likelihood. Fast response recommended.'
        }
      case 'warm':
        return {
          emoji: '👍',
          text: 'Warm',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          tooltip: 'Moderate potential. Worth a follow-up.'
        }
      case 'cold':
        return {
          emoji: '💤',
          text: 'Cold',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          tooltip: 'Lower likelihood. Consider if pipeline is light.'
        }
    }
  }

  const config = getBadgeConfig(label)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} cursor-help`}>
          <span className="mr-1">{config.emoji}</span>
          {config.text} ({score})
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
