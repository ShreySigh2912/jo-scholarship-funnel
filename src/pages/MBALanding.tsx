import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Trophy, GraduationCap, Award, Clock, Users, Star, TrendingUp, BarChart3, BookOpen, Target, Zap, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { ContactForm } from '@/components/ui/component';
import MBAScholarshipQuiz from '@/components/MBAScholarshipQuiz';
import { FAQSection } from '@/components/FAQSection';
import { CountdownTimer } from '@/components/CountdownTimer';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { toast } from '@/hooks/use-toast';

interface MBALandingProps {
  resetTimer?: boolean;
}

const MBALanding = ({ resetTimer = false }: MBALandingProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSuccess = (data: { name: string; email: string; phone: string }) => {
    toast({
      title: "🎉 You've unlocked your scholarship eligibility!",
      description: "Starting your scholarship quiz now..."
    });
    
    // Open quiz after short delay
    setTimeout(() => {
      setShowQuiz(true);
    }, 1500);
  };

  const handleQuizRedirect = () => {
    toast({
      title: "🎉 You've unlocked your scholarship eligibility!",
      description: "Starting your scholarship quiz now..."
    });
    
    // Open quiz after short delay
    setTimeout(() => {
      setShowQuiz(true);
    }, 1500);
  };

  if (showQuiz) {
    return <MBAScholarshipQuiz onClose={() => setShowQuiz(false)} />;
  }

  const containerStyle = {
    backgroundImage: 'url("/bg-pattern-3.svg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          {/* Announcement Bar */}
          <div className="mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm font-medium">
              🎉 Limited Time: ₹25,000 Scholarship Available!
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Your Career with
            <span className="text-primary block mt-2">JAIN Online MBA</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            100% Online • Flexible Timings • Industry-Recognized Degree • Placement Support
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Specializations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Alumni Network</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Placement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">₹8.5L</div>
              <div className="text-sm text-muted-foreground">Avg. Salary</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={scrollToForm}
            >
              <Trophy className="mr-2 h-5 w-5" />
              Claim ₹25,000 Scholarship
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6 border-2 hover:bg-muted"
              onClick={scrollToForm}
            >
              Download Brochure
            </Button>
          </div>

          {/* Countdown Timer */}
          <CountdownTimer resetTimer={resetTimer} />
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose JAIN Online MBA?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed for working professionals who want to accelerate their career growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <GraduationCap className="h-8 w-8 text-primary" />,
                title: "100% Online Learning",
                description: "Study anytime, anywhere with our flexible online platform"
              },
              {
                icon: <Award className="h-8 w-8 text-primary" />,
                title: "UGC Recognized",
                description: "Fully accredited degree recognized by employers globally"
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Expert Faculty",
                description: "Learn from industry veterans and academic experts"
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-primary" />,
                title: "Career Growth",
                description: "85% of our graduates get promoted within 6 months"
              },
              {
                icon: <Target className="h-8 w-8 text-primary" />,
                title: "Placement Support",
                description: "Dedicated placement cell with 500+ hiring partners"
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Fast Track Option",
                description: "Complete your MBA in 12-24 months"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 border-border hover:shadow-lg transition-all duration-300">
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Specialization
            </h2>
            <p className="text-lg text-muted-foreground">
              15+ specializations designed for today's business landscape
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { name: "Marketing", icon: <BarChart3 className="h-5 w-5" /> },
              { name: "Finance", icon: <TrendingUp className="h-5 w-5" /> },
              { name: "HR Management", icon: <Users className="h-5 w-5" /> },
              { name: "Business Analytics", icon: <BarChart3 className="h-5 w-5" /> },
              { name: "Digital Marketing", icon: <Zap className="h-5 w-5" /> },
              { name: "Operations", icon: <Target className="h-5 w-5" /> },
              { name: "International Business", icon: <Trophy className="h-5 w-5" /> },
              { name: "Entrepreneurship", icon: <Star className="h-5 w-5" /> },
              { name: "Project Management", icon: <CheckCircle className="h-5 w-5" /> },
              { name: "Supply Chain", icon: <BookOpen className="h-5 w-5" /> }
            ].map((spec, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="p-3 justify-center border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer"
              >
                <span className="mr-2">{spec.icon}</span>
                {spec.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Real transformations from our alumni
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Senior Manager → Director",
                company: "TCS",
                growth: "65% salary increase",
                image: "👩‍💼"
              },
              {
                name: "Rahul Kumar",
                role: "Team Lead → VP Marketing",
                company: "Wipro",
                growth: "80% salary increase",
                image: "👨‍💼"
              },
              {
                name: "Anita Patel",
                role: "Executive → Head of Operations",
                company: "Infosys",
                growth: "75% salary increase",
                image: "👩‍💼"
              }
            ].map((story, index) => (
              <Card key={index} className="p-6 border-border">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{story.image}</div>
                  <h3 className="text-xl font-semibold text-foreground">{story.name}</h3>
                  <p className="text-muted-foreground">{story.role}</p>
                  <p className="text-sm text-primary font-medium">{story.company}</p>
                </div>
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {story.growth}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Designed for Working Professionals
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Clock className="h-6 w-6 text-primary" />,
                    title: "Flexible Schedule",
                    description: "Weekend classes & recorded sessions available 24/7"
                  },
                  {
                    icon: <BookOpen className="h-6 w-6 text-primary" />,
                    title: "Industry-Relevant Curriculum",
                    description: "Updated syllabus with latest business trends & case studies"
                  },
                  {
                    icon: <Users className="h-6 w-6 text-primary" />,
                    title: "Peer Learning",
                    description: "Network with 1000+ professionals from diverse industries"
                  },
                  {
                    icon: <Award className="h-6 w-6 text-primary" />,
                    title: "Industry Projects",
                    description: "Work on live projects with leading companies"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-foreground mb-6">Program Highlights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground font-medium">12-24 Months</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Format</span>
                  <span className="text-foreground font-medium">100% Online</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Classes</span>
                  <span className="text-foreground font-medium">Weekends</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-foreground font-medium">₹2.5L - ₹25K Scholarship</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Placement Support</span>
                  <span className="text-foreground font-medium">Lifetime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ₹25,000 Scholarship Program
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Limited scholarships available for deserving candidates. Apply now to secure your spot!
            </p>
            
            <Card className="p-8 bg-card border-2 border-primary/20 shadow-lg">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100</div>
                  <div className="text-sm text-muted-foreground">Scholarships Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">₹25,000</div>
                  <div className="text-sm text-muted-foreground">Maximum Scholarship</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Merit</div>
                  <div className="text-sm text-muted-foreground">Based Selection</div>
                </div>
              </div>
              
              <div className="space-y-4 text-left max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-foreground">Scholarship Criteria:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Minimum 60% in graduation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    2+ years of work experience
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Clear scholarship aptitude test
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Demonstrate leadership potential
                  </li>
                </ul>
              </div>
              
              <Button 
                size="lg" 
                className="mt-8 text-lg px-8 py-6"
                onClick={scrollToForm}
              >
                Apply for Scholarship
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our counselors are here to help you make the right decision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 border-border">
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-3">Mon-Sat, 9 AM - 7 PM</p>
              <Button variant="outline" size="sm">1800-102-4431</Button>
            </Card>

            <Card className="text-center p-6 border-border">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-3">Quick response guaranteed</p>
              <Button variant="outline" size="sm">admissions@jainuniversity.ac.in</Button>
            </Card>

            <Card className="text-center p-6 border-border">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground mb-3">Bangalore Campus</p>
              <Button variant="outline" size="sm">Get Directions</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      {showForm && (
        <section ref={formRef} className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-2xl">
            <ContactForm onSubmit={handleFormSuccess} onSuccess={handleQuizRedirect} />
          </div>
        </section>
      )}

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onCtaClick={scrollToForm} />
    </div>
  );
};

export default MBALanding;
