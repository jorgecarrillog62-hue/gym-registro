// Pantallas y botones. Los cálculos viven en js/calc/ (puros y con pruebas).
import * as db from './db.js';
import { EJERCICIOS, RUTINAS, MUSCULOS, TIPOS } from './datos-iniciales.js';
import { metaDeHoy } from './calc/meta.js';
import { e1rmSesion, seriesTrabajo, volumenKg } from './calc/e1rm.js';
import { convertir, paso, r1 } from './calc/pesos.js';
import * as F from './formato.js';
import { lineaSVG } from './grafica.js';

const S = {
  cfg: null, ejercicios: new Map(), rutinas: [], sesiones: [], pesos: [], ajustes: {},
  tab: 'entrenar', detalleId: null, progresoEj: null, rango: '3m', rutinaVer: null,
};
const $ = (q) => document.querySelector(q);
const app = $('#app');
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? r1(n) : null;
};
const sinAcentos = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---------- datos ----------
function cargar(d) {
  S.ejercicios = new Map(d.ejercicios.map((e) => [e.id, e]));
  S.rutinas = d.rutinas;
  S.sesiones = d.sesiones.sort((a, b) => b.inicio.localeCompare(a.inicio));
  S.pesos = d.pesoCorporal.sort((a, b) => a.id.localeCompare(b.id));
  S.ajustes = Object.fromEntries(d.ajustes.map((a) => [a.id, a.valor]));
}
const ejDe = (id) => S.ejercicios.get(id) || { id, nombre: '(ejercicio borrado)', tipo: 'maquina', unidad: 'kg', musculo: '', secundarios: [] };
const abierta = () => S.sesiones.find((s) => !s.fin);
const terminadas = () => S.sesiones.filter((s) => s.fin);
const rutinaActiva = () => S.rutinas.find((r) => r.id === S.ajustes.rutinaActiva) || S.rutinas[0];
const setAjuste = (id, valor) => { S.ajustes[id] = valor; return db.guardar('ajustes', { id, valor }); };

function pesoCorporalEn(fecha) {
  const dia = F.diaLocal(fecha);
  const antes = S.pesos.filter((p) => p.id <= dia);
  return (antes.at(-1) || S.pesos[0])?.kg ?? null;
}

/** Sesiones anteriores con este ejercicio (la más reciente primero). Si no hay, el punto de partida. */
function historialDe(ejercicioId, antesDe) {
  const t = new Date(antesDe).toISOString();
  const h = terminadas()
    .filter((s) => s.inicio < t)
    .flatMap((s) => s.ejercicios.filter((x) => x.ejercicioId === ejercicioId).map((x) => ({ fecha: s.inicio, unidad: x.unidad, series: x.series })));
  const ini = S.ejercicios.get(ejercicioId)?.inicio;
  if (!h.length && ini) {
    return [{ fecha: null, unidad: ejDe(ejercicioId).unidad, series: Array.from({ length: ini.series }, () => ({ peso: ini.peso, reps: ini.reps, rir: null, hecha: true })) }];
  }
  return h;
}

const nuevaSerie = (peso = null, reps = null) => ({ peso, reps, rir: null, calentamiento: false, hecha: false });

function nuevoEjSesion(ejercicioId, planDia, fecha) {
  const ej = ejDe(ejercicioId);
  const plan = planDia
    ? { series: planDia.series, min: planDia.min, max: planDia.max, descanso: planDia.descanso }
    : { series: 3, min: 8, max: 12, descanso: 90 };
  const historial = historialDe(ejercicioId, fecha);
  const meta = metaDeHoy({ ej, plan, historial, hoy: new Date(fecha), cfg: S.cfg });
  const anterior = historial[0]
    ? seriesTrabajo(historial[0].series).map((s) => ({ peso: convertir(s.peso, historial[0].unidad, ej.unidad), reps: s.reps }))
    : [];
  const ex = { uid: uid(), ejercicioId, unidad: ej.unidad, plan, nota: '', meta, anterior, series: [] };
  const n = plan.series;
  if (S.ajustes.precarga === 'ultima' && anterior.length) {
    ex.series = Array.from({ length: n }, (_, i) => { const a = anterior[Math.min(i, anterior.length - 1)]; return nuevaSerie(a.peso, a.reps); });
  } else {
    const base = meta.peso ?? (ej.tipo === 'corporal' ? 0 : null);
    ex.series = Array.from({ length: n }, (_, i) => nuevaSerie(base, meta.reps[i]));
  }
  return ex;
}

/** Plan del ejercicio en la rutina activa (para ejercicios añadidos al vuelo). */
function planEnRutina(ejercicioId) {
  for (const d of rutinaActiva()?.dias || []) {
    const p = d.ejercicios.find((x) => x.ejercicioId === ejercicioId);
    if (p) return p;
  }
  return null;
}

let tGuardar;
function guardarSesion(s, pronto = false) {
  clearTimeout(tGuardar);
  if (pronto) { tGuardar = setTimeout(() => db.guardar('sesiones', s), 250); return; }
  return db.guardar('sesiones', s);
}

// ---------- utilidades de interfaz ----------
let tAviso;
function aviso(texto) {
  const a = $('#aviso');
  a.textContent = texto;
  a.classList.add('visible');
  clearTimeout(tAviso);
  tAviso = setTimeout(() => a.classList.remove('visible'), 2600);
}

