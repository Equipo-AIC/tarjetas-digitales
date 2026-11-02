/* App "Tarjeta AIC": dos accesos (QR y datos) sobre la tarjeta digital existente.
   La tarjeta original no se modifica: se muestra tal cual dentro de la app y de ella
   se toman nombre, cargo y foto. El QR se genera con la misma librería y el mismo
   enlace del QR ya distribuido, así que apunta exactamente al mismo destino. */
(function () {
  const id = window.PERSONA;
  const p = (window.PERSONAS || {})[id];
  const raiz = '../../';
  const $ = s => document.querySelector(s);

  const ICONO = {
    qr: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm2-4h2v2h-2v-2zm0 4h2v4h-4v-2h2v-2zm-4 2h2v2h-2v-2zm0-6h2v2h-2v-2z"/></svg>',
    datos: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM8.5 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM13 17H4v-.9C4 14.4 6.2 13 8.5 13s4.5 1.4 4.5 3.1v.9zm7-2h-5v-2h5v2zm0-4h-5V9h5v2z"/></svg>',
    volver: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z"/></svg>',
    compartir: '<svg viewBox="0 0 24 24"><path d="M12 2 7.5 6.5l1.4 1.4L11 5.8V15h2V5.8l2.1 2.1 1.4-1.4L12 2zM5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10h-3v2h1v8H7v-8h1v-2H5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>'
  };

  const encabezado = () => `
    <div class="header"><img class="logo-img" src="../img/logo-aic-blanco.png" alt="AIC — Asociación de Empresas Consultoras de Ingeniería de Chile A.G."><div class="linea-amarilla"></div></div>
    <div class="foto-wrap"><img class="foto" alt=""><div class="foto-iniciales"></div></div>
    <div class="info"><h1 class="nombre"></h1><div class="cargo"></div>
      <div class="empresa">Asociación de Empresas Consultoras<br>de Ingeniería de Chile A.G.</div></div>`;

  document.body.innerHTML = `
    <section class="vista" id="vista-inicio">
      <main class="card">
        ${encabezado()}
        <div class="opciones">
          <a class="btn-app btn-qr" href="#qr">${ICONO.qr}Mostrar mi QR</a>
          <a class="btn-app btn-datos" href="#datos">${ICONO.datos}Mostrar mis datos</a>
          <button class="btn-app btn-datos" id="compartir" type="button">${ICONO.compartir}<span>Compartir mi tarjeta</span></button>
        </div>
        <div class="instalar" id="instalar"></div>
        <div class="pie"></div>
      </main>
    </section>
    <section class="vista" id="vista-qr">
      <main class="card">
        ${encabezado()}
        <div class="qr-caja"><div class="qr" id="qr" role="img" aria-label="Código QR de mi tarjeta digital"></div></div>
        <p class="qr-texto">Escanea para ver mis datos de contacto</p>
      </main>
    </section>
    <section class="vista" id="vista-datos"></section>
    <section class="vista" id="vista-error"><p class="aviso" id="aviso"></p></section>
    <button class="volver" id="volver" aria-label="Volver">${ICONO.volver}</button>
    <iframe id="marco" title="Mis datos de contacto" hidden></iframe>`;

  if (!p) { error('Esta tarjeta no está configurada en la app.'); return; }

  // ---- Tarjeta original: se carga una vez y se reutiliza ----
  const marco = $('#marco');
  const urlTarjeta = new URL(raiz + p.tarjeta, location.href).href;
  let datosListos = false;
  let persona = { nombre: '', cargo: '' };
  marco.addEventListener('load', () => {
    if (datosListos) return;
    try {
      const d = marco.contentDocument;
      const nombre = d.getElementById('v-nombre').textContent.trim();
      const cargo = d.getElementById('v-cargo').textContent.trim();
      const foto = d.querySelector('.foto');
      if (!nombre) throw new Error('sin datos');
      document.querySelectorAll('.nombre').forEach(e => e.textContent = nombre);
      document.querySelectorAll('.cargo').forEach(e => e.textContent = cargo);
      const iniciales = nombre.split(/\s+/).map(x => x[0]).slice(0, 2).join('');
      document.querySelectorAll('.foto').forEach(img => {
        img.alt = nombre;
        img.onerror = () => { img.style.display = 'none'; img.nextElementSibling.style.display = 'flex'; };
        if (foto && foto.src) img.src = foto.src; else img.onerror();
      });
      document.querySelectorAll('.foto-iniciales').forEach(e => e.textContent = iniciales);
      document.title = nombre + ' — Tarjeta AIC';
      persona = { nombre, cargo };
      datosListos = true;
      mostrar();
    } catch (e) {
      error('No se pudo cargar la tarjeta. Revisa tu conexión a internet y vuelve a abrir la app.');
    }
  });
  marco.src = urlTarjeta;

  // ---- QR: misma librería y mismo enlace del QR distribuido ----
  new QRCode($('#qr'), {
    text: p.qr, width: 1024, height: 1024,
    colorDark: '#01163A', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H
  });

  // ---- Compartir: envía el mismo enlace del QR (la tarjeta con datos) ----
  $('#compartir').addEventListener('click', async () => {
    const url = p.qr;
    if (navigator.share) {
      try {
        await navigator.share({ title: persona.nombre + ' — AIC', text: 'Mi tarjeta digital AIC: ' + persona.nombre, url });
      } catch (e) { /* el usuario cerró el menú */ }
      return;
    }
    const etiqueta = $('#compartir span');
    try { await navigator.clipboard.writeText(url); etiqueta.textContent = 'Enlace copiado'; }
    catch (e) { prompt('Copia este enlace:', url); }
    setTimeout(() => { etiqueta.textContent = 'Compartir mi tarjeta'; }, 2500);
  });

  // ---- Navegación (#qr, #datos) ----
  let desdeInicio = false;
  const volver = $('#volver');
  volver.addEventListener('click', () => {
    if (desdeInicio) history.back(); else location.replace('#');
  });
  window.addEventListener('hashchange', () => { desdeInicio = vistaActual() !== ''; mostrar(); });

  function vistaActual() { return (location.hash || '').replace('#', ''); }

  let bloqueo = null;
  async function pantallaEncendida(on) {
    try {
      if (on && 'wakeLock' in navigator && !bloqueo) bloqueo = await navigator.wakeLock.request('screen');
      if (!on && bloqueo) { await bloqueo.release(); bloqueo = null; }
    } catch (e) { bloqueo = null; }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && vistaActual() === 'qr') { bloqueo = null; pantallaEncendida(true); }
  });

  function mostrar() {
    if (!datosListos) return;
    const v = vistaActual();
    document.querySelectorAll('.vista').forEach(s => s.classList.remove('activa'));
    if (v === 'datos') {
      // si la tarjeta navegó a otra parte (p. ej. al .vcf), se recarga
      try { if (marco.contentWindow.location.href !== urlTarjeta) marco.src = urlTarjeta; } catch (e) { marco.src = urlTarjeta; }
      $('#vista-datos').classList.add('activa');
      marco.hidden = false;
    } else {
      marco.hidden = true;
      $(v === 'qr' ? '#vista-qr' : '#vista-inicio').classList.add('activa');
    }
    volver.classList.toggle('visible', v === 'qr' || v === 'datos');
    pantallaEncendida(v === 'qr');
    window.scrollTo(0, 0);
  }

  function error(msg) {
    document.querySelectorAll('.vista').forEach(s => s.classList.remove('activa'));
    $('#aviso').textContent = msg;
    $('#vista-error').classList.add('activa');
  }

  // ---- Ayuda para instalar (solo si se abrió en el navegador) ----
  const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const caja = $('#instalar');
  const ua = navigator.userAgent;
  const esIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const esAndroid = /Android/.test(ua);
  let aviso = null;
  if (!instalada) {
    if (esIOS) {
      caja.innerHTML = `<b>Instala la app en tu iPhone (desde Safari):</b><br>`
        + `1. Toca <b>···</b> junto a la barra de dirección (o ${ICONO.compartir} en la barra de Safari).<br>`
        + `2. Toca <b>Compartir</b> y baja hasta <b>“Agregar a pantalla de inicio”</b> (si no aparece, toca <b>Ver más</b>).<br>`
        + `<small>Usa el Compartir de Safari, no el botón “Compartir mi tarjeta”.</small>`;
      caja.classList.add('visible');
    } else if (esAndroid) {
      caja.innerHTML = `<b>Instala la app en tu teléfono:</b><br>abre el menú ${ICONO.menu} del navegador y elige <b>“Instalar app”</b> o <b>“Agregar a pantalla principal”</b>.`;
      caja.classList.add('visible');
    } else {
      caja.innerHTML = 'Abre este enlace en tu teléfono para instalar la app.';
      caja.classList.add('visible');
    }
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); aviso = e;
    caja.innerHTML = '<b>Instala la app en tu teléfono</b> para tener tu tarjeta siempre a mano.<button class="btn-app btn-instalar" id="btn-instalar">Instalar app</button>';
    caja.classList.add('visible');
    $('#btn-instalar').addEventListener('click', async () => {
      aviso.prompt();
      const r = await aviso.userChoice;
      if (r.outcome === 'accepted') caja.classList.remove('visible');
      aviso = null;
    });
  });
  window.addEventListener('appinstalled', () => caja.classList.remove('visible'));

  // ---- Funcionamiento sin conexión ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(raiz + 'sw.js', { scope: raiz }).catch(() => {});
  }
})();
