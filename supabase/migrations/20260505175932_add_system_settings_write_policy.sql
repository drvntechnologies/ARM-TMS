/*
  # Add write policies for system_settings

  ## Changes
  - Add INSERT policy: authenticated users can insert new settings
  - Add UPDATE policy: authenticated users can update existing settings

  The existing SELECT policy already allows all authenticated users to read settings.
  These policies allow authenticated users (admins) to manage integration API keys
  such as SuperDispatch and Google Maps keys stored in system_settings.
*/

CREATE POLICY "Authenticated users can insert system settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
