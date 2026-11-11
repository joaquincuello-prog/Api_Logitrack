import { AsyncLocalStorage } from 'node:async_hooks';
import type { PoolConnection } from 'mysql2/promise';

/**
 * Contexto asíncrono para almacenar la conexión activa durante una transacción ACID.
 * Permite que los repositorios utilicen automáticamente la conexión con la transacción abierta
 * sin filtrar detalles de infraestructura a la capa de dominio o casos de uso.
 */
export const transactionStorage = new AsyncLocalStorage<PoolConnection>();
