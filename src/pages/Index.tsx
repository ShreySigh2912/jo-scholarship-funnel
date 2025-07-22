import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import MBALanding from './MBALanding';

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  // Check for resetTimer URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const resetTimer = urlParams.get('resetTimer') === 'true';

  return (
    <div className="relative">
      {/* Admin Access Button */}
      <div className="absolute top-4 right-4 z-50">
        {user && isAdmin ? (
          <Link to="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        )}
      </div>
      
      <MBALanding resetTimer={resetTimer} />
    </div>
  );
};

export default Index;
