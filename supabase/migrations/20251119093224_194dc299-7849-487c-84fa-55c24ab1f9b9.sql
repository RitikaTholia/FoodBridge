-- Enable realtime for food_listings and food_claims tables
ALTER TABLE public.food_listings REPLICA IDENTITY FULL;
ALTER TABLE public.food_claims REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.food_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_claims;