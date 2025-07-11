import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  const handleTakeQuizAgain = () => {
    navigate('/quiz');
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            Quiz Completed!
          </CardTitle>
          <p className="text-xl text-muted-foreground">
            Thank you for taking the MBA Scholarship Quiz
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Next Steps:</h3>
            <div className="space-y-3 text-muted-foreground">
              <p>Your responses have been successfully submitted.</p>
              <p>Our Scholarship Review Team is now evaluating your quiz performance and written inputs.</p>
              <p>Within 1–2 working days, you'll receive a detailed update on your scholarship eligibility via WhatsApp and Email.</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium text-primary mb-6">
              ✨ Stay tuned — your journey toward a future-ready MBA starts here!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={handleTakeQuizAgain}
              variant="outline"
              className="flex-1 h-12 text-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              🔁 Take Quiz Again
            </Button>
            <Button 
              onClick={handleBackToMain}
              className="flex-1 h-12 text-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              🏠 Back to Main Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;