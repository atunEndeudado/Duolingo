from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import mercadopago
from sqlalchemy.orm import Session
from src.db.models.usuario_model import Usuario
from src.db.models.suscripcion_model import Suscripcion

# Reemplaza con tu credencial de Mercado Pago
ACCESS_TOKEN = "PROD_CUSTOM_ACCESS_TOKEN_O_TEST_TOKEN"
sdk = mercadopago.SDK(ACCESS_TOKEN)

PLANES = {
    "mes_1": {"title": "Tubolingo Premium - 1 Mes", "price": 4999.00, "meses": 1},
    "meses_3": {"title": "Tubolingo Premium - 3 Meses", "price": 12999.00, "meses": 3},
    "año_1": {"title": "Tubolingo Premium - 1 Año", "price": 39999.00, "meses": 12},
}

class PagoService:
    def __init__(self, db: Session):
        self.db = db

    def crear_preferencia_suscripcion(self, usuario_id: int, email: str, plan_key: str):
        plan = PLANES.get(plan_key)
        if not plan:
            raise ValueError("Plan no válido")

        preference_data = {
            "items": [
                {
                    "id": plan_key,
                    "title": plan["title"],
                    "quantity": 1,
                    "currency_id": "ARS",
                    "unit_price": plan["price"],
                }
            ],
            "payer": {"email": email},
            "external_reference": f"{usuario_id}:{plan_key}",
            "back_urls": {
                "success": "http://localhost:3000/pago-exitoso",
                "failure": "http://localhost:3000/pago-fallido",
                "pending": "http://localhost:3000/pago-pendiente",
            },
            "auto_return": "approved",
        }

        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        return {
            "preference_id": preference["id"],
            "init_point": preference["init_point"],
            "sandbox_init_point": preference["sandbox_init_point"],
        }

    def procesar_webhook(self, topic: str, payment_id: str):
        if topic in ["payment", "payment.created"]:
            payment_info = sdk.payment().get(payment_id)["response"]

            if payment_info.get("status") == "approved":
                external_ref = payment_info.get("external_reference")  # ej: "1:mes_1"
                usuario_id_str, plan_key = external_ref.split(":")
                usuario_id = int(usuario_id_str)

                plan = PLANES.get(plan_key)
                if not plan:
                    return False

                usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()
                if usuario:
                    ahora = datetime.now(timezone.utc)
                    meses_a_sumar = plan["meses"]

                    # Si ya es premium vigente, extendemos la fecha actual
                    if usuario.suscripcion_hasta and usuario.suscripcion_hasta.tzinfo is None:
                        usuario.suscripcion_hasta = usuario.suscripcion_hasta.replace(tzinfo=timezone.utc)

                    if usuario.suscripcion_hasta and usuario.suscripcion_hasta > ahora:
                        fecha_inicio = usuario.suscripcion_hasta
                    else:
                        fecha_inicio = ahora

                    fecha_fin = fecha_inicio + relativedelta(months=meses_a_sumar)

                    # 1. Actualizar usuario
                    usuario.es_premium = True
                    usuario.suscripcion_hasta = fecha_fin

                    # 2. Guardar registro histórico
                    nueva_sub = Suscripcion(
                        usuario_id=usuario_id,
                        payment_id=str(payment_id),
                        plan=plan_key,
                        monto=plan["price"],
                        estado="aprobado",
                        fecha_inicio=fecha_inicio,
                        fecha_fin=fecha_fin
                    )
                    self.db.add(nueva_sub)
                    self.db.commit()
                    return True
        return False