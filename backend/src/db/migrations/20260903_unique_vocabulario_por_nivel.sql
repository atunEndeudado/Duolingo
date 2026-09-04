DELETE FROM vocabulario duplicado
USING vocabulario original
WHERE lower(trim(duplicado.palabra)) = lower(trim(original.palabra))
  AND duplicado.nivel = original.nivel
  AND duplicado.id > original.id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_vocabulario_palabra_nivel
    ON vocabulario (lower(trim(palabra)), nivel);