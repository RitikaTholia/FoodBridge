import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UtensilsCrossed, Heart, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const handleGetStarted = () => {
    if (user && userRole) {
      navigate(userRole === 'restaurant' ? '/restaurant' : '/ngo');
    } else {
      navigate('/auth/signup');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/60" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Fighting Hunger,
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                One Meal at a Time
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect restaurants with NGOs to redistribute surplus food and make a real difference in your community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="shadow-glow hover:shadow-soft transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/auth/signin')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-section">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, efficient, and impactful food redistribution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-glow transition-all">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <UtensilsCrossed className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Restaurants Post</h3>
              <p className="text-muted-foreground">
                Restaurants list their surplus food with pickup details and availability times.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-glow transition-all">
              <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">NGOs Browse</h3>
              <p className="text-muted-foreground">
                NGOs discover available food donations and claim what they need for their communities.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-glow transition-all">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Make Impact</h3>
              <p className="text-muted-foreground">
                Coordinate pickup and delivery to ensure no food goes to waste while helping those in need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're a restaurant with surplus food or an NGO looking to serve your community, 
              we're here to bridge the gap.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
              className="shadow-lg"
            >
              Start Making a Difference
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
