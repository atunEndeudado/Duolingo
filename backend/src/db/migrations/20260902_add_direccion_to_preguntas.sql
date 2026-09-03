ALTER TABLE preguntas
ADD COLUMN IF NOT EXISTS direccion VARCHAR(30) NOT NULL DEFAULT 'nativo_a_curso';

ALTER TABLE preguntas
DROP CONSTRAINT IF EXISTS preguntas_direccion_check;

ALTER TABLE preguntas
ADD CONSTRAINT preguntas_direccion_check
CHECK (direccion IN ('nativo_a_curso', 'curso_a_nativo'));
