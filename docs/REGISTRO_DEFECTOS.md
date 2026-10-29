# Etapa 7: Registro y Seguimiento de Defectos (Bug Tracker)

**Proyecto:** LogiTrack API  
**Integrantes:** Vivas Guillermo - Cuello Joaquin  

A continuación se documentan los defectos identificados durante los ciclos de verificación, pruebas de caja negra, pruebas de límites y pruebas de integración.

---

### Defecto #1: DEF-001 - Falta de rechazo en dimensiones límite frontera (150.1 cm)
* **ID del defecto:** DEF-001
* **Fecha:** 2026-10-15
* **Funcionalidad afectada:** Admisión y Tarifación (`validarLimitesFisicos` / `admisionSchema`)
* **Descripción:** Al enviar un paquete con una dimensión superior a 150 cm (ej. alto = 150.1 cm), el sistema aceptaba la carga debido a una validación con redondeo truncado (`Math.floor`) en lugar del valor flotante exacto.
* **Pasos para reproducirlo:**
  1. Enviar petición `POST /api/encomiendas/admitir`.
  2. En el cuerpo JSON enviar `"alto": 150.1`, `"ancho": 50`, `"largo": 50`, `"pesoReal": 10`.
  3. Observar la respuesta HTTP.
* **Resultado esperado:** Código HTTP `400 Bad Request` con mensaje de error `"El alto no puede superar los 150 cm"`.
* **Resultado obtenido:** Código HTTP `201 Created` y paquete admitido incorrectamente.
* **Severidad:** Alta (incumple restricción física del flete).
* **Prioridad:** Alta.
* **Estado:** **RESUELTO** (Corregido ajustando la regla de validación en Zod y en `validarLimitesFisicos`).

---

### Defecto #2: DEF-002 - Error en asignación de vehículo en frontera exacta de 20 kg
* **ID del defecto:** DEF-002
* **Fecha:** 2026-10-15
* **Funcionalidad afectada:** Asignación de Flota (`asignarVehiculo`)
* **Descripción:** Un paquete con peso facturable exactamente igual a 20.0 kg era asignado a `CAMION` en lugar de `UTILITARIO` debido a una condición estricta `< 20` en lugar de `<= 20`.
* **Pasos para reproducirlo:**
  1. Crear encomienda con peso facturable de 20.0 kg.
  2. Ejecutar despacho automático.
* **Resultado esperado:** Vehículo asignado `UTILITARIO` (rango $5\text{ kg}$ a $20\text{ kg}$).
* **Resultado obtenido:** Vehículo asignado `CAMION`.
* **Severidad:** Media (asigna vehículo de mayor costo operativo de forma errónea).
* **Prioridad:** Media.
* **Estado:** **RESUELTO** (Se corrigió el operador condicional a `<= REGLAS_ASIGNACION.UTILITARIO.PESO_MAXIMO`).

---

### Defecto #3: DEF-003 - Reintegro nulo en indemnización al reportar siniestro con cero horas de demora
* **ID del defecto:** DEF-003
* **Fecha:** 2026-10-15
* **Funcionalidad afectada:** Gestión de Entregas e Indemnizaciones (`calcularIndemnizacion`)
* **Descripción:** Si un paquete era marcado como `SINIESTRADO` pero la notificación ocurría dentro del plazo garantizado (0 horas de mora), la condición inicial evaluaba primero las horas de demora (`horasDemora === 0`) antes del siniestro, retornando reintegro $0\%$.
* **Pasos para reproducirlo:**
  1. Ejecutar entrega con `estadoFinal: "SINIESTRADO"` y `horasDemora: 0`.
* **Resultado esperado:** Reintegro del 100% del flete + indemnización del seguro declarado.
* **Resultado obtenido:** Total indemnizado: $0.
* **Severidad:** Crítica (incumplimiento contractual y legal ante siniestros).
* **Prioridad:** Alta.
* **Estado:** **RESUELTO** (Se priorizó la condición `estadoFinal === 'SINIESTRADO' || horasDemora > 48` en la primera instrucción de decisión).
