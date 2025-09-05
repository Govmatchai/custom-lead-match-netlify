import { Wrench } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-blue-100 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-900">TrustedPlumbing</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Button 
              onClick={scrollToForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
            >
              Request Service
            </Button>
          </div>

          <div className="md:hidden">
            <Button 
              onClick={scrollToForm}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
            >
              Get Help
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
