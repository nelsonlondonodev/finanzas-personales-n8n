# Dashboard de Finanzas y Tareas

Un sencillo dashboard de una sola página para visualizar un resumen financiero (ingresos, gastos, saldo) y una lista de tareas pendientes. El proyecto está construido con HTML, Tailwind CSS y JavaScript puro, y está diseñado para conectarse con un webhook de n8n para obtener los datos.

## ✨ Características

-   **Resumen Financiero:** Visualiza el saldo disponible, los ingresos del mes y los gastos del mes.
-   **Últimos Movimientos:** Lista las transacciones recientes, diferenciando entre ingresos y gastos.
-   **Gestor de Tareas:** Muestra una lista de tareas pendientes.
-   **Diseño Limpio:** Interfaz moderna y responsiva creada con Tailwind CSS.
-   **Dos Modos de Funcionamiento:**
    1.  **Modo Demo:** Funciona sin necesidad de configuración, utilizando datos de ejemplo.
    2.  **Modo n8n:** Se conecta a un webhook de n8n para mostrar datos reales.

## 🛠️ Tecnologías Utilizadas

-   HTML5
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Lucide Icons](https://lucide.dev/)
-   JavaScript (Vanilla)
-   [n8n](https://n8n.io/) (para el backend y la automatización)

## 🚀 Instalación y Configuración

Este proyecto no requiere un proceso de compilación. Simplemente abre el archivo `dashboard.html` en tu navegador.

### Modo Demo

Por defecto, el dashboard se iniciará en "Modo Demo" y mostrará datos de ejemplo. No necesitas hacer nada para que esto funcione.

### Modo n8n (Conexión con Datos Reales)

Para conectar el dashboard a tu propio flujo de n8n, sigue estos pasos:

1.  **Crea un archivo `config.js`** en la raíz del proyecto.
2.  **Copia el siguiente contenido** en tu archivo `config.js`:

    ```javascript
    // Pega aquí la URL de tu Webhook de n8n.
    const N8N_WEBHOOK_URL = "URL_DE_TU_WEBHOOK";
    ```

3.  **Reemplaza `"URL_DE_TU_WEBHOOK"`** con la URL real de tu webhook de n8n.

El dashboard detectará automáticamente el archivo `config.js` y lo usará para obtener los datos en lugar de los datos de ejemplo.

## 🔐 Nota de Seguridad

La variable `N8N_WEBHOOK_URL` se carga en el frontend. Esto significa que cualquier persona que visite tu página puede ver la URL de tu webhook en el código fuente del navegador.

Para una mayor seguridad en un entorno de producción, se recomienda implementar un backend que actúe como un proxy. El frontend llamaría a tu backend, y tu backend llamaría de forma segura al webhook de n8n, sin exponer la URL al público.
