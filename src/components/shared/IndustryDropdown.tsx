import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useIndustryDropdowns } from '@/hooks/useIndustryDropdowns'
import { useEffect } from 'react'

interface IndustryDropdownProps {
  industryValue: string
  subServiceValue: string
  onIndustryChange: (value: string) => void
  onSubServiceChange: (value: string) => void
  industryLabel?: string
  subServiceLabel?: string
  required?: boolean
}

export const IndustryDropdown = ({
  industryValue,
  subServiceValue,
  onIndustryChange,
  onSubServiceChange,
  industryLabel = "Service Category",
  subServiceLabel = "Sub-Service",
  required = false
}: IndustryDropdownProps) => {
  const { industries, subServices, isLoading, error, fetchSubServices, clearSubServices } = useIndustryDropdowns()

  useEffect(() => {
    if (industryValue) {
      fetchSubServices(industryValue)
    } else {
      clearSubServices()
    }
  }, [industryValue])

  const handleIndustryChange = (value: string) => {
    onIndustryChange(value)
    onSubServiceChange('')
  }

  if (error) {
    return <div className="text-red-500 text-sm">Error loading dropdown options</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="industry">{industryLabel} {required && '*'}</Label>
        <Select value={industryValue} onValueChange={handleIndustryChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${industryLabel.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {industryValue && (
        <div>
          <Label htmlFor="sub-service">{subServiceLabel} {required && '*'}</Label>
          <Select value={subServiceValue} onValueChange={onSubServiceChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : `Select ${subServiceLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {subServices.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
