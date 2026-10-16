/*
# Create translations table for dynamic content localization

1. New Tables
- `translations`
  - `id` (uuid, primary key)
  - `entity_type` (text, not null) - type of entity being translated: 'video_title', 'video_tag', 'category_name', 'country_name', 'ui_string'
  - `entity_key` (text, not null) - the original text or unique identifier being translated
  - `language` (text, not null) - target language code: 'pt', 'en', 'es'
  - `translated_text` (text, not null) - the translated text
  - `is_manual` (boolean, default false) - true when manually edited by admin, false for auto-translated
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  - Unique constraint on (entity_type, entity_key, language) to prevent duplicate translations

2. Security
- Enable RLS on `translations`.
- Allow anon + authenticated to read translations (needed for frontend display without sign-in).
- Allow anon + authenticated to insert/update translations (edge function writes auto-translations).
*/

CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_key text NOT NULL,
  language text NOT NULL,
  translated_text text NOT NULL,
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS translations_unique_idx
  ON translations (entity_type, entity_key, language);

CREATE INDEX IF NOT EXISTS translations_lookup_idx
  ON translations (entity_type, language);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_translations" ON translations;
CREATE POLICY "anon_select_translations"
ON translations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_translations" ON translations;
CREATE POLICY "anon_insert_translations"
ON translations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_translations" ON translations;
CREATE POLICY "anon_update_translations"
ON translations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_translations" ON translations;
CREATE POLICY "anon_delete_translations"
ON translations FOR DELETE
TO anon, authenticated USING (true);
