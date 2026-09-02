-- ============================================================
-- PROYECTO 6 — DUOLINGO
-- Esquema de base de datos para app de aprendizaje de idiomas
-- Motor objetivo: PostgreSQL 14+
-- ============================================================

BEGIN;

-- ============================================================
-- TABLA: usuario
-- ============================================================
CREATE TABLE usuario (
    id                     SERIAL PRIMARY KEY,
    email                  VARCHAR(255) NOT NULL UNIQUE,
    nombre                 VARCHAR(150) NOT NULL,
    password_hash          VARCHAR(150) NOT NULL, 
    xp_total               INTEGER NOT NULL DEFAULT 0 CHECK (xp_total >= 0),
    racha_dias             INTEGER NOT NULL DEFAULT 0 CHECK (racha_dias >= 0),
    fecha_ultima_actividad DATE,
    creado_en              TIMESTAMP NOT NULL DEFAULT now(),
    es_admin               BOOLEAN NOT NULL DEFAULT FALSE,
    es_premium             BOOLEAN NOT NULL DEFAULT FALSE,
    suscripcion_hasta      TIMESTAMP WITHOUT TIME ZONE -- AGREGADO: Fecha de vencimiento de suscripción Premium
);

-- ============================================================
-- TABLA: idioma
-- ============================================================
CREATE TABLE idioma (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE,
    codigo  VARCHAR(10)  NOT NULL UNIQUE   -- ej: 'en', 'fr', 'pt-br'
);

CREATE TABLE vocabulario (
    id          SERIAL PRIMARY KEY,
    palabra     VARCHAR(100) NOT NULL,
    traduccion  VARCHAR(100) NOT NULL,
    nivel       VARCHAR(20) NOT NULL CHECK (nivel IN ('A1','A2','B1','B2','C1','C2')),
    idioma_id   INTEGER NOT NULL REFERENCES idioma(id) ON DELETE CASCADE
);

CREATE INDEX idx_vocabulario_nivel ON vocabulario(nivel);

CREATE TABLE solicitud_amistad (
    id                  SERIAL PRIMARY KEY,
    usuario_solicitante INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    usuario_receptor    INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    fecha               TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (usuario_solicitante <> usuario_receptor),
    UNIQUE (usuario_solicitante, usuario_receptor)
);

CREATE INDEX idx_solicitud_receptor ON solicitud_amistad(usuario_receptor);

-- ============================================================
-- TABLA: curso
-- Un curso = un idioma en un nivel determinado
-- ============================================================
CREATE TABLE curso (
    id        SERIAL PRIMARY KEY,
    idioma_id INTEGER NOT NULL REFERENCES idioma(id) ON DELETE CASCADE,
    nivel     VARCHAR(20) NOT NULL CHECK (nivel IN ('A1','A2','B1','B2','C1','C2')),
    UNIQUE (idioma_id, nivel)
);

-- ============================================================
-- TABLA: leccion
-- Las lecciones se completan en orden estricto dentro de un curso
-- ============================================================
CREATE TABLE leccion (
    id            SERIAL PRIMARY KEY,
    curso_id      INTEGER NOT NULL REFERENCES curso(id) ON DELETE CASCADE,
    orden         INTEGER NOT NULL CHECK (orden > 0),
    titulo        VARCHAR(200) NOT NULL,
    xp_recompensa INTEGER NOT NULL DEFAULT 10 CHECK (xp_recompensa >= 0),
    UNIQUE (curso_id, orden)
);

CREATE TABLE preguntas (
    id          SERIAL PRIMARY KEY,
    leccion_id  INTEGER NOT NULL REFERENCES leccion(id) ON DELETE CASCADE,
    orden       INTEGER NOT NULL CHECK (orden > 0),
    pregunta    VARCHAR(200) NOT NULL,
    respuesta   VARCHAR(200) NOT NULL,
    es_premium  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (leccion_id, orden)
);

CREATE INDEX idx_preguntas_leccion ON preguntas(leccion_id);


-- ============================================================
-- TABLA: progreso
-- Registra el intento/avance de un usuario sobre una lección
-- ============================================================
CREATE TABLE progreso (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    leccion_id  INTEGER NOT NULL REFERENCES leccion(id) ON DELETE CASCADE,
    puntaje     NUMERIC(5,2) CHECK (puntaje >= 0 AND puntaje <= 100),
    completada  BOOLEAN NOT NULL DEFAULT FALSE,
    fecha       TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, leccion_id)
);

-- ============================================================
-- TABLA: insignia
-- ============================================================
CREATE TABLE insignia (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    criterio    TEXT NOT NULL   -- descripción legible de la condición de desbloqueo
);

-- ============================================================
-- TABLA: suscripcion 
-- ============================================================
CREATE TABLE suscripcion (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    payment_id          VARCHAR(100) UNIQUE, -- ID del pago enviado por Mercado Pago
    plan                VARCHAR(50) NOT NULL, 
    monto               NUMERIC(10,2) NOT NULL
    estado              VARCHAR(50) NOT NULL DEFAULT 'aprobado',
    fecha_inicio        TIMESTAMP NOT NULL DEFAULT now(),
    fecha_fin           TIMESTAMP NOT NULL
);

-- ============================================================
-- N:M — usuario_cursos (inscripciones)
-- ============================================================
CREATE TABLE usuario_cursos (
    usuario_id        INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    curso_id          INTEGER NOT NULL REFERENCES curso(id)   ON DELETE CASCADE,
    fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (usuario_id, curso_id)
);

