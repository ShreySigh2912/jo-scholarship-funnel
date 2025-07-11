"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface ContactFormProps {
  onSubmit?: (data: FormData) => void;
  onSuccess?: () => void;
  className?: string;
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

// Google Sheets submission function - temporarily disabled
const submitToGoogleSheets = async (data: FormData) => {
  // For now, just simulate a successful submission
  // Replace this URL with your actual Google Apps Script Web App URL when ready
  const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
  
  // Simulate successful submission for demo purposes
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Form data would be submitted:', {
    name: data.name,
    email: data.email,
    phone: data.phone,
    timestamp: new Date().toISOString(),
    source: 'MBA Landing Page'
  });
  
  return { success: true };
};

export function ContactForm({ onSubmit, onSuccess, className }: ContactFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit to Google Sheets
      await submitToGoogleSheets(formData);
      
      // Show success message
      toast({
        title: "🎉 Success!",
        description: "Your information has been submitted successfully! Redirecting to scholarship quiz...",
      });
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className={cn(
      "max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-background dark:bg-black border border-border",
      className
    )}>
      <h2 className="font-bold text-xl text-foreground">
        Get Free MBA Consultation + ₹25,000 Scholarship
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm mt-2">
        Please provide your contact details so we can get in touch with you about your scholarship eligibility.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            type="text"
            value={formData.name}
            onChange={handleInputChange("name")}
            className={cn(
              "transition-colors",
              errors.name && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.name && (
            <span className="text-red-500 text-xs mt-1">{errors.name}</span>
          )}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            placeholder="Enter your email address"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={cn(
              "transition-colors",
              errors.email && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1">{errors.email}</span>
          )}
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            placeholder="Enter your phone number"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange("phone")}
            className={cn(
              "transition-colors",
              errors.phone && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.phone && (
            <span className="text-red-500 text-xs mt-1">{errors.phone}</span>
          )}
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Get My ₹25,000 Scholarship
              </>
            )}
          </span>
          <BottomGradient />
        </button>
      </form>

      <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your information is secure and will only be used to contact you about your MBA consultation and scholarship.
        </p>
      </div>
    </div>
  );
}

// Usage example
export default function ContactFormDemo() {
  const handleFormSubmit = (data: FormData) => {
    console.log("Received form data:", data);
    // Handle the form submission here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ContactForm onSubmit={handleFormSubmit} />
    </div>
  );
}
