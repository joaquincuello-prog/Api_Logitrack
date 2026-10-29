# INFORME TÉCNICO FINAL: SISTEMA DE CONTROL DE CALIDAD Y DESARROLLO DE LOGITRACK API

---

## 1. Portada
* **Proyecto:** LogiTrack API - API REST de Liquidación, Admisión y Despacho Logístico de Encomiendas
* **Asignatura:** Calidad de Software / Interfaz de Usuarios y Programación (3er Año)
* **Institución Académica:** Nivel Superior Universitario / Terciario
* **Año Académico:** 2026
* **Fecha de Entrega:** 15 de Octubre de 2026

---

## 2. Integrantes
* **Vivas, Guillermo** (Rol: Líder de Análisis y Lógica de Negocio; Motor Tarifario, TDD y Pruebas Unitarias / Caja Blanca).
* **Cuello, Joaquín** (Rol: Líder de Integración y Persistencia; Asignación de Flota, Pruebas de Integración y Automatización).

---

## 3. Descripción del Problema
Las empresas de logística y distribución de paquetería interurbana enfrentan habitualmente graves pérdidas operativas y reclamos de clientes debido a:
1. **Ineficiencia en la tarifación:** Cobro erróneo de paquetes muy voluminosos pero de bajo peso físico, o viceversa, al no contar con un cálculo automatizado de peso facturable volumétrico.
2. **Asignación manual de flota:** Despacho de vehículos inadecuados (enviar camiones para paquetes diminutos o sobrecargar motos con bultos pesados fuera de normativa de seguridad vial).
3. **Manejo opaco de demoras e indemnizaciones:** Falta de un mecanismo algorítmico y transparente para liquidar los reintegros porcentuales por mora en entregas garantizadas o pérdidas por siniestro.

---

## 4. Objetivos
* **Objetivo General:** Desarrollar y verificar exhaustivamente un backend modular en formato API REST que automatice la tarifación, validación física, asignación de flota e indemnizaciones por mora o siniestro en encomiendas.
* **Objetivos Específicos:**
  1. Implementar reglas de tarifación considerando peso volumétrico ($(\text{alto} \times \text{ancho} \times \text{largo}) / 5000$) y distancia zonal.
  2. Aplicar validación estricta de restricciones físicas (máximo 150 cm por lado y 40 kg de peso real).
  3. Aplicar técnicas de verificación estática y dinámica: pruebas de Caja Negra (valores límite y clases de equivalencia), Caja Blanca (cobertura de ramas y decisiones), TDD, pruebas unitarias, de integración y regresión.
  4. Mantener una cobertura de pruebas superior al 90% en la lógica de negocio central.

---

## 5. Requisitos del Sistema

### 5.1. Requisitos Funcionales (RF)
* **RF01 - Admisión y Validación Física:** El sistema debe admitir encomiendas validando que ninguna dimensión individual supere los 150 cm y el peso real no supere los 40 kg. Si se excede, debe rechazar con error 400 Bad Request.
* **RF02 - Cálculo de Peso Volumétrico y Facturable:** Debe calcular el peso volumétrico según la fórmula internacional $(\text{alto} \times \text{ancho} \times \text{largo}) / 5000$ y determinar el peso facturable como el valor máximo entre el peso real y el volumétrico.
* **RF03 - Determinación de Zona y Tarifa Base:** Debe categorizar la distancia en: Urbana ($<50\text{ km}$), Provincial ($50\text{ a }300\text{ km}$) o Nacional ($>300\text{ km}$), aplicando las tarifas base y costo por kilómetro correspondientes.
* **RF04 - Aplicación de Recargos:** Debe adicionar un 15% de recargo sobre la tarifa base si el paquete es frágil, y un 30% si se contrata servicio Express.
* **RF05 - Generación de Código de Seguimiento:** Debe generar un identificador alfanumérico único (prefijo `LOGI-`) por cada encomienda registrada.
* **RF06 - Asignación Automática de Vehículo:** Al despachar, debe asignar: `MOTO` si el peso facturable es $< 5\text{ kg}$, `UTILITARIO` si está entre $5\text{ kg}$ y $20\text{ kg}$, y `CAMION` si es $> 20\text{ kg}$.
* **RF07 - Determinación de Plazo Garantizado:** Debe fijar 24 horas para envíos express o urbanos, 48 horas para provinciales y 72 horas para nacionales.
* **RF08 - Liquidación de Indemnizaciones:** Al registrar entrega, si hubo demora garantizada: $1\text{ a }24\text{ h} \rightarrow 20\%$ de reintegro de flete; $25\text{ a }48\text{ h} \rightarrow 50\%$; $>48\text{ h}$ o `SINIESTRADO` $\rightarrow 100\%$ de reintegro de flete más el seguro declarado.