-- ============================================================
-- N:M — usuario_insignias (insignias obtenidas)
-- ============================================================
CREATE TABLE usuario_insignias (
    usuario_id  INTEGER NOT NULL REFERENCES usuario(id)  ON DELETE CASCADE,
    insignia_id INTEGER NOT NULL REFERENCES insignia(id) ON DELETE CASCADE,
    fecha       TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, insignia_id)
);

-- ============================================================
-- N:M — amigos (relación simétrica, sin filas duplicadas)
-- Se fuerza usuario_a < usuario_b para no guardar (a,b) y (b,a)
-- ============================================================
CREATE TABLE amigos (
    usuario_a   INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    usuario_b   INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
    PRIMARY KEY (usuario_a, usuario_b),
    CHECK (usuario_a <> usuario_b),
    CHECK (usuario_a < usuario_b)
);

COMMIT;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_leccion_curso      ON leccion(curso_id);
CREATE INDEX idx_progreso_usuario   ON progreso(usuario_id);
CREATE INDEX idx_progreso_leccion   ON progreso(leccion_id);
CREATE INDEX idx_usuario_xp         ON usuario(xp_total DESC);
CREATE INDEX idx_usuario_cursos_c   ON usuario_cursos(curso_id);
CREATE INDEX idx_amigos_b           ON amigos(usuario_b);
CREATE INDEX idx_suscripcion_usuario ON suscripcion(usuario_id); -- AGREGADO

-- ============================================================
-- LÓGICA DE NEGOCIO: TRIGGERS
-- ============================================================

-- 1) Una lección solo puede marcarse "completada" si la anterior
--    del mismo curso ya fue completada por ese usuario.
CREATE OR REPLACE FUNCTION fn_valida_orden_leccion()
RETURNS TRIGGER AS $$
DECLARE
    v_orden_actual  INTEGER;
    v_curso_id      INTEGER;
    v_anterior_ok   BOOLEAN;
BEGIN
    IF NEW.completada THEN
        SELECT orden, curso_id INTO v_orden_actual, v_curso_id
        FROM leccion WHERE id = NEW.leccion_id;

        IF v_orden_actual > 1 THEN
            SELECT EXISTS (
                SELECT 1
                FROM progreso p
                JOIN leccion l ON l.id = p.leccion_id
                WHERE p.usuario_id = NEW.usuario_id
                  AND l.curso_id   = v_curso_id
                  AND l.orden      = v_orden_actual - 1
                  AND p.completada = TRUE
            ) INTO v_anterior_ok;

            IF NOT v_anterior_ok THEN
                RAISE EXCEPTION
                    'El usuario % no puede completar la lección % (orden %) sin antes completar la lección anterior del curso %',
                    NEW.usuario_id, NEW.leccion_id, v_orden_actual, v_curso_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_valida_orden_leccion
BEFORE INSERT OR UPDATE ON progreso
FOR EACH ROW EXECUTE FUNCTION fn_valida_orden_leccion();

-- 2) Al completar una lección: sumar XP y actualizar la racha diaria.
--    - Si la última actividad fue ayer -> racha + 1
--    - Si la última actividad fue hoy  -> racha se mantiene
--    - Si hubo un salto de más de 1 día (o es la primera vez) -> racha = 1
CREATE OR REPLACE FUNCTION fn_actualiza_usuario_tras_progreso()
RETURNS TRIGGER AS $$
DECLARE
    v_xp            INTEGER;
    v_ultima_fecha  DATE;
BEGIN
    IF NEW.completada AND (TG_OP = 'INSERT' OR OLD.completada IS DISTINCT FROM TRUE) THEN
        SELECT xp_recompensa INTO v_xp FROM leccion WHERE id = NEW.leccion_id;
        SELECT fecha_ultima_actividad INTO v_ultima_fecha FROM usuario WHERE id = NEW.usuario_id;

        UPDATE usuario
        SET xp_total = xp_total + v_xp,
            racha_dias = CASE
                WHEN v_ultima_fecha IS NULL THEN 1
                WHEN v_ultima_fecha = CURRENT_DATE THEN racha_dias
                WHEN v_ultima_fecha = CURRENT_DATE - INTERVAL '1 day' THEN racha_dias + 1
                ELSE 1
            END,
            fecha_ultima_actividad = CURRENT_DATE
        WHERE id = NEW.usuario_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualiza_usuario_tras_progreso
AFTER INSERT OR UPDATE ON progreso
FOR EACH ROW EXECUTE FUNCTION fn_actualiza_usuario_tras_progreso();

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Ranking global de usuarios por XP
CREATE VIEW v_ranking_xp AS
SELECT id, nombre, xp_total, racha_dias,
       RANK() OVER (ORDER BY xp_total DESC) AS posicion
FROM usuario;

-- Porcentaje de avance de cada usuario en cada curso en el que está inscrito
CREATE VIEW v_progreso_curso AS
SELECT
    uc.usuario_id,
    uc.curso_id,
    COUNT(l.id)                                             AS total_lecciones,
    COUNT(p.id) FILTER (WHERE p.completada)                 AS lecciones_completadas,
    ROUND(
        100.0 * COUNT(p.id) FILTER (WHERE p.completada) / NULLIF(COUNT(l.id), 0), 2
    )                                                       AS porcentaje_avance
FROM usuario_cursos uc
JOIN leccion l ON l.curso_id = uc.curso_id
LEFT JOIN progreso p ON p.leccion_id = l.id AND p.usuario_id = uc.usuario_id
GROUP BY uc.usuario_id, uc.curso_id;