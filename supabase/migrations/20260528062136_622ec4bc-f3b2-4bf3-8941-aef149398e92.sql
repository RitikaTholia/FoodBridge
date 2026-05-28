
-- 1) Restrict user_roles SELECT to the row owner
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) Remove client-side INSERT capability for roles
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

-- 3) Enforce one role per user at the DB level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_unique'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

-- 4) Server-side role assignment via handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
BEGIN
  INSERT INTO public.profiles (id, full_name, organization_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'organization_name'
  )
  ON CONFLICT (id) DO NOTHING;

  requested_role := NEW.raw_user_meta_data->>'user_type';

  IF requested_role IN ('restaurant', 'ngo') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, requested_role::public.user_role)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