### 5.2. Requisitos No Funcionales (RNF)
* **RNF01 - Rendimiento:** Respuestas de la API inferiores a 200 ms por transacción.
* **RNF02 - Mantenibilidad y Modularidad:** Arquitectura en capas desacopladas (Rutas, Controladores, Servicios, Repositorios).
* **RNF03 - Robustez:** Manejo estructurado de excepciones y validación de tipos estricta con TypeScript y Zod.
* **RNF04 - Testabilidad:** Desacoplamiento de la base de datos mediante Patrón Repositorio para permitir ejecuciones unitarias e integrales en memoria o contra MySQL.

---

## 6. Descripción del Sistema
LogiTrack API es un backend desarrollado bajo principios de Arquitectura Limpia y Programación Modular. Expone una interfaz RESTful que procesa solicitudes en formato JSON y coordina los servicios de cálculo con la capa de persistencia en MySQL.

---

## 7. Tecnologías Utilizadas
* **Lenguaje:** TypeScript v5.4.5 sobre Node.js v22.15.0.
* **Framework Web:** Express.js v4.19.2.
* **Validación de Datos:** Zod v3.23.8.
* **Base de Datos:** MySQL Server 8.0 (con driver `mysql2/promise`).
* **Framework de Pruebas:** Jest v29.7.0 con `ts-jest`.
* **Pruebas de Integración HTTP:** Supertest v6.3.4.
* **Control de Versiones:** Git v2.49.0.

---

## 8. Planificación del Proyecto
El trabajo se estructuró en 4 fases temporales distribuidas equitativamente entre los integrantes:

| Fase | Tareas Principales | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| **Fase I: Análisis y Diseño** | Requisitos, modelado de datos, diseño de base de datos MySQL. | Vivas & Cuello | 100% |
| **Fase II: TDD y Lógica de Negocio** | Ciclo Rojo-Verde-Refactor en indemnizaciones, motor tarifario y despacho. | Vivas | 100% |
| **Fase III: Persistencia e Integración** | Repositorios, endpoints Express, validadores Zod y Supertest. | Cuello | 100% |
| **Fase IV: QA, Regresión y Documentación** | Pruebas de caja blanca/negra, bug tracker, revisión de manual e informe técnico. | Vivas & Cuello | 100% |

---

## 9. Desarrollo del Sistema
Se estructuró el código bajo el siguiente árbol de directorios:
```
src/
├── config/database.ts            # Conexión MySQL pool
├── models/types.ts               # Modelos e interfaces TypeScript
├── services/                     # Lógica de negocio pura (Pura y desacoplada)
│   ├── tarifadorService.ts
│   ├── despachoService.ts
│   └── indemnizacionService.ts
├── repositories/                 # Patrón Repositorio (MySQL y Memory)
│   ├── IEncomiendaRepository.ts
│   ├── MySqlEncomiendaRepository.ts
│   ├── InMemoryEncomiendaRepository.ts
│   └── index.ts
├── middlewares/                  # Zod validation y Error Handler
│   ├── validation.ts
│   └── errorHandler.ts
├── controllers/                  # EncomiendaController
├── routes/                       # encomiendaRoutes
├── app.ts                        # Configuración Express
└── server.ts                     # Entrada del servidor
```

---

## 10. Estrategia de Verificación y Validación (V&V)
* **Verificación (¿Estamos construyendo el producto correctamente?):**
  * Análisis estático de código mediante el compilador de TypeScript (`strict: true`).
  * Revisión de código por pares (Peer Code Review).
  * Inspección formal de artefactos no código (`README.md`).
  * Pruebas de Caja Blanca (análisis de cobertura de caminos y complejidad ciclomática).
* **Validación (¿Estamos construyendo el producto correcto?):**
  * Pruebas de Caja Negra (clases de equivalencia y valores límite).
  * Pruebas de Integración y Sistema extremo a extremo con Supertest simulando los casos de uso reales de los clientes.

---

## 11. Casos de Prueba Diseñados
Se diseñaron **39 casos de prueba** divididos estratégicamente entre pruebas unitarias, de caja negra, caja blanca e integración. Todos se rigen por la plantilla oficial de la cátedra:

```
[ID] | [Funcionalidad] | [Objetivo] | [Precondiciones] | [Entrada] | [Procedimiento] | [Resultado Esperado] | [Resultado Obtenido] | [Estado] | [Observaciones]
```

---

## 12. Pruebas de Caja Negra

