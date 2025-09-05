import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function Urgency() {
  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const emergencyIssues = [
    'Burst pipes or major leaks',
    'Sewage backup or overflow',
    'No hot water in winter',
    'Flooding in basement or home',
    'Gas line issues or smell',
    'Complete water system failure',
  ];

  return (
    <section className="py-16 bg-red-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h2 className="text-3xl font-bold text-red-800">
                Emergency Plumbing - Don't Wait!
              </h2>
            </div>
            <p className="text-lg text-red-700">
              Plumbing emergencies can cause thousands in damage if not addressed immediately
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Plumbing Situations
                </h3>
                <ul className="space-y-2">
                  {emergencyIssues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-red-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time is Critical
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-orange-800">First 30 minutes:</div>
                    <div className="text-sm text-orange-700">Minor damage, easy cleanup</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-orange-800">After 1 hour:</div>
                    <div className="text-sm text-orange-700">Water damage spreads, costs increase</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="font-semibold text-orange-800">After 24 hours:</div>
                    <div className="text-sm text-orange-700">Mold growth, structural damage possible</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg p-8 text-center border-2 border-orange-300">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Get Emergency Plumber Help in 15 Minutes
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Our emergency response team is standing by. Don't let a small problem become a big expense.
            </p>
            
            <div className="flex justify-center">
              <Button
                onClick={scrollToForm}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                Request Emergency Service Now
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Available 24/7</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>15-min response</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Licensed & insured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
