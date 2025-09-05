import { CheckCircle, Clock, DollarSign, Shield, Star, Wrench } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: '24/7 Emergency Service',
      description: 'Available around the clock for urgent plumbing emergencies. No extra charges for nights or weekends.',
    },
    {
      icon: Shield,
      title: 'Licensed & Insured',
      description: 'All our plumbers are fully licensed, bonded, and insured for your peace of mind.',
    },
    {
      icon: DollarSign,
      title: 'Upfront Pricing',
      description: 'No hidden fees or surprise charges. You know the cost before we start any work.',
    },
    {
      icon: Star,
      title: '5-Star Rated Service',
      description: 'Consistently rated 5 stars by customers for quality work and professional service.',
    },
    {
      icon: Wrench,
      title: 'Expert Technicians',
      description: 'Experienced plumbers with years of training and expertise in all types of plumbing issues.',
    },
    {
      icon: CheckCircle,
      title: 'Satisfaction Guaranteed',
      description: 'We stand behind our work with a 100% satisfaction guarantee on all services.',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Why Choose Our Local Plumbing Services?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the highest quality plumbing services with 
            transparent pricing and exceptional customer care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="border-blue-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-700">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">15 min</div>
              <div className="text-gray-700">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-700">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
