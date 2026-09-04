import traceback
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from src.db.connection import get_db
from src.dtos.pago_dto import CrearPagoDTO
from src.services.pago_service import PagoService

router_pago = APIRouter(prefix="/pagos", tags=["Pagos y Suscripciones"])

def get_pago_service(db: Session = Depends(get_db)) -> PagoService:
    return PagoService(db)

@router_pago.post("/crear-preferencia", status_code=status.HTTP_200_OK)
def crear_preferencia(dto: CrearPagoDTO, service: PagoService = Depends(get_pago_service)):
    try:
        return service.crear_preferencia_suscripcion(dto.usuario_id, dto.email, dto.plan)
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router_pago.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook_mercado_pago(request: Request, service: PagoService = Depends(get_pago_service)):
    try:
        params = request.query_params
        topic = params.get("topic") or params.get("type")
        payment_id = params.get("data.id") or params.get("id")

        if topic and payment_id:
            service.procesar_webhook(topic, payment_id)

        return {"status": "ok"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router_pago.post("/activar-manual/{usuario_id}", status_code=status.HTTP_200_OK)
def activar_premium_manual(usuario_id: int, service: PagoService = Depends(get_pago_service)):
    try:
        return service.activar_premium_usuario(usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))