# LogiTrack API - Sistema de Liquidación y Despacho Logístico de Encomiendas

Backend REST desarrollado en Node.js, Express y TypeScript para la gestión, liquidación tarifaria, asignación de flota e indemnizaciones de encomiendas de paquetería y fletes interurbanos.

**Integrantes:**
* Vivas, Guillermo
* Cuello, Joaquín

**Materia:** Control de Calidad y Pruebas de Software / Interfaz de Usuarios (3er Año)

---

## 1. Requisitos Previos

* **Node.js:** Versión 18.x o superior (probado en v22.15.0).
* **npm:** Versión 9.x o superior.
* **MySQL Server:** Versión 8.0 (opcional para desarrollo local; se incluye soporte en memoria para pruebas automáticas).

---

## 2. Instalación y Puesta en Marcha

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd "LogiTrack API"
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copiar el archivo de plantilla `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Ajustar los datos de conexión a MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

4. Inicializar la base de datos (en MySQL):
   Ejecutar el script [`database/init.sql`](database/init.sql).

5. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   * **API REST:** escuchando en `http://localhost:3000/api/encomiendas`.
   * **Frontend SPA Dashboard (Interfaz de Usuarios):** disponible en `http://localhost:3000`.

---

## 3. Endpoints de la API

### 3.1. Health Check
* **Método:** `GET`
* **Ruta:** `/health`
* **Respuesta (200 OK):**
  ```json
  {
    "status": "OK",
    "servicio": "LogiTrack API",
    "timestamp": "2026-10-15T21:00:00.000Z"
  }
  ```

---

### 3.2. Admisión y Tarifación de Encomiendas
Valida las dimensiones y peso, calcula el peso facturable ($\max(\text{pesoReal}, \text{pesoVolumetrico})$), determina la zona y calcula la tarifa total con recargos.

* **Método:** `POST`
* **Ruta:** `/api/encomiendas/admitir`
* **Cuerpo de la petición (JSON):**
  ```json
  {
    "cliente": "Distribuidora Central S.A.",
    "alto": 30,
    "ancho": 40,
    "largo": 50,
    "pesoReal": 8.5,
    "distanciaKm": 120,
    "esFragil": true,
    "esExpress": false,
    "valorDeclarado": 25000
  }
  ```
* **Restricciones de validación:**
  * Ningún lado puede superar los 150 cm.
  * Peso real no puede superar los 40 kg.
  * Dimensiones y distancias mayores a cero.
* **Respuesta exitosa (201 Created):**
  ```json
  {
    "status": "EXITO",
    "mensaje": "Encomienda admitida y tarifada correctamente",
    "datos": {
      "id": 1,
      "codigoSeguimiento": "LOGI-839211-4821",
      "cliente": "Distribuidora Central S.A.",
      "pesoVolumetrico": 12.0,
      "pesoFacturable": 12.0,
      "tipoZona": "PROVINCIAL",
      "tarifaBase": 5300.0,
      "recargoFragil": 795.0,
      "recargoExpress": 0.0,
      "costoTotal": 6095.0,
      "estado": "ADMITIDO"
    }
  }
  ```

---

### 3.3. Asignación de Flota y Despacho
Asigna automáticamente el tipo de vehículo según el peso facturable y fija el plazo de entrega garantizado.

* **Método:** `POST`
* **Ruta:** `/api/encomiendas/despachar`
* **Cuerpo de la petición (JSON):**
  ```json
  {
    "encomiendaId": 1
  }
  ```
* **Reglas de Asignación:**
  * Peso facturable $< 5\text{ kg} \rightarrow$ **MOTO**
  * Peso facturable de $5\text{ kg}$ a $20\text{ kg} \rightarrow$ **UTILITARIO**
  * Peso facturable $> 20\text{ kg} \rightarrow$ **CAMION**
* **Respuesta exitosa (201 Created):**
  ```json
  {
    "status": "EXITO",
    "mensaje": "Encomienda despachada y vehículo asignado exitosamente",
    "datos": {
      "despacho": {
        "id": 1,
        "encomiendaId": 1,
        "vehiculoAsignado": "UTILITARIO",
        "plazoGarantizadoHoras": 48
      },
      "vehiculoAsignado": "UTILITARIO",
      "plazoGarantizadoHoras": 48,
      "estadoNuevo": "EN_TRANSITO"
    }
  }
  ```

