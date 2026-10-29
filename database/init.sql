-- Script de inicialización de Base de Datos para LogiTrack API
-- Proyecto: Sistema de Liquidación y Despacho Logístico de Encomiendas
-- Autores: Guillermo Vivas - Joaquín Cuello

CREATE DATABASE IF NOT EXISTS logitrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE logitrack_db;

-- 1. Tabla de Encomiendas (Admisión y Tarifación)
CREATE TABLE IF NOT EXISTS encomiendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_seguimiento VARCHAR(30) NOT NULL UNIQUE,
    cliente VARCHAR(100) NOT NULL,
    alto DECIMAL(6,2) NOT NULL,
    ancho DECIMAL(6,2) NOT NULL,
    largo DECIMAL(6,2) NOT NULL,
    peso_real DECIMAL(6,2) NOT NULL,
    peso_volumetrico DECIMAL(6,2) NOT NULL,
    peso_facturable DECIMAL(6,2) NOT NULL,
    distancia_km DECIMAL(7,2) NOT NULL,
    tipo_zona ENUM('URBANO', 'PROVINCIAL', 'NACIONAL') NOT NULL,
    es_fragil BOOLEAN NOT NULL DEFAULT FALSE,
    es_express BOOLEAN NOT NULL DEFAULT FALSE,
    valor_declarado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tarifa_base DECIMAL(10,2) NOT NULL,
    recargo_fragil DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    recargo_express DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    costo_total DECIMAL(10,2) NOT NULL,
    estado ENUM('ADMITIDO', 'EN_TRANSITO', 'ENTREGADO', 'DEVUELTO', 'SINIESTRADO') NOT NULL DEFAULT 'ADMITIDO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Despachos (Asignación de Vehículo)
CREATE TABLE IF NOT EXISTS despachos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encomienda_id INT NOT NULL,
    vehiculo_asignado ENUM('MOTO', 'UTILITARIO', 'CAMION') NOT NULL,
    plazo_garantizado_horas INT NOT NULL,
    fecha_despacho TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (encomienda_id) REFERENCES encomiendas(id) ON DELETE CASCADE
);

-- 3. Tabla de Entregas e Indemnizaciones
CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    despacho_id INT NOT NULL,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    horas_demora INT NOT NULL DEFAULT 0,
    estado_final ENUM('ENTREGADO', 'DEVUELTO', 'SINIESTRADO') NOT NULL,
    porcentaje_reintegro DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    indemnizacion_flete DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    indemnizacion_seguro DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_indemnizado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (despacho_id) REFERENCES despachos(id) ON DELETE CASCADE
);