### 12.1. Clases de Equivalencia
* **CE1 (Dimensiones):** Dimensiones válidas ($\le 150\text{ cm}$) vs. Inválidas ($> 150\text{ cm}$ o $\le 0$).
* **CE2 (Peso Real):** Peso válido ($\le 40\text{ kg}$) vs. Inválido ($> 40\text{ kg}$ o $\le 0$).
* **CE3 (Zonas Geográficas):** Urbana ($< 50\text{ km}$), Provincial ($50\text{ a }300\text{ km}$), Nacional ($> 300\text{ km}$).
* **CE4 (Escalas de Demora):** Sin demora ($0\text{ h}$), Leve ($1\text{ a }24\text{ h}$), Media ($25\text{ a }48\text{ h}$), Crítica ($> 48\text{ h}$ o siniestrado).

### 12.2. Análisis de Valores Límite (BVA)
| ID Caso | Variable | Límite Evaluado | Valor Entrada | Resultado Esperado | Resultado Obtenido | Estado |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CP-01** | Lado | Límite superior válido | $150.0\text{ cm}$ | Admisión aceptada | Aceptado sin error | APROBADO |
| **CP-02** | Lado | Valor frontera excedido | $150.1\text{ cm}$ | Rechazo con excepción | Error: Lado no puede superar 150 cm | APROBADO |
| **CP-03** | Peso | Límite superior válido | $40.0\text{ kg}$ | Admisión aceptada | Aceptado sin error | APROBADO |
| **CP-04** | Peso | Valor frontera excedido | $40.1\text{ kg}$ | Rechazo con excepción | Error: Peso no puede superar 40 kg | APROBADO |
| **CP-06** | Distancia | Frontera Urbana | $49.9\text{ km}$ | Zona URBANO | URBANO | APROBADO |
| **CP-07** | Distancia | Frontera Provincial inf. | $50.0\text{ km}$ | Zona PROVINCIAL | PROVINCIAL | APROBADO |
| **CP-09** | Distancia | Frontera Provincial sup. | $300.0\text{ km}$ | Zona PROVINCIAL | PROVINCIAL | APROBADO |
| **CP-10** | Distancia | Frontera Nacional inf. | $300.1\text{ km}$ | Zona NACIONAL | NACIONAL | APROBADO |
| **CP-15** | Flota | Límite Moto | $4.9\text{ kg}$ | MOTO | MOTO | APROBADO |
| **CP-16** | Flota | Frontera Utilitario inf. | $5.0\text{ kg}$ | UTILITARIO | UTILITARIO | APROBADO |
| **CP-18** | Flota | Frontera Utilitario sup. | $20.0\text{ kg}$ | UTILITARIO | UTILITARIO | APROBADO |
| **CP-19** | Flota | Frontera Camión inf. | $20.1\text{ kg}$ | CAMION | CAMION | APROBADO |
| **CP-26** | Demora | En término | $0\text{ horas}$ | Reintegro 0% | 0% reintegro | APROBADO |
| **CP-27** | Demora | Límite Leve inf. | $1\text{ hora}$ | Reintegro 20% | 20% reintegro | APROBADO |
| **CP-28** | Demora | Límite Leve sup. | $24\text{ horas}$ | Reintegro 20% | 20% reintegro | APROBADO |
| **CP-29** | Demora | Límite Media inf. | $25\text{ horas}$ | Reintegro 50% | 50% reintegro | APROBADO |
| **CP-30** | Demora | Límite Media sup. | $48\text{ horas}$ | Reintegro 50% | 50% reintegro | APROBADO |
| **CP-31** | Demora | Límite Crítica inf. | $49\text{ horas}$ | Reintegro 100% + Seguro | 100% flete + seguro | APROBADO |

---

## 13. Pruebas de Caja Blanca
Se analizó la lógica interna de los métodos `calcularTarifa`, `asignarVehiculo` y `calcularIndemnizacion`:
* **Cobertura de Instrucciones (Statement Coverage):** 100% en todos los módulos de servicios.
* **Cobertura de Decisiones y Ramas (Branch Coverage):** 100% en todos los servicios de negocio (se evaluaron exhaustivamente las combinaciones booleanas de `esFragil`, `esExpress`, bifurcaciones de zona geográfica y condiciones compuestas `horasDemora > 48 || estadoFinal === 'SINIESTRADO'`).
* **Complejidad Ciclomática:**
  * `calcularIndemnizacion`: $V(G) = 4$ (4 regiones cerradas correspondientes a las escalas de demora y siniestro).
  * `determinarZona`: $V(G) = 3$.
  * `asignarVehiculo`: $V(G) = 3$.

