import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { UtensilsCrossed, Users } from "lucide-react";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [userType, setUserType] = useState<"restaurant" | "ngo">("restaurant");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName || !organizationName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization_name: organizationName,
            user_type: userType,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Role is assigned server-side by the handle_new_user trigger
        // using the user_type from raw_user_meta_data. Give it a moment.
        await new Promise(resolve => setTimeout(resolve, 800));

        toast({
          title: "Account Created!",
          description: "Welcome to FoodShare!",
        });

        // Navigate to the appropriate dashboard
        navigate(userType === 'restaurant' ? '/restaurant' : '/ngo');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-section">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription>Join our community and make a difference</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "restaurant" | "ngo")}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                  <RadioGroupItem value="restaurant" id="restaurant" />
                  <Label htmlFor="restaurant" className="flex items-center gap-2 cursor-pointer flex-1">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <span>Restaurant</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-secondary transition-colors">
                  <RadioGroupItem value="ngo" id="ngo" />
                  <Label htmlFor="ngo" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Users className="h-5 w-5 text-secondary" />
                    <span>NGO</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">
                {userType === 'restaurant' ? 'Restaurant Name' : 'NGO Name'}
              </Label>
              <Input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/signin" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
