
-- Upsert education levels with their corresponding prices
INSERT INTO exam_level_of_educations (name, promo_price, full_price)
VALUES 
  ('Fundamental', 99.00, 118.80),
  ('Médio', 159.00, 190.80),
  ('Médio-Técnico', 159.90, 190.80),
  ('Carreiras Policiais Nível Médio', 159.90, 190.80),
  ('Superior', 499.00, 598.80),
  ('Carreiras Policiais Nível Superior', 699.00, 838.80),
  ('Carreiras Médicas', 999.00, 1198.80),
  ('Carreiras Jurídicas', 999.00, 1198.80),
  ('Carreiras de Promotoria', 1999.00, 2398.80),
  ('Carreiras de Magistratura', 1999.00, 2398.80)
ON CONFLICT (name) DO UPDATE
SET 
  promo_price = EXCLUDED.promo_price,
  full_price = EXCLUDED.full_price;

-- Verify all entries were properly updated
DO $$
DECLARE
  missing_levels TEXT;
BEGIN
  WITH expected_levels AS (
    SELECT level_name, count FROM (
      VALUES 
        ('Fundamental', 1),
        ('Médio', 1),
        ('Médio-Técnico', 1),
        ('Carreiras Policiais Nível Médio', 1),
        ('Superior', 1),
        ('Carreiras Policiais Nível Superior', 1),
        ('Carreiras Médicas', 1),
        ('Carreiras Jurídicas', 1),
        ('Carreiras de Promotoria', 1),
        ('Carreiras de Magistratura', 1)
    ) AS t(level_name, count)
  ),
  actual_levels AS (
    SELECT name, COUNT(*) as count
    FROM exam_level_of_educations
    GROUP BY name
  ),
  missing AS (
    SELECT e.level_name
    FROM expected_levels e
    LEFT JOIN actual_levels a ON LOWER(e.level_name) = LOWER(a.name)
    WHERE a.name IS NULL
  )
  SELECT string_agg(level_name, ', ')
  INTO missing_levels
  FROM missing;
  
  IF missing_levels IS NOT NULL THEN
    RAISE EXCEPTION 'Missing education levels after update: %', missing_levels;
  END IF;

  -- Verify price formats
  IF EXISTS (
    SELECT 1 
    FROM exam_level_of_educations 
    WHERE promo_price IS NULL 
    OR full_price IS NULL 
    OR promo_price <= 0 
    OR full_price <= 0
  ) THEN
    RAISE EXCEPTION 'Invalid price values detected';
  END IF;
END $$;

