import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSection } from '@/components/ui/hero-section';
import CountdownTimer from '@/components/CountdownTimer';
import { ContactForm } from '@/components/ui/component';
import StickyMobileCTA from '@/components/StickyMobileCTA';
import FAQSection from '@/components/FAQSection';
import { toast } from '@/hooks/use-toast';
import { GraduationCap, TrendingUp, Clock, Users, Star, Award, Briefcase, Brain, BarChart, Megaphone, ChevronRight, Shield, CheckCircle, Target, Globe, BookOpen, Phone } from 'lucide-react';
import { Icons } from '@/components/ui/icons';
interface MBALandingProps {
  resetTimer?: boolean;
}
export default function MBALanding({
  resetTimer = false
}: MBALandingProps) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLElement>(null);
  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  const handleFormSuccess = (data: { name: string; email: string; phone: string }) => {
    toast({
      title: "🎉 You've unlocked your scholarship eligibility!",
      description: "Our counselor will contact you within 24 hours to confirm your ₹25,000 scholarship."
    });
  };

  // Stats data
  const stats = [{
    number: "10,000+",
    label: "Alumni"
  }, {
    number: "4.8/5",
    label: "Rating"
  }, {
    number: "₹2.5L",
    label: "Avg Hike"
  }, {
    number: "85%",
    label: "Placement Success"
  }];

  // Program highlights
  const highlights = [{
    icon: Target,
    title: "Career-Focused Curriculum",
    description: "95% job relevance with industry-aligned courses"
  }, {
    icon: Clock,
    title: "Flexible Learning",
    description: "Study anytime, anywhere at your own pace"
  }, {
    icon: Users,
    title: "Placement Support",
    description: "85% placement rate with dedicated career support"
  }, {
    icon: Award,
    title: "Industry Recognition",
    description: "NAAC A+ rating and UGC-DEB approved"
  }, {
    icon: BookOpen,
    title: "Expert Faculty",
    description: "20+ years average industry experience"
  }, {
    icon: TrendingUp,
    title: "Proven ROI",
    description: "₹2.5L+ average salary hike for graduates"
  }];

  // Future-ready electives
  const electives = [{
    icon: Brain,
    title: "Artificial Intelligence",
    skills: ["Fundamentals", "Generative AI", "Applied AI", "Algorithms"],
    isInDemand: true
  }, {
    icon: BarChart,
    title: "Data Science & Business Analytics",
    skills: ["Python", "SQL", "Analytics", "Visualization", "AI for Business"],
    isInDemand: true
  }, {
    icon: Megaphone,
    title: "Digital Marketing & E-Commerce",
    skills: ["Inbound/Outbound Marketing", "Brand Strategy", "Product Strategy", "Growth Strategy"],
    isInDemand: true
  }];

  // Success stories
  const testimonials = [{
    name: "Merin Anns Mathew",
    role: "Senior Accountant",
    company: "Global Corp",
    image: "/placeholder.svg",
    story: "JAIN Online MBA helped me advance my accounting career. I got promoted to Senior Accountant with a 35% salary hike within 6 months of graduation.",
    verified: true
  }, {
    name: "Madhuri Sandeep",
    role: "Startup Founder",
    company: "TechStart Solutions",
    image: "/placeholder.svg",
    story: "The entrepreneurship and business strategy modules gave me the confidence to expand my startup. We're now a team of 25 with 3x revenue growth.",
    verified: true
  }, {
    name: "Karthik Rajendran",
    role: "Data Science Manager",
    company: "Analytics Pro",
    image: "/placeholder.svg",
    story: "Transitioned from software development to data science through the analytics specialization. Now leading a team of data scientists with 50% salary increase.",
    verified: true
  }];
  return <div className="min-h-screen bg-background">
      {/* Scholarship Banner */}
      <div className="bg-secondary text-secondary-foreground py-3 px-4 text-center">
        <p className="font-semibold text-sm md:text-base">
          🎓 Get ₹25,000 Scholarship – Limited Time | Apply via Consultation
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl md:text-2xl font-bold text-primary">JAIN Online</span>
          </div>
          <Button onClick={scrollToForm} className="hidden md:flex">
            Apply Now
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection
        badge={{
          text: "🎓 Get ₹25,000 Scholarship – Limited Time",
          action: {
            text: "Apply via Consultation",
            onClick: scrollToForm
          }
        }}
        title="Future-Proof MBA – 100% Online"
        description="Advance your career without quitting your job"
        actions={[
          {
            text: "Get ₹25,000 Scholarship",
            onClick: scrollToForm,
            variant: "default",
            icon: <GraduationCap className="h-5 w-5" />
          }
        ]}
      >
        {/* Hero Benefits Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
          <Card className="p-4 sm:p-6 shadow-lg border-2 border-primary/20">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">Career Growth</h3>
              <p className="text-sm text-muted-foreground">12% Average Salary Hike</p>
            </CardContent>
          </Card>
          <Card className="p-4 sm:p-6 shadow-lg border-2 border-primary/20">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">Work-Life Balance</h3>
              <p className="text-sm text-muted-foreground">Flexible Timings</p>
            </CardContent>
          </Card>
          <Card className="p-4 sm:p-6 shadow-lg border-2 border-primary/20 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-primary mb-2">Industry Connect</h3>
              <p className="text-sm text-muted-foreground">Industry Recognized Degree</p>
            </CardContent>
          </Card>
        </div>
      </HeroSection>

      {/* Countdown Timer */}
      <CountdownTimer resetTimer={resetTimer} className="sticky top-16 z-30" />

      {/* Stats Bar */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => <div key={index}>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Why Our MBA Program Stands Out
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {highlights.map((highlight, index) => <Card key={index} className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 sm:pt-6">
                  <highlight.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-3">
                    {highlight.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Future-Ready Electives */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Future-Ready Electives
            </h2>
            <p className="text-lg text-muted-foreground">
              Become job ready with electives crafted by industry experts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {electives.map((elective, index) => <Card key={index} className="p-4 sm:p-6 relative overflow-hidden">
                {elective.isInDemand && <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-success text-success-foreground text-xs">
                    In-demand
                  </Badge>}
                <CardContent className="pt-4 sm:pt-6">
                  <elective.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">
                    {elective.title}
                  </h3>
                  <div className="space-y-2">
                    {elective.skills.map((skill, skillIndex) => <div key={skillIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{skill}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Scholarship Section */}
      <section className="py-16 px-4 bg-scholarship border-t border-scholarship-border">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-secondary text-secondary-foreground inline-block px-6 py-2 rounded-full mb-6">
            <Star className="inline mr-2 h-5 w-5" />
            Scholarship Program
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Unlock Your MBA Dreams with a ₹25,000 Scholarship
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We believe finances shouldn't stop you from upgrading your career. 
            Limited scholarships now available for eligible learners. Apply now through your free consultation call.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-background p-3 md:p-4 rounded-lg border">
              <div className="font-semibold text-primary text-sm md:text-base">1. Test</div>
              <div className="text-xs md:text-sm text-muted-foreground">Quick eligibility assessment</div>
            </div>
            <div className="bg-background p-3 md:p-4 rounded-lg border">
              <div className="font-semibold text-primary text-sm md:text-base">2. Result</div>
              <div className="text-xs md:text-sm text-muted-foreground">Scholarship confirmation</div>
            </div>
            <div className="bg-background p-3 md:p-4 rounded-lg border">
              <div className="font-semibold text-primary text-sm md:text-base">3. Pay ₹5000</div>
              <div className="text-xs md:text-sm text-muted-foreground">Booking amount</div>
            </div>
            <div className="bg-background p-3 md:p-4 rounded-lg border">
              <div className="font-semibold text-primary text-sm md:text-base">4. Enroll</div>
              <div className="text-xs md:text-sm text-muted-foreground">Start your MBA journey</div>
            </div>
          </div>

          <Card className="p-4 sm:p-6 mb-6 md:mb-8 bg-background border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-semibold text-primary mb-2 text-sm sm:text-base">Is the scholarship real?</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Yes, absolutely! This is a merit-based scholarship for qualified candidates. 
                  During your consultation, our counselor will assess your profile and confirm eligibility.
                </p>
              </div>
            </div>
          </Card>

          <Button onClick={scrollToForm} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg w-full sm:w-auto">
            Claim My ₹25,000 Scholarship Now
          </Button>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Success Stories from Our Alumni
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from real students who transformed their careers
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="p-4 sm:p-6 shadow-lg">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary text-sm sm:text-base">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-primary text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                    {testimonial.verified && <Badge variant="secondary" className="ml-auto flex-shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Verified</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>}
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    "{testimonial.story}"
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      {showForm && <section ref={formRef} className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-2xl">
            <ContactForm onSubmit={handleFormSuccess} />
          </div>
        </section>}

      {/* FAQ Section */}
      <FAQSection />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onClick={scrollToForm} />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">JAIN Online</span>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Transforming careers through quality education since 1990
          </p>
          <div className="flex justify-center items-center gap-4 text-sm">
            <span>📞 1800-123-4567</span>
            <span>✉️ info@jainonline.ac.in</span>
          </div>
        </div>
      </footer>
    </div>;
}