---

### 3.4. Registro de Entrega y Liquidación de Indemnizaciones
Registra el cumplimiento de la entrega y calcula la indemnización si hubo mora o siniestro.

* **Método:** `POST`
* **Ruta:** `/api/encomiendas/entregar`
* **Cuerpo de la petición (JSON):**
  ```json
  {
    "despachoId": 1,
    "horasDemora": 30,
    "estadoFinal": "ENTREGADO"
  }
  ```
* **Escala de Indemnizaciones:**
  * $0\text{ horas de demora}: 0\%$
  * $1\text{ a }24\text{ horas}: 20\%$ reintegro sobre el flete.
  * $25\text{ a }48\text{ horas}: 50\%$ reintegro sobre el flete.
  * $> 48\text{ horas}$ o estado `SINIESTRADO`: $100\%$ flete $+$ seguro de valor declarado.
* **Respuesta exitosa (200 OK):**
  ```json
  {
    "status": "EXITO",
    "mensaje": "Entrega registrada y liquidación de indemnización calculada",
    "datos": {
      "entrega": {
        "id": 1,
        "despachoId": 1,
        "horasDemora": 30,
        "estadoFinal": "ENTREGADO",
        "porcentajeReintegro": 50,
        "indemnizacionFlete": 3047.5,
        "indemnizacionSeguro": 0,
        "totalIndemnizado": 3047.5
      },
      "saldoFinalFlete": 3047.5
    }
  }
  ```

---

### 3.5. Consulta de Encomienda por ID
* **Método:** `GET`
* **Ruta:** `/api/encomiendas/:id`
* **Respuesta exitosa (200 OK):** Detalle consolidado de encomienda, despacho y entrega.

---

### 3.6. Listado de Encomiendas (con Filtro Opcional)
Permite listar todas las encomiendas o filtrar por estado operativo (`ADMITIDO`, `EN_TRANSITO`, `ENTREGADO`, `DEVUELTO`, `SINIESTRADO`).

* **Método:** `GET`
* **Ruta:** `/api/encomiendas` (o `/api/encomiendas?estado=ADMITIDO`)
* **Parámetros de consulta (Query params):**
  * `estado` (opcional): Filtro por estado (`ADMITIDO`, `EN_TRANSITO`, `ENTREGADO`, `DEVUELTO`, `SINIESTRADO`).
* **Respuesta exitosa (200 OK):**
  ```json
  {
    "status": "EXITO",
    "datos": [
      {
        "id": 1,
        "codigoSeguimiento": "LOGI-839211-4821",
        "cliente": "Distribuidora Central S.A.",
        "costoTotal": 6095.0,
        "estado": "ADMITIDO"
      }
    ]
  }
  ```

---

### 3.7. Métricas y Estadísticas Globales
Devuelve las estadísticas consolidadas del sistema para paneles de monitoreo y frontend: total de encomiendas, total recaudado en fletes, total indemnizado por demoras o siniestros, y distribución de flota asignada.

* **Método:** `GET`
* **Ruta:** `/api/encomiendas/estadisticas`
* **Respuesta exitosa (200 OK):**
  ```json
  {
    "status": "EXITO",
    "datos": {
      "totalEncomiendas": 4,
      "totalRecaudado": 25400.0,
      "totalRecaudadoFletes": 25400.0,
      "totalIndemnizado": 3500.0,
      "distribucionFlota": {
        "motos": 1,
        "utilitarios": 2,
        "camiones": 1
      }
    }
  }
  ```

---


## 4. Ejecución de Pruebas

* **Ejecutar todas las pruebas:**
  ```bash
  npm test
  ```
* **Ejecutar pruebas unitarias (Caja Negra y Blanca):**
  ```bash
  npm run test:unit
  ```
* **Ejecutar pruebas de integración con Supertest:**
  ```bash
  npm run test:integration
  ```
* **Generar reporte de cobertura de código:**
  ```bash
  npm run test:coverage
  ```
