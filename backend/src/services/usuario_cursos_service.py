from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from src.db.models.usuario_cursos_model import Usuario_cursos
from src.dtos.usuario_cursos_dto import CreateUsuarioCursoDTO, UsuarioCursoResponseDTO
from src.mappers.usuario_cursos_mapper import to_usuario_curso_response
from src.repositories.usuario_cursos_repository import UsuarioCursoRepository
from src.repositories.usuario_repository import UsuarioRepository
from src.repositories.curso_repository import CursoRepository
 
 
class UsuarioCursoService:
    def __init__(self, db: Session):
        self.repository = UsuarioCursoRepository(db)
        self.usuario_repository = UsuarioRepository(db)
        self.curso_repository = CursoRepository(db)
    def inscribir(self, dto: CreateUsuarioCursoDTO) -> UsuarioCursoResponseDTO:
        if self.repository.obtener(dto.usuario_id, dto.curso_id):
            raise ValueError("El usuario ya está inscripto en ese curso")
        if not self.usuario_repository.obtener_por_id(dto.usuario_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"El usuario con ID {dto.usuario_id} no existe.")
        if not self.curso_repository.obtener_por_id(dto.curso_id):
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"El curso con ID {dto.curso_id} no existe.")
        inscripcion = Usuario_cursos(usuario_id=dto.usuario_id, curso_id=dto.curso_id)
        inscripcion = self.repository.crear(inscripcion)
        return to_usuario_curso_response(inscripcion)
 
    def listar_cursos_de_usuario(self, usuario_id: int) -> list[UsuarioCursoResponseDTO]:
        return [to_usuario_curso_response(i) for i in self.repository.listar_por_usuario(usuario_id)]