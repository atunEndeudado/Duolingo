#Importar librerias y archivos necesarios
from fastapi import FastAPI
from src.middlewares.error_middleware import app_error_handler
from src.routers import auth_router, usuario_router, curso_router, idioma_router, insignias_router,leccion_router,pregunta_router,usuario_cursos_router, usuario_insignias_router,vocabulario_router
from src.utils.errors import AppError
 
app = FastAPI(title="Tubolingo API")

# Incluir las rutas de autenticación
app.include_router(usuario_router.router_usuarios, prefix="/api")
app.include_router(auth_router.router_auth, prefix="/api")
app.include_router(curso_router.router_cursos, prefix="/api")
app.include_router(idioma_router.router_idiomas, prefix="/api")
app.include_router(insignias_router.router_insignias, prefix="/api")
app.include_router(leccion_router.router_lecciones, prefix="/api")
app.include_router(pregunta_router.router_preguntas, prefix="/api")
app.include_router(usuario_cursos_router.router_usuario_cursos, prefix="/api")
app.include_router(usuario_insignias_router.router_usuario_insignias, prefix="/api")
app.include_router(vocabulario_router.router_vocabulario, prefix="/api")

app.add_exception_handler(AppError, app_error_handler) #type: ignore
#CUIDADO: app_error_handler esta programado para recibir exclusivamente AppError, pero FastAPI espera recibir tambien Exception. Con #type: ignore hago que el error no se marque, pero en caso de traer problemas, reemplazar el def del handler con error_middleware_suplente.py. con el if con isinstance el handler incluye tambien exceptions, pero por la programacion del handler no deberia ser necesario.

#Chequea status de la API
@app.get("/health")
def health():
    return {"status": "ok"}