/**
 * LogiTrack PRO — Lógica Frontend SPA Modular (3 Pantallas / Vistas por Roles)
 * Materia: Interfaz de Usuarios (3er Año)
 * Integrantes: Guillermo Vivas & Joaquín Cuello
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de la API
  const API_BASE = window.location.origin.includes('http') && !window.location.origin.startsWith('file:')
    ? window.location.origin
    : 'http://localhost:3000';

  // Constantes de negocio sincronizadas con el Backend
  const LIMITES = {
    LADO_MAXIMO_CM: 150,
    PESO_MAXIMO_KG: 40,
    DIVISOR_VOLUMETRICO: 5000
  };

  const TARIFAS_ZONA = {
    URBANO: { MAX_KM: 50, BASE: 1500, PRECIO_KM: 20 },
    PROVINCIAL: { MIN_KM: 50, MAX_KM: 300, BASE: 3500, PRECIO_KM: 15 },
    NACIONAL: { MIN_KM: 300.01, BASE: 7000, PRECIO_KM: 12 }
  };

  // Estado reactivo global de la SPA
  const state = {
    pantallaActiva: 'view-admision', // 'view-admision' | 'view-monitor' | 'view-entregas'
    encomiendas: [],
    estadisticas: null,
    filtroEstado: 'TODOS',
    busquedaMonitor: '',
    vistaMonitor: 'table', // 'table' | 'cards'
    filtroTransito: 'EN_TRANSITO', // 'EN_TRANSITO' | 'CERRADOS'
    busquedaTransito: '',
    encomiendaSeleccionadaParaEntrega: null
  };

  // Referencias del DOM agrupadas por módulo
  const dom = {
    // Cabecera y Navegación Principal (3 Pestañas)
    themeToggle: document.getElementById('themeToggle'),
    themeIconSun: document.getElementById('themeIconSun'),
    themeIconMoon: document.getElementById('themeIconMoon'),
    apiStatusBadge: document.getElementById('apiStatusBadge'),
    btnSeedDemo: document.getElementById('btnSeedDemo'),
    moduleTabs: document.querySelectorAll('.module-tab'),
    viewSections: document.querySelectorAll('.view-section'),
    navBadgeTotal: document.getElementById('navBadgeTotal'),
    navBadgeTransito: document.getElementById('navBadgeTransito'),

    // 🟢 PANTALLA 1: Admisión y Carga (Mostrador)
    admisionForm: document.getElementById('admisionForm'),
    inputCliente: document.getElementById('inputCliente'),
    inputAlto: document.getElementById('inputAlto'),
    inputAncho: document.getElementById('inputAncho'),
    inputLargo: document.getElementById('inputLargo'),
    inputPeso: document.getElementById('inputPeso'),
    inputDistancia: document.getElementById('inputDistancia'),
    inputValorDeclarado: document.getElementById('inputValorDeclarado'),
    checkFragil: document.getElementById('checkFragil'),
    checkExpress: document.getElementById('checkExpress'),
    btnAdmitir: document.getElementById('btnAdmitir'),
    btnSpinner: document.querySelector('#btnAdmitir .btn-spinner'),
    physicalLimitAlert: document.getElementById('physicalLimitAlert'),
    physicalLimitMsg: document.getElementById('physicalLimitMsg'),
    hintZona: document.getElementById('hintZona'),
    lastAdmittedBanner: document.getElementById('lastAdmittedBanner'),
    lastAdmittedText: document.getElementById('lastAdmittedText'),
    btnGoToMonitorFromBanner: document.getElementById('btnGoToMonitorFromBanner'),

    // Panel Inferior de Auditoría y Desglose en Tiempo Real (Pantalla 1)
    cardComparePesoReal: document.getElementById('cardComparePesoReal'),
    cardComparePesoVol: document.getElementById('cardComparePesoVol'),
    tagPesoReal: document.getElementById('tagPesoReal'),
    tagPesoVol: document.getElementById('tagPesoVol'),
    auditPesoReal: document.getElementById('auditPesoReal'),
    auditFormulaVol: document.getElementById('auditFormulaVol'),
    livePesoVolumetrico: document.getElementById('livePesoVolumetrico'),
    livePesoFacturable: document.getElementById('livePesoFacturable'),
    liveZona: document.getElementById('liveZona'),
    livePlazoEst: document.getElementById('livePlazoEst'),
    auditReglaZona: document.getElementById('auditReglaZona'),
    liveVehicleBadge: document.getElementById('liveVehicleBadge'),
    liveTarifaBase: document.getElementById('liveTarifaBase'),
    breakdownBaseRepeat: document.getElementById('breakdownBaseRepeat'),
    liveTarifaBaseFormula: document.getElementById('liveTarifaBaseFormula'),
    liveRecargoFragil: document.getElementById('liveRecargoFragil'),
    rowRecargoFragil: document.getElementById('rowRecargoFragil'),
    liveRecargoExpress: document.getElementById('liveRecargoExpress'),
    rowRecargoExpress: document.getElementById('rowRecargoExpress'),
    auditValorDeclarado: document.getElementById('auditValorDeclarado'),
    liveCostoTotal: document.getElementById('liveCostoTotal'),

    // 🔵 PANTALLA 2: Monitor de Encomiendas (KPIs, Filtros y Tabla/Tarjetas)
    kpiTotalFacturado: document.getElementById('kpiTotalFacturado'),
    kpiTotalIndemnizado: document.getElementById('kpiTotalIndemnizado'),
    kpiPaquetesActivos: document.getElementById('kpiPaquetesActivos'),
    kpiAdmitidosCount: document.getElementById('kpiAdmitidosCount'),
    kpiTransitoCount: document.getElementById('kpiTransitoCount'),
    flotaMotos: document.getElementById('flotaMotos'),
    flotaUtilitarios: document.getElementById('flotaUtilitarios'),
    flotaCamiones: document.getElementById('flotaCamiones'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterPills: document.querySelectorAll('.filter-pill'),
    btnViewTable: document.getElementById('btnViewTable'),
    btnViewCards: document.getElementById('btnViewCards'),
    btnRefreshBoard: document.getElementById('btnRefreshBoard'),
    refreshIcon: document.getElementById('refreshIcon'),
    tableView: document.getElementById('tableView'),
    cardsView: document.getElementById('cardsView'),
    encomiendasTableBody: document.getElementById('encomiendasTableBody'),
    emptyState: document.getElementById('emptyState'),
    countTodos: document.getElementById('countTodos'),
    countAdmitido: document.getElementById('countAdmitido'),
    countEnTransito: document.getElementById('countEnTransito'),
    countEntregado: document.getElementById('countEntregado'),
    countSiniestrado: document.getElementById('countSiniestrado'),

    // 🟠 PANTALLA 3: Módulo de Entregas e Indemnizaciones
    transitSearchInput: document.getElementById('transitSearchInput'),
    btnFilterTransitPending: document.getElementById('btnFilterTransitPending'),
    btnFilterTransitClosed: document.getElementById('btnFilterTransitClosed'),
    countTransitPending: document.getElementById('countTransitPending'),
    countTransitClosed: document.getElementById('countTransitClosed'),
    transitListContainer: document.getElementById('transitListContainer'),
    selectEncomiendaTransito: document.getElementById('selectEncomiendaTransito'),
    emptySettlementState: document.getElementById('emptySettlementState'),
    activeSettlementForm: document.getElementById('activeSettlementForm'),
    settlementCodigoBadge: document.getElementById('settlementCodigoBadge'),
    settlementClienteNombre: document.getElementById('settlementClienteNombre'),
    settlementFlotaPlazo: document.getElementById('settlementFlotaPlazo'),
    settlementFleteOriginal: document.getElementById('settlementFleteOriginal'),
    settlementSeguroDeclarado: document.getElementById('settlementSeguroDeclarado'),
    modalDespachoId: document.getElementById('modalDespachoId'),
    modalEncomiendaId: document.getElementById('modalEncomiendaId'),
    modalCostoTotalFlete: document.getElementById('modalCostoTotalFlete'),
    modalValorDeclarado: document.getElementById('modalValorDeclarado'),
    modalEstadoFinalRadios: document.querySelectorAll('input[name="modalEstadoFinal"]'),
    sliderGroupDemora: document.getElementById('sliderGroupDemora'),
    inputSliderDemora: document.getElementById('inputSliderDemora'),
    sliderValDisplay: document.getElementById('sliderValDisplay'),
    sliderTicks: document.querySelectorAll('.slider-scale-ticks .tick'),
    delayPresetBtns: document.querySelectorAll('.delay-preset-btn'),
    previewPorcentajeBadge: document.getElementById('previewPorcentajeBadge'),
    prevCostoFlete: document.getElementById('prevCostoFlete'),
    prevIndemnizacionFlete: document.getElementById('prevIndemnizacionFlete'),
    prevIndemnizacionSeguro: document.getElementById('prevIndemnizacionSeguro'),
    prevTotalIndemnizado: document.getElementById('prevTotalIndemnizado'),
    prevSaldoFinal: document.getElementById('prevSaldoFinal'),
    btnConfirmarEntrega: document.getElementById('btnConfirmarEntrega'),

    // Modal de Detalle Técnico
    detalleModal: document.getElementById('detalleModal'),
    modalDetalleCodigo: document.getElementById('modalDetalleCodigo'),
    modalDetalleBody: document.getElementById('modalDetalleBody'),
    btnCloseDetalleModal: document.getElementById('btnCloseDetalleModal'),
    btnCloseDetalleFooter: document.getElementById('btnCloseDetalleFooter'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     1. NAVEGACIÓN ENTRE LAS 3 PANTALLAS (VIEWS / TABS)
     ========================================================================== */
  window.cambiarVista = function(viewId) {
    state.pantallaActiva = viewId;

    // Actualizar pestañas del menú superior
    dom.moduleTabs.forEach(tab => {
      const esActiva = tab.getAttribute('data-target') === viewId;
      tab.classList.toggle('active', esActiva);
      tab.setAttribute('aria-selected', esActiva ? 'true' : 'false');
    });

    // Mostrar únicamente la pantalla seleccionada
    dom.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === viewId);
    });

    // Si entra a la pantalla 3 y aún no hay encomienda seleccionada, auto-seleccionar la primera en tránsito si existe
    if (viewId === 'view-entregas' && !state.encomiendaSeleccionadaParaEntrega) {
      const primeraEnTransito = state.encomiendas.find(e => e.estado === 'EN_TRANSITO');
      if (primeraEnTransito) {
        window.seleccionarEncomiendaParaEntrega(primeraEnTransito.id);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  dom.moduleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      if (target) window.cambiarVista(target);
    });
  });

  if (dom.btnGoToMonitorFromBanner) {
    dom.btnGoToMonitorFromBanner.addEventListener('click', () => {
      window.cambiarVista('view-monitor');
    });
  }

  /* ==========================================================================
     2. GESTIÓN DE TEMA (MODO OSCURO / MODO CLARO)
     ========================================================================== */
  function inicializarTema() {
    const temaGuardado = localStorage.getItem('logitrack_theme') || 'dark';
    aplicarTema(temaGuardado);

    dom.themeToggle.addEventListener('click', () => {
      const temaActual = document.documentElement.getAttribute('data-theme') || 'dark';
      const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
      aplicarTema(nuevoTema);
    });
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('logitrack_theme', tema);

    if (tema === 'dark') {
      dom.themeIconSun.style.display = 'block';
      dom.themeIconMoon.style.display = 'none';
    } else {
      dom.themeIconSun.style.display = 'none';
      dom.themeIconMoon.style.display = 'block';
    }
  }

  /* ==========================================================================
     3. CLIENTE DE API Y HEALTH CHECK
     ========================================================================== */
  async function verificarConexionAPI() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        dom.apiStatusBadge.className = 'status-indicator online';
        dom.apiStatusBadge.querySelector('.status-text').textContent = 'API Conectada';
        return true;
      }
    } catch {
      // Ignorar y marcar desconectada
    }
    dom.apiStatusBadge.className = 'status-indicator offline';
    dom.apiStatusBadge.querySelector('.status-text').textContent = 'API Desconectada';
    return false;
  }

  async function apiRequest(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || (data.errores && data.errores[0]?.mensaje) || 'Error en la petición');
      }
      return data;
    } catch (err) {
      console.error(`Error en API [${endpoint}]:`, err);
      throw err;
    }
  }

  /* ==========================================================================
     4. 🟢 PANTALLA 1: AUDITORÍA Y DESGLOSE DE CÁLCULO EN TIEMPO REAL
     ========================================================================== */
  function calcularCotizacionEnVivo() {
    const alto = parseFloat(dom.inputAlto.value) || 0;
    const ancho = parseFloat(dom.inputAncho.value) || 0;
    const largo = parseFloat(dom.inputLargo.value) || 0;
    const pesoReal = parseFloat(dom.inputPeso.value) || 0;
    const distanciaKm = parseFloat(dom.inputDistancia.value) || 0;
    const valorDeclarado = parseFloat(dom.inputValorDeclarado.value) || 0;
    const esFragil = dom.checkFragil.checked;
    const esExpress = dom.checkExpress.checked;

    // 1. Validación inmediata de límites físicos (150 cm máx por lado y 40 kg máx)
    const errores = [];
    if (alto > LIMITES.LADO_MAXIMO_CM) errores.push(`Alto (${alto} cm) supera el máximo de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (ancho > LIMITES.LADO_MAXIMO_CM) errores.push(`Ancho (${ancho} cm) supera el máximo de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (largo > LIMITES.LADO_MAXIMO_CM) errores.push(`Largo (${largo} cm) supera el máximo de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (pesoReal > LIMITES.PESO_MAXIMO_KG) errores.push(`Peso Real (${pesoReal} kg) supera el máximo de ${LIMITES.PESO_MAXIMO_KG} kg`);
    if (alto <= 0 || ancho <= 0 || largo <= 0 || pesoReal <= 0 || distanciaKm <= 0) {
      errores.push('Todas las dimensiones, el peso real y la distancia deben ser mayores a 0');
    }

    dom.inputAlto.classList.toggle('input-error', alto > LIMITES.LADO_MAXIMO_CM || alto <= 0);
    dom.inputAncho.classList.toggle('input-error', ancho > LIMITES.LADO_MAXIMO_CM || ancho <= 0);
    dom.inputLargo.classList.toggle('input-error', largo > LIMITES.LADO_MAXIMO_CM || largo <= 0);
    dom.inputPeso.classList.toggle('input-error', pesoReal > LIMITES.PESO_MAXIMO_KG || pesoReal <= 0);

    if (errores.length > 0) {
      dom.physicalLimitAlert.style.display = 'flex';
      dom.physicalLimitMsg.textContent = errores.join(' · ');
      dom.btnAdmitir.disabled = true;
      return null;
    } else {
      dom.physicalLimitAlert.style.display = 'none';
      dom.btnAdmitir.disabled = false;
    }

    // 2. Comparativa Peso Real vs Peso Volumétrico
    const volumen = alto * ancho * largo;
    const pesoVolumetrico = Math.round((volumen / LIMITES.DIVISOR_VOLUMETRICO) * 100) / 100;
    const pesoFacturable = Math.round(Math.max(pesoReal, pesoVolumetrico) * 100) / 100;
    const ganaVolumetrico = pesoVolumetrico >= pesoReal;

    dom.auditPesoReal.textContent = `${pesoReal.toFixed(2)} kg`;
    dom.livePesoVolumetrico.textContent = `${pesoVolumetrico.toFixed(2)} kg`;
    dom.auditFormulaVol.textContent = `(${alto}×${ancho}×${largo}) / 5000`;
    dom.livePesoFacturable.textContent = `${pesoFacturable.toFixed(2)} kg`;

    if (ganaVolumetrico) {
      dom.cardComparePesoVol.classList.add('active-weight');
      dom.cardComparePesoReal.classList.remove('active-weight');
      dom.tagPesoVol.textContent = 'SE TOMA ESTE (MAYOR)';
      dom.tagPesoReal.textContent = 'MENOR AL VOLUMÉTRICO';
    } else {
      dom.cardComparePesoReal.classList.add('active-weight');
      dom.cardComparePesoVol.classList.remove('active-weight');
      dom.tagPesoReal.textContent = 'SE TOMA ESTE (MAYOR)';
      dom.tagPesoVol.textContent = 'MENOR AL PESO REAL';
    }

    // 3. Zona Geográfica y Fórmula de Tarifa Base
    let tipoZona = 'URBANO';
    let baseTarifa = TARIFAS_ZONA.URBANO.BASE;
    let precioKm = TARIFAS_ZONA.URBANO.PRECIO_KM;
    let plazoHoras = 24;
    let zonaLabel = 'Zona Urbana (< 50 km): Base $1.500 + $20/km';
    let reglaCorta = 'Base $1.500 + $20/km';

    if (distanciaKm < TARIFAS_ZONA.URBANO.MAX_KM) {
      tipoZona = 'URBANO';
      baseTarifa = TARIFAS_ZONA.URBANO.BASE;
      precioKm = TARIFAS_ZONA.URBANO.PRECIO_KM;
      plazoHoras = 24;
      zonaLabel = 'Zona Urbana (< 50 km): Base $1.500 + $20/km';
      reglaCorta = 'Base $1.500 + $20/km';
    } else if (distanciaKm <= TARIFAS_ZONA.PROVINCIAL.MAX_KM) {
      tipoZona = 'PROVINCIAL';
      baseTarifa = TARIFAS_ZONA.PROVINCIAL.BASE;
      precioKm = TARIFAS_ZONA.PROVINCIAL.PRECIO_KM;
      plazoHoras = esExpress ? 24 : 48;
      zonaLabel = 'Zona Provincial (50 a 300 km): Base $3.500 + $15/km';
      reglaCorta = 'Base $3.500 + $15/km';
    } else {
      tipoZona = 'NACIONAL';
      baseTarifa = TARIFAS_ZONA.NACIONAL.BASE;
      precioKm = TARIFAS_ZONA.NACIONAL.PRECIO_KM;
      plazoHoras = esExpress ? 24 : 72;
      zonaLabel = 'Zona Nacional (> 300 km): Base $7.000 + $12/km';
      reglaCorta = 'Base $7.000 + $12/km';
    }

    dom.hintZona.textContent = zonaLabel;
    dom.liveZona.textContent = tipoZona;
    dom.livePlazoEst.textContent = `${plazoHoras}h garantizadas${esExpress ? ' (Prioridad Express)' : ''}`;
    dom.auditReglaZona.textContent = reglaCorta;

    // 4. Flota sugerida según Peso Facturable
    const { vehiculoIcon, vehiculoTexto, vehiculoClass } = obtenerInfoVehiculo(pesoFacturable);
    dom.liveVehicleBadge.className = `vehicle-pill ${vehiculoClass}`;
    dom.liveVehicleBadge.innerHTML = `<span class="vehicle-icon">${vehiculoIcon}</span> Flota sugerida: ${vehiculoTexto}`;

    // 5. Desglose de Tarifa Base, Recargos y Costo Total
    const tarifaBase = Math.round((baseTarifa + (distanciaKm * precioKm)) * 100) / 100;
    const recargoFragil = esFragil ? Math.round(tarifaBase * 0.15 * 100) / 100 : 0;
    const recargoExpress = esExpress ? Math.round(tarifaBase * 0.30 * 100) / 100 : 0;
    const costoTotal = Math.round((tarifaBase + recargoFragil + recargoExpress) * 100) / 100;

    const tarifaBaseFmt = `$${tarifaBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.liveTarifaBaseFormula.textContent = `$${baseTarifa} + (${distanciaKm} km × $${precioKm})`;
    dom.liveTarifaBase.textContent = tarifaBaseFmt;
    dom.breakdownBaseRepeat.textContent = tarifaBaseFmt;

    dom.rowRecargoFragil.style.opacity = esFragil ? '1' : '0.45';
    dom.liveRecargoFragil.textContent = esFragil
      ? `+$${recargoFragil.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      : '$0.00 (No aplica)';

    dom.rowRecargoExpress.style.opacity = esExpress ? '1' : '0.45';
    dom.liveRecargoExpress.textContent = esExpress
      ? `+$${recargoExpress.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      : '$0.00 (No aplica)';

    dom.auditValorDeclarado.textContent = `$${valorDeclarado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.liveCostoTotal.textContent = `$${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return {
      pesoVolumetrico,
      pesoFacturable,
      tipoZona,
      tarifaBase,
      recargoFragil,
      recargoExpress,
      costoTotal
    };
  }

  [
    dom.inputAlto,
    dom.inputAncho,
    dom.inputLargo,
    dom.inputPeso,
    dom.inputDistancia,
    dom.inputValorDeclarado,
    dom.checkFragil,
    dom.checkExpress
  ].forEach(input => {
    input.addEventListener('input', calcularCotizacionEnVivo);
    input.addEventListener('change', calcularCotizacionEnVivo);
  });

  // Envío del Formulario de Admisión (Pantalla 1)
  dom.admisionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cotizacion = calcularCotizacionEnVivo();
    if (!cotizacion) {
      showToast('Revisa las dimensiones o el peso real: exceden el límite operativo.', 'error');
      return;
    }

    const payload = {
      cliente: dom.inputCliente.value.trim(),
      alto: parseFloat(dom.inputAlto.value),
      ancho: parseFloat(dom.inputAncho.value),
      largo: parseFloat(dom.inputLargo.value),
      pesoReal: parseFloat(dom.inputPeso.value),
      distanciaKm: parseFloat(dom.inputDistancia.value),
      esFragil: dom.checkFragil.checked,
      esExpress: dom.checkExpress.checked,
      valorDeclarado: parseFloat(dom.inputValorDeclarado.value) || 0
    };

    if (!payload.cliente) {
      showToast('Por favor ingresa el nombre del Cliente / Remitente.', 'error');
      dom.inputCliente.focus();
      return;
    }

    try {
      dom.btnAdmitir.disabled = true;
      dom.btnSpinner.style.display = 'inline-block';

      const respuesta = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const nueva = respuesta.datos;
      showToast(`¡Encomienda admitida! Código: ${nueva.codigoSeguimiento}`, 'success', 4500);

      // Mostrar banner de confirmación en Pantalla 1
      dom.lastAdmittedBanner.style.display = 'flex';
      dom.lastAdmittedText.textContent = `Código: ${nueva.codigoSeguimiento} · Cliente: ${nueva.cliente} · Costo: $${(nueva.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

      dom.inputCliente.value = '';
      dom.inputCliente.focus();

      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'Error al registrar la encomienda', 'error');
    } finally {
      dom.btnAdmitir.disabled = false;
      dom.btnSpinner.style.display = 'none';
      calcularCotizacionEnVivo();
    }
  });

  /* ==========================================================================
     5. SINCRONIZACIÓN CENTRAL DE DATOS (MONITOR Y MÓDULO DE ENTREGAS)
     ========================================================================== */
  async function cargarDatosDashboard() {
    try {
      if (dom.refreshIcon) dom.refreshIcon.style.animation = 'spin 0.8s linear infinite';
      await verificarConexionAPI();

      const [encomiendasRes, estadisticasRes] = await Promise.all([
        apiRequest('/api/encomiendas'),
        apiRequest('/api/encomiendas/estadisticas')
      ]);

      state.encomiendas = encomiendasRes.datos || [];
      state.estadisticas = estadisticasRes.datos || null;

      actualizarKPIsYBadges();
      renderizarMonitor();
      renderizarModuloEntregas();
    } catch (err) {
      console.error('Error al sincronizar datos:', err);
      showToast('No se pudieron sincronizar los datos con el servidor.', 'error');
    } finally {
      if (dom.refreshIcon) dom.refreshIcon.style.animation = 'none';
    }
  }

  function actualizarKPIsYBadges() {
    const admitidos = state.encomiendas.filter(e => e.estado === 'ADMITIDO').length;
    const enTransito = state.encomiendas.filter(e => e.estado === 'EN_TRANSITO').length;
    const entregados = state.encomiendas.filter(e => e.estado === 'ENTREGADO').length;
    const siniestrados = state.encomiendas.filter(e => e.estado === 'SINIESTRADO').length;
    const cerrados = state.encomiendas.filter(e => ['ENTREGADO', 'DEVUELTO', 'SINIESTRADO'].includes(e.estado)).length;

    // Badges en la barra de navegación superior
    dom.navBadgeTotal.textContent = state.encomiendas.length;
    dom.navBadgeTransito.textContent = enTransito;

    // Contadores de filtros en Pantalla 2 (Monitor)
    dom.countTodos.textContent = state.encomiendas.length;
    dom.countAdmitido.textContent = admitidos;
    dom.countEnTransito.textContent = enTransito;
    dom.countEntregado.textContent = entregados;
    dom.countSiniestrado.textContent = siniestrados;

    // Contadores en Pantalla 3 (Entregas)
    dom.countTransitPending.textContent = enTransito;
    dom.countTransitClosed.textContent = cerrados;

    // KPIs de Pantalla 2
    if (state.estadisticas) {
      const stats = state.estadisticas;
      dom.kpiTotalFacturado.textContent = `$${(stats.totalRecaudado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
      dom.kpiTotalIndemnizado.textContent = `$${(stats.totalIndemnizado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
      dom.kpiPaquetesActivos.textContent = admitidos + enTransito;
      dom.kpiAdmitidosCount.textContent = admitidos;
      dom.kpiTransitoCount.textContent = enTransito;

      dom.flotaMotos.textContent = stats.distribucionFlota?.motos || 0;
      dom.flotaUtilitarios.textContent = stats.distribucionFlota?.utilitarios || 0;
      dom.flotaCamiones.textContent = stats.distribucionFlota?.camiones || 0;
    }
  }

  /* ==========================================================================
     6. 🔵 PANTALLA 2: MONITOR DE ENCOMIENDAS Y DESPACHO DE FLOTA
     ========================================================================== */
  function obtenerEncomiendasFiltradasMonitor() {
    return state.encomiendas.filter(item => {
      if (state.filtroEstado !== 'TODOS' && item.estado !== state.filtroEstado) {
        return false;
      }
      if (state.busquedaMonitor) {
        const q = state.busquedaMonitor.toLowerCase();
        const matchCode = item.codigoSeguimiento?.toLowerCase().includes(q);
        const matchClient = item.cliente?.toLowerCase().includes(q);
        return matchCode || matchClient;
      }
      return true;
    });
  }

  function renderizarMonitor() {
    const items = obtenerEncomiendasFiltradasMonitor();

    if (items.length === 0) {
      dom.emptyState.style.display = 'flex';
      dom.tableView.style.display = 'none';
      dom.cardsView.style.display = 'none';
      return;
    }

    dom.emptyState.style.display = 'none';

    if (state.vistaMonitor === 'table') {
      dom.tableView.style.display = 'block';
      dom.cardsView.style.display = 'none';
      renderizarTablaMonitor(items);
    } else {
      dom.tableView.style.display = 'none';
      dom.cardsView.style.display = 'grid';
      renderizarTarjetasMonitor(items);
    }
  }

  function renderizarTablaMonitor(items) {
    dom.encomiendasTableBody.innerHTML = items.map(enc => {
      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(enc.pesoFacturable);
      const estadoBadge = renderizarBadgeEstado(enc.estado);

      return `
        <tr data-id="${enc.id}">
          <td>
            <span class="tracking-code-badge" onclick="window.copiarAlPortapapeles('${enc.codigoSeguimiento}')" title="Clic para copiar código">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              ${enc.codigoSeguimiento}
            </span>
          </td>
          <td>
            <div style="font-weight: 700;">${enc.cliente}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">
              ${enc.esFragil ? '📦 Frágil (+15%)' : 'Estándar'} · ${enc.esExpress ? '⚡ Express (+30%)' : 'Normal'}
            </div>
          </td>
          <td>
            <span style="font-weight: 700;">${enc.tipoZona}</span>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${enc.distanciaKm} km</div>
          </td>
          <td>
            <span class="font-mono" style="font-weight: 700;">${enc.pesoFacturable} kg</span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Real: ${enc.pesoReal}kg | Vol: ${enc.pesoVolumetrico}kg</div>
          </td>
          <td>
            <span style="font-size: 1.1rem;">${vehiculoIcon}</span>
            <span style="font-size: 0.82rem; font-weight: 700; margin-left: 0.25rem;">${vehiculoTexto}</span>
          </td>
          <td>
            <span class="font-mono" style="font-weight: 800; color: #38bdf8;">
              $${(enc.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </td>
          <td>${estadoBadge}</td>
          <td class="text-right">
            <div class="table-actions-cell">
              ${renderizarBotonesAccionMonitor(enc)}
              <button class="btn btn-secondary btn-sm" onclick="window.abrirDetalleModal(${enc.id})" title="Inspeccionar detalle técnico completo">
                🔍 Detalle
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderizarTarjetasMonitor(items) {
    dom.cardsView.innerHTML = items.map(enc => {
      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(enc.pesoFacturable);
      const estadoBadge = renderizarBadgeEstado(enc.estado);

      return `
        <div class="package-card" data-id="${enc.id}">
          <div class="card-top">
            <div>
              <div class="card-client">${enc.cliente}</div>
              <span class="tracking-code-badge" onclick="window.copiarAlPortapapeles('${enc.codigoSeguimiento}')">
                ${enc.codigoSeguimiento}
              </span>
            </div>
            ${estadoBadge}
          </div>

          <div class="card-details-grid">
            <div class="detail-item">
              <span class="d-label">Zona / Distancia</span>
              <span class="d-val">${enc.tipoZona} (${enc.distanciaKm} km)</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Flota Asignable</span>
              <span class="d-val">${vehiculoIcon} ${vehiculoTexto}</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Peso Facturable</span>
              <span class="d-val font-mono">${enc.pesoFacturable} kg</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Servicio</span>
              <span class="d-val">${enc.esFragil ? '📦 Frágil' : 'Normal'} · ${enc.esExpress ? '⚡ Express' : 'Estándar'}</span>
            </div>
          </div>

          <div class="card-bottom">
            <div>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block;">COSTO TOTAL</span>
              <span class="card-price">$${(enc.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; gap: 0.45rem;">
              ${renderizarBotonesAccionMonitor(enc)}
              <button class="btn btn-secondary btn-sm" onclick="window.abrirDetalleModal(${enc.id})">
                🔍 Detalle
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderizarBotonesAccionMonitor(enc) {
    if (enc.estado === 'ADMITIDO') {
      return `
        <button class="btn btn-primary btn-sm" onclick="window.despacharEncomienda(${enc.id})" title="Asignar vehículo (Moto/Utilitario/Camión) y despachar">
          🚀 Despachar
        </button>
      `;
    }
    if (enc.estado === 'EN_TRANSITO') {
      return `
        <button class="btn btn-warning btn-sm" onclick="window.irALiquidarEntrega(${enc.id})" title="Abrir en el Módulo 3 de Entregas e Indemnizaciones">
          🟠 Liquidar Entrega
        </button>
      `;
    }
    return '';
  }

  // Acción: Despachar Encomienda desde el Monitor
  window.despacharEncomienda = async function(id) {
    try {
      showToast('Asignando flota y registrando despacho...', 'info', 1800);

      const respuesta = await apiRequest('/api/encomiendas/despachar', {
        method: 'POST',
        body: JSON.stringify({ encomiendaId: id })
      });

      const datos = respuesta.datos;
      showToast(
        `¡Encomienda despachada! Flota asignada: ${datos.vehiculoAsignado} · Plazo garantizado: ${datos.plazoGarantizadoHoras}h`,
        'success',
        4500
      );

      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'No se pudo despachar la encomienda', 'error');
    }
  };

  // Puente directo del Monitor (Pantalla 2) al Módulo de Entregas (Pantalla 3)
  window.irALiquidarEntrega = async function(encomiendaId) {
    window.cambiarVista('view-entregas');
    await window.seleccionarEncomiendaParaEntrega(encomiendaId);
  };

  /* ==========================================================================
     7. 🟠 PANTALLA 3: MÓDULO DE ENTREGAS E INDEMNIZACIONES
     ========================================================================== */
  function renderizarModuloEntregas() {
    // 1. Poblar selector desplegable superior con todas las encomiendas EN_TRANSITO
    const enTransitoList = state.encomiendas.filter(e => e.estado === 'EN_TRANSITO');
    const selectedId = state.encomiendaSeleccionadaParaEntrega?.encomienda?.id || '';

    dom.selectEncomiendaTransito.innerHTML = `
      <option value="">-- Seleccionar envío en tránsito (${enTransitoList.length} pendientes) --</option>
      ${enTransitoList.map(e => `
        <option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>
          ${e.codigoSeguimiento} — ${e.cliente} ($${(e.costoTotal || 0).toLocaleString('es-AR')})
        </option>
      `).join('')}
    `;

    // 2. Filtrar listado lateral izquierdo según sub-pestaña (EN_TRANSITO vs CERRADOS) y búsqueda
    const listaFiltrada = state.encomiendas.filter(item => {
      if (state.filtroTransito === 'EN_TRANSITO') {
        if (item.estado !== 'EN_TRANSITO') return false;
      } else {
        if (!['ENTREGADO', 'DEVUELTO', 'SINIESTRADO'].includes(item.estado)) return false;
      }

      if (state.busquedaTransito) {
        const q = state.busquedaTransito.toLowerCase();
        const matchCode = item.codigoSeguimiento?.toLowerCase().includes(q);
        const matchClient = item.cliente?.toLowerCase().includes(q);
        return matchCode || matchClient;
      }
      return true;
    });

    if (listaFiltrada.length === 0) {
      dom.transitListContainer.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <p style="font-size: 0.85rem;">
            ${state.filtroTransito === 'EN_TRANSITO'
              ? 'No hay encomiendas en tránsito pendientes de entrega. Despacha una encomienda desde el Monitor (Pestaña 2).'
              : 'Aún no hay entregas finalizadas en el historial.'}
          </p>
        </div>
      `;
      return;
    }

    dom.transitListContainer.innerHTML = listaFiltrada.map(enc => {
      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(enc.pesoFacturable);
      const isSelected = selectedId === enc.id;
      const esEnTransito = enc.estado === 'EN_TRANSITO';

      return `
        <div
          class="transit-item-card ${isSelected ? 'selected' : ''}"
          onclick="${esEnTransito ? `window.seleccionarEncomiendaParaEntrega(${enc.id})` : `window.abrirDetalleModal(${enc.id})`}"
        >
          <div class="t-card-header">
            <span class="tracking-code-badge">${enc.codigoSeguimiento}</span>
            ${renderizarBadgeEstado(enc.estado)}
          </div>
          <div class="t-card-client">${enc.cliente}</div>
          <div class="t-card-meta">
            <span>${vehiculoIcon} ${vehiculoTexto} · ${enc.tipoZona} (${enc.distanciaKm} km)</span>
            <strong class="font-mono" style="color: #38bdf8;">$${(enc.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      `;
    }).join('');
  }

  // Seleccionar una encomienda en tránsito para liquidar su entrega en el Panel Derecho
  window.seleccionarEncomiendaParaEntrega = async function(encomiendaId) {
    if (!encomiendaId) {
      state.encomiendaSeleccionadaParaEntrega = null;
      dom.emptySettlementState.style.display = 'flex';
      dom.activeSettlementForm.style.display = 'none';
      renderizarModuloEntregas();
      return;
    }

    try {
      const res = await apiRequest(`/api/encomiendas/${encomiendaId}`);
      const { encomienda, despacho } = res.datos;

      if (!despacho || encomienda.estado !== 'EN_TRANSITO') {
        showToast('Esta encomienda no se encuentra en tránsito activo.', 'info');
        return;
      }

      state.encomiendaSeleccionadaParaEntrega = { encomienda, despacho };

      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(encomienda.pesoFacturable);

      // Poblar cabecera del panel de liquidación
      dom.settlementCodigoBadge.textContent = encomienda.codigoSeguimiento;
      dom.settlementClienteNombre.textContent = encomienda.cliente;
      dom.settlementFlotaPlazo.textContent = `${vehiculoIcon} ${despacho.vehiculoAsignado || vehiculoTexto} · Plazo: ${despacho.plazoGarantizadoHoras}h`;
      dom.settlementFleteOriginal.textContent = `$${(encomienda.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
      dom.settlementSeguroDeclarado.textContent = `$${(encomienda.valorDeclarado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

      // Campos ocultos para cálculo
      dom.modalDespachoId.value = despacho.id;
      dom.modalEncomiendaId.value = encomienda.id;
      dom.modalCostoTotalFlete.value = encomienda.costoTotal;
      dom.modalValorDeclarado.value = encomienda.valorDeclarado || 0;

      // Resetear valores por defecto del formulario de cierre
      setDelayHours(0);
      const radioEntregado = document.querySelector('input[name="modalEstadoFinal"][value="ENTREGADO"]');
      if (radioEntregado) radioEntregado.checked = true;
      actualizarEstiloRadioCards();
      actualizarSimulacionIndemnizacion();

      dom.emptySettlementState.style.display = 'none';
      dom.activeSettlementForm.style.display = 'flex';

      renderizarModuloEntregas();
    } catch (err) {
      showToast(err.message || 'Error al cargar datos del envío en tránsito', 'error');
    }
  };

  dom.selectEncomiendaTransito.addEventListener('change', (e) => {
    const id = parseInt(e.target.value, 10);
    window.seleccionarEncomiendaParaEntrega(id || null);
  });

  // Sub-pestañas y buscador en Pantalla 3
  dom.btnFilterTransitPending.addEventListener('click', () => {
    state.filtroTransito = 'EN_TRANSITO';
    dom.btnFilterTransitPending.classList.add('active');
    dom.btnFilterTransitClosed.classList.remove('active');
    renderizarModuloEntregas();
  });

  dom.btnFilterTransitClosed.addEventListener('click', () => {
    state.filtroTransito = 'CERRADOS';
    dom.btnFilterTransitClosed.classList.add('active');
    dom.btnFilterTransitPending.classList.remove('active');
    renderizarModuloEntregas();
  });

  dom.transitSearchInput.addEventListener('input', () => {
    state.busquedaTransito = dom.transitSearchInput.value.trim();
    renderizarModuloEntregas();
  });

  // Control de Demora (Slider + Botones rápidos de tramo)
  function setDelayHours(horas) {
    dom.inputSliderDemora.value = horas;
    dom.sliderValDisplay.textContent = `${horas} hora${horas === 1 ? '' : 's'}`;

    dom.sliderTicks.forEach(tick => {
      const tickVal = parseInt(tick.getAttribute('data-val'), 10);
      tick.classList.toggle('active', horas >= tickVal);
    });

    dom.delayPresetBtns.forEach(btn => {
      const presetVal = parseInt(btn.getAttribute('data-delay'), 10);
      const isMatch =
        (presetVal === 0 && horas === 0) ||
        (presetVal === 24 && horas >= 1 && horas <= 24) ||
        (presetVal === 48 && horas >= 25 && horas <= 48) ||
        (presetVal === 60 && horas > 48);
      btn.classList.toggle('active', isMatch);
    });

    actualizarSimulacionIndemnizacion();
  }

  dom.inputSliderDemora.addEventListener('input', () => {
    const val = parseInt(dom.inputSliderDemora.value, 10) || 0;
    setDelayHours(val);
  });

  dom.delayPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const delay = parseInt(btn.getAttribute('data-delay'), 10) || 0;
      setDelayHours(delay);
    });
  });

  dom.modalEstadoFinalRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      actualizarEstiloRadioCards();
      actualizarSimulacionIndemnizacion();
    });
  });

  function actualizarEstiloRadioCards() {
    dom.modalEstadoFinalRadios.forEach(radio => {
      const card = radio.closest('.status-radio-card');
      if (card) card.classList.toggle('active', radio.checked);
    });

    const estadoFinal = document.querySelector('input[name="modalEstadoFinal"]:checked')?.value;
    dom.sliderGroupDemora.style.opacity = estadoFinal === 'SINIESTRADO' ? '0.6' : '1';
  }

  // Previsualización de Liquidación en Vivo (Pantalla 3)
  function actualizarSimulacionIndemnizacion() {
    const costoFlete = parseFloat(dom.modalCostoTotalFlete.value) || 0;
    const seguroDeclarado = parseFloat(dom.modalValorDeclarado.value) || 0;
    const horasDemora = parseInt(dom.inputSliderDemora.value, 10) || 0;
    const estadoFinal = document.querySelector('input[name="modalEstadoFinal"]:checked')?.value || 'ENTREGADO';

    let porcentaje = 0;
    let indemnizacionFlete = 0;
    let indemnizacionSeguro = 0;
    let pillClass = 'pill-zero';

    if (estadoFinal === 'SINIESTRADO' || horasDemora > 48) {
      porcentaje = 100;
      indemnizacionFlete = costoFlete;
      indemnizacionSeguro = seguroDeclarado;
      pillClass = 'pill-high';
    } else if (horasDemora >= 25) {
      porcentaje = 50;
      indemnizacionFlete = Math.round(costoFlete * 0.5 * 100) / 100;
      indemnizacionSeguro = 0;
      pillClass = 'pill-mid';
    } else if (horasDemora >= 1) {
      porcentaje = 20;
      indemnizacionFlete = Math.round(costoFlete * 0.2 * 100) / 100;
      indemnizacionSeguro = 0;
      pillClass = 'pill-mid';
    } else {
      porcentaje = 0;
      indemnizacionFlete = 0;
      indemnizacionSeguro = 0;
      pillClass = 'pill-zero';
    }

    const totalIndemnizado = Math.round((indemnizacionFlete + indemnizacionSeguro) * 100) / 100;
    const saldoFinal = Math.max(0, Math.round((costoFlete - indemnizacionFlete) * 100) / 100);

    dom.previewPorcentajeBadge.className = `porcentaje-pill ${pillClass}`;
    dom.previewPorcentajeBadge.textContent = `${porcentaje}% Reintegro ${
      estadoFinal === 'SINIESTRADO' || horasDemora > 48 ? '+ Cobertura Seguro' : ''
    }`;

    dom.prevCostoFlete.textContent = `$${costoFlete.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevIndemnizacionFlete.textContent = `-$${indemnizacionFlete.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevIndemnizacionSeguro.textContent = `+$${indemnizacionSeguro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevTotalIndemnizado.textContent = `$${totalIndemnizado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevSaldoFinal.textContent = `$${saldoFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  }

  // Confirmar y Liquidar Entrega en el Backend
  dom.btnConfirmarEntrega.addEventListener('click', async () => {
    const despachoId = parseInt(dom.modalDespachoId.value, 10);
    const horasDemora = parseInt(dom.inputSliderDemora.value, 10) || 0;
    const estadoFinal = document.querySelector('input[name="modalEstadoFinal"]:checked')?.value || 'ENTREGADO';

    if (!despachoId) {
      showToast('Selecciona primero una encomienda en tránsito.', 'error');
      return;
    }

    try {
      dom.btnConfirmarEntrega.disabled = true;
      dom.btnConfirmarEntrega.querySelector('.btn-spinner').style.display = 'inline-block';

      const respuesta = await apiRequest('/api/encomiendas/entregar', {
        method: 'POST',
        body: JSON.stringify({ despachoId, horasDemora, estadoFinal })
      });

      const { entrega, saldoFinalFlete } = respuesta.datos;
      showToast(
        `¡Entrega liquidada (${estadoFinal})! Reintegro aplicado: ${entrega.porcentajeReintegro}%. Saldo neto flete: $${saldoFinalFlete}`,
        'success',
        5000
      );

      state.encomiendaSeleccionadaParaEntrega = null;
      dom.emptySettlementState.style.display = 'flex';
      dom.activeSettlementForm.style.display = 'none';

      await cargarDatosDashboard();

      // Si hay otra encomienda en tránsito pendiente, seleccionarla automáticamente
      const siguiente = state.encomiendas.find(e => e.estado === 'EN_TRANSITO');
      if (siguiente) {
        await window.seleccionarEncomiendaParaEntrega(siguiente.id);
      }
    } catch (err) {
      showToast(err.message || 'Error al liquidar la entrega', 'error');
    } finally {
      dom.btnConfirmarEntrega.disabled = false;
      dom.btnConfirmarEntrega.querySelector('.btn-spinner').style.display = 'none';
    }
  });

  /* ==========================================================================
     8. MODAL DE DETALLE TÉCNICO Y TRAZABILIDAD COMPLETA
     ========================================================================== */
  window.abrirDetalleModal = async function(id) {
    try {
      const res = await apiRequest(`/api/encomiendas/${id}`);
      const { encomienda, despacho, entrega } = res.datos;

      dom.modalDetalleCodigo.textContent = `${encomienda.codigoSeguimiento} — ${encomienda.cliente}`;

      dom.modalDetalleBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="background-color: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #10b981; font-size: 0.95rem;">🟢 1. Datos de Admisión y Tarifación</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; font-size: 0.84rem;">
              <div><strong style="color:var(--text-muted);">Dimensiones:</strong> ${encomienda.alto}×${encomienda.ancho}×${encomienda.largo} cm</div>
              <div><strong style="color:var(--text-muted);">Peso Real:</strong> ${encomienda.pesoReal} kg</div>
              <div><strong style="color:var(--text-muted);">Peso Volumétrico:</strong> ${encomienda.pesoVolumetrico} kg</div>
              <div><strong style="color:var(--text-muted);">Peso Facturable:</strong> <span class="font-mono" style="font-weight:700;">${encomienda.pesoFacturable} kg</span></div>
              <div><strong style="color:var(--text-muted);">Zona:</strong> ${encomienda.tipoZona} (${encomienda.distanciaKm} km)</div>
              <div><strong style="color:var(--text-muted);">Valor Declarado:</strong> $${(encomienda.valorDeclarado || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Tarifa Base:</strong> $${(encomienda.tarifaBase || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Recargo Frágil:</strong> +$${(encomienda.recargoFragil || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Recargo Express:</strong> +$${(encomienda.recargoExpress || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Costo Total:</strong> <span class="font-mono" style="color:#38bdf8; font-weight:800;">$${(encomienda.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          <div style="background-color: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #38bdf8; font-size: 0.95rem;">🔵 2. Despacho y Asignación de Flota</h4>
            ${despacho ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.84rem;">
                <div><strong style="color:var(--text-muted);">ID Despacho:</strong> #${despacho.id}</div>
                <div><strong style="color:var(--text-muted);">Vehículo Asignado:</strong> <strong>${despacho.vehiculoAsignado}</strong></div>
                <div><strong style="color:var(--text-muted);">Plazo Garantizado:</strong> ${despacho.plazoGarantizadoHoras} horas</div>
                <div><strong style="color:var(--text-muted);">Fecha Despacho:</strong> ${despacho.fechaDespacho ? new Date(despacho.fechaDespacho).toLocaleString('es-AR') : 'Registrado'}</div>
              </div>
            ` : `<p style="font-size: 0.85rem; color: var(--text-muted);">Pendiente de despacho en el Monitor (Módulo 2).</p>`}
          </div>

          <div style="background-color: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #f59e0b; font-size: 0.95rem;">🟠 3. Cierre de Entrega y Liquidación de Indemnización</h4>
            ${entrega ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.84rem;">
                <div><strong style="color:var(--text-muted);">Estado Final:</strong> <strong>${entrega.estadoFinal}</strong></div>
                <div><strong style="color:var(--text-muted);">Demora Registrada:</strong> ${entrega.horasDemora} horas</div>
                <div><strong style="color:var(--text-muted);">Porcentaje Reintegro:</strong> ${entrega.porcentajeReintegro}%</div>
                <div><strong style="color:var(--text-muted);">Indemnización Flete:</strong> -$${(entrega.indemnizacionFlete || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                <div><strong style="color:var(--text-muted);">Indemnización Seguro:</strong> +$${(entrega.indemnizacionSeguro || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                <div><strong style="color:var(--text-muted);">Total Indemnizado:</strong> <span class="text-danger font-mono" style="font-weight:700;">$${(entrega.totalIndemnizado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
              </div>
            ` : `<p style="font-size: 0.85rem; color: var(--text-muted);">Pendiente de cierre en el Módulo 3 de Entregas.</p>`}
          </div>
        </div>
      `;

      dom.detalleModal.style.display = 'flex';
    } catch (err) {
      showToast(err.message || 'Error al obtener detalle de la encomienda', 'error');
    }
  };

  dom.btnCloseDetalleModal.addEventListener('click', () => { dom.detalleModal.style.display = 'none'; });
  dom.btnCloseDetalleFooter.addEventListener('click', () => { dom.detalleModal.style.display = 'none'; });

  /* ==========================================================================
     9. HELPERS DE UI, FILTROS DEL MONITOR Y DATOS DEMO
     ========================================================================== */
  function obtenerInfoVehiculo(pesoFacturable) {
    if (pesoFacturable < 5) return { vehiculoIcon: '🏍️', vehiculoTexto: 'Moto', vehiculoClass: 'pill-moto' };
    if (pesoFacturable <= 20) return { vehiculoIcon: '🚐', vehiculoTexto: 'Utilitario', vehiculoClass: 'pill-utilitario' };
    return { vehiculoIcon: '🚛', vehiculoTexto: 'Camión', vehiculoClass: 'pill-camion' };
  }

  function renderizarBadgeEstado(estado) {
    switch (estado) {
      case 'ADMITIDO':
        return `<span class="status-badge status-admitido">Admitido</span>`;
      case 'EN_TRANSITO':
        return `<span class="status-badge status-en_transito"><span class="pulse-indicator"></span>En Tránsito</span>`;
      case 'ENTREGADO':
        return `<span class="status-badge status-entregado">✅ Entregado</span>`;
      case 'SINIESTRADO':
        return `<span class="status-badge status-siniestrado">⚠️ Siniestrado</span>`;
      case 'DEVUELTO':
        return `<span class="status-badge status-devuelto">↩️ Devuelto</span>`;
      default:
        return `<span class="status-badge">${estado}</span>`;
    }
  }

  dom.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dom.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filtroEstado = pill.getAttribute('data-filter') || 'TODOS';
      renderizarMonitor();
    });
  });

  dom.searchInput.addEventListener('input', () => {
    state.busquedaMonitor = dom.searchInput.value.trim();
    dom.btnClearSearch.style.display = state.busquedaMonitor ? 'block' : 'none';
    renderizarMonitor();
  });

  dom.btnClearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.busquedaMonitor = '';
    dom.btnClearSearch.style.display = 'none';
    renderizarMonitor();
  });

  dom.btnViewTable.addEventListener('click', () => {
    state.vistaMonitor = 'table';
    dom.btnViewTable.classList.add('active');
    dom.btnViewCards.classList.remove('active');
    renderizarMonitor();
  });

  dom.btnViewCards.addEventListener('click', () => {
    state.vistaMonitor = 'cards';
    dom.btnViewCards.classList.add('active');
    dom.btnViewTable.classList.remove('active');
    renderizarMonitor();
  });

  dom.btnRefreshBoard.addEventListener('click', () => {
    cargarDatosDashboard();
  });

  // Generador de Datos Demo para probar los 3 módulos
  dom.btnSeedDemo.addEventListener('click', async () => {
    try {
      dom.btnSeedDemo.disabled = true;
      showToast('Generando encomiendas de prueba para los 3 módulos...', 'info', 2000);

      // 1. Encomienda en estado ADMITIDO (lista para despachar en Pantalla 2)
      await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Farmacia del Centro S.R.L.',
          alto: 15, ancho: 15, largo: 20,
          pesoReal: 2.5, distanciaKm: 25,
          esFragil: true, esExpress: true,
          valorDeclarado: 15000
        })
      });

      // 2. Encomienda despachada EN_TRANSITO (lista para liquidar en Pantalla 3)
      const adm2 = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Repuestos Automotrices Norte',
          alto: 30, ancho: 40, largo: 40,
          pesoReal: 12, distanciaKm: 140,
          esFragil: false, esExpress: false,
          valorDeclarado: 45000
        })
      });
      await apiRequest('/api/encomiendas/despachar', {
        method: 'POST',
        body: JSON.stringify({ encomiendaId: adm2.datos.id })
      });

      // 3. Encomienda ENTREGADA con 30h de demora (50% reintegro)
      const adm3 = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Industrias Metalúrgicas Sur S.A.',
          alto: 45, ancho: 50, largo: 50,
          pesoReal: 28, distanciaKm: 350,
          esFragil: false, esExpress: false,
          valorDeclarado: 80000
        })
      });
      const desp3 = await apiRequest('/api/encomiendas/despachar', {
        method: 'POST',
        body: JSON.stringify({ encomiendaId: adm3.datos.id })
      });
      await apiRequest('/api/encomiendas/entregar', {
        method: 'POST',
        body: JSON.stringify({
          despachoId: desp3.datos.despacho.id,
          horasDemora: 30,
          estadoFinal: 'ENTREGADO'
        })
      });

      // 4. Encomienda SINIESTRADA (100% flete + seguro)
      const adm4 = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Electro Hogar & Confort',
          alto: 25, ancho: 25, largo: 30,
          pesoReal: 6.5, distanciaKm: 80,
          esFragil: true, esExpress: false,
          valorDeclarado: 60000
        })
      });
      const desp4 = await apiRequest('/api/encomiendas/despachar', {
        method: 'POST',
        body: JSON.stringify({ encomiendaId: adm4.datos.id })
      });
      await apiRequest('/api/encomiendas/entregar', {
        method: 'POST',
        body: JSON.stringify({
          despachoId: desp4.datos.despacho.id,
          horasDemora: 10,
          estadoFinal: 'SINIESTRADO'
        })
      });

      showToast('¡Datos demo cargados! Revisa el Monitor (Módulo 2) y Entregas (Módulo 3).', 'success', 4500);
      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'Error al cargar datos demo', 'error');
    } finally {
      dom.btnSeedDemo.disabled = false;
    }
  });

  window.copiarAlPortapapeles = function(texto) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        showToast(`Código ${texto} copiado al portapapeles`, 'info', 2000);
      });
    } else {
      showToast(`Código: ${texto}`, 'info', 2000);
    }
  };

  function showToast(mensaje, tipo = 'info', duracion = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    let iconSvg = '';
    if (tipo === 'success') {
      iconSvg = '<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (tipo === 'error') {
      iconSvg = '<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${mensaje}</span>
      <button class="toast-close">&times;</button>
    `;

    dom.toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => removerToast(toast));
    setTimeout(() => removerToast(toast), duracion);
  }

  function removerToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dom.detalleModal.style.display = 'none';
    }
  });

  // Inicialización de la aplicación
  inicializarTema();
  calcularCotizacionEnVivo();
  cargarDatosDashboard();

  // Sincronización periódica cada 20 segundos
  setInterval(() => {
    cargarDatosDashboard();
  }, 20000);
});