function dialogo(html, alAbrir) {
  const d = $('#dlg');
  d.innerHTML = html;
  d.returnValue = '';
  return new Promise((ok) => {
    d.addEventListener('close', () => ok(d.returnValue), { once: true });
    d.showModal();
    alAbrir?.(d);
  });
}

const confirmar = async (texto, si = 'Aceptar') =>
  (await dialogo(`<form method="dialog" class="form"><p>${esc(texto)}</p>
    <menu><button value="no" formnovalidate class="btn">Cancelar</button><button value="si" class="btn primario">${esc(si)}</button></menu></form>`)) === 'si';

function descargar(blob, nombre) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- render general ----------
const TABS = [['entrenar', 'Entrenar'], ['historial', 'Historial'], ['progreso', 'Progreso'], ['rutina', 'Rutina']];

function render() {
  let html;
  if (S.tab === 'entrenar') html = abierta() ? vistaSesion(abierta(), false) : vistaInicio();
  else if (S.tab === 'historial') {
    const s = S.sesiones.find((x) => x.id === S.detalleId && x.fin);
    html = s ? vistaSesion(s, true) : vistaHistorial();
  } else if (S.tab === 'progreso') html = vistaProgreso();
  else html = vistaRutina();
  app.innerHTML = `<main class="contenido">${html}</main>
    <nav class="tabs">${TABS.map(([t, n]) => `<button data-a="tab" data-t="${t}" class="${S.tab === t ? 'activo' : ''}">${n}</button>`).join('')}</nav>`;
}

// ---------- Inicio ----------
function diaSugerido(r) {
  const hoy = new Date().getDay();
  const porSemana = r.dias.find((d) => d.diaSemana === hoy);
  if (porSemana) return porSemana;
  const ult = terminadas().find((s) => s.rutinaId === r.id);
  const i = ult ? r.dias.findIndex((d) => d.id === ult.diaId) : -1;
  return i >= 0 ? r.dias[(i + 1) % r.dias.length] : r.dias[0];
}

function vistaInicio() {
  const r = rutinaActiva();
  const sug = diaSugerido(r);
  const ult = terminadas()[0];
  const pesoHoy = S.pesos.find((p) => p.id === F.diaLocal())?.kg ?? '';
  return `<header class="barra"><h1>Entrenar</h1><p>${esc(r.nombre)}</p></header>
    <button class="btn grande verde" data-a="empezar" data-dia="${sug.id}">Empezar entrenamiento<small>${esc(sug.nombre)}</small></button>
    <p class="etiqueta">Otro día</p>
    <div class="chips">${r.dias.filter((d) => d !== sug).map((d) => `<button class="chip" data-a="empezar" data-dia="${d.id}">${esc(d.nombre)}</button>`).join('')}
      <button class="chip" data-a="empezar" data-dia="">Libre</button></div>
    <label class="tarjeta campo-peso">Peso corporal hoy
      <span><input id="pesoCorporal" inputmode="decimal" placeholder="—" value="${pesoHoy}"> kg</span></label>
    ${ult ? `<p class="tenue">Último entrenamiento: ${esc(ult.nombre)}, ${F.fechaLarga(ult.inicio)}</p>` : ''}`;
}

// ---------- Sesión (en curso o editando desde el historial) ----------
function vistaSesion(s, editar) {
  const cab = editar
    ? `<header class="barra fila-barra"><button class="btn-barra" data-a="volver">‹ Historial</button>
        <div><h1>${esc(s.nombre)}</h1><p>${F.fechaLarga(s.inicio)} · ${F.hora(s.inicio)} · ${F.duracion(new Date(s.fin) - new Date(s.inicio))}</p></div></header>`
    : `<header class="barra fila-barra"><div><h1>${esc(s.nombre)}</h1><p>Empezaste ${F.hora(s.inicio)} · <span id="crono">${F.reloj(Date.now() - new Date(s.inicio))}</span></p></div>
        <button class="btn verde" data-a="terminar">Terminar</button></header>`;
  return `${cab}
    <div id="tarjetas">${s.ejercicios.map((x, i) => tarjeta(s, i, editar)).join('')}</div>
    <button class="btn ancho" data-a="agregarEj">+ Añadir ejercicio</button>
    ${editar
      ? '<button class="btn ancho peligro" data-a="borrarSesion">Borrar este entrenamiento</button>'
      : '<button class="btn ancho tenue-btn" data-a="descartar">Descartar entrenamiento</button>'}`;
}

