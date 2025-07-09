import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  resetTimer?: boolean;
  className?: string;
}

export default function CountdownTimer({ resetTimer = false, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate target time (72 hours from now or reset)
    const getTargetTime = () => {
      const stored = localStorage.getItem('mba-countdown-target');
      if (resetTimer || !stored) {
        const target = new Date().getTime() + (72 * 60 * 60 * 1000); // 72 hours
        localStorage.setItem('mba-countdown-target', target.toString());
        return target;
      }
      return parseInt(stored);
    };

    const targetTime = getTargetTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        // Reset countdown when it expires
        const newTarget = new Date().getTime() + (72 * 60 * 60 * 1000);
        localStorage.setItem('mba-countdown-target', newTarget.toString());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [resetTimer]);

  return (
    <div className={`bg-primary text-primary-foreground p-3 sm:p-4 md:p-6 text-center ${className}`}>
      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">Limited-Time Offer Ends In:</h3>
      
      <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-4 mb-3">
        <div className="bg-primary-foreground text-primary rounded-lg p-1.5 sm:p-2 md:p-3 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</div>
          <div className="text-xs">Days</div>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl font-bold">:</span>
        <div className="bg-primary-foreground text-primary rounded-lg p-1.5 sm:p-2 md:p-3 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs">Hours</div>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl font-bold">:</span>
        <div className="bg-primary-foreground text-primary rounded-lg p-1.5 sm:p-2 md:p-3 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs">Mins</div>
        </div>
        <span className="text-lg sm:text-xl md:text-2xl font-bold">:</span>
        <div className="bg-primary-foreground text-primary rounded-lg p-1.5 sm:p-2 md:p-3 min-w-[40px] sm:min-w-[50px] md:min-w-[60px]">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs">Secs</div>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm md:text-base opacity-90 px-2">
        50% off admission fee + ₹25,000 MBA Scholarship + Free Career Counseling
      </p>
    </div>
  );
}