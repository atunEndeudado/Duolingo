-- Conserva las primeras tres preguntas de cada lección como gratuitas y
-- convierte las siguientes en Premium. Solo afecta preguntas que aún son gratis.
WITH preguntas_ordenadas AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY leccion_id ORDER BY orden, id) AS posicion
    FROM preguntas
)
UPDATE preguntas AS pregunta
SET es_premium = TRUE
FROM preguntas_ordenadas AS ordenada
WHERE pregunta.id = ordenada.id
  AND ordenada.posicion > 3
  AND pregunta.es_premium = FALSE;
