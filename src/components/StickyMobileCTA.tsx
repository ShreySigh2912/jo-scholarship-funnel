import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
interface StickyMobileCTAProps {
  onClick: () => void;
}
export default function StickyMobileCTA({
  onClick
}: StickyMobileCTAProps) {
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
  return <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background border-t border-border shadow-lg md:hidden">
      <Button onClick={onClick} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-3 rounded-xl shadow-lg text-sm" size="lg">
        <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="truncate">Get ₹25,000 Scholarship</span>
      </Button>
    </div>;
}