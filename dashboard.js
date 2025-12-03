// =================================================================================
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// =================================================================================

/**
 * @description Formateador de moneda para Europa (España).
 * Se define globalmente para evitar su redeclaración en cada renderizado.
 */
const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * @description Datos simulados para el modo de demostración.
 * Se usa cuando no se puede conectar con n8n.
 */
const mockData = {
  balance: 12500.75,
  income: 3500.0,
  expenses: 2250.25,
  transactions: [
    { id: 1, type: "gasto", concept: "Supermercado", amount: 150.5, date: "Hoy, 10:30 AM", category: "Comida" },
    { id: 2, type: "ingreso", concept: "Pago Cliente A", amount: 400.0, date: "Ayer, 04:15 PM", category: "Trabajo" },
    { id: 3, type: "gasto", concept: "Pago Internet", amount: 80.0, date: "Ayer, 09:00 AM", category: "Servicios" },
    { id: 4, type: "gasto", concept: "Almuerzo", amount: 25.0, date: "28 Nov", category: "Comida" },
  ],
  tasks: [
    { id: 1, text: "Revisar presupuesto mensual", done: false },
    { id: 2, text: "Pagar tarjeta de crédito", done: false },
    { id: 3, text: "Enviar reporte semanal", done: true },
  ],
};

// =================================================================================
// RENDERIZADO DE COMPONENTES DE LA UI
// =================================================================================

/**
 * @description Actualiza las tarjetas de resumen financiero en el DOM.
 * @param {object} data - Contiene los datos financieros { balance, income, expenses }.
 */
function renderizarResumenFinanciero({ balance, income, expenses }) {
  document.getElementById("display-balance").innerText = formatoMoneda.format(balance);
  document.getElementById("display-income").innerText = formatoMoneda.format(income);
  document.getElementById("display-expense").innerText = formatoMoneda.format(expenses);
}

/**
 * @description Crea el elemento HTML para una única transacción.
 * @param {object} tx - El objeto de la transacción.
 * @returns {string} El string HTML del elemento de la transacción.
 */
function crearElementoTransaccion(tx) {
  const isExpense = tx.type === "gasto";
  const icon = isExpense ? "arrow-down-circle" : "arrow-up-circle";
  const colorClass = isExpense ? "text-red-500" : "text-green-500";
  const amountSign = isExpense ? "-" : "+";
  const bgClass = isExpense ? "bg-red-100 dark:bg-red-500/10" : "bg-green-100 dark:bg-green-500/10";

  return `
    <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center transition">
        <div class="flex items-center gap-3">
            <div class="${bgClass} p-2 rounded-full">
                <i data-lucide="${icon}" class="w-5 h-5 ${colorClass}"></i>
            </div>
            <div>
                <p class="font-medium text-gray-800 dark:text-gray-200">${tx.concept}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">${tx.date} • ${tx.category}</p>
            </div>
        </div>
        <span class="font-bold ${colorClass}">${amountSign}${formatoMoneda.format(tx.amount)}</span>
    </div>
  `;
}

/**
 * @description Renderiza la lista completa de transacciones en el DOM.
 * @param {Array<object>} transacciones - Un array de objetos de transacción.
 */
function renderizarTransacciones(transacciones) {
  const txList = document.getElementById("transactions-list");
  txList.innerHTML = ""; // Limpiar lista anterior

  if (transacciones.length === 0) {
    txList.innerHTML = '<div class="p-4 text-center text-gray-400 dark:text-gray-500">No hay movimientos recientes.</div>';
    return;
  }

  transacciones.forEach((tx) => {
    txList.innerHTML += crearElementoTransaccion(tx);
  });
}

/**
 * @description Crea el elemento HTML para una única tarea.
 * @param {object} tarea - El objeto de la tarea.
 * @returns {string} El string HTML del elemento de la tarea.
 */
