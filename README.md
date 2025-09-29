PayJoy Reviews (MVP)

Este proyecto es una aplicación mínima desarrollada con Next.js (App Router) que permite recoger opiniones de clientes en las tiendas de PayJoy y reenviar los datos a un webhook. La aplicación ofrece un formulario de feedback en /feedback?store=<ID_DE_TIENDA> para que los usuarios califiquen su experiencia y se implementa un API backend para validar y enviar los datos.

Características

Next.js: utiliza la App Router de Next.js, con metadata y un layout que define la fuente y colores básicos
raw.githubusercontent.com
.

Página de inicio: la ruta raíz muestra un enlace al formulario y explica cómo acceder a él
raw.githubusercontent.com
.

Redirección /form → /feedback: mediante un middleware se redirige cualquier visita a /form hacia /feedback conservando los parámetros de query
raw.githubusercontent.com
.

Formulario interactivo: la página /feedback carga un componente cliente (FeedbackClient) que muestra:

Calificación de 1 a 5 estrellas.

Net Promoter Score (0–10).

Motivo principal (espera, pago, precio, atención, garantía, disponibilidad u otro)
raw.githubusercontent.com
.

Tiempo de espera, tipo de trámite, si el trámite se resolvió, nombre del asesor, nombre y contacto del cliente y un comentario
raw.githubusercontent.com
raw.githubusercontent.com
.

Validación en el cliente: antes de enviar, se valida que todos los campos necesarios se hayan completado, mostrando alertas en caso contrario
raw.githubusercontent.com
raw.githubusercontent.com
.

API de reviews: la ruta POST /api/review recibe el feedback, realiza validaciones mínimas (store_id y que la calificación esté entre 1 y 5)
raw.githubusercontent.com
, limpia PII en el comentario sustituyendo teléfonos y correos
raw.githubusercontent.com
, construye un payload con los datos del cliente
raw.githubusercontent.com
 y lo reenvía a la URL definida en la variable de entorno N8N_WEBHOOK_URL
raw.githubusercontent.com
. Si no se define N8N_WEBHOOK_URL, la API devuelve el payload para pruebas locales
raw.githubusercontent.com
.

Limpieza y mensajes: después del envío se limpian los campos del formulario y se muestra un mensaje de agradecimiento o error según la respuesta del servidor
raw.githubusercontent.com
raw.githubusercontent.com
.

Instalación y uso local

Clonar el repositorio:

git clone https://github.com/danieleconomist99/payjoy-reviews.git
cd payjoy-reviews


Instalar dependencias:

npm install


Configurar variables de entorno (opcional):

Cree un archivo .env.local en la raíz con la variable N8N_WEBHOOK_URL apuntando al webhook de n8n o a otro destino que reciba las reviews.

Si no se configura, la API devolverá un eco con los datos para facilitar pruebas
raw.githubusercontent.com
.

Iniciar en modo desarrollo:

npm run dev


Abra http://localhost:3000/feedback?store=CEN en su navegador para probar el formulario.
Reemplace CEN por el identificador de tienda que desee; el parámetro store se captura automáticamente
raw.githubusercontent.com
.

Despliegue

La aplicación es compatible con el despliegue en plataformas como Vercel. Para desplegar:

Cree un proyecto en Vercel y vincule este repositorio.

Establezca la variable de entorno N8N_WEBHOOK_URL en las configuraciones del proyecto.

Vercel detectará automáticamente la configuración de Next.js e iniciará el despliegue.

La versión en producción se encuentra en payjoy-reviews.vercel.app
.

Estructura del proyecto

/app: contiene la App Router, las páginas page.jsx, layout.jsx y la API en api/review/route.js.

/app/feedback: contiene el componente FeedbackClient.jsx con la lógica del formulario.

middleware.js: redirige /form a /feedback
raw.githubusercontent.com
.

package.json: lista de scripts y dependencias mínimas (Next.js y React)
raw.githubusercontent.com
.

Contribuciones

Este repositorio es un MVP y puede ampliarse para añadir:

Persistencia en base de datos en vez de usar un webhook.

Validaciones más robustas y sanitización del lado del servidor.

Autenticación o permisos para el panel de administración.

Estilos personalizados o integración con bibliotecas de UI.

Se agradecen issues y pull requests para mejorar la aplicación.
