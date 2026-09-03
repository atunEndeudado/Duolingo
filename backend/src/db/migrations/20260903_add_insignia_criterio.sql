ALTER TABLE insignia
    ADD COLUMN criterio_variable VARCHAR(30),
    ADD COLUMN criterio_valor INTEGER;

UPDATE insignia
SET criterio_variable = 'xp_total', criterio_valor = 1
WHERE criterio_variable IS NULL;

ALTER TABLE insignia
    ALTER COLUMN criterio_variable SET NOT NULL,
    ALTER COLUMN criterio_valor SET NOT NULL;

ALTER TABLE insignia
    DROP COLUMN criterio;