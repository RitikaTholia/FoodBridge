-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('restaurant', 'ngo');

-- Create profiles table (basic info without role)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organization_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create food_listings table (restaurants post available food)
CREATE TABLE public.food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_claims table (NGOs claim food)
CREATE TABLE public.food_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  pickup_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, ngo_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_claims ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for food_listings
CREATE POLICY "Anyone can view available food listings"
  ON public.food_listings FOR SELECT
  USING (true);

CREATE POLICY "Restaurants can create food listings"
  ON public.food_listings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'restaurant') AND auth.uid() = restaurant_id);

CREATE POLICY "Restaurants can update their own listings"
  ON public.food_listings FOR UPDATE
  USING (public.has_role(auth.uid(), 'restaurant') AND auth.uid() = restaurant_id);

CREATE POLICY "Restaurants can delete their own listings"
  ON public.food_listings FOR DELETE
  USING (public.has_role(auth.uid(), 'restaurant') AND auth.uid() = restaurant_id);

-- RLS Policies for food_claims
CREATE POLICY "NGOs and listing owners can view claims"
  ON public.food_claims FOR SELECT
  USING (
    auth.uid() = ngo_id OR 
    EXISTS (
      SELECT 1 FROM public.food_listings 
      WHERE id = listing_id AND restaurant_id = auth.uid()
    )
  );

CREATE POLICY "NGOs can create claims"
  ON public.food_claims FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'ngo') AND auth.uid() = ngo_id);

CREATE POLICY "NGOs can update their own claims"
  ON public.food_claims FOR UPDATE
  USING (public.has_role(auth.uid(), 'ngo') AND auth.uid() = ngo_id);

CREATE POLICY "Listing owners can update claims on their listings"
  ON public.food_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.food_listings 
      WHERE id = listing_id AND restaurant_id = auth.uid()
    )
  );

-- Trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_listings_updated_at
  BEFORE UPDATE ON public.food_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_claims_updated_at
  BEFORE UPDATE ON public.food_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, organization_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'organization_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();