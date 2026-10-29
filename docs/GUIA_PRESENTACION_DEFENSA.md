# Guía y Estructura para la Presentación y Defensa del Proyecto

**Proyecto:** LogiTrack API  
**Integrantes:** Vivas, Guillermo & Cuello, Joaquín  
**Duración Estimada:** 12 a 15 minutos  

---

## 1. Distribución de Roles en la Exposición

Ambos integrantes participan activamente de la presentación y la demostración en vivo:

* **Guillermo Vivas:**
  * Introducción y problemática del flete/paquetería.
  * Requisitos y arquitectura de la API.
  * Lógica de tarifación, pesos volumétricos y ciclo TDD.
  * Conclusiones de calidad y testing.

* **Joaquín Cuello:**
  * Asignación de flota y plazos garantizados.
  * Estrategia de pruebas de Caja Negra (valores límite) y Caja Blanca.
  * Defectos encontrados y proceso de resolución (Bug Tracker).
  * Demostración en vivo de la API y ejecución de suites en Jest.

---

## 2. Estructura de Diapositivas Sugerida

### Diapositiva 1: Portada y Presentación del Equipo
* Título: **LogiTrack API - Control de Calidad y Pruebas de Software**
* Subtítulo: API de Liquidación y Despacho Logístico de Encomiendas
* Integrantes: Vivas Guillermo - Cuello Joaquin

### Diapositiva 2: El Problema
* Ineficiencia en la tarifación de encomiendas livianas pero voluminosas.
* Asignación de vehículos errónea o insegura.
* Disputas comerciales por demoras o siniestros sin una política transparente.

### Diapositiva 3: La Solución - Arquitectura de LogiTrack API
* Backend REST liviano en Node.js, Express y TypeScript.
* Separación estricta de capas: Rutas $\rightarrow$ Middlewares (Zod) $\rightarrow$ Controladores $\rightarrow$ Servicios Puros $\rightarrow$ Repositorios.
* Flexibilidad de almacenamiento: MySQL con soporte para base de datos en memoria para testing automatizado.

### Diapositiva 4: Las 3 Funcionalidades Principales
1. **Admisión y Tarifación:** $(\text{alto} \times \text{ancho} \times \text{largo}) / 5000$, peso facturable y recargos condicionales.
2. **Validación Física y Asignación de Flota:** Moto ($<5\text{ kg}$), Utilitario ($5\text{-}20\text{ kg}$), Camión ($>20\text{ kg}$).
3. **Gestión de Entregas e Indemnizaciones:** Reintegros automáticos del 20%, 50% y 100% + seguro.

### Diapositiva 5: Ciclo TDD y Refactorización (Etapa 12)
* Demostración del ciclo Rojo $\rightarrow$ Verde $\rightarrow$ Refactor en el servicio de indemnizaciones.
* Eliminación de números mágicos con la constante `ESCALAS_INDEMNIZACION`.
* Protección contra valores negativos.

### Diapositiva 6: Estrategia de Testing (Caja Negra y Caja Blanca)
* **Caja Negra:** Clases de equivalencia y análisis de valores límite (149 cm, 150 cm, 150.1 cm; 40 kg, 40.1 kg; horas 0, 1, 24, 25, 48, 49).
* **Caja Blanca:** Cobertura del 100% en sentencias, ramas y decisiones en la capa de servicios.

### Diapositiva 7: Registro y Seguimiento de Defectos (Bug Tracker)
* Muestra de los 3 defectos reales detectados:
  * DEF-001: Redondeo en límite de 150 cm.
  * DEF-002: Límite frontera de 20 kg en asignación de camión.
  * DEF-003: Siniestro con 0 horas de mora.
* Cómo se corrigieron y verificaron mediante pruebas de regresión.

### Diapositiva 8: Resultados de Cobertura y Métricas
* 39 pruebas automatizadas ejecutadas y aprobadas en menos de 10 segundos.
* 100% de cobertura en ramas en los servicios de negocio.

### Diapositiva 9: Conclusiones
* Por qué el sistema satisface la necesidad inicial.
* Aprendizajes sobre testing temprano, TDD e inspección de artefactos no código.

---

## 3. Guion para la Demostración en Vivo (Live Demo)

### Paso 1: Ejecución de las Pruebas Automatizadas
1. Abrir la terminal en la raíz del proyecto.
2. Ejecutar:
   ```bash
   npm test
   ```
3. Explicar en vivo:
   > *"Como pueden observar, se ejecutan las 4 suites de pruebas (unitarias de tarifación, despacho, indemnización e integración de endpoints con Supertest), completando 39 casos de prueba aprobados con 0 errores."*

### Paso 2: Mostrar el Reporte de Cobertura
1. Ejecutar:
   ```bash
   npm run test:coverage
   ```
2. Señalar en la tabla de la consola el **100% de cobertura** en `tarifadorService.ts`, `despachoService.ts` e `indemnizacionService.ts`.

### Paso 3: Demostración de Peticiones HTTP en la API
1. Iniciar el servidor:
   ```bash
   npm run dev
   ```
2. Realizar una petición de admisión válida y luego una que supere los 150 cm para mostrar el manejo de errores (400 Bad Request) validado por Zod.
