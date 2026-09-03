ALTER TABLE leccion
DROP CONSTRAINT IF EXISTS leccion_curso_id_fkey;

ALTER TABLE leccion
ADD CONSTRAINT leccion_curso_id_fkey
FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE;

ALTER TABLE usuario_cursos
DROP CONSTRAINT IF EXISTS usuario_cursos_curso_id_fkey;

ALTER TABLE usuario_cursos
ADD CONSTRAINT usuario_cursos_curso_id_fkey
FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE CASCADE;