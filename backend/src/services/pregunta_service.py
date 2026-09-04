from src.db.models.preguntas_model import Pregunta
from src.dtos.pregunta_dto import CreatePreguntaDTO, PreguntaResponseDTO
from src.repositories.vocabulario_repository import VocabularioRepository
from src.mappers.preguntas_mapper import to_pregunta_response
from src.repositories.pregunta_repository import PreguntaRepository
from src.utils.google_translator import traducir_terminos
 
 
class PreguntaService:
    def __init__(self, repository: PreguntaRepository):
        self.repository = repository
 
    def crear_pregunta(self, dto: CreatePreguntaDTO) -> PreguntaResponseDTO:
        if dto.direccion not in {"nativo_a_curso", "curso_a_nativo"}:
            raise ValueError("Dirección de traducción inválida")

        codigo_idioma = self.repository.codigo_idioma_de_leccion(dto.leccion_id)
        if not codigo_idioma:
            raise ValueError("No se pudo determinar el idioma de la lección")
        codigo_idioma = codigo_idioma.strip().lower()

        if dto.tipo == "unir_palabras":
            return self.crear_match_de_vocabulario(dto.leccion_id, codigo_idioma, dto.es_premium)

        texto_base_espanol = dto.pregunta.strip()
        try:
            if dto.direccion == "nativo_a_curso":
                pregunta_texto = texto_base_espanol
                respuesta = traducir_terminos(texto_base_espanol, src="es", dest=codigo_idioma)
            else:
                pregunta_texto = traducir_terminos(texto_base_espanol, src="es", dest=codigo_idioma)
                respuesta = texto_base_espanol
        except Exception as error:
            raise ValueError("No se pudo traducir la pregunta con Google Translator") from error

        pregunta = Pregunta(
            leccion_id=dto.leccion_id,
            orden=self.repository.siguiente_orden(dto.leccion_id),
            pregunta=pregunta_texto,
            respuesta=respuesta,
            tipo=dto.tipo,
            direccion=dto.direccion,
            es_premium=dto.es_premium
        )
        pregunta = self.repository.crear(pregunta)
        return to_pregunta_response(pregunta)

    def crear_match_de_vocabulario(
        self, leccion_id: int, codigo_idioma: str, es_premium: bool = False
    ) -> PreguntaResponseDTO:
        nivel = self.repository.nivel_de_leccion(leccion_id)
        if not nivel:
            raise ValueError("No se pudo determinar el nivel de la lección")
        from src.utils.google_translator import traducir

        palabras = VocabularioRepository(self.repository.db).obtener_aleatorias_por_nivel(nivel, 5)
        if len(palabras) < 5:
            raise ValueError("Se necesitan al menos 5 palabras en el vocabulario de este nivel")
        pares = []
        for palabra in palabras:
            try:
                pares.append({"es": palabra.palabra, "tr": traducir(palabra.palabra, src="es", dest=codigo_idioma)})
            except Exception as error:
                raise ValueError("No se pudo traducir el vocabulario de la lección") from error
        pregunta = Pregunta(
            leccion_id=leccion_id,
            orden=self.repository.siguiente_orden(leccion_id),
            pregunta="Vocabulario de la lección",
            respuesta="",
            tipo="unir_palabras",
            direccion="nativo_a_curso",
            es_premium=es_premium,
            pares=pares,
        )
        return to_pregunta_response(self.repository.crear(pregunta))
 
    def listar_preguntas_de_leccion(
        self,
        leccion_id: int,
        usuario_id: int | None = None,
        incluir_premium: bool = False,
    ) -> list[PreguntaResponseDTO]:
        preguntas = self.repository.listar_por_leccion(leccion_id)
        # Las preguntas Premium nunca se entregan a una cuenta sin Premium.
        # Un administrador sí debe poder verlas para gestionarlas.
        if not incluir_premium and (
            usuario_id is None or not self.repository.usuario_es_premium(usuario_id)
        ):
            preguntas = [pregunta for pregunta in preguntas if not pregunta.es_premium]
        return [to_pregunta_response(pregunta) for pregunta in preguntas]

    def generar_preguntas_de_vocabulario(self, leccion_id: int) -> list[PreguntaResponseDTO]:
        nivel = self.repository.nivel_de_leccion(leccion_id)
        codigo_idioma = self.repository.codigo_idioma_de_leccion(leccion_id)
        if not nivel or not codigo_idioma:
            raise ValueError("No se pudo determinar el curso de la lección")

        from src.utils.google_translator import traducir

        palabras = VocabularioRepository(self.repository.db).obtener_aleatorias_por_nivel(nivel, 5)
        preguntas = []
        for indice, palabra in enumerate(palabras, start=1):
            try:
                traduccion = traducir(palabra.palabra, src="es", dest=codigo_idioma)
            except Exception as error:
                raise ValueError("No se pudo traducir el vocabulario de la lección") from error
            preguntas.append(PreguntaResponseDTO(
                id=-palabra.id,
                leccion_id=leccion_id,
                orden=indice,
                pregunta=palabra.palabra,
                respuesta=traduccion,
                tipo="traducir",
                direccion="nativo_a_curso",
                es_premium=False,
            ))
        return preguntas

    def generar_match_de_vocabulario(
        self, leccion_id: int, es_premium: bool = False
    ) -> PreguntaResponseDTO:
        nivel = self.repository.nivel_de_leccion(leccion_id)
        codigo_idioma = self.repository.codigo_idioma_de_leccion(leccion_id)
        if not nivel or not codigo_idioma:
            raise ValueError("No se pudo determinar el curso de la lección")

        return self.crear_match_de_vocabulario(leccion_id, codigo_idioma, es_premium)

    def eliminar_pregunta(self, pregunta_id: int) -> None:
        pregunta = self.repository.obtener_por_id(pregunta_id)
        if not pregunta:
            raise ValueError("Pregunta inexistente")
        self.repository.eliminar(pregunta)