function tarjeta(s, i, editar) {
  const x = s.ejercicios[i];
  const ej = ejDe(x.ejercicioId);
  const u = ej.tipo === 'corporal' ? `lastre ${x.unidad}` : x.unidad;
  let k = 0;
  const filas = x.series.map((se, j) => {
    const num = se.calentamiento ? 'C' : ++k;
    const a = !se.calentamiento && x.anterior?.[k - 1];
    const ant = a ? `${ej.tipo === 'corporal' && a.peso > 0 ? '+' : ''}${a.peso}×${a.reps}` : '—';
    return `<div class="serie ${se.hecha ? 'hecha' : ''} ${se.calentamiento ? 'cal' : ''}" data-j="${j}">
      <button class="num" data-a="calentamiento" aria-label="Serie ${num}. Tocar para marcar calentamiento">${num}</button>
      <span class="ant" title="La última vez">${ant}</span>
      <div class="rir" role="group" aria-label="Repeticiones en reserva">${[0, 1, 2, 3, 4].map((r) => `<button data-a="rir" data-r="${r}" class="${se.rir === r ? 'on' : ''}">${r}</button>`).join('')}</div>
      <button class="check" data-a="hecha" aria-pressed="${se.hecha}" aria-label="Serie hecha">✓</button>
      <div class="pasos"><div class="paso"><button data-a="menos" data-f="peso" aria-label="Menos peso">−</button>
        <label><input data-f="peso" inputmode="decimal" value="${se.peso ?? ''}" placeholder="peso"><small>${u}</small></label>
        <button data-a="mas" data-f="peso" aria-label="Más peso">+</button></div>
      <div class="paso"><button data-a="menos" data-f="reps" aria-label="Menos repeticiones">−</button>
        <label><input data-f="reps" inputmode="numeric" value="${se.reps ?? ''}" placeholder="reps"><small>reps</small></label>
        <button data-a="mas" data-f="reps" aria-label="Más repeticiones">+</button></div></div>
    </div>`;
  }).join('');
  const m = x.meta;
  return `<section class="tarjeta ej" data-i="${i}">
    <header class="ej-cab"><div><h2>${esc(ej.nombre)}</h2>
      <p class="tenue">${x.plan.series} × ${x.plan.min}–${x.plan.max} · descanso ${F.descanso(x.plan.descanso)}</p></div>
      <button class="icono" data-a="menuEj" aria-label="Opciones del ejercicio">⋮</button></header>
    ${!editar && m ? `<button class="meta" data-a="aplicarMeta"><b>${esc(m.texto)}</b><span>(${esc(m.razon)})</span></button>` : ''}
    ${x.nota ? `<p class="nota">${esc(x.nota)}</p>` : ''}
    <div class="cab-series"><span>#</span><span>Antes</span><span>RIR</span><span></span></div>
    ${filas}
    <div class="acciones-series"><button class="btn chico" data-a="quitarSerie">− Serie</button><button class="btn chico" data-a="agregarSerie">+ Serie</button></div>
  </section>`;
}

const sesionVisible = () => (S.tab === 'entrenar' ? abierta() : S.sesiones.find((x) => x.id === S.detalleId));
function repintarTarjeta(i) {
  const s = sesionVisible();
  const el = app.querySelector(`.ej[data-i="${i}"]`);
  if (el) el.outerHTML = tarjeta(s, i, S.tab !== 'entrenar');
}

/** Copia el peso a las series de trabajo siguientes que aún no están hechas (como RP). */
function copiarPesoAdelante(x, j) {
  for (let k = j + 1; k < x.series.length; k++) {
    const s = x.series[k];
    if (!s.hecha && !s.calentamiento) s.peso = x.series[j].peso;
  }
}

async function empezar(diaId) {
  const r = rutinaActiva();
  const dia = r.dias.find((d) => d.id === diaId);
  const ahora = new Date();
  const s = {
    id: uid(), inicio: ahora.toISOString(), fin: null,
    nombre: dia ? dia.nombre : 'Entrenamiento libre', rutinaId: dia ? r.id : null, diaId: dia?.id ?? null,
    ejercicios: dia ? dia.ejercicios.map((p) => nuevoEjSesion(p.ejercicioId, p, ahora)) : [],
  };
  S.sesiones.unshift(s);
  await guardarSesion(s);
  render();
  window.scrollTo(0, 0);
}