function crearElementoTarea(tarea) {
  return `
    <div class="flex items-center gap-3 group">
        <div class="relative flex items-center">
            <input type="checkbox" ${tarea.done ? "checked" : ""} 
                class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 dark:border-gray-600 shadow-sm checked:border-primary checked:bg-primary hover:border-primary focus:outline-none transition-all">
            <i data-lucide="check" class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100"></i>
        </div>
        <span class="text-sm text-gray-700 dark:text-gray-300 ${tarea.done ? "line-through text-gray-400 dark:text-gray-500" : ""}">${tarea.text}</span>
    </div>
  `;
}

/**
 * @description Renderiza la lista completa de tareas en el DOM.
 * @param {Array<object>} tareas - Un array de objetos de tarea.
 */
function renderizarTareas(tareas) {
  const tasksList = document.getElementById("tasks-list");
  const taskCount = document.getElementById("task-count");
  tasksList.innerHTML = ""; // Limpiar lista anterior

  const pending = tareas.filter((t) => !t.done).length;
  taskCount.innerText = pending;

  if (tareas.length === 0) {
    tasksList.innerHTML = '<div class="p-4 text-center text-gray-400 dark:text-gray-500">No hay tareas pendientes.</div>';
    return;
  }

  tareas.forEach((tarea) => {
    tasksList.innerHTML += crearElementoTarea(tarea);
  });
}


// =================================================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN
// =================================================================================

/**
 * @description Orquestador principal que actualiza todos los componentes de la UI.
 * @param {object} data - El objeto de datos principal con toda la información del dashboard.
 */
function actualizarDashboard(data) {
  renderizarResumenFinanciero(data);
  renderizarTransacciones(data.transactions);
  renderizarTareas(data.tasks);

  // Re-inicializar los iconos de Lucide para que se muestren los nuevos iconos
  lucide.createIcons();
}



/**
 * @description Carga los datos desde el webhook de n8n o usa los datos simulados.
 * Maneja el estado de carga y los errores.
 */
async function cargarDatos() {
  const refreshIcon = document.getElementById("refresh-icon");
  refreshIcon.classList.add("animate-spin");

  try {
    let data;
    // Usar 'typeof' para evitar errores si 'config.js' no existe o la variable no está definida
    if (typeof N8N_WEBHOOK_URL !== 'undefined' && N8N_WEBHOOK_URL.startsWith("http")) {
      // --- CAMBIO AQUÍ ---
      // Configuramos las opciones de la petición para incluir la cabecera
      const opciones = {
        method: "GET", // Opcional, por defecto es GET
        headers: {
          "Content-Type": "application/json",
          // Aquí inyectamos la llave que definimos en config.js
          "x-api-key": typeof N8N_API_KEY !== 'undefined' ? N8N_API_KEY : "" 
        }
      };

      // Pasamos las 'opciones' al fetch
      const response = await fetch(N8N_WEBHOOK_URL, opciones);
      // -------------------
      if (!response.ok) throw new Error(`Error en la respuesta de n8n: ${response.statusText}`);
      data = await response.json();
    } else {
      console.log("Modo Demo: Usando datos simulados.");
      await new Promise((r) => setTimeout(r, 800)); // Simular retraso de red
      data = mockData;
    }
    actualizarDashboard(data);
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    document.getElementById("error-message").innerText = "No se pudieron cargar los datos. Verifica que el webhook de n8n esté activo y la URL sea correcta.";
    document.getElementById("error-modal").classList.remove("hidden");
    // Como fallback, se muestran los datos de demostración para no dejar la UI vacía
    console.log("Mostrando datos de demostración como fallback por error de conexión.");
    actualizarDashboard(mockData);
  } finally {
    // Detener la animación del icono de refrescar en cualquier caso
    refreshIcon.classList.remove("animate-spin");
  }
}

// =================================================================================
// INICIALIZACIÓN
// =================================================================================

/**
 * @description Punto de entrada de la aplicación. Se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons(); // Inicializar iconos estáticos al cargar la página
  cargarDatos(); // Cargar los datos del dashboard
});