---

## 14. Pruebas Unitarias
Se implementaron suites en Jest para las 3 funciones nucleares:
1. `tarifadorService.test.ts` (14 pruebas unitarias): cálculo de peso volumétrico, tarifas base, recargos y validaciones.
2. `despachoService.test.ts` (11 pruebas unitarias): clasificación de flota vehicular y plazos de entrega garantizados.
3. `indemnizacionService.test.ts` (9 pruebas unitarias): escalas de penalización y liquidación económica.

**Evidencia de Ejecución:**
```
PASS tests/unit/tarifadorService.test.ts
PASS tests/unit/despachoService.test.ts
PASS tests/unit/indemnizacionService.test.ts
```

---

## 15. Pruebas de Integración
Se implementó `tests/integration/encomiendas.integration.test.ts` evaluando la interacción coordinada entre la capa de Controladores HTTP, Middlewares de validación, Servicios de dominio y la Capa de Repositorios:
* **Caso PI-01 (Flujo Completo):**
  1. `POST /api/encomiendas/admitir` $\rightarrow$ Registra paquete de 25 kg y genera ID.
  2. `POST /api/encomiendas/despachar` $\rightarrow$ Recupera encomienda y asigna automáticamente `CAMION` con plazo de 48h.
  3. `POST /api/encomiendas/entregar` $\rightarrow$ Notifica 30h de demora, calculando 50% de reintegro de flete e impactando el saldo final.
  4. `GET /api/encomiendas/:id` $\rightarrow$ Verifica persistencia consolidada del estado final `ENTREGADO`.

---

## 16. Pruebas de Sistema y Validación
Se ejecutaron pruebas integrales sobre el sistema completo para validar el cumplimiento de los requerimientos de los usuarios de paquetería:
* Respuestas correctas ante datos válidos.
* Manejo estricto de errores ante entradas inválidas (HTTP 400 con detalle de campos infractores).
* Manejo de registros no existentes (HTTP 404).

### ¿El sistema desarrollado satisface las necesidades planteadas al comienzo del proyecto?
**SÍ, satisface plenamente las necesidades planteadas.**  
**Justificación:** A través de las 39 pruebas automatizadas (unitarias, integración y de sistema), se demostró empíricamente que:
1. Elimina las pérdidas por discrepancias de volumen mediante el cálculo automático del peso facturable.
2. Evita errores humanos en la logística asignando el vehículo óptimo según el tonelaje real de la carga.
3. Otorga transparencia total al cliente al calcular de forma auditable los reintegros y coberturas de seguro ante demoras o siniestros.

---

## 17. Automatización de Pruebas
Se seleccionaron y automatizaron 3 flujos críticos en Jest + Supertest:
1. **Flujo Feliz y Liquidación por Mora:** Validación automática de código de seguimiento, asignación vehicular y reintegro del 50%.
2. **Rechazo por Dimensiones y Pesos Fuera de Límite:** Validación automática de código de estado HTTP 400 y mensajes de error emitidos por Zod.
3. **Liquidación Total por Siniestro:** Comprobación del reembolso del 100% del flete más cobertura del seguro declarado.

* **Herramientas utilizadas:** Jest + Supertest.
* **Motivo de elección:** Velocidad de ejecución en memoria, soporte nativo de TypeScript sin transpilación previa en disco, e informes integrados de cobertura (`lcov` y consola).
* **Ventajas:** Ejecución repetible en menos de 10 segundos para toda la suite de regresión; detección inmediata de roturas.
* **Limitaciones:** Supertest emula peticiones HTTP a nivel de aplicación Express sin abrir sockets de red externos completos.

---

## 18. TDD y Refactorización

### 18.1. Proceso TDD Documentado
Se aplicó TDD sobre la función `calcularIndemnizacion`:
1. **Fase Roja (Red):** Se crearon los 5 casos de prueba iniciales en `indemnizacionService.test.ts` esperando una función stub que arrojaba `Error('Función calcularIndemnizacion no implementada todavía')`. Resultado: **5 failed de 5 tests**.
2. **Fase Verde (Green):** Se implementó el código mínimo en `src/services/indemnizacionService.ts` utilizando condicionales básicos. Resultado: **5 passed de 5 tests**.
3. **Fase Refactor:** Se mejoró la arquitectura del código.

