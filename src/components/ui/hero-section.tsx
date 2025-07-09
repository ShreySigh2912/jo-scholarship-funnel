"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
}

interface HeroProps {
  badge?: {
    text: string;
    action?: {
      text: string;
      href?: string;
      onClick?: () => void;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image?: {
    src: string;
    alt: string;
  };
  children?: React.ReactNode;
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
  children,
}: HeroProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-8 sm:py-16 md:py-20 px-4",
        "overflow-hidden"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-8">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-appear gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              {badge.action && (
                <button 
                  onClick={badge.action.onClick}
                  className="flex items-center gap-1 hover:underline"
                >
                  {badge.action.text}
                  <ArrowRightIcon className="h-3 w-3" />
                </button>
              )}
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-appear bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-transparent drop-shadow-2xl">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl relative z-10 max-w-[600px] animate-appear font-medium text-muted-foreground opacity-0 delay-100">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row animate-appear justify-center gap-4 opacity-0 delay-300">
            {actions.map((action, index) => (
              <Button 
                key={index} 
                variant={action.variant || "default"} 
                size="lg" 
                onClick={action.onClick}
                className="w-full sm:w-auto"
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href} className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </a>
                ) : (
                  <div className="flex items-center gap-2">
                    {action.icon}
                    {action.text}
                  </div>
                )}
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          {image && (
            <div className="relative pt-8 sm:pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup type="responsive">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-auto"
                  />
                </Mockup>
              </MockupFrame>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}

          {/* Custom children content */}
          {children}
        </div>
      </div>
    </section>
  );
}