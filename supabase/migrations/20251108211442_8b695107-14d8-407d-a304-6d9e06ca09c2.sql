-- Create quiz_subjects table
CREATE TABLE public.quiz_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quiz_topics table
CREATE TABLE public.quiz_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES public.quiz_subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quiz_sessions table to track user quiz attempts
CREATE TABLE public.quiz_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  topic_id uuid NOT NULL REFERENCES public.quiz_topics(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 15,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  questions jsonb NOT NULL,
  answers jsonb NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.quiz_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_subjects (public read)
CREATE POLICY "Anyone can view subjects"
ON public.quiz_subjects
FOR SELECT
USING (true);

-- RLS Policies for quiz_topics (public read)
CREATE POLICY "Anyone can view topics"
ON public.quiz_topics
FOR SELECT
USING (true);

-- RLS Policies for quiz_sessions (user-specific)
CREATE POLICY "Users can view their own quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default subjects
INSERT INTO public.quiz_subjects (name, description, icon) VALUES
('Mathematics', 'Algebra, Calculus, Geometry, and more', '🔢'),
('Science', 'Physics, Chemistry, Biology, and Earth Science', '🔬'),
('History', 'World History, US History, and Historical Events', '📚'),
('Literature', 'Classic and Modern Literature, Poetry, and Analysis', '📖'),
('Geography', 'World Geography, Capitals, and Physical Features', '🌍'),
('Computer Science', 'Programming, Algorithms, and Data Structures', '💻');

-- Insert sample topics for Mathematics
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('Algebra Fundamentals', 'Variables, equations, and algebraic expressions', 'easy'),
  ('Calculus Basics', 'Derivatives, integrals, and limits', 'hard'),
  ('Geometry', 'Shapes, angles, and spatial reasoning', 'medium'),
  ('Trigonometry', 'Sine, cosine, tangent, and trigonometric identities', 'medium'),
  ('Statistics & Probability', 'Data analysis, distributions, and probability theory', 'medium')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'Mathematics';

-- Insert sample topics for Science
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('Cell Biology', 'Cell structure, organelles, and cellular processes', 'medium'),
  ('Chemistry Basics', 'Atoms, molecules, and chemical reactions', 'easy'),
  ('Physics Fundamentals', 'Motion, forces, energy, and matter', 'medium'),
  ('Human Anatomy', 'Body systems, organs, and physiology', 'hard'),
  ('Ecology', 'Ecosystems, biodiversity, and environmental science', 'medium')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'Science';

-- Insert sample topics for History
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('World War II', 'Major events, battles, and outcomes of WWII', 'medium'),
  ('Ancient Civilizations', 'Egypt, Rome, Greece, and early societies', 'hard'),
  ('US History', 'Colonial period through modern America', 'medium'),
  ('Renaissance Era', 'Art, culture, and innovation in Europe', 'hard'),
  ('Cold War', 'Post-WWII tensions and global politics', 'medium')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'History';

-- Insert sample topics for Literature
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('Shakespeare', 'Plays, sonnets, and literary devices', 'hard'),
  ('Modern Fiction', 'Contemporary novels and short stories', 'medium'),
  ('Poetry Analysis', 'Poetic forms, themes, and interpretation', 'hard'),
  ('Classic Literature', 'Timeless works and their cultural impact', 'medium'),
  ('Literary Devices', 'Metaphor, symbolism, and narrative techniques', 'easy')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'Literature';

-- Insert sample topics for Geography
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('World Capitals', 'Capital cities of countries worldwide', 'easy'),
  ('Physical Geography', 'Mountains, rivers, and landforms', 'medium'),
  ('Climate Zones', 'Weather patterns and climate regions', 'medium'),
  ('Cultural Geography', 'Populations, languages, and cultures', 'hard'),
  ('Map Skills', 'Reading maps, coordinates, and navigation', 'easy')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'Geography';

-- Insert sample topics for Computer Science
INSERT INTO public.quiz_topics (subject_id, name, description, difficulty)
SELECT 
  id,
  topic_name,
  topic_desc,
  topic_diff
FROM public.quiz_subjects,
LATERAL (VALUES
  ('Programming Basics', 'Variables, loops, and conditionals', 'easy'),
  ('Data Structures', 'Arrays, lists, stacks, and trees', 'hard'),
  ('Algorithms', 'Sorting, searching, and complexity analysis', 'hard'),
  ('Web Development', 'HTML, CSS, JavaScript, and frameworks', 'medium'),
  ('Database Systems', 'SQL, relational databases, and queries', 'medium')
) AS topics(topic_name, topic_desc, topic_diff)
WHERE name = 'Computer Science';