### 18.2. Proceso de Refactorización
* **Problema del código original:** Presencia de números mágicos dispersos (`100`, `50`, `20`, `48`, `25`), código duplicado en la asignación de variables de retorno, y ausencia de validación ante valores negativos.
* **Modificación realizada:** Se extrajo la estructura inmutable `ESCALAS_INDEMNIZACION`, se agregaron validaciones de precondición (lanzando excepciones ante horas o costos negativos) y se centralizó el cálculo de porcentajes.
* **Justificación de la mejora:** Aumenta la legibilidad, previene errores sutiles con valores negativos y facilita futuras modificaciones de las políticas de indemnización sin tocar la lógica de cálculo.
* **Verificación:** Se ejecutó nuevamente la suite de pruebas unitarias (`npm test`), confirmando que el 100% de los casos se mantuvieron aprobados.

---

## 19. Pruebas de Regresión
Luego de la refactorización y de corregir los 3 defectos registrados en el Bug Tracker:
* **Pruebas previas:** 5 pruebas unitarias iniciales de TDD.
* **Modificaciones realizadas:** Corrección de operador en `asignarVehiculo` ($<= 20$), orden de evaluación de siniestros, y validación estricta de flotantes en dimensiones.
* **Pruebas de regresión aplicadas:** Se ejecutaron las 39 pruebas de la suite completa (`npm test`).
* **Resultados:** 39 pruebas aprobadas, 0 pruebas fallidas, confirmando que las mejoras no introdujeron efectos colaterales indeseados.

---

## 20. Defectos Encontrados
Se detectaron y registraron 3 defectos principales (detallados en `docs/REGISTRO_DEFECTOS.md`):
1. **DEF-001 (Alta):** Falta de rechazo en dimensiones límite frontera (150.1 cm) por redondeo truncado.
2. **DEF-002 (Media):** Asignación incorrecta a Camión para paquetes de exactamente 20.0 kg por operador `<` en lugar de `<=`.
3. **DEF-003 (Crítica):** Indemnización nula en siniestros con 0 horas de mora por evaluación invertida de condiciones.

---

## 21. Seguimiento de Defectos
Todos los defectos pasaron por el ciclo de vida: **Nuevo $\rightarrow$ En Análisis $\rightarrow$ Corregido $\rightarrow$ Verificado por Pruebas $\rightarrow$ Cerrado**.  
Actualmente, el 100% de los defectos reportados se encuentran en estado **RESUELTO / CERRADO**.

---

## 22. Revisión de Artefactos No Relacionados con el Código
Se auditó formalmente el manual técnico `README.md` mediante una inspección por pares realizada por Joaquín Cuello.
* **Problemas encontrados:** Discrepancia de nomenclatura de campos JSON (`snake_case` en manual vs. `camelCase` en código) y omisión del comando de inicialización del archivo `.env`.
* **Acciones:** Corrección integral de la documentación, logrando un 100% de consistencia verificada (documentado en `docs/REVISION_ARTEFACTO_NO_CODIGO.md`).

---

## 23. Resultados Obtenidos
* **Total de Pruebas Automatizadas:** 39 pruebas ejecutadas y aprobadas al 100%.
* **Cobertura de Código en Servicios de Negocio:** **100% de sentencias, 100% de ramas y 100% de funciones**.
* **Cobertura General del Proyecto:** 79.43% de líneas totales (incluyendo enrutadores, controladores y repositorios).
* **Tiempo de Ejecución de Suites:** Menos de 10 segundos.

---

## 24. Conclusiones
El desarrollo del proyecto **LogiTrack API** permitió integrar de manera práctica y rigurosa los conceptos fundamentales de Calidad de Software y Verificación y Validación:
1. La aplicación temprana de **TDD** y el diseño de pruebas de **Caja Negra (valores límite)** permitió capturar defectos de frontera antes de que impactaran en capas superiores.
2. Las pruebas de **Caja Blanca** garantizaron que no quedara ninguna bifurcación o condición lógica huérfana en el motor de liquidación.
3. El uso del **Patrón Repositorio** demostró ser una decisión arquitectónica clave, permitiendo una suite de pruebas ágil y desacoplada de la infraestructura externa.
4. La inspección de artefactos no código demostró que la calidad del software trasciende el código fuente, siendo la documentación un pilar crítico para la adopción y confiabilidad del producto.

---

## 25. Bibliografía y Fuentes Consultadas
* Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill Education.
* Myers, G. J., Sandler, C., & Badgett, T. (2011). *The Art of Software Testing* (3rd ed.). John Wiley & Sons.
* Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall.
* Beck, K. (2002). *Test Driven Development: By Example*. Addison-Wesley Professional.
* Documentación Oficial de Express.js: https://expressjs.com/
* Documentación Oficial de Jest: https://jestjs.io/
* Documentación Oficial de TypeScript: https://www.typescriptlang.org/
