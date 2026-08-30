"""async def app_error_handler(request: Request, exc: Exception):
    if isinstance(exc, AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.__class__.__name__, "message": exc.message},
        )
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": "Error interno del servidor"},
    )
    """