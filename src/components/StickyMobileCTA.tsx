import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

interface StickyMobileCTAProps {
  onClick: () => void;
}

export default function StickyMobileCTA({ onClick }: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg md:hidden">
      <Button 
        onClick={onClick}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg"
        size="lg"
      >
        <GraduationCap className="mr-2 h-5 w-5" />
        Get Free MBA Consultation + ₹25,000 Scholarship
      </Button>
    </div>
  );
}