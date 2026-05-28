
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view relevant profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR id IN (
    SELECT fc.ngo_id FROM public.food_claims fc
    JOIN public.food_listings fl ON fc.listing_id = fl.id
    WHERE fl.restaurant_id = auth.uid()
  )
  OR id IN (
    SELECT fl.restaurant_id FROM public.food_listings fl
    JOIN public.food_claims fc ON fc.listing_id = fl.id
    WHERE fc.ngo_id = auth.uid()
  )
);
