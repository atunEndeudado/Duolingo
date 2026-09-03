ALTER TABLE preguntas
DROP CONSTRAINT IF EXISTS preguntas_leccion_id_fkey;

ALTER TABLE preguntas
ADD CONSTRAINT preguntas_leccion_id_fkey
FOREIGN KEY (leccion_id) REFERENCES leccion(id) ON DELETE CASCADE;

ALTER TABLE progreso
DROP CONSTRAINT IF EXISTS progreso_leccion_id_fkey;

ALTER TABLE progreso
ADD CONSTRAINT progreso_leccion_id_fkey
FOREIGN KEY (leccion_id) REFERENCES leccion(id) ON DELETE CASCADE;
