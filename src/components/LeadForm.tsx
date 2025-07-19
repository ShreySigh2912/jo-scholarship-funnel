import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Shield, CheckCircle } from 'lucide-react';

// Declare fbq function for TypeScript
declare global {
  interface Window {
    fbq: (action: string, event: string, data?: any) => void;
  }
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  role: string;
  company: string;
}

interface LeadFormProps {
  onSuccess?: () => void;
}

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    role: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.experience.trim()) newErrors.experience = 'Work experience is required';
    if (!formData.role.trim()) newErrors.role = 'Current role is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      // Track Lead event on successful step 1 submission
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead');
      }
      setStep(2);
      setErrors({});
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "🎉 Success!",
        description: "Your MBA consultation is booked! Our counselor will call you within 24 hours to discuss your ₹25,000 scholarship.",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const progress = step === 1 ? 50 : 100;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl md:text-2xl font-bold text-primary">
          Get Free MBA Consultation + ₹25,000 Scholarship
        </CardTitle>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-muted-foreground mt-2">
          Step {step} of 2
        </p>
      </CardHeader>

      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="your.email@company.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+91 9876543210"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Continue to Step 2
            </Button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <Label htmlFor="experience">Work Experience *</Label>
              <Input
                id="experience"
                type="text"
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                placeholder="e.g., 3 years"
                className={errors.experience ? 'border-destructive' : ''}
              />
              {errors.experience && (
                <p className="text-sm text-destructive mt-1">{errors.experience}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Current Role *</Label>
              <Input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => updateFormData('role', e.target.value)}
                placeholder="e.g., Software Engineer, Manager"
                className={errors.role ? 'border-destructive' : ''}
              />
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                placeholder="e.g., TCS, Infosys, Startup"
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && (
                <p className="text-sm text-destructive mt-1">{errors.company}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Get My Scholarship'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>100% secure & GDPR compliant</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}