
-- Rename column in student_exams
ALTER TABLE student_exams 
RENAME COLUMN exam_positions_id TO exam_position_id;

-- Check if plans table has any dependencies
DO $$ 
BEGIN
  -- Drop plans table if it exists and has no dependencies
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'plans'
  ) THEN
    DROP TABLE IF EXISTS plans CASCADE;
  END IF;
END $$;

-- Verify exam_level_of_educations has required entries
DO $$ 
BEGIN
  -- Create temporary table with required education levels
  CREATE TEMP TABLE required_levels (
    name TEXT
  );
  
  INSERT INTO required_levels (name) VALUES 
    ('Fundamental'),
    ('Médio'),
    ('Médio-Técnico'),
    ('Carreiras Policiais Nível Médio'),
    ('Superior'),
    ('Carreiras Policiais Nível Superior'),
    ('Carreiras Médicas'),
    ('Carreiras Jurídicas'),
    ('Carreiras de Promotoria'),
    ('Carreiras de Magistratura');

  -- Check for missing levels
  WITH missing_levels AS (
    SELECT r.name
    FROM required_levels r
    LEFT JOIN exam_level_of_educations e ON LOWER(e.name) = LOWER(r.name)
    WHERE e.id IS NULL
  )
  SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM missing_levels)
    THEN RAISE EXCEPTION 'Missing required education levels: %', 
      (SELECT string_agg(name, ', ') FROM missing_levels)
    ELSE NULL
  END;
END $$;
