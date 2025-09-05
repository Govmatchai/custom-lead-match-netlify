import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function TrustProof() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'Downtown',
      rating: 5,
      text: 'Called them for an emergency leak at 2 AM and they were here within 30 minutes! Professional, clean, and fixed the problem quickly.',
    },
    {
      name: 'Mike Chen',
      location: 'Westside',
      rating: 5,
      text: 'Honest pricing and excellent work. They explained everything clearly and cleaned up after themselves. Highly recommend!',
    },
    {
      name: 'Lisa Rodriguez',
      location: 'Northside',
      rating: 5,
      text: 'Best plumbing service in the area. They installed our new water heater and the price was very fair. Great communication throughout.',
    },
  ];

  const certifications = [
    'Licensed Plumbing Contractor',
    'Better Business Bureau A+',
    'Fully Insured & Bonded',
    'EPA Certified',
    'OSHA Safety Trained',
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Trusted Local Plumbers in Your Area
          </h2>
          <p className="text-lg text-gray-600">
            See what our customers are saying about our plumbing services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <Quote className="h-6 w-6 text-blue-200 mb-2" />
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-blue-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              Certified & Trusted Professionals
            </h3>
            <p className="text-gray-600">
              We maintain the highest standards in the industry
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="text-sm font-medium text-blue-900">{cert}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-4 bg-green-50 px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-green-800 font-semibold">
                4.9/5 Average Rating from 200+ Reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
