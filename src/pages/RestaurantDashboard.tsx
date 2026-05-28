import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FoodListing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  pickup_address: string;
  available_until: string;
  status: string;
  created_at: string;
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

const RestaurantDashboard = () => {
  const { user, signOut } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    pickup_address: "",
    available_until: "",
    food_type: "vegetarian",
  });

  useEffect(() => {
    fetchListings();

    // Set up real-time subscription for listing updates
    const listingsChannel = supabase
      .channel('restaurant-listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_listings',
          filter: `restaurant_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Listing changed:', payload);
          fetchListings();
          
          // Show notification when status changes to claimed
          if (payload.eventType === 'UPDATE' && payload.new.status === 'claimed') {
            toast({
              title: "Food Claimed!",
              description: `Your "${payload.new.title}" listing has been claimed by an NGO.`,
            });
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for new claims
    const claimsChannel = supabase
      .channel('restaurant-claims-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'food_claims',
        },
        async (payload) => {
          console.log('New claim:', payload);
          
          // Fetch the listing details to show in notification
          const { data: listing } = await supabase
            .from('food_listings')
            .select('title')
            .eq('id', payload.new.listing_id)
            .eq('restaurant_id', user?.id)
            .single();
          
          if (listing) {
            toast({
              title: "New Claim Request!",
              description: `An NGO has requested to claim "${listing.title}".`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(claimsChannel);
    };
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('food_listings')
      .select('*')
      .eq('restaurant_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setListings(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('food_listings')
        .insert({
          restaurant_id: user.id,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Food listing created successfully",
      });

      setFormData({
        title: "",
        description: "",
        quantity: "",
        pickup_address: "",
        available_until: "",
        food_type: "vegetarian",
      });
      setShowForm(false);
      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-section">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Restaurant Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="mb-6">
          <Button onClick={() => setShowForm(!showForm)} className="shadow-soft">
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "Post Food Donation"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle>Create Food Listing</CardTitle>
              <CardDescription>Share your surplus food with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Food Item</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Fresh Sandwiches"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the food items"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 20 portions"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup_address">Pickup Address</Label>
                  <Input
                    id="pickup_address"
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    placeholder="Your restaurant address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_until">Available Until</Label>
                  <Input
                    id="available_until"
                    type="datetime-local"
                    value={formData.available_until}
                    onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Food Type</Label>
                  <RadioGroup
                    value={formData.food_type}
                    onValueChange={(value) => setFormData({ ...formData, food_type: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vegetarian" id="vegetarian" />
                      <Label htmlFor="vegetarian" className="font-normal cursor-pointer">
                        Vegetarian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-vegetarian" id="non-vegetarian" />
                      <Label htmlFor="non-vegetarian" className="font-normal cursor-pointer">
                        Non-Vegetarian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vegan" id="vegan" />
                      <Label htmlFor="vegan" className="font-normal cursor-pointer">
                        Vegan
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.length === 0 ? (
            <Card className="col-span-full shadow-soft">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No listings yet. Create your first food donation!</p>
              </CardContent>
            </Card>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="shadow-soft hover:shadow-glow transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{listing.title}</CardTitle>
                    <FoodTypeIndicator type={listing.food_type} />
                  </div>
                  <CardDescription className="capitalize">Status: {listing.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{listing.description}</p>
                  <p className="text-sm"><strong>Quantity:</strong> {listing.quantity}</p>
                  <p className="text-sm"><strong>Pickup:</strong> {listing.pickup_address}</p>
                  <p className="text-sm">
                    <strong>Available Until:</strong>{" "}
                    {new Date(listing.available_until).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
