import { Clock, Shield, Star } from 'lucide-react';
import { Button } from './ui/button';

export function Hero() {
  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
              Emergency Plumbing Services Near You
              <span className="text-orange-500"> 24/7</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Licensed, insured local plumbers in your area ready to fix leaks, clogs, and plumbing emergencies. 
              Fast response times and upfront pricing guaranteed.
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Same Day Service</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>5-Star Rated</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={scrollToForm}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg w-full md:w-auto"
              >
                Get Free Quote Now
              </Button>
              <p className="text-sm text-gray-500">
                ✓ No obligation quote ✓ Local plumbers ✓ Upfront pricing
              </p>
            </div>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Licensed emergency plumber repairing pipes and plumbing systems with professional tools"
              className="rounded-lg shadow-xl w-full h-auto"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm">Emergency Service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