async function elegirEjercicio(titulo = 'Elegir ejercicio') {
  const lista = [...S.ejercicios.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const v = await dialogo(`<form method="dialog" class="form"><h2>${titulo}</h2>
    <input type="search" id="buscar" placeholder="Buscar…" autocomplete="off">
    <div class="lista">${lista.map((e) => `<button value="${e.id}" class="fila" data-n="${esc(sinAcentos(e.nombre))}">${esc(e.nombre)}<small>${MUSCULOS[e.musculo] || ''} · ${TIPOS[e.tipo]}</small></button>`).join('')}</div>
    <menu><button value="" formnovalidate class="btn">Cancelar</button><button value="__nuevo" class="btn">Crear ejercicio nuevo</button></menu></form>`,
  (d) => d.querySelector('#buscar').addEventListener('input', (e) => {
    const q = sinAcentos(e.target.value);
    d.querySelectorAll('.lista .fila').forEach((b) => { b.hidden = !b.dataset.n.includes(q); });
  }));
  if (v === '__nuevo') {
    const r = await formEjercicio({ id: '', nombre: '', musculo: 'pecho', secundarios: [], tipo: 'mancuerna', unidad: 'kg', compuesto: false, incremento: null, inicio: null });
    return r?.ej.id || null;
  }
  return v || null;
}

/** Formulario de ejercicio (catálogo) y, si se pasa `plan`, de su plan en el día. */
async function formEjercicio(ej, plan = null) {
  const sel = (nombre, opciones, actual) => `<select name="${nombre}">${Object.entries(opciones).map(([k, v]) => `<option value="${k}" ${k === actual ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
  const v = await dialogo(`<form method="dialog" class="form" id="fEj"><h2>${ej.id ? 'Editar ejercicio' : 'Ejercicio nuevo'}</h2>
    <label>Nombre<input name="nombre" required value="${esc(ej.nombre)}"></label>
    ${plan ? `<div class="rejilla4">
      <label>Series<input name="series" inputmode="numeric" value="${plan.series}"></label>
      <label>Mín<input name="min" inputmode="numeric" value="${plan.min}"></label>
      <label>Máx<input name="max" inputmode="numeric" value="${plan.max}"></label>
      <label>Descanso (s)<input name="descanso" inputmode="numeric" value="${plan.descanso}"></label></div>` : ''}
    <label>Músculo principal${sel('musculo', MUSCULOS, ej.musculo)}</label>
    <fieldset><legend>Músculos secundarios</legend><div class="chips">${Object.entries(MUSCULOS).map(([k, n]) =>
      `<label class="chip"><input type="checkbox" name="sec" value="${k}" ${ej.secundarios.includes(k) ? 'checked' : ''}>${n}</label>`).join('')}</div></fieldset>
    <div class="rejilla2"><label>Tipo${sel('tipo', TIPOS, ej.tipo)}</label><label>Unidad${sel('unidad', { kg: 'kg', lb: 'lb' }, ej.unidad)}</label></div>
    <label>Incremento mínimo (vacío = automático)<input name="incremento" inputmode="decimal" value="${ej.incremento ?? ''}" placeholder="automático"></label>
    <label class="check-linea"><input type="checkbox" name="compuesto" ${ej.compuesto ? 'checked' : ''}> Ejercicio compuesto (para subir de peso acepta RIR hasta ${S.cfg.umbralRIR.compuesto}; si no, ${S.cfg.umbralRIR.aislamiento})</label>
    <menu><button value="" formnovalidate class="btn">Cancelar</button><button value="ok" class="btn primario">Guardar</button></menu></form>`);
  if (v !== 'ok') return null;
  const f = new FormData($('#fEj'));
  const nuevo = {
    ...ej,
    id: ej.id || `${sinAcentos(f.get('nombre')).replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${uid().slice(-4)}`,
    nombre: f.get('nombre').trim() || ej.nombre || 'Ejercicio',
    musculo: f.get('musculo'),
    secundarios: f.getAll('sec').filter((m) => m !== f.get('musculo')),
    tipo: f.get('tipo'), unidad: f.get('unidad'),
    incremento: num(f.get('incremento')) || null,
    compuesto: f.get('compuesto') === 'on',
  };
  S.ejercicios.set(nuevo.id, nuevo);
  await db.guardar('ejercicios', nuevo);
  let p = null;
  if (plan) {
    const ent = (k, d, lo, hi) => Math.min(hi, Math.max(lo, Math.round(num(f.get(k)) ?? d)));
    const min = ent('min', plan.min, 1, 50);
    p = { series: ent('series', plan.series, 1, 10), min, max: ent('max', plan.max, min, 50), descanso: ent('descanso', plan.descanso, 0, 600) };
  }
  return { ej: nuevo, plan: p };
}

async function menuEjercicio(i) {
  const s = sesionVisible();
  const x = s.ejercicios[i];
  const v = await dialogo(`<form method="dialog" class="form menu-lista"><h2>${esc(ejDe(x.ejercicioId).nombre)}</h2>
    <button value="nota" class="fila">${x.nota ? 'Editar nota' : 'Agregar nota'}</button>
    <button value="sustituir" class="fila">Sustituir por otro ejercicio</button>
    ${i > 0 ? '<button value="subir" class="fila">Mover arriba</button>' : ''}
    ${i < s.ejercicios.length - 1 ? '<button value="bajar" class="fila">Mover abajo</button>' : ''}
    <button value="quitar" class="fila peligro">Quitar ejercicio</button>
    <menu><button value="" class="btn">Cerrar</button></menu></form>`);
  if (v === 'nota') {
    const r = await dialogo(`<form method="dialog" class="form"><h2>Nota</h2><textarea id="txtNota" rows="3">${esc(x.nota)}</textarea>
      <menu><button value="" class="btn">Cancelar</button><button value="ok" class="btn primario">Guardar</button></menu></form>`);
    if (r === 'ok') x.nota = $('#txtNota').value.trim();
  } else if (v === 'sustituir') {
    const id = await elegirEjercicio('Sustituir por');
    if (!id) return;
    s.ejercicios[i] = nuevoEjSesion(id, x.plan, s.inicio);
  } else if (v === 'subir' || v === 'bajar') {
    const j = v === 'subir' ? i - 1 : i + 1;
    [s.ejercicios[i], s.ejercicios[j]] = [s.ejercicios[j], s.ejercicios[i]];
  } else if (v === 'quitar') {
    if (!(await confirmar('¿Quitar este ejercicio del entrenamiento?', 'Quitar'))) return;
    s.ejercicios.splice(i, 1);
  } else return;
  await guardarSesion(s);
  render();
}

async function terminar() {
  const s = abierta();
  const hechas = s.ejercicios.reduce((t, x) => t + x.series.filter((y) => y.hecha).length, 0);
  if (!hechas) {
    if (await confirmar('No marcaste ninguna serie como hecha. ¿Descartar este entrenamiento?', 'Descartar')) await descartar(true);
    return;
  }
  if (!(await confirmar(`¿Terminar entrenamiento? Se guardan ${hechas} series hechas; las que no marcaste se quitan.`, 'Terminar'))) return;
  s.ejercicios = s.ejercicios.map((x) => ({ ...x, series: x.series.filter((y) => y.hecha) })).filter((x) => x.series.length);
  s.fin = new Date().toISOString();
  await guardarSesion(s);
  aviso(`Guardado: ${F.duracion(new Date(s.fin) - new Date(s.inicio))}, ${hechas} series`);
  render();
}

async function descartar(yaConfirmado = false) {
  const s = abierta();
  if (!yaConfirmado && !(await confirmar('¿Descartar este entrenamiento? Se borra sin guardar.', 'Descartar'))) return;
  S.sesiones = S.sesiones.filter((x) => x !== s);
  await db.borrar('sesiones', s.id);
  render();
}

// ---------- Historial ----------
function volumenSesion(s) {
  return s.ejercicios.reduce((t, x) => {
    const ej = ejDe(x.ejercicioId);
    return t + volumenKg(x.series, x.unidad, { corporal: ej.tipo === 'corporal', pesoCorporal: pesoCorporalEn(s.inicio) });
  }, 0);
}

function vistaHistorial() {
  const t = terminadas();
  return `<header class="barra"><h1>Historial</h1><p>${t.length} ${t.length === 1 ? 'entrenamiento' : 'entrenamientos'}</p></header>
    ${t.length ? '' : '<p class="vacio">Aquí aparecerán tus entrenamientos terminados.</p>'}
    <div class="lista">${t.map((s) => {
      const nSeries = s.ejercicios.reduce((n, x) => n + seriesTrabajo(x.series).length, 0);
      return `<button class="fila tarjeta" data-a="verSesion" data-id="${s.id}">
        <b>${esc(s.nombre)}</b><span>${F.fechaLarga(s.inicio)} · ${F.hora(s.inicio)}</span>
        <small>${F.duracion(new Date(s.fin) - new Date(s.inicio))} · ${nSeries} series · ${F.numero(volumenSesion(s))} kg de volumen</small></button>`;
    }).join('')}</div>`;
}

// ---------- Progreso ----------
const RANGOS = { '4s': ['4 sem', 28], '3m': ['3 meses', 91], '6m': ['6 meses', 182], todo: ['Todo', Infinity] };

function puntosE1rm(ejId) {
  const ej = ejDe(ejId);
  const pts = [];
  for (const s of [...terminadas()].reverse()) {
    const series = s.ejercicios.filter((x) => x.ejercicioId === ejId)
      .flatMap((x) => x.series.map((y) => ({ ...y, peso: convertir(y.peso, x.unidad, ej.unidad) })));
    if (!series.length) continue;
    const e1 = e1rmSesion(series, { corporal: ej.tipo === 'corporal', pesoCorporal: pesoCorporalEn(s.inicio) }, S.cfg.e1rm);
    const mejor = seriesTrabajo(series).sort((a, b) => b.peso - a.peso || b.reps - a.reps)[0];
    if (mejor) pts.push({ x: s.inicio, y: e1, mejor });
  }
  return pts;
}

function vistaProgreso() {
  const ids = [...new Set(terminadas().flatMap((s) => s.ejercicios.map((x) => x.ejercicioId)))];
  if (!ids.length) return '<header class="barra"><h1>Progreso</h1></header><p class="vacio">Termina tu primer entrenamiento para ver tu progreso.</p>';
  const ejId = ids.includes(S.progresoEj) ? S.progresoEj : ids[0];
  const ej = ejDe(ejId);
  const todos = puntosE1rm(ejId);
  let max = -Infinity;
  const marcas = todos.map((p) => { const r = p.y != null && p.y > max; if (r) max = p.y; return r; });
  const desde = Date.now() - RANGOS[S.rango][1] * 86400000;
  const visibles = todos.map((p, i) => ({ ...p, marca: marcas[i] && i > 0 })).filter((p) => p.y != null && new Date(p.x).getTime() >= desde);
  const sinPC = ej.tipo === 'corporal' && !S.pesos.length;
  return `<header class="barra"><h1>Progreso</h1></header>
    <select class="selector" data-c="progresoEj">${ids.map((id) => ejDe(id)).sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((e) => `<option value="${e.id}" ${e.id === ejId ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select>
    <div class="chips">${Object.entries(RANGOS).map(([k, [n]]) => `<button class="chip ${S.rango === k ? 'on' : ''}" data-a="rango" data-r="${k}">${n}</button>`).join('')}</div>
    <section class="tarjeta"><h2>1RM estimado (${ej.unidad})</h2>
      ${sinPC ? '<p class="nota">Registra tu peso corporal en Entrenar para calcular el 1RM de este ejercicio (peso corporal + lastre).</p>' : lineaSVG(visibles, { unidad: ej.unidad, marcas: visibles.map((p) => p.marca) })}
      <p class="tenue leyenda"><span class="punto-verde"></span> nuevo máximo</p></section>
    <section class="tarjeta"><h2>Sesiones</h2><table class="tabla"><thead><tr><th>Fecha</th><th>Mejor serie</th><th>1RM est.</th></tr></thead><tbody>
      ${todos.slice(-12).reverse().map((p) => `<tr><td>${F.fechaConAnio(p.x)}</td><td>${p.mejor.peso}×${p.mejor.reps}</td><td>${p.y ?? '—'}</td></tr>`).join('')}
    </tbody></table></section>`;
}

// ---------- Rutina y ajustes ----------
function vistaRutina() {
  const act = rutinaActiva();
  const r = S.rutinas.find((x) => x.id === S.rutinaVer) || act;
  return `<header class="barra"><h1>Rutina</h1><p>Activa: ${esc(act.nombre)}</p></header>
    <section class="tarjeta"><h2>Mis rutinas</h2>${S.rutinas.map((x) => `<div class="fila-rutina ${x.id === r.id ? 'viendo' : ''}">
      <button class="fila" data-a="verRutina" data-id="${x.id}">${esc(x.nombre)}</button>
      ${x.id === act.id ? '<span class="insignia">Activa</span>' : `<button class="btn chico" data-a="activar" data-id="${x.id}">Activar</button>`}</div>`).join('')}</section>
    ${r.dias.map((d) => `<section class="tarjeta"><h2>${esc(d.nombre)}</h2>
      ${d.ejercicios.map((p, k) => `<div class="fila-ej">
        <button class="fila" data-a="editarEj" data-dia="${d.id}" data-k="${k}">${esc(ejDe(p.ejercicioId).nombre)}<small>${p.series} × ${p.min}–${p.max} · ${F.descanso(p.descanso)} · ${ejDe(p.ejercicioId).unidad}</small></button>
        <button class="icono" data-a="moverEj" data-dia="${d.id}" data-k="${k}" data-d="-1" aria-label="Subir" ${k === 0 ? 'disabled' : ''}>↑</button>
        <button class="icono" data-a="moverEj" data-dia="${d.id}" data-k="${k}" data-d="1" aria-label="Bajar" ${k === d.ejercicios.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icono" data-a="quitarEjDia" data-dia="${d.id}" data-k="${k}" aria-label="Quitar">✕</button></div>`).join('')}
      <button class="btn chico" data-a="agregarEjDia" data-dia="${d.id}">+ Añadir ejercicio</button></section>`).join('')}
    <section class="tarjeta"><h2>Ajustes</h2>
      <label class="fila-ajuste">Tema<select data-c="tema"><option value="dark">Oscuro</option><option value="light" ${document.documentElement.dataset.theme === 'light' ? 'selected' : ''}>Claro</option></select></label>
      <label class="fila-ajuste">Precargar series con<select data-c="precarga"><option value="meta">La meta de hoy</option><option value="ultima" ${S.ajustes.precarga === 'ultima' ? 'selected' : ''}>La última sesión</option></select></label>
    </section>
    <section class="tarjeta"><h2>Tus datos</h2>
      <p class="tenue">Viven solo en este teléfono. Si borras los datos de Chrome o desinstalas la app, se pierden: exporta un respaldo seguido.</p>
      ${S.ajustes.ultimoRespaldo ? `<p class="tenue">Último respaldo: ${F.fechaLarga(S.ajustes.ultimoRespaldo)}</p>` : ''}
      <div class="chips"><button class="btn" data-a="exportarJSON">Exportar respaldo (JSON)</button><button class="btn" data-a="exportarCSV">Exportar series (CSV)</button>
      <label class="btn">Importar respaldo<input type="file" accept=".json,application/json" data-c="importar" hidden></label></div>
      <p class="tenue">Versión de la app: ${document.documentElement.dataset.version || 'sin instalar'}</p></section>`;
}

const diaPorId = (r, id) => r.dias.find((d) => d.id === id);
const rutinaVista = () => S.rutinas.find((x) => x.id === S.rutinaVer) || rutinaActiva();
const guardarRutina = (r) => db.guardar('rutinas', r);

async function exportarJSON() {
  const datos = await db.leerTodo();
  descargar(new Blob([JSON.stringify({ app: 'gym-registro', formato: 1, exportado: new Date().toISOString(), datos })], { type: 'application/json' }),
    `gym-respaldo-${F.diaLocal()}.json`);
  await setAjuste('ultimoRespaldo', new Date().toISOString());
  render();
}

function exportarCSV() {
  const q = (v) => (/[",\n]/.test(String(v ?? '')) ? `"${String(v).replace(/"/g, '""')}"` : (v ?? ''));
  const filas = [['fecha', 'hora', 'entrenamiento', 'ejercicio', 'serie', 'tipo', 'peso', 'unidad', 'reps', 'rir']];
  for (const s of [...terminadas()].reverse()) {
    for (const x of s.ejercicios) {
      let k = 0;
      for (const y of x.series) {
        if (!y.hecha) continue;
        filas.push([F.diaLocal(s.inicio), F.hora(s.inicio), s.nombre, ejDe(x.ejercicioId).nombre, y.calentamiento ? 'C' : ++k,
          y.calentamiento ? 'calentamiento' : 'trabajo', y.peso, x.unidad, y.reps, y.rir]);
      }
    }
  }
  descargar(new Blob(['﻿' + filas.map((f) => f.map(q).join(',')).join('\r\n')], { type: 'text/csv' }), `gym-series-${F.diaLocal()}.csv`);
}

async function importar(archivo) {
  let o;
  try { o = JSON.parse(await archivo.text()); } catch { aviso('Ese archivo no es un respaldo válido.'); return; }
  const d = o?.datos;
  const valido = o?.app === 'gym-registro' && d && db.ALMACENES.every((k) => d[k] === undefined || Array.isArray(d[k]))
    && Array.isArray(d.sesiones) && Array.isArray(d.ejercicios) && Array.isArray(d.rutinas) && d.rutinas.length
    && d.sesiones.every((s) => s.id && s.inicio && Array.isArray(s.ejercicios));
  if (!valido) { aviso('Ese archivo no es un respaldo de esta app.'); return; }
  const cuando = o.exportado ? F.fechaLarga(o.exportado) : 'fecha desconocida';
  if (!(await confirmar(`Esto reemplaza TODOS los datos de este teléfono por el respaldo del ${cuando} (${d.sesiones.length} entrenamientos). No se puede deshacer. ¿Continuar?`, 'Reemplazar'))) return;
  await db.reemplazarTodo(d);
  cargar(await db.leerTodo());
  S.detalleId = null;
  render();
  aviso('Datos restaurados.');
}

// ---------- eventos ----------
const acciones = {
  tab: (b) => { S.tab = b.dataset.t; S.detalleId = null; render(); window.scrollTo(0, 0); },
  empezar: (b) => empezar(b.dataset.dia),
  terminar: () => terminar(),
  descartar: () => descartar(),
  volver: () => { S.detalleId = null; render(); },
  verSesion: (b) => { S.detalleId = b.dataset.id; render(); window.scrollTo(0, 0); },
  borrarSesion: async () => {
    if (!(await confirmar('¿Borrar este entrenamiento del historial? No se puede deshacer.', 'Borrar'))) return;
    await db.borrar('sesiones', S.detalleId);
    S.sesiones = S.sesiones.filter((x) => x.id !== S.detalleId);
    S.detalleId = null;
    render();
  },
  agregarEj: async () => {
    const id = await elegirEjercicio();
    if (!id) return;
    const s = sesionVisible();
    s.ejercicios.push(nuevoEjSesion(id, planEnRutina(id), s.fin ? s.inicio : new Date()));
    await guardarSesion(s);
    render();
  },
  menuEj: (b, i) => menuEjercicio(i),
  aplicarMeta: (b, i) => {
    const s = sesionVisible(); const x = s.ejercicios[i];
    let k = 0;
    for (const y of x.series) {
      if (y.calentamiento || y.hecha) { if (!y.calentamiento) k++; continue; }
      if (x.meta.peso != null) y.peso = x.meta.peso;
      y.reps = x.meta.reps[Math.min(k, x.meta.reps.length - 1)];
      k++;
    }
    guardarSesion(s); repintarTarjeta(i); aviso('Meta aplicada a las series pendientes');
  },
  agregarSerie: (b, i) => {
    const s = sesionVisible(); const x = s.ejercicios[i];
    const ult = [...x.series].reverse().find((y) => !y.calentamiento) || {};
    x.series.push(nuevaSerie(ult.peso ?? null, ult.reps ?? null));
    guardarSesion(s); repintarTarjeta(i);
  },
  quitarSerie: (b, i) => {
    const s = sesionVisible(); const x = s.ejercicios[i];
    if (x.series.length > 1) x.series.pop();
    guardarSesion(s); repintarTarjeta(i);
  },
  calentamiento: (b, i, j) => { const s = sesionVisible(); const y = s.ejercicios[i].series[j]; y.calentamiento = !y.calentamiento; guardarSesion(s); repintarTarjeta(i); },
  rir: (b, i, j) => { const s = sesionVisible(); const y = s.ejercicios[i].series[j]; const r = +b.dataset.r; y.rir = y.rir === r ? null : r; guardarSesion(s); repintarTarjeta(i); },
  hecha: (b, i, j) => {
    const s = sesionVisible(); const x = s.ejercicios[i]; const y = x.series[j];
    if (!y.hecha && (!(y.reps > 0) || (y.peso == null && ejDe(x.ejercicioId).tipo !== 'corporal'))) { aviso('Escribe el peso y las repeticiones'); return; }
    y.hecha = !y.hecha;
    guardarSesion(s); repintarTarjeta(i);
  },
  mas: (b, i, j) => cambiar(b.dataset.f, i, j, +1),
  menos: (b, i, j) => cambiar(b.dataset.f, i, j, -1),
  rango: (b) => { S.rango = b.dataset.r; render(); },
  verRutina: (b) => { S.rutinaVer = b.dataset.id; render(); },
  activar: async (b) => { await setAjuste('rutinaActiva', b.dataset.id); S.rutinaVer = b.dataset.id; render(); aviso('Rutina activada'); },
  editarEj: async (b) => {
    const r = rutinaVista(); const p = diaPorId(r, b.dataset.dia).ejercicios[+b.dataset.k];
    const res = await formEjercicio(ejDe(p.ejercicioId), p);
    if (!res) return;
    Object.assign(p, res.plan);
    await guardarRutina(r); render();
  },
  moverEj: async (b) => {
    const r = rutinaVista(); const l = diaPorId(r, b.dataset.dia).ejercicios; const k = +b.dataset.k; const j = k + +b.dataset.d;
    [l[k], l[j]] = [l[j], l[k]];
    await guardarRutina(r); render();
  },
  quitarEjDia: async (b) => {
    const r = rutinaVista(); const l = diaPorId(r, b.dataset.dia).ejercicios;
    if (!(await confirmar(`¿Quitar ${ejDe(l[+b.dataset.k].ejercicioId).nombre} de este día?`, 'Quitar'))) return;
    l.splice(+b.dataset.k, 1);
    await guardarRutina(r); render();
  },
  agregarEjDia: async (b) => {
    const id = await elegirEjercicio();
    if (!id) return;
    const r = rutinaVista();
    diaPorId(r, b.dataset.dia).ejercicios.push({ ejercicioId: id, series: 3, min: 8, max: 12, descanso: 90 });
    await guardarRutina(r); render();
  },
  exportarJSON: () => exportarJSON(),
  exportarCSV: () => exportarCSV(),
};

function cambiar(campo, i, j, signo) {
  const s = sesionVisible(); const x = s.ejercicios[i]; const y = x.series[j];
  if (campo === 'reps') y.reps = Math.max(0, (y.reps ?? 0) + signo);
  else {
    const ej = { ...ejDe(x.ejercicioId), unidad: x.unidad };
    const p = y.peso ?? 0;
    y.peso = r1(signo > 0 ? p + paso(ej, p, S.cfg) : p - paso(ej, p - 0.001, S.cfg));
    if (ej.tipo !== 'corporal') y.peso = Math.max(0, y.peso);
    if (!y.calentamiento) copiarPesoAdelante(x, j);
  }
  guardarSesion(s); repintarTarjeta(i);
}

app.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]');
  if (!b || b.disabled) return;
  const i = b.closest('[data-i]')?.dataset.i;
  const j = b.closest('[data-j]')?.dataset.j;
  acciones[b.dataset.a]?.(b, i == null ? null : +i, j == null ? null : +j);
});

// Escribir en peso/reps: se guarda mientras escribes; al salir del campo copia el peso hacia adelante.
app.addEventListener('input', (e) => {
  const f = e.target.dataset.f;
  if (!f) return;
  const i = +e.target.closest('[data-i]').dataset.i, j = +e.target.closest('[data-j]').dataset.j;
  const s = sesionVisible(); const y = s.ejercicios[i].series[j];
  const v = num(e.target.value);
  y[f] = f === 'reps' && v != null ? Math.max(0, Math.round(v)) : v;
  guardarSesion(s, true);
});

app.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.dataset.f === 'peso') {
    const i = +t.closest('[data-i]').dataset.i, j = +t.closest('[data-j]').dataset.j;
    const s = sesionVisible(); const x = s.ejercicios[i];
    if (!x.series[j].calentamiento) copiarPesoAdelante(x, j);
    guardarSesion(s); repintarTarjeta(i);
  } else if (t.dataset.f === 'reps') {
    guardarSesion(sesionVisible());
  } else if (t.id === 'pesoCorporal') {
    const kg = num(t.value);
    const id = F.diaLocal();
    S.pesos = S.pesos.filter((p) => p.id !== id);
    if (kg > 0) { S.pesos.push({ id, kg }); S.pesos.sort((a, b) => a.id.localeCompare(b.id)); await db.guardar('pesoCorporal', { id, kg }); aviso('Peso corporal guardado'); }
    else await db.borrar('pesoCorporal', id);
  } else if (t.dataset.c === 'progresoEj') { S.progresoEj = t.value; render(); }
  else if (t.dataset.c === 'tema') {
    document.documentElement.dataset.theme = t.value;
    try { localStorage.setItem('tema', t.value); } catch {}
  } else if (t.dataset.c === 'precarga') { await setAjuste('precarga', t.value); aviso('Listo'); }
  else if (t.dataset.c === 'importar' && t.files[0]) { await importar(t.files[0]); t.value = ''; }
});

// Si la app se va a segundo plano, guarda lo pendiente de inmediato.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && abierta()) guardarSesion(abierta());
});

setInterval(() => {
  const c = $('#crono'); const s = abierta();
  if (c && s) c.textContent = F.reloj(Date.now() - new Date(s.inicio));
}, 1000);

// ---------- arranque ----------
async function iniciar() {
  S.cfg = await fetch('./progresion.json').then((r) => r.json());
  let d = await db.leerTodo();
  if (!d.ejercicios.length && !d.rutinas.length) {
    await db.reemplazarTodo({ ejercicios: EJERCICIOS, rutinas: RUTINAS, sesiones: [], pesoCorporal: [], ajustes: [{ id: 'rutinaActiva', valor: 'actual' }] });
    d = await db.leerTodo();
  }
  cargar(d);
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  if (window.caches) {
    const v = (await caches.keys()).find((k) => k.startsWith('gym-'));
    if (v) document.documentElement.dataset.version = v;
  }
}

iniciar().catch((err) => {
  app.innerHTML = `<p class="vacio">No se pudo abrir la app: ${esc(err.message)}</p>`;
});
