#El middleware es un bloque de código intermedio que actúa como un "filtro" o "aduana" en el servidor. Se ejecuta antes de que una petición HTTP llegue a tus routers y después de que tu router genere una respuesta, justo antes de enviarla al cliente.

#¿Cómo funciona en el flujo de una petición?
#    Cliente (Frontend) ---> [ MIDDLEWARE ] ---> Router / Service (Tu código)
#    Cliente (Frontend) <--- [ MIDDLEWARE ] <--- Respuesta JSON
#    Entrada: La petición llega al servidor. El middleware la intercepta, analiza sus datos (encabezados, IP, tokens) y decide si la deja pasar o la rebota.

#Procesamiento: Si pasa la aduana, tu router procesa la lógica del negocio (ej. guardar un usuario).

#Salida: Antes de enviar la respuesta al frontend, el middleware puede volver a interceptarla para modificarla (por ejemplo, agregando encabezados de seguridad como CORS o midiendo el tiempo de respuesta).

#Casos de uso comunes de un Middleware
#Manejo global de errores (Error Handling): Captura cualquier excepción que ocurra en cualquier punto de la app para que el servidor no colapse y responda con un JSON estructurado.

#Seguridad y Autenticación: Verifica si la petición incluye un token JWT válido antes de dejarla entrar a rutas privadas.

#CORS: Inspecciona si el dominio del frontend que hace la consulta tiene permiso para comunicarse con la API.

#Logging y Auditoría: Registra en la consola la hora, la dirección IP y la ruta consultada cada vez que alguien hace una petición HTTP.