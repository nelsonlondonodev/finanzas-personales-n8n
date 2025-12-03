// =================================================================================
// CONSTANTES Y CONFIGURACIÓN GLOBAL
// =================================================================================

/**
 * @description Centraliza las referencias a los elementos del DOM para fácil acceso y mantenimiento.
 */
const UI_ELEMENTS = {
  balance: document.getElementById("display-balance"),
  income: document.getElementById("display-income"),
  expense: document.getElementById("display-expense"),
  transactionsList: document.getElementById("transactions-list"),
  tasksList: document.getElementById("tasks-list"),
  taskCount: document.getElementById("task-count"),
  refreshIcon: document.getElementById("refresh-icon"),
  errorModal: document.getElementById("error-modal"),
  errorMessage: document.getElementById("error-message"),
};

/**
 * @description Formateador de moneda para Europa (España).
 */
const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/**
 * @description Datos simulados para el modo de demostración.
 */
const mockData = {
  balance: 12500.75,
  income: 3500.0,
  expenses: 2250.25,
  transactions: [
    { id: 1, type: "gasto", concept: "Supermercado", amount: 150.5, date: "Hoy, 10:30 AM", category: "Comida" },
    { id: 2, type: "ingreso", concept: "Pago Cliente A", amount: 400.0, date: "Ayer, 04:15 PM", category: "Trabajo" },
    { id: 3, type: "gasto", concept: "Pago Internet", amount: 80.0, date: "Ayer, 09:00 AM", category: "Servicios" },
  ],
  tasks: [
    { id: 1, text: "Revisar presupuesto mensual", done: false },
    { id: 2, text: "Pagar tarjeta de crédito", done: true },
  ],
};


// =================================================================================
// RENDERIZADO DE COMPONENTES DE LA UI
// =================================================================================

function renderizarResumenFinanciero({ balance, income, expenses }) {
  UI_ELEMENTS.balance.innerText = formatoMoneda.format(balance);
  UI_ELEMENTS.income.innerText = formatoMoneda.format(income);
  UI_ELEMENTS.expense.innerText = formatoMoneda.format(expenses);
}

function crearElementoTransaccion(tx) {
  const isExpense = tx.type === "gasto";
  const icon = isExpense ? "arrow-down-circle" : "arrow-up-circle";
  const colorClass = isExpense ? "text-red-500" : "text-green-500";
  const amountSign = isExpense ? "-" : "+";
  const bgClass = isExpense ? "bg-red-100" : "bg-green-100";

  return `
    <div class="p-4 hover:bg-gray-50 flex justify-between items-center transition">
      <div class="flex items-center gap-3">
        <div class="${bgClass} p-2 rounded-full">
          <i data-lucide="${icon}" class="w-5 h-5 ${colorClass}"></i>
        </div>
        <div>
          <p class="font-medium text-gray-800">${tx.concept}</p>
          <p class="text-xs text-gray-400">${tx.date} • ${tx.category}</p>
        </div>
      </div>
      <span class="font-bold ${colorClass}">${amountSign}${formatoMoneda.format(tx.amount)}</span>
    </div>`;
}

function renderizarTransacciones(transacciones) {
  UI_ELEMENTS.transactionsList.innerHTML = transacciones.length
    ? transacciones.map(crearElementoTransaccion).join("")
    : '<div class="p-4 text-center text-gray-400">No hay movimientos recientes.</div>';
}

function crearElementoTarea(tarea) {
  return `
    <div class="flex items-center gap-3 group">
      <div class="relative flex items-center">
        <input type="checkbox" ${tarea.done ? "checked" : ""} 
          class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-primary checked:bg-primary hover:border-primary focus:outline-none transition-all">
        <i data-lucide="check" class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100"></i>
      </div>
      <span class="text-sm text-gray-700 ${tarea.done ? "line-through text-gray-400" : ""}">${tarea.text}</span>
    </div>`;
}

function renderizarTareas(tareas) {
  const pending = tareas.filter((t) => !t.done).length;
  UI_ELEMENTS.taskCount.innerText = pending;
  UI_ELEMENTS.tasksList.innerHTML = tareas.length
    ? tareas.map(crearElementoTarea).join("")
    : '<div class="p-4 text-center text-gray-400">No hay tareas pendientes.</div>';
}

function actualizarDashboard(data) {
  renderizarResumenFinanciero(data);
  renderizarTransacciones(data.transactions);
  renderizarTareas(data.tasks);
  lucide.createIcons(); // Re-renderizar iconos
}

// =================================================================================
// HELPERS DE UI Y LÓGICA DE DATOS
// =================================================================================

/**
 * @description Controla la animación del icono de refrescar.
 * @param {boolean} isLoading - El estado de carga.
 */
function setLoading(isLoading) {
  UI_ELEMENTS.refreshIcon.classList.toggle("animate-spin", isLoading);
}

/**
 * @description Muestra el modal de error con un mensaje específico.
 * @param {string} message - El mensaje de error a mostrar.
 */
function showErrorModal(message) {
  UI_ELEMENTS.errorMessage.innerText = message;
  UI_ELEMENTS.errorModal.classList.remove("hidden");
}

/**
 * @description Realiza la petición fetch al webhook de n8n.
 * @returns {Promise<object>} Los datos del dashboard.
 * @throws {Error} Si la respuesta de la red no es exitosa.
 */
async function fetchN8nData() {
    // Las variables N8N_WEBHOOK_URL y N8N_API_KEY se esperan del archivo config.js
  const url = typeof N8N_WEBHOOK_URL !== 'undefined' ? N8N_WEBHOOK_URL : '';
  const apiKey = typeof N8N_API_KEY !== 'undefined' ? N8N_API_KEY : '';

  if (!url.startsWith("http")) {
    throw new Error("La URL del webhook de n8n no está configurada.");
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Error en la respuesta de n8n: ${response.statusText} (${response.status})`);
  }
  return response.json();
}

/**
 * @description Retorna los datos simulados tras un breve retraso para emular una llamada de red.
 * @returns {Promise<object>} Los datos simulados.
 */
function getMockData() {
  console.log("Modo Demo: Usando datos simulados.");
  return new Promise((resolve) => setTimeout(() => resolve(mockData), 800));
}

// =================================================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN
// =================================================================================

/**
 * @description Carga los datos del dashboard, ya sea desde n8n o usando datos simulados como fallback.
 */
async function cargarDatos() {
  setLoading(true);
  try {
    const data = await fetchN8nData();
    actualizarDashboard(data);
  } catch (error) {
    console.error("Error al cargar datos de n8n:", error);
    showErrorModal("No se pudieron cargar los datos desde el servidor. Mostrando datos de demostración.");
    // Fallback a datos de demostración si la carga desde n8n falla
    const data = await getMockData();
    actualizarDashboard(data);
  } finally {
    setLoading(false);
  }
}

// =================================================================================
// INICIALIZACIÓN
// =================================================================================

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  cargarDatos();
});