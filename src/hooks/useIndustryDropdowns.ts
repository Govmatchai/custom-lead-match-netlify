import { useState, useEffect } from 'react'

interface Industry {
  value: string
  label: string
}

interface SubService {
  value: string
  label: string
}

export const useIndustryDropdowns = () => {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [subServices, setSubServices] = useState<SubService[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIndustries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/.netlify/functions/industries')
      if (!response.ok) throw new Error('Failed to fetch industries')
      const data = await response.json()
      setIndustries(data)
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      setError('Failed to load industries')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubServices = async (industry: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/.netlify/functions/sub-services?industry=${industry}`)
      if (!response.ok) throw new Error('Failed to fetch sub-services')
      const data = await response.json()
      setSubServices(data)
    } catch (error) {
      console.error('Failed to fetch sub-services:', error)
      setError('Failed to load sub-services')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIndustries()
  }, [])

  return {
    industries,
    subServices,
    isLoading,
    error,
    fetchSubServices,
    clearSubServices: () => setSubServices([])
  }
}
