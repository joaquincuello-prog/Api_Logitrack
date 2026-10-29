/**
 * LogiTrack PRO — Lógica del Cliente Frontend SPA
 * Materia: Interfaz de Usuarios (3er Año)
 * Integrantes: Guillermo Vivas & Joaquín Cuello
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuración de la API (Usa origen actual si es servido por Express, o localhost:3000 por defecto)
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

  // Estado reactivo de la aplicación
  let state = {
    encomiendas: [],
    estadisticas: null,
    filtroEstado: 'TODOS',
    busqueda: '',
    vistaActual: 'table', // 'table' | 'cards'
    encomiendaSeleccionadaParaEntrega: null
  };

  // Referencias del DOM
  const dom = {
    themeToggle: document.getElementById('themeToggle'),
    themeIconSun: document.getElementById('themeIconSun'),
    themeIconMoon: document.getElementById('themeIconMoon'),
    apiStatusBadge: document.getElementById('apiStatusBadge'),
    btnSeedDemo: document.getElementById('btnSeedDemo'),

    // KPIs
    kpiTotalFacturado: document.getElementById('kpiTotalFacturado'),
    kpiTotalIndemnizado: document.getElementById('kpiTotalIndemnizado'),
    kpiPaquetesActivos: document.getElementById('kpiPaquetesActivos'),
    kpiAdmitidosCount: document.getElementById('kpiAdmitidosCount'),
    kpiTransitoCount: document.getElementById('kpiTransitoCount'),
    flotaMotos: document.getElementById('flotaMotos'),
    flotaUtilitarios: document.getElementById('flotaUtilitarios'),
    flotaCamiones: document.getElementById('flotaCamiones'),

    // Formulario de Admisión & Cotizador
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

    // Elementos de Previsualización en Vivo del Cotizador
    livePesoVolumetrico: document.getElementById('livePesoVolumetrico'),
    livePesoFacturable: document.getElementById('livePesoFacturable'),
    liveZona: document.getElementById('liveZona'),
    livePlazoEst: document.getElementById('livePlazoEst'),
    liveVehicleBadge: document.getElementById('liveVehicleBadge'),
    liveTarifaBase: document.getElementById('liveTarifaBase'),
    liveTarifaBaseFormula: document.getElementById('liveTarifaBaseFormula'),
    liveRecargoFragil: document.getElementById('liveRecargoFragil'),
    rowRecargoFragil: document.getElementById('rowRecargoFragil'),
    liveRecargoExpress: document.getElementById('liveRecargoExpress'),
    rowRecargoExpress: document.getElementById('rowRecargoExpress'),
    liveCostoTotal: document.getElementById('liveCostoTotal'),

    // Tablero Operativo
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
    skeletonLoader: document.getElementById('skeletonLoader'),

    // Contadores de Filtros
    countTodos: document.getElementById('countTodos'),
    countAdmitido: document.getElementById('countAdmitido'),
    countEnTransito: document.getElementById('countEnTransito'),
    countEntregado: document.getElementById('countEntregado'),
    countSiniestrado: document.getElementById('countSiniestrado'),

    // Modal de Entrega
    entregaModal: document.getElementById('entregaModal'),
    btnCloseEntregaModal: document.getElementById('btnCloseEntregaModal'),
    btnCancelEntrega: document.getElementById('btnCancelEntrega'),
    btnConfirmarEntrega: document.getElementById('btnConfirmarEntrega'),
    modalEntregaSubtitle: document.getElementById('modalEntregaSubtitle'),
    modalDespachoId: document.getElementById('modalDespachoId'),
    modalEncomiendaId: document.getElementById('modalEncomiendaId'),
    modalCostoTotalFlete: document.getElementById('modalCostoTotalFlete'),
    modalValorDeclarado: document.getElementById('modalValorDeclarado'),
    modalEstadoFinalRadios: document.querySelectorAll('input[name="modalEstadoFinal"]'),
    sliderGroupDemora: document.getElementById('sliderGroupDemora'),
    inputSliderDemora: document.getElementById('inputSliderDemora'),
    sliderValDisplay: document.getElementById('sliderValDisplay'),
    sliderTicks: document.querySelectorAll('.slider-scale-ticks .tick'),
    previewPorcentajeBadge: document.getElementById('previewPorcentajeBadge'),
    prevCostoFlete: document.getElementById('prevCostoFlete'),
    prevIndemnizacionFlete: document.getElementById('prevIndemnizacionFlete'),
    prevIndemnizacionSeguro: document.getElementById('prevIndemnizacionSeguro'),
    prevTotalIndemnizado: document.getElementById('prevTotalIndemnizado'),
    prevSaldoFinal: document.getElementById('prevSaldoFinal'),

    // Modal de Detalle
    detalleModal: document.getElementById('detalleModal'),
    modalDetalleCodigo: document.getElementById('modalDetalleCodigo'),
    modalDetalleBody: document.getElementById('modalDetalleBody'),
    btnCloseDetalleModal: document.getElementById('btnCloseDetalleModal'),
    btnCloseDetalleFooter: document.getElementById('btnCloseDetalleFooter'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     1. GESTIÓN DE TEMA (MODO OSCURO / MODO CLARO)
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
     2. CLIENTE DE API Y HEALTH CHECK
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
      // Ignorar error y marcar offline
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
     3. MOTOR DE COTIZACIÓN Y VALIDACIÓN EN TIEMPO REAL
     ========================================================================== */
  function calcularCotizacionEnVivo() {
    const alto = parseFloat(dom.inputAlto.value) || 0;
    const ancho = parseFloat(dom.inputAncho.value) || 0;
    const largo = parseFloat(dom.inputLargo.value) || 0;
    const pesoReal = parseFloat(dom.inputPeso.value) || 0;
    const distanciaKm = parseFloat(dom.inputDistancia.value) || 0;
    const esFragil = dom.checkFragil.checked;
    const esExpress = dom.checkExpress.checked;

    // 1. Validación de Límites Físicos (Reglas de Negocio)
    const errores = [];
    if (alto > LIMITES.LADO_MAXIMO_CM) errores.push(`Alto (${alto} cm) supera el límite de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (ancho > LIMITES.LADO_MAXIMO_CM) errores.push(`Ancho (${ancho} cm) supera el límite de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (largo > LIMITES.LADO_MAXIMO_CM) errores.push(`Largo (${largo} cm) supera el límite de ${LIMITES.LADO_MAXIMO_CM} cm`);
    if (pesoReal > LIMITES.PESO_MAXIMO_KG) errores.push(`Peso real (${pesoReal} kg) supera el límite de ${LIMITES.PESO_MAXIMO_KG} kg`);
    if (alto <= 0 || ancho <= 0 || largo <= 0 || pesoReal <= 0 || distanciaKm <= 0) {
      errores.push('Las dimensiones, peso y distancia deben ser mayores a cero');
    }

    // Manejo de Feedback Visual Inmediato (Color rojo en inputs y banner de advertencia)
    dom.inputAlto.classList.toggle('input-error', alto > LIMITES.LADO_MAXIMO_CM);
    dom.inputAncho.classList.toggle('input-error', ancho > LIMITES.LADO_MAXIMO_CM);
    dom.inputLargo.classList.toggle('input-error', largo > LIMITES.LADO_MAXIMO_CM);
    dom.inputPeso.classList.toggle('input-error', pesoReal > LIMITES.PESO_MAXIMO_KG);

    if (errores.length > 0) {
      dom.physicalLimitAlert.style.display = 'flex';
      dom.physicalLimitMsg.textContent = errores.join(' · ');
      dom.btnAdmitir.disabled = true;
      return null;
    } else {
      dom.physicalLimitAlert.style.display = 'none';
      dom.btnAdmitir.disabled = false;
    }

    // 2. Cálculo Volumétrico y Facturable
    const volumen = alto * ancho * largo;
    const pesoVolumetrico = Math.round((volumen / LIMITES.DIVISOR_VOLUMETRICO) * 100) / 100;
    const pesoFacturable = Math.round(Math.max(pesoReal, pesoVolumetrico) * 100) / 100;

    // 3. Determinación de Zona y Plazo Estimado
    let tipoZona = 'URBANO';
    let baseTarifa = TARIFAS_ZONA.URBANO.BASE;
    let precioKm = TARIFAS_ZONA.URBANO.PRECIO_KM;
    let plazoHoras = esExpress ? 24 : 24;
    let zonaLabel = 'Urbano ($1500 + $20/km)';

    if (distanciaKm < TARIFAS_ZONA.URBANO.MAX_KM) {
      tipoZona = 'URBANO';
      baseTarifa = TARIFAS_ZONA.URBANO.BASE;
      precioKm = TARIFAS_ZONA.URBANO.PRECIO_KM;
      plazoHoras = esExpress ? 24 : 24;
      zonaLabel = 'Urbano ($1500 + $20/km)';
    } else if (distanciaKm <= TARIFAS_ZONA.PROVINCIAL.MAX_KM) {
      tipoZona = 'PROVINCIAL';
      baseTarifa = TARIFAS_ZONA.PROVINCIAL.BASE;
      precioKm = TARIFAS_ZONA.PROVINCIAL.PRECIO_KM;
      plazoHoras = esExpress ? 24 : 48;
      zonaLabel = 'Provincial ($3500 + $15/km)';
    } else {
      tipoZona = 'NACIONAL';
      baseTarifa = TARIFAS_ZONA.NACIONAL.BASE;
      precioKm = TARIFAS_ZONA.NACIONAL.PRECIO_KM;
      plazoHoras = esExpress ? 24 : 72;
      zonaLabel = 'Nacional ($7000 + $12/km)';
    }

    dom.hintZona.textContent = zonaLabel;

    // 4. Asignación Proyectada de Flota
    let vehiculoSugerido = 'UTILITARIO';
    let vehiculoIcon = '🚐';
    let vehiculoClass = 'pill-utilitario';

    if (pesoFacturable < 5) {
      vehiculoSugerido = 'MOTO';
      vehiculoIcon = '🏍️';
      vehiculoClass = 'pill-moto';
    } else if (pesoFacturable <= 20) {
      vehiculoSugerido = 'UTILITARIO';
      vehiculoIcon = '🚐';
      vehiculoClass = 'pill-utilitario';
    } else {
      vehiculoSugerido = 'CAMION';
      vehiculoIcon = '🚛';
      vehiculoClass = 'pill-camion';
    }

    // 5. Desglose Tarifario
    const tarifaBase = Math.round((baseTarifa + (distanciaKm * precioKm)) * 100) / 100;
    const recargoFragil = esFragil ? Math.round(tarifaBase * 0.15 * 100) / 100 : 0;
    const recargoExpress = esExpress ? Math.round(tarifaBase * 0.30 * 100) / 100 : 0;
    const costoTotal = Math.round((tarifaBase + recargoFragil + recargoExpress) * 100) / 100;

    // Actualizar Widget en Vivo del DOM
    dom.livePesoVolumetrico.textContent = `${pesoVolumetrico.toFixed(2)} kg`;
    dom.livePesoFacturable.textContent = `${pesoFacturable.toFixed(2)} kg`;
    dom.liveZona.textContent = tipoZona;
    dom.livePlazoEst.textContent = `${plazoHoras}h garantizadas`;

    dom.liveVehicleBadge.className = `vehicle-pill ${vehiculoClass}`;
    dom.liveVehicleBadge.innerHTML = `<span class="vehicle-icon">${vehiculoIcon}</span> ${vehiculoSugerido} sugerido`;

    dom.liveTarifaBaseFormula.textContent = `${baseTarifa} + ${distanciaKm}km×$${precioKm}`;
    dom.liveTarifaBase.textContent = `$${tarifaBase.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    dom.rowRecargoFragil.style.display = esFragil ? 'flex' : 'none';
    dom.liveRecargoFragil.textContent = `+$${recargoFragil.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    dom.rowRecargoExpress.style.display = esExpress ? 'flex' : 'none';
    dom.liveRecargoExpress.textContent = `+$${recargoExpress.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    dom.liveCostoTotal.textContent = `$${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return {
      pesoVolumetrico,
      pesoFacturable,
      tipoZona,
      tarifaBase,
      recargoFragil,
      recargoExpress,
      costoTotal,
      vehiculoSugerido
    };
  }

  // Escuchar cambios en vivo en los campos de entrada
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

  /* ==========================================================================
     4. ENVÍO DEL FORMULARIO DE ADMISIÓN
     ========================================================================== */
  dom.admisionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cotizacion = calcularCotizacionEnVivo();
    if (!cotizacion) {
      showToast('Por favor corrige las dimensiones o pesos excedidos.', 'error');
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
      showToast('El nombre del cliente es obligatorio.', 'error');
      dom.inputCliente.focus();
      return;
    }

    try {
      // Estado de carga en botón
      dom.btnAdmitir.disabled = true;
      dom.btnSpinner.style.display = 'inline-block';

      const respuesta = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`¡Encomienda admitida con éxito! Código: ${respuesta.datos.codigoSeguimiento}`, 'success');

      // Limpiar cliente pero mantener valores prácticos
      dom.inputCliente.value = '';
      dom.inputCliente.focus();

      // Refrescar lista y estadísticas
      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'Error al admitir encomienda', 'error');
    } finally {
      dom.btnAdmitir.disabled = false;
      dom.btnSpinner.style.display = 'none';
      calcularCotizacionEnVivo();
    }
  });

  /* ==========================================================================
     5. CARGA Y RENDERIZADO DEL TABLERO Y KPIS
     ========================================================================== */
  async function cargarDatosDashboard() {
    try {
      dom.refreshIcon.style.animation = 'spin 0.8s linear infinite';
      await verificarConexionAPI();

      // Cargar Encomiendas y Estadísticas en paralelo
      const [encomiendasRes, estadisticasRes] = await Promise.all([
        apiRequest('/api/encomiendas'),
        apiRequest('/api/encomiendas/estadisticas')
      ]);

      state.encomiendas = encomiendasRes.datos || [];
      state.estadisticas = estadisticasRes.datos || null;

      actualizarKPIs();
      actualizarContadoresFiltros();
      renderizarTablero();
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      showToast('No se pudieron actualizar los datos del servidor.', 'error');
    } finally {
      dom.refreshIcon.style.animation = 'none';
    }
  }

  function actualizarKPIs() {
    if (!state.estadisticas) return;

    const stats = state.estadisticas;
    dom.kpiTotalFacturado.textContent = `$${(stats.totalRecaudado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.kpiTotalIndemnizado.textContent = `$${(stats.totalIndemnizado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    // Paquetes activos (Admitidos + En Tránsito)
    const admitidos = state.encomiendas.filter(e => e.estado === 'ADMITIDO').length;
    const transito = state.encomiendas.filter(e => e.estado === 'EN_TRANSITO').length;
    dom.kpiPaquetesActivos.textContent = admitidos + transito;
    dom.kpiAdmitidosCount.textContent = admitidos;
    dom.kpiTransitoCount.textContent = transito;

    // Flota
    dom.flotaMotos.textContent = stats.distribucionFlota?.motos || 0;
    dom.flotaUtilitarios.textContent = stats.distribucionFlota?.utilitarios || 0;
    dom.flotaCamiones.textContent = stats.distribucionFlota?.camiones || 0;
  }

  function actualizarContadoresFiltros() {
    dom.countTodos.textContent = state.encomiendas.length;
    dom.countAdmitido.textContent = state.encomiendas.filter(e => e.estado === 'ADMITIDO').length;
    dom.countEnTransito.textContent = state.encomiendas.filter(e => e.estado === 'EN_TRANSITO').length;
    dom.countEntregado.textContent = state.encomiendas.filter(e => e.estado === 'ENTREGADO').length;
    dom.countSiniestrado.textContent = state.encomiendas.filter(e => e.estado === 'SINIESTRADO').length;
  }

  function obtenerEncomiendasFiltradas() {
    return state.encomiendas.filter(item => {
      // Filtro por Estado
      if (state.filtroEstado !== 'TODOS' && item.estado !== state.filtroEstado) {
        return false;
      }
      // Filtro por Búsqueda (código o cliente)
      if (state.busqueda) {
        const query = state.busqueda.toLowerCase();
        const coincideCodigo = item.codigoSeguimiento?.toLowerCase().includes(query);
        const coincideCliente = item.cliente?.toLowerCase().includes(query);
        return coincideCodigo || coincideCliente;
      }
      return true;
    });
  }

  function renderizarTablero() {
    const encomiendas = obtenerEncomiendasFiltradas();

    if (encomiendas.length === 0) {
      dom.emptyState.style.display = 'flex';
      dom.tableView.style.display = 'none';
      dom.cardsView.style.display = 'none';
      return;
    }

    dom.emptyState.style.display = 'none';

    if (state.vistaActual === 'table') {
      dom.tableView.style.display = 'block';
      dom.cardsView.style.display = 'none';
      renderizarTabla(encomiendas);
    } else {
      dom.tableView.style.display = 'none';
      dom.cardsView.style.display = 'grid';
      renderizarTarjetas(encomiendas);
    }
  }

  function renderizarTabla(items) {
    dom.encomiendasTableBody.innerHTML = items.map(enc => {
      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(enc.pesoFacturable);
      const estadoBadge = renderizarBadgeEstado(enc.estado);

      return `
        <tr data-id="${enc.id}">
          <td>
            <span class="tracking-code-badge" onclick="window.copiarAlPortapapeles('${enc.codigoSeguimiento}')" title="Copiar código al portapapeles">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              ${enc.codigoSeguimiento}
            </span>
          </td>
          <td>
            <div style="font-weight: 700;">${enc.cliente}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${enc.esFragil ? '📦 Frágil' : ''} ${enc.esExpress ? '⚡ Express' : ''}</div>
          </td>
          <td>
            <span style="font-weight: 600;">${enc.tipoZona}</span>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${enc.distanciaKm} km</div>
          </td>
          <td>
            <span class="font-mono font-bold">${enc.pesoFacturable} kg</span>
            <div style="font-size: 0.7rem; color: var(--text-muted);">(Real: ${enc.pesoReal}kg)</div>
          </td>
          <td>
            <span title="${vehiculoTexto}">
              <span style="font-size: 1.15rem;">${vehiculoIcon}</span>
              <span style="font-size: 0.8rem; font-weight: 600; margin-left: 0.2rem;">${vehiculoTexto}</span>
            </span>
          </td>
          <td>
            <span class="font-mono" style="font-weight: 700; color: #38bdf8;">
              $${(enc.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </td>
          <td>
            ${estadoBadge}
          </td>
          <td class="text-right">
            <div class="table-actions-cell">
              ${renderizarBotonesAccion(enc)}
              <button class="btn btn-secondary btn-sm" onclick="window.abrirDetalleModal(${enc.id})" title="Ver detalles y trazabilidad">
                Ver
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderizarTarjetas(items) {
    dom.cardsView.innerHTML = items.map(enc => {
      const { vehiculoIcon, vehiculoTexto } = obtenerInfoVehiculo(enc.pesoFacturable);
      const estadoBadge = renderizarBadgeEstado(enc.estado);

      return `
        <div class="package-card" data-id="${enc.id}">
          <div class="card-top">
            <div>
              <div class="card-client">${enc.cliente}</div>
              <span class="tracking-code-badge" onclick="window.copiarAlPortapapeles('${enc.codigoSeguimiento}')" title="Copiar código">
                ${enc.codigoSeguimiento}
              </span>
            </div>
            ${estadoBadge}
          </div>

          <div class="card-details-grid">
            <div class="detail-item">
              <span class="d-label">Zona / Dist.</span>
              <span class="d-val">${enc.tipoZona} (${enc.distanciaKm}km)</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Vehículo</span>
              <span class="d-val">${vehiculoIcon} ${vehiculoTexto}</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Peso Facturable</span>
              <span class="d-val font-mono">${enc.pesoFacturable} kg</span>
            </div>
            <div class="detail-item">
              <span class="d-label">Características</span>
              <span class="d-val" style="font-size: 0.72rem;">${enc.esFragil ? '📦 Frágil' : 'Normal'} · ${enc.esExpress ? '⚡ Express' : 'Estándar'}</span>
            </div>
          </div>

          <div class="card-bottom">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">TARIFA TOTAL</span>
              <span class="card-price">$${(enc.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; gap: 0.45rem;">
              ${renderizarBotonesAccion(enc)}
              <button class="btn btn-secondary btn-sm" onclick="window.abrirDetalleModal(${enc.id})">
                Detalle
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function obtenerInfoVehiculo(pesoFacturable) {
    if (pesoFacturable < 5) return { vehiculoIcon: '🏍️', vehiculoTexto: 'Moto' };
    if (pesoFacturable <= 20) return { vehiculoIcon: '🚐', vehiculoTexto: 'Utilitario' };
    return { vehiculoIcon: '🚛', vehiculoTexto: 'Camión' };
  }

  function renderizarBadgeEstado(estado) {
    switch (estado) {
      case 'ADMITIDO':
        return `<span class="status-badge status-admitido">Admitido</span>`;
      case 'EN_TRANSITO':
        return `<span class="status-badge status-en_transito"><span class="pulse-indicator"></span>En Ruta</span>`;
      case 'ENTREGADO':
        return `<span class="status-badge status-entregado">✅ Entregado</span>`;
      case 'SINIESTRADO':
        return `<span class="status-badge status-siniestrado">⚠️ Siniestrado</span>`;
      case 'DEVUELTO':
        return `<span class="status-badge status-devuelto">Devuelto</span>`;
      default:
        return `<span class="status-badge">${estado}</span>`;
    }
  }

  function renderizarBotonesAccion(enc) {
    if (enc.estado === 'ADMITIDO') {
      return `
        <button class="btn btn-primary btn-sm" onclick="window.despacharEncomienda(${enc.id})" title="Asigna vehículo y fija plazo garantizado">
          🚀 Despachar
        </button>
      `;
    }
    if (enc.estado === 'EN_TRANSITO') {
      return `
        <button class="btn btn-warning btn-sm" onclick="window.abrirModalEntrega(${enc.id})" title="Registrar entrega, horas de demora e indemnización">
          📦 Entregar
        </button>
      `;
    }
    return '';
  }

  /* ==========================================================================
     6. ACCIÓN 1: DESPACHO EN 1 CLIC
     ========================================================================== */
  window.despacharEncomienda = async function(id) {
    try {
      showToast('Asignando vehículo y despachando...', 'info', 1500);

      const respuesta = await apiRequest('/api/encomiendas/despachar', {
        method: 'POST',
        body: JSON.stringify({ encomiendaId: id })
      });

      const datos = respuesta.datos;
      showToast(`¡Despachado! Vehículo: ${datos.vehiculoAsignado} · Plazo garantizado: ${datos.plazoGarantizadoHoras}h`, 'success', 4000);

      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'No se pudo despachar la encomienda', 'error');
    }
  };

  /* ==========================================================================
     7. ACCIÓN 2: MODAL REGISTRO DE ENTREGA E INDEMNIZACIÓN EN TIEMPO REAL
     ========================================================================== */
  window.abrirModalEntrega = async function(encomiendaId) {
    try {
      // Obtener detalle completo de la encomienda y su despacho activo
      const res = await apiRequest(`/api/encomiendas/${encomiendaId}`);
      const { encomienda, despacho } = res.datos;

      if (!despacho) {
        showToast('No se encontró el despacho asociado a esta encomienda.', 'error');
        return;
      }

      state.encomiendaSeleccionadaParaEntrega = { encomienda, despacho };

      // Configurar inputs del modal
      dom.modalEntregaSubtitle.textContent = `Código: ${encomienda.codigoSeguimiento} — Cliente: ${encomienda.cliente}`;
      dom.modalDespachoId.value = despacho.id;
      dom.modalEncomiendaId.value = encomienda.id;
      dom.modalCostoTotalFlete.value = encomienda.costoTotal;
      dom.modalValorDeclarado.value = encomienda.valorDeclarado || 0;

      // Resetear controles
      dom.inputSliderDemora.value = 0;
      dom.sliderValDisplay.textContent = '0 horas';
      document.querySelector('input[name="modalEstadoFinal"][value="ENTREGADO"]').checked = true;
      actualizarEstiloRadioCards();

      // Recalcular simulación interactiva
      actualizarSimulacionIndemnizacion();

      // Mostrar modal
      dom.entregaModal.style.display = 'flex';
    } catch (err) {
      showToast(err.message || 'Error al preparar la entrega', 'error');
    }
  };

  function cerrarModalEntrega() {
    dom.entregaModal.style.display = 'none';
    state.encomiendaSeleccionadaParaEntrega = null;
  }

  dom.btnCloseEntregaModal.addEventListener('click', cerrarModalEntrega);
  dom.btnCancelEntrega.addEventListener('click', cerrarModalEntrega);

  // Escuchar cambio en el Slider de Demora
  dom.inputSliderDemora.addEventListener('input', () => {
    const val = parseInt(dom.inputSliderDemora.value, 10);
    dom.sliderValDisplay.textContent = `${val} hora${val === 1 ? '' : 's'}`;

    // Actualizar ticks activos
    dom.sliderTicks.forEach(tick => {
      const tickVal = parseInt(tick.getAttribute('data-val'), 10);
      tick.classList.toggle('active', val >= tickVal);
    });

    actualizarSimulacionIndemnizacion();
  });

  // Escuchar cambio en selector de Estado Final (Radio buttons)
  dom.modalEstadoFinalRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      actualizarEstiloRadioCards();
      actualizarSimulacionIndemnizacion();
    });
  });

  function actualizarEstiloRadioCards() {
    dom.modalEstadoFinalRadios.forEach(radio => {
      const card = radio.closest('.status-radio-card');
      if (card) {
        card.classList.toggle('active', radio.checked);
      }
    });

    const estadoFinal = document.querySelector('input[name="modalEstadoFinal"]:checked')?.value;
    // Si es siniestrado, el slider puede bloquearse o advertirse
    if (estadoFinal === 'SINIESTRADO') {
      dom.sliderGroupDemora.style.opacity = '0.6';
    } else {
      dom.sliderGroupDemora.style.opacity = '1';
    }
  }

  // Motor de Previsualización Interactiva de Liquidación
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

    // Actualizar elementos DOM
    dom.previewPorcentajeBadge.className = `porcentaje-pill ${pillClass}`;
    dom.previewPorcentajeBadge.textContent = `${porcentaje}% Reintegro ${estadoFinal === 'SINIESTRADO' ? '+ Seguro' : ''}`;

    dom.prevCostoFlete.textContent = `$${costoFlete.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevIndemnizacionFlete.textContent = `-$${indemnizacionFlete.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevIndemnizacionSeguro.textContent = `+$${indemnizacionSeguro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevTotalIndemnizado.textContent = `$${totalIndemnizado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    dom.prevSaldoFinal.textContent = `$${saldoFinal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  }

  // Confirmar Entrega en el Backend
  dom.btnConfirmarEntrega.addEventListener('click', async () => {
    const despachoId = parseInt(dom.modalDespachoId.value, 10);
    const horasDemora = parseInt(dom.inputSliderDemora.value, 10);
    const estadoFinal = document.querySelector('input[name="modalEstadoFinal"]:checked')?.value || 'ENTREGADO';

    try {
      dom.btnConfirmarEntrega.disabled = true;
      dom.btnConfirmarEntrega.querySelector('.btn-spinner').style.display = 'inline-block';

      const respuesta = await apiRequest('/api/encomiendas/entregar', {
        method: 'POST',
        body: JSON.stringify({ despachoId, horasDemora, estadoFinal })
      });

      const { entrega, saldoFinalFlete } = respuesta.datos;
      showToast(
        `Entrega registrada (${estadoFinal}). Reintegro: ${entrega.porcentajeReintegro}%. Saldo final flete: $${saldoFinalFlete}`,
        'success',
        5000
      );

      cerrarModalEntrega();
      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'Error al liquidar entrega', 'error');
    } finally {
      dom.btnConfirmarEntrega.disabled = false;
      dom.btnConfirmarEntrega.querySelector('.btn-spinner').style.display = 'none';
    }
  });

  /* ==========================================================================
     8. MODAL DE DETALLE Y TRAZABILIDAD COMPLETA
     ========================================================================== */
  window.abrirDetalleModal = async function(id) {
    try {
      const res = await apiRequest(`/api/encomiendas/${id}`);
      const { encomienda, despacho, entrega } = res.datos;

      dom.modalDetalleCodigo.textContent = `${encomienda.codigoSeguimiento} — ${encomienda.cliente}`;

      dom.modalDetalleBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Bloque 1: Encomienda y Tarifación -->
          <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #38bdf8; font-size: 0.95rem;">📦 Datos Físicos & Liquidación Tarifaria</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
              <div><strong style="color:var(--text-muted);">Dimensiones:</strong> ${encomienda.alto}×${encomienda.ancho}×${encomienda.largo} cm</div>
              <div><strong style="color:var(--text-muted);">Peso Real:</strong> ${encomienda.pesoReal} kg</div>
              <div><strong style="color:var(--text-muted);">Peso Volumétrico:</strong> ${encomienda.pesoVolumetrico} kg</div>
              <div><strong style="color:var(--text-muted);">Peso Facturable:</strong> <span class="font-mono" style="font-weight:700;">${encomienda.pesoFacturable} kg</span></div>
              <div><strong style="color:var(--text-muted);">Zona:</strong> ${encomienda.tipoZona} (${encomienda.distanciaKm} km)</div>
              <div><strong style="color:var(--text-muted);">Valor Declarado:</strong> $${(encomienda.valorDeclarado || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Tarifa Base:</strong> $${(encomienda.tarifaBase || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Recargo Frágil:</strong> +$${(encomienda.recargoFragil || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Recargo Express:</strong> +$${(encomienda.recargoExpress || 0).toLocaleString('es-AR')}</div>
              <div><strong style="color:var(--text-muted);">Costo Total:</strong> <span class="font-mono" style="color:#38bdf8; font-weight:800; font-size:1.05rem;">$${(encomienda.costoTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          <!-- Bloque 2: Despacho y Asignación de Flota -->
          <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #10b981; font-size: 0.95rem;">🚀 Despacho & Asignación de Flota</h4>
            ${despacho ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
                <div><strong style="color:var(--text-muted);">ID Despacho:</strong> #${despacho.id}</div>
                <div><strong style="color:var(--text-muted);">Vehículo Asignado:</strong> <span style="font-weight:700;">${despacho.vehiculoAsignado}</span></div>
                <div><strong style="color:var(--text-muted);">Plazo Garantizado:</strong> ${despacho.plazoGarantizadoHoras} horas</div>
                <div><strong style="color:var(--text-muted);">Fecha Despacho:</strong> ${despacho.fechaDespacho ? new Date(despacho.fechaDespacho).toLocaleString('es-AR') : 'Registrado'}</div>
              </div>
            ` : `
              <p style="font-size: 0.85rem; color: var(--text-muted);">Pendiente de asignación y despacho.</p>
            `}
          </div>

          <!-- Bloque 3: Entrega & Liquidación de Indemnización -->
          <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="margin-bottom: 0.75rem; color: #f59e0b; font-size: 0.95rem;">⚖️ Resultado de Entrega & Liquidación</h4>
            ${entrega ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.82rem;">
                <div><strong style="color:var(--text-muted);">Estado Final:</strong> <span style="font-weight:700;">${entrega.estadoFinal}</span></div>
                <div><strong style="color:var(--text-muted);">Demora Registrada:</strong> ${entrega.horasDemora} horas</div>
                <div><strong style="color:var(--text-muted);">Porcentaje Reintegro:</strong> ${entrega.porcentajeReintegro}%</div>
                <div><strong style="color:var(--text-muted);">Indemnización Flete:</strong> -$${(entrega.indemnizacionFlete || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                <div><strong style="color:var(--text-muted);">Indemnización Seguro:</strong> +$${(entrega.indemnizacionSeguro || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                <div><strong style="color:var(--text-muted);">Total Indemnizado:</strong> <span class="text-danger font-mono" style="font-weight:700;">$${(entrega.totalIndemnizado || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
              </div>
            ` : `
              <p style="font-size: 0.85rem; color: var(--text-muted);">Entrega en proceso de transporte o pendiente de confirmación.</p>
            `}
          </div>

        </div>
      `;

      dom.detalleModal.style.display = 'flex';
    } catch (err) {
      showToast(err.message || 'Error al obtener detalle', 'error');
    }
  };

  dom.btnCloseDetalleModal.addEventListener('click', () => { dom.detalleModal.style.display = 'none'; });
  dom.btnCloseDetalleFooter.addEventListener('click', () => { dom.detalleModal.style.display = 'none'; });

  /* ==========================================================================
     9. GENERADOR DE DATOS DE PRUEBA (DEMO SEED DATA)
     ========================================================================== */
  dom.btnSeedDemo.addEventListener('click', async () => {
    try {
      dom.btnSeedDemo.disabled = true;
      showToast('Cargando datos de prueba del curso...', 'info', 2000);

      // Encomienda 1: Liviana (< 5kg -> Moto), se queda en ADMITIDO
      await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Farmacia del Centro',
          alto: 15, ancho: 15, largo: 20,
          pesoReal: 2.5, distanciaKm: 25,
          esFragil: true, esExpress: true,
          valorDeclarado: 12000
        })
      });

      // Encomienda 2: Mediana (5 a 20kg -> Utilitario), se despacha y queda EN_TRANSITO
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

      // Encomienda 3: Pesada (> 20kg -> Camión), despachada y ENTREGADA con 30h de demora (50% reintegro)
      const adm3 = await apiRequest('/api/encomiendas/admitir', {
        method: 'POST',
        body: JSON.stringify({
          cliente: 'Industrias Metalúrgicas S.A.',
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

      // Encomienda 4: Tecnológica frágil, despachada y declarada SINIESTRADA (100% flete + seguro)
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

      showToast('¡Datos demo cargados con éxito! Se crearon 4 encomiendas representativas.', 'success', 4000);
      await cargarDatosDashboard();
    } catch (err) {
      showToast(err.message || 'Error al sembrar datos de prueba', 'error');
    } finally {
      dom.btnSeedDemo.disabled = false;
    }
  });

  /* ==========================================================================
     10. CONTROLADORES DE FILTROS, BÚSQUEDA Y VISTAS
     ========================================================================== */
  dom.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dom.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filtroEstado = pill.getAttribute('data-filter') || 'TODOS';
      renderizarTablero();
    });
  });

  dom.searchInput.addEventListener('input', () => {
    state.busqueda = dom.searchInput.value.trim();
    dom.btnClearSearch.style.display = state.busqueda ? 'block' : 'none';
    renderizarTablero();
  });

  dom.btnClearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.busqueda = '';
    dom.btnClearSearch.style.display = 'none';
    renderizarTablero();
  });

  dom.btnViewTable.addEventListener('click', () => {
    state.vistaActual = 'table';
    dom.btnViewTable.classList.add('active');
    dom.btnViewCards.classList.remove('active');
    renderizarTablero();
  });

  dom.btnViewCards.addEventListener('click', () => {
    state.vistaActual = 'cards';
    dom.btnViewCards.classList.add('active');
    dom.btnViewTable.classList.remove('active');
    renderizarTablero();
  });

  dom.btnRefreshBoard.addEventListener('click', () => {
    cargarDatosDashboard();
  });

  // Copiar código al portapapeles
  window.copiarAlPortapapeles = function(texto) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        showToast(`Código ${texto} copiado al portapapeles`, 'info', 2000);
      });
    } else {
      showToast(`Código: ${texto}`, 'info', 2000);
    }
  };

  /* ==========================================================================
     11. SISTEMA DE NOTIFICACIONES TOAST
     ========================================================================== */
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

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      removerToast(toast);
    });

    setTimeout(() => {
      removerToast(toast);
    }, duracion);
  }

  function removerToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }

  // Cerrar modales con tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModalEntrega();
      dom.detalleModal.style.display = 'none';
    }
  });

  /* ==========================================================================
     INICIALIZACIÓN
     ========================================================================== */
  inicializarTema();
  calcularCotizacionEnVivo();
  cargarDatosDashboard();

  // Auto-refresco cada 20 segundos
  setInterval(() => {
    cargarDatosDashboard();
  }, 20000);
});
