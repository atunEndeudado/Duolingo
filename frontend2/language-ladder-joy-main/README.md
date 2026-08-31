# Lingua Journey

Realizar el front end en typeScript basandote en:
Proyecto 6 — Duolingo

App de aprendizaje de idiomas. Los usuarios se inscriben a cursos, completan lecciones en orden, acumulan XP, mantienen una racha diaria y desbloquean insignias.

Entidades sugeridas

Usuario (id, email, nombre, xp_total, racha_dias, fecha_ultima_actividad)

Idioma (id, nombre, codigo)

Curso (id, idioma_id, nivel)

Leccion (id, curso_id, orden, titulo, xp_recompensa)

Progreso (id, usuario_id, leccion_id, puntaje, completada, fecha)

Insignia (id, nombre, descripcion, criterio)

Relación N a M usuario_cursos (usuario_id, curso_id, fecha_inscripcion)

Relación N a M usuario_insignias (usuario_id, insignia_id, fecha)

Relación N a M amigos (usuario_a, usuario_b, fecha)

Historias de usuario

HU1 — Registro

Como visitante, quiero registrarme para empezar a estudiar.

El email es único.

xp_total y racha_dias inician en 0.

POST /usuarios devuelve 201 con los datos del usuario creado.

HU2 — Inscribirse a un curso

Como usuario, quiero inscribirme a un curso de un idioma y nivel.

Cada curso pertenece a un idioma; nivel puede ser A1, A2, B1, B2, C1.

Un usuario no puede inscribirse dos veces al mismo curso.

Un usuario puede tener varios cursos activos en paralelo (distintos idiomas).

HU3 — Alta de contenido

Como administrador, quiero cargar cursos y lecciones.

Toda lección pertenece a un curso.

El orden es único dentro de un curso (dos lecciones no pueden compartir posición).

xp_recompensa entre 5 y 50.

GET /cursos/{id}/lecciones devuelve las lecciones ordenadas por orden.

HU4 — Completar lección

Como usuario, quiero completar una lección y registrar mi puntaje.

puntaje entre 0 y 100.

La lección se marca como completada = true solo si el puntaje es ≥ 60.

Si se completa, se suma xp_recompensa al xp_total del usuario.

Se guarda fecha con el timestamp de finalización.

HU5 — Progreso secuencial

Como plataforma, quiero forzar que las lecciones se hagan en orden.

Una lección solo se puede iniciar si la lección anterior (por orden) está completada.

La primera lección de cada curso (orden = 1) no tiene prerrequisito.

Un intento fallido (puntaje < 60) puede repetirse cuantas veces se quiera.

HU6 — Racha diaria

Como usuario, quiero mantener una racha por practicar todos los días.

Si el usuario completa al menos una lección un día nuevo, racha_dias += 1.

Si pasa un día entero sin completar ninguna lección, la racha vuelve a 0.

Completar varias lecciones el mismo día suma solo 1 a la racha.

HU7 — Insignias

Como usuario, quiero desbloquear insignias por hitos.

Cada insignia tiene un criterio (ej: xp>=100, racha>=7, lecciones_completadas>=20).

Al cumplir el criterio, la insignia se otorga automáticamente y se guarda la fecha.

Una insignia se otorga una única vez por usuario.

GET /usuarios/{id}/insignias devuelve las insignias desbloqueadas.

HU8 — Amigos

Como usuario, quiero agregar amigos para compararme.

Un usuario no puede agregarse a sí mismo.

No puede existir una amistad duplicada entre los mismos dos usuarios.

GET /usuarios/{id}/amigos devuelve la lista de amigos con su xp_total y racha_dias.

HU9 — Ranking global

Como usuario, quiero ver el ranking global por XP.

GET /ranking?periodo=global devuelve el top 50 por xp_total.

GET /ranking?periodo=semana devuelve el top 50 por XP ganado en los últimos 7 días.

Empates se desempatan por racha descendente.

HU10 — Ranking entre amigos

Como usuario, quiero ver el ranking entre mis amigos.

GET /usuarios/{id}/ranking-amigos devuelve al usuario y sus amigos ordenados por xp_total descendente.

Indica la posición del usuario dentro del grupo.

HU11 — Progreso por curso

Como usuario, quiero ver el avance en cada curso.

GET /usuarios/{id}/cursos/{curso_id}/progreso devuelve total de lecciones, completadas y porcentaje.

Incluye la próxima lección a hacer (según orden).

Si el usuario no está inscripto al curso, devuelve 404.

HU12 — Actividad diaria

Como usuario, quiero ver mi actividad histórica.

GET /usuarios/{id}/actividad?desde=&hasta= devuelve la XP ganada por día en el rango.

Incluye la cantidad de lecciones completadas por día.

Los días sin actividad aparecen con XP en 0 (para poder dibujar el heatmap).

deja los ends points consumibles comentados que despues yo los modifico

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d858d4f-72ab-47b6-a6fe-75a3e9a86ad8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
