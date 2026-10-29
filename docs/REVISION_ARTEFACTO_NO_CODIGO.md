# Etapa 14: Revisión Formal de Artefactos No Relacionados con el Código

**Artefacto Seleccionado:** Manual de Integración y Uso de la API (`README.md`).  
**Técnica Aplicada:** Inspección formal por pares (Peer Review / Walkthrough).  
**Revisor:** Cuello, Joaquín  
**Autor del artefacto:** Vivas, Guillermo  
**Fecha de revisión:** 2026-10-15  

---

## 1. Objetivo de la Revisión
Comprobar la exactitud técnica, claridad, completitud y consistencia entre la documentación de la API expuesta a desarrolladores externos y la implementación real del software en Express y TypeScript.

---

## 2. Lista de Comprobación (Checklist) de Inspección

| Ítem | Criterio Evaluado | Resultado Inicial | Observaciones |
| :---: | :--- | :---: | :--- |
| **1** | ¿Las rutas y métodos HTTP coinciden exactamente con las definidas en el enrutador? | CUMPLE | Métodos POST y GET alineados. |
| **2** | ¿Los nombres de las propiedades en los JSON de ejemplo coinciden con el esquema de validación? | NO CUMPLE | Se detectó discrepancia en el payload de admisión (`peso_real` vs `pesoReal`). |
| **3** | ¿Los comandos de instalación y arranque en consola son ejecutables y correctos? | NO CUMPLE | Faltaba la instrucción de configuración de variables de entorno `.env.example`. |
| **4** | ¿Las reglas de negocio (rangos de demora y límites de peso) reflejan fielmente el código? | CUMPLE | Coinciden con los valores fijados en `LIMITES_FISICOS` y `ESCALAS_INDEMNIZACION`. |
| **5** | ¿Los enlaces internos a archivos de base de datos (`database/init.sql`) son válidos? | CUMPLE | Enlace relativo operativo. |

---

## 3. Registro de Problemas Encontrados en la Documentación

### Hallazgo #1: Inconsistencia en nomenclatura de campos JSON (Snake_case vs CamelCase)
* **Ubicación:** Sección 3.2 de `README.md` (Ejemplo de `POST /api/encomiendas/admitir`).
* **Descripción del problema:** La documentación preliminar mostraba `"peso_real": 8.5` y `"distancia_km": 120`. Sin embargo, el esquema Zod y los tipos TypeScript del backend exigen estrictamente `camelCase` (`pesoReal` y `distanciaKm`). Un cliente que siguiera el manual recibiría un error `400 Bad Request`.
* **Severidad:** Alta (bloquea la integración de cualquier desarrollador externo).
* **Acción correctiva:** Se actualizaron todos los ejemplos en el `README.md` a la convención `camelCase` (`pesoReal`, `distanciaKm`, `esFragil`, `esExpress`, `valorDeclarado`).
* **Estado:** Corregido y Verificado.

### Hallazgo #2: Omisión del paso de inicialización de variables de entorno
* **Ubicación:** Sección 2 de `README.md` (Instalación y Puesta en Marcha).
* **Descripción del problema:** El manual saltaba directamente de `npm install` a `npm run dev` sin explicar la necesidad de copiar `.env.example` a `.env` para definir las credenciales y puertos de la base de datos.
* **Severidad:** Media (causa fallos de inicialización en entornos limpios).
* **Acción correctiva:** Se agregó el paso 3 explícito: `cp .env.example .env` con la explicación de cada variable.
* **Estado:** Corregido y Verificado.

---

## 4. Conclusión de la Inspección
Tras la aplicación de las correcciones documentadas, el manual técnico `README.md` presenta un **100% de consistencia** con el código fuente y las pruebas automatizadas, garantizando una experiencia de integración sin fricciones.
