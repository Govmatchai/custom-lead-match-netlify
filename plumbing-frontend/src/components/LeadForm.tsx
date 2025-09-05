import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, Clock, Star } from 'lucide-react';

const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 123-4567'),
  email: z.string().email('Please enter a valid email address'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  serviceNeeded: z.string().min(1, 'Please select a service'),
  description: z.string().min(10, 'Please provide at least 10 characters describing your issue'),
  urgencyLevel: z.enum(['standard', 'premium', 'emergency']),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
      utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || '',
      utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
      utmTerm: new URLSearchParams(window.location.search).get('utm_term') || '',
      utmContent: new URLSearchParams(window.location.search).get('utm_content') || '',
    },
  });

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setValue('phone', formattedPhoneNumber);
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/.netlify/functions/leads-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          email: data.email,
          zip_code: data.zipCode,
          service_category: 'plumbing',
          sub_service: data.serviceNeeded,
          description: data.description,
          urgency: data.urgencyLevel === 'standard' ? 'Standard' : data.urgencyLevel === 'premium' ? 'Premium' : 'Emergency',
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
          utm_term: data.utmTerm,
          utm_content: data.utmContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      setSubmitSuccess(true);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit', {
          event_category: 'Lead Generation',
          event_label: 'Plumbing Lead Form',
          value: data.urgencyLevel,
        });
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('There was an error submitting your request. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <section id="lead-form" className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Request Received!</h2>
              <p className="text-green-700 mb-4">
                Thank you! A plumber in your area will contact you shortly.
              </p>
              <p className="text-sm text-gray-600">
                You should receive a call within 15-30 minutes during business hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Get Your Free Local Plumber Quote</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and a licensed plumber will contact you within 30 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-900">Service Request Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123-4567"
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...register('zipCode')}
                          placeholder="12345"
                          maxLength={5}
                          className={errors.zipCode ? 'border-red-500' : ''}
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="serviceNeeded">Service Needed *</Label>
                        <Select onValueChange={(value) => setValue('serviceNeeded', value)}>
                          <SelectTrigger className={errors.serviceNeeded ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leak-repair">Leak Repair</SelectItem>
                            <SelectItem value="clogged-drain">Clogged Drain</SelectItem>
                            <SelectItem value="burst-pipe">Burst Pipe</SelectItem>
                            <SelectItem value="water-heater">Water Heater Issues</SelectItem>
                            <SelectItem value="toilet-repair">Toilet Repair</SelectItem>
                            <SelectItem value="faucet-repair">Faucet Repair</SelectItem>
                            <SelectItem value="sewer-line">Sewer Line Issues</SelectItem>
                            <SelectItem value="installation">New Installation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.serviceNeeded && (
                          <p className="text-red-500 text-sm mt-1">{errors.serviceNeeded.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Describe Your Issue *</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Please describe your plumbing issue in detail..."
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Urgency Level *</Label>
                      <RadioGroup
                        onValueChange={(value) => setValue('urgencyLevel', value as 'standard' | 'premium' | 'emergency')}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="standard" id="standard" />
                          <Label htmlFor="standard" className="flex-1 cursor-pointer">
                            <div className="font-medium">Standard Service</div>
                            <div className="text-sm text-gray-600">Routine request - next available appointment</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="premium" id="premium" />
                          <Label htmlFor="premium" className="flex-1 cursor-pointer">
                            <div className="font-medium">Priority Service</div>
                            <div className="text-sm text-gray-600">Same-day service when possible</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="emergency" id="emergency" />
                          <Label htmlFor="emergency" className="flex-1 cursor-pointer">
                            <div className="font-medium">Emergency Service</div>
                            <div className="text-sm text-gray-600">Immediate response - 24/7 availability</div>
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.urgencyLevel && (
                        <p className="text-red-500 text-sm mt-1">{errors.urgencyLevel.message}</p>
                      )}
                    </div>

                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{submitError}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request Service Now'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting this form, you agree to be contacted by a licensed plumber in your area.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Fast Response</div>
                        <div className="text-sm text-gray-600">30-minute callback guarantee</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Licensed & Insured</div>
                        <div className="text-sm text-gray-600">Fully certified professionals</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">5-Star Service</div>
                        <div className="text-sm text-gray-600">Highly rated by customers</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
