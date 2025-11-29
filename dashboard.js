      // Inicializar Iconos
      lucide.createIcons();

      // ==========================================
      // CONFIGURACIÓN IMPORTANTE
      // ==========================================
      // Cuando configures tu n8n, pondrás aquí la URL de tu Webhook.
      // Por ahora, déjalo vacío para usar el "Modo Demostración".
      const N8N_WEBHOOK_URL =
        "https://n8n.srv1033442.hstgr.cloud/webhook/dashboard-finanzas";
      // ==========================================

      // Datos simulados (Mock Data) para cuando no hay conexión a n8n
      const mockData = {
        balance: 1250000,
        income: 3500000,
        expenses: 2250000,
        transactions: [
          {
            id: 1,
            type: "gasto",
            concept: "Supermercado",
            amount: 150000,
            date: "Hoy, 10:30 AM",
            category: "Comida",
          },
          {
            id: 2,
            type: "ingreso",
            concept: "Pago Cliente A",
            amount: 400000,
            date: "Ayer, 04:15 PM",
            category: "Trabajo",
          },
          {
            id: 3,
            type: "gasto",
            concept: "Pago Internet",
            amount: 80000,
            date: "Ayer, 09:00 AM",
            category: "Servicios",
          },
          {
            id: 4,
            type: "gasto",
            concept: "Almuerzo",
            amount: 25000,
            date: "28 Nov",
            category: "Comida",
          },
        ],
        tasks: [
          { id: 1, text: "Revisar presupuesto mensual", done: false },
          { id: 2, text: "Pagar tarjeta de crédito", done: false },
          { id: 3, text: "Enviar reporte semanal", done: true },
        ],
      };

      // Función principal para cargar datos
      async function cargarDatos() {
        const refreshIcon = document.getElementById("refresh-icon");
        refreshIcon.classList.add("animate-spin"); // Animación de carga

        try {
          let data;

          if (N8N_WEBHOOK_URL && N8N_WEBHOOK_URL.startsWith("http")) {
            // Si hay URL configurada, intentamos conectar a n8n
            const response = await fetch(N8N_WEBHOOK_URL);
            if (!response.ok) throw new Error("Error al conectar con n8n");
            data = await response.json();
          } else {
            // Si no hay URL, usamos datos de prueba (Simulación)
            console.log("Modo Demo: Usando datos simulados");
            // Simulamos un retraso de red de 1 segundo
            await new Promise((r) => setTimeout(r, 800));
            data = mockData;
          }

          actualizarUI(data);
        } catch (error) {
          console.error("Error:", error);
          document.getElementById("error-message").innerText =
            "Verifica que tu flujo de n8n esté activo y la URL sea correcta.";
          document.getElementById("error-modal").classList.remove("hidden");
        } finally {
          refreshIcon.classList.remove("animate-spin");
        }
      }

      // Función para pintar los datos en pantalla
      function actualizarUI(data) {
        // Formateador de moneda para Europa (España)
        const formatoMoneda = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2, // Asegura que siempre muestre céntimos
          maximumFractionDigits: 2,
        });

        // 1. Actualizar Tarjetas
        document.getElementById("display-balance").innerText =
          formatoMoneda.format(data.balance);
        document.getElementById("display-income").innerText =
          formatoMoneda.format(data.income);
        document.getElementById("display-expense").innerText =
          formatoMoneda.format(data.expenses);

        // 2. Actualizar Lista de Transacciones
        const txList = document.getElementById("transactions-list");
        txList.innerHTML = "";

        data.transactions.forEach((tx) => {
          const isExpense = tx.type === "gasto";
          const icon = isExpense ? "arrow-down-circle" : "arrow-up-circle";
          const colorClass = isExpense ? "text-red-500" : "text-green-500";
          const amountSign = isExpense ? "-" : "+";

          const html = `
                    <div class="p-4 hover:bg-gray-50 flex justify-between items-center transition">
                        <div class="flex items-center gap-3">
                            <div class="${
                              isExpense ? "bg-red-100" : "bg-green-100"
                            } p-2 rounded-full">
                                <i data-lucide="${icon}" class="w-5 h-5 ${colorClass}"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-800">${
                                  tx.concept
                                }</p>
                                <p class="text-xs text-gray-400">${tx.date} • ${
            tx.category
          }</p>
                            </div>
                        </div>
                        <span class="font-bold ${colorClass}">${amountSign}${formatoMoneda.format(
            tx.amount
          )}</span>
                    </div>
                `;
          txList.innerHTML += html;
        });

        // 3. Actualizar Lista de Tareas
        const tasksList = document.getElementById("tasks-list");
        const taskCount = document.getElementById("task-count");
        tasksList.innerHTML = "";

        // Contar pendientes
        const pending = data.tasks.filter((t) => !t.done).length;
        taskCount.innerText = pending;

        data.tasks.forEach((task) => {
          const html = `
                    <div class="flex items-center gap-3 group">
                        <div class="relative flex items-center">
                            <input type="checkbox" ${
                              task.done ? "checked" : ""
                            } 
                                class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm checked:border-primary checked:bg-primary hover:border-primary focus:outline-none transition-all">
                            <i data-lucide="check" class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100"></i>
                        </div>
                        <span class="text-sm text-gray-700 ${
                          task.done ? "line-through text-gray-400" : ""
                        }">${task.text}</span>
                    </div>
                `;
          tasksList.innerHTML += html;
        });

        // Re-inicializar iconos para los nuevos elementos insertados
        lucide.createIcons();
      }

      // Cargar al iniciar
      document.addEventListener("DOMContentLoaded", cargarDatos);
