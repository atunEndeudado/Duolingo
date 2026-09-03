from src.db.models.preguntas_model import Pregunta
from src.dtos.pregunta_dto import CreatePreguntaDTO, PreguntaResponseDTO
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

        texto_origen = dto.pregunta.strip()
        try:
            if dto.direccion == "nativo_a_curso":
                pregunta_texto = texto_origen
                respuesta = traducir_terminos(texto_origen, src="es", dest=codigo_idioma)
            else:
                pregunta_texto = texto_origen
                respuesta = traducir_terminos(texto_origen, src=codigo_idioma, dest="es")
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
 
    def listar_preguntas_de_leccion(self, leccion_id: int) -> list[PreguntaResponseDTO]:
        return [to_pregunta_response(p) for p in self.repository.listar_por_leccion(leccion_id)]

    def eliminar_pregunta(self, pregunta_id: int) -> None:
        pregunta = self.repository.obtener_por_id(pregunta_id)
        if not pregunta:
            raise ValueError("Pregunta inexistente")
        self.repository.eliminar(pregunta)
