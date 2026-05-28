import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Package, MapPin, Clock } from "lucide-react";

interface FoodListing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  pickup_address: string;
  available_until: string;
  status: string;
  restaurant_id: string;
  food_type: string;
}

const FoodTypeIndicator = ({ type }: { type: string }) => {
  const getIndicatorStyle = () => {
    switch (type) {
      case 'vegetarian':
        return 'bg-green-600';
      case 'non-vegetarian':
        return 'bg-red-700';
      case 'vegan':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 border border-current rounded">
      <div className={`w-3 h-3 rounded-full ${getIndicatorStyle()}`} />
      <span className="text-xs font-medium capitalize">{type}</span>
    </div>
  );
};

const NGODashboard = () => {
  const { user, signOut } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [myClaims, setMyClaims] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
    fetchMyClaims();
  }, [user]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setListings(data);
    }
  };

  const fetchMyClaims = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('food_claims')
      .select('listing_id')
      .eq('ngo_id', user.id);

    if (data && !error) {
      setMyClaims(data.map(claim => claim.listing_id));
    }
  };

  const handleClaim = async (listingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('food_claims')
        .insert({
          listing_id: listingId,
          ngo_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      await supabase
        .from('food_listings')
        .update({ status: 'claimed' })
        .eq('id', listingId);

      toast({
        title: "Success",
        description: "Food claimed successfully! The restaurant will be notified.",
      });

      fetchListings();
      fetchMyClaims();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">NGO Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Available Food Donations</h2>
          <p className="text-muted-foreground">Browse and claim food donations from restaurants</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.length === 0 ? (
            <Card className="col-span-full shadow-soft">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No available donations at the moment</p>
              </CardContent>
            </Card>
          ) : (
            listings.map((listing) => {
              const isClaimed = myClaims.includes(listing.id);
              return (
                <Card key={listing.id} className="shadow-soft hover:shadow-glow transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{listing.title}</CardTitle>
                      <FoodTypeIndicator type={listing.food_type} />
                    </div>
                    <CardDescription>
                      Available Food Donation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-primary mt-0.5" />
                        <span><strong>Quantity:</strong> {listing.quantity}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                        <span><strong>Pickup:</strong> {listing.pickup_address}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-accent mt-0.5" />
                        <span>
                          <strong>Available Until:</strong>{" "}
                          {new Date(listing.available_until).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => handleClaim(listing.id)}
                      disabled={isClaimed}
                    >
                      {isClaimed ? "Already Claimed" : "Claim Food"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
