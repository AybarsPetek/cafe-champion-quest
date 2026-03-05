
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, store_name, employment_date)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    NULLIF(new.raw_user_meta_data->>'phone', ''),
    NULLIF(new.raw_user_meta_data->>'store_name', ''),
    CASE 
      WHEN new.raw_user_meta_data->>'employment_date' IS NOT NULL 
           AND new.raw_user_meta_data->>'employment_date' != '' 
      THEN (new.raw_user_meta_data->>'employment_date')::date 
      ELSE NULL 
    END
  );
  RETURN new;
END;
$function$;
