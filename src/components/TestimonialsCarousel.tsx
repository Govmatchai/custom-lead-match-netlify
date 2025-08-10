import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'

const testimonials = [
  {
    quote: "Custom Lead Match has doubled my monthly revenue.",
    author: "John D.",
    title: "Plumbing Pro",
    avatar: "JD"
  },
  {
    quote: "Leads are real, qualified, and ready to go.",
    author: "Maria S.",
    title: "Roofing Specialist", 
    avatar: "MS"
  },
  {
    quote: "Best lead-gen investment I've made in years.",
    author: "Eric L.",
    title: "HVAC Contractor",
    avatar: "EL"
  }
]

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Contractors Say</h2>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {testimonials[currentIndex].avatar}
                </div>
                <blockquote className="text-2xl italic text-gray-700 mb-6">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                <cite className="text-lg font-semibold text-gray-900">
                  {testimonials[currentIndex].author}, {testimonials[currentIndex].title}
                </cite>
              </div>
              
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
