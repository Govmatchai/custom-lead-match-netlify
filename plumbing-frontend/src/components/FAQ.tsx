import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from './ui/card';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'How quickly can you respond to emergency plumbing calls?',
      answer: 'We provide 24/7 emergency plumbing services with an average response time of 15 minutes. Our local plumbers are strategically located throughout the area to ensure fast response times, even during nights, weekends, and holidays.',
    },
    {
      question: 'Are your plumbers licensed and insured?',
      answer: 'Yes, all our plumbers are fully licensed, bonded, and insured. We maintain comprehensive liability insurance and workers compensation coverage. Our technicians undergo continuous training and certification to stay current with industry standards and local codes.',
    },
    {
      question: 'What plumbing services do you offer?',
      answer: 'We provide comprehensive plumbing services including emergency repairs, leak detection and repair, drain cleaning, water heater installation and repair, pipe replacement, fixture installation, and preventive maintenance. No job is too big or small for our experienced team.',
    },
    {
      question: 'Do you provide upfront pricing?',
      answer: 'Absolutely! We believe in transparent, upfront pricing with no hidden fees or surprise charges. Before any work begins, we provide a detailed estimate so you know exactly what to expect. Our pricing is competitive and fair for the quality of service we provide.',
    },
    {
      question: 'Do you offer any guarantees on your work?',
      answer: 'Yes, we stand behind our work with a 100% satisfaction guarantee. All our plumbing services come with warranties on both parts and labor. If you\'re not completely satisfied with our work, we\'ll make it right at no additional cost to you.',
    },
    {
      question: 'What areas do you serve?',
      answer: 'We serve the entire local area with our network of licensed plumbers. Our service area includes residential and commercial properties throughout the region. Contact us to confirm service availability in your specific location.',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Frequently Asked Questions About Our Plumbing Services
            </h2>
            <p className="text-lg text-gray-600">
              Get answers to common questions about our local plumbing services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-blue-100">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <h3 className="font-semibold text-blue-900 pr-4">{faq.question}</h3>
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Still Have Questions About Our Plumbing Services?
            </h3>
            <p className="text-gray-600 mb-6">
              Our friendly customer service team is available 24/7 to answer any questions about our local plumbing services.
            </p>
            <div className="inline-flex items-center space-x-4 text-sm text-blue-700">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Available 24/7</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Upfront Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
