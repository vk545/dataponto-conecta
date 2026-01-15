-- Drop the old trigger function and recreate with correct logic
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tipo public.user_type;
BEGIN
  -- Get the tipo from metadata, default to 'cliente'
  user_tipo := COALESCE(
    (NEW.raw_user_meta_data->>'tipo')::public.user_type, 
    'cliente'::public.user_type
  );
  
  INSERT INTO public.profiles (user_id, email, nome, tipo)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    user_tipo
  );
  
  -- If the user is a tecnico, create a record in tecnicos table
  IF user_tipo = 'tecnico' THEN
    INSERT INTO public.tecnicos (profile_id)
    SELECT id FROM public.profiles WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();