-- Add food_type column to food_listings table
ALTER TABLE public.food_listings 
ADD COLUMN food_type text NOT NULL DEFAULT 'vegetarian' 
CHECK (food_type IN ('vegan', 'vegetarian', 'non-vegetarian'));