
CREATE POLICY "Anyone can resolve short links by code"
ON public.short_links
FOR SELECT
USING (true);
