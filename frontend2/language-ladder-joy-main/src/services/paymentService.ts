const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_AUTH_API_URL ??
  "http://127.0.0.1:8011/api";

export type PaymentPlan = "mes_1" | "meses_3" | "año_1";

interface PreferenceResponse {
  preference_id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export async function createPaymentPreference(
  usuarioId: string,
  email: string,
  plan: PaymentPlan,
): Promise<PreferenceResponse> {
  const res = await fetch(`${API_URL}/pagos/crear-preferencia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id: Number(usuarioId), email, plan }),
  });

  if (!res.ok) {
    let message = res.statusText || "No se pudo iniciar el pago";
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") message = data.detail;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  return (await res.json()) as PreferenceResponse;
}
