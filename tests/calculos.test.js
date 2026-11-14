import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { metaDeHoy } from '../js/calc/meta.js';
import { e1rmSesion, epley, volumenKg } from '../js/calc/e1rm.js';
import { convertir, subir, bajarHasta } from '../js/calc/pesos.js';

const cfg = JSON.parse(readFileSync(new URL('../progresion.json', import.meta.url)));
const hoy = new Date(2026, 10, 13, 18, 0);
const haceDias = (d) => new Date(2026, 10, 13 - d, 18, 0).toISOString();
const series = (n, peso, reps, rir = null) => Array.from({ length: n }, () => ({ peso, reps, rir, hecha: true }));
const mancuerna = { tipo: 'mancuerna', unidad: 'kg', compuesto: false, musculo: 'biceps' };

test('ejemplo 1: rango 8–12, 3×10 con 20 kg → 3×11 con 20 kg', () => {
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 20, 10, 2) }] });
  assert.equal(m.peso, 20);
  assert.deepEqual(m.reps, [11, 11, 11]);
  assert.equal(`${m.texto} (${m.razon})`,
    'Meta de hoy: 3×11 con 20 kg (la última vez hiciste 3×10 con 20 kg y 2 repeticiones en reserva)');
});

test('ejemplo 2: rango 8–10, 3×10 con 20 kg, incremento 2 → 3×8 con 22 kg', () => {
  const m = metaDeHoy({ ej: { ...mancuerna, incremento: 2 }, plan: { series: 3, min: 8, max: 10 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 20, 10) }] });
  assert.equal(m.regla, 'subir');
  assert.equal(m.peso, 22);
  assert.deepEqual(m.reps, [8, 8, 8]);
});

test('primera sesión sin historial', () => {
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg, historial: [] });
  assert.equal(m.regla, 'primera');
  assert.equal(m.peso, null);
  assert.deepEqual(m.reps, [8, 8, 8]);
});

test('series incompletas: 2 de 3 al tope no sube de peso', () => {
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(2), unidad: 'kg', series: series(2, 20, 12) }] });
  assert.equal(m.peso, 20);
  assert.deepEqual(m.reps, [12, 12, 12]);
});

test('calentamientos y series no hechas no cuentan', () => {
  const s = [{ peso: 10, reps: 12, calentamiento: true, hecha: true }, ...series(3, 20, 9), { peso: 20, reps: 2, hecha: false }];
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(2), unidad: 'kg', series: s }] });
  assert.deepEqual(m.reps, [10, 10, 10]);
  assert.equal(m.peso, 20);
});

test('una serie bajo el mínimo: mantener; R5 la lleva al mínimo', () => {
  const s = [{ peso: 20, reps: 9, hecha: true }, { peso: 20, reps: 8, hecha: true }, { peso: 20, reps: 7, hecha: true }];
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(2), unidad: 'kg', series: s }] });
  assert.equal(m.regla, 'mantener');
  assert.equal(m.peso, 20);
  assert.deepEqual(m.reps, [9, 8, 8]);
});

test('dos sesiones seguidas bajo el mínimo: bajar 5 %', () => {
  const mala = [{ peso: 60, reps: 6, hecha: true }, { peso: 60, reps: 5, hecha: true }, { peso: 60, reps: 5, hecha: true }];
  const barra = { tipo: 'barra', unidad: 'kg', compuesto: true, musculo: 'cuadriceps' };
  const m = metaDeHoy({ ej: barra, plan: { series: 3, min: 6, max: 10 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'kg', series: mala }, { fecha: haceDias(7), unidad: 'kg', series: mala }] });
  assert.equal(m.regla, 'bajar');
  assert.equal(m.peso, 55); // 60 × 0.95 = 57 → escalón de barra que no pasa de 57
  assert.deepEqual(m.reps, [8, 8, 8]);
});

test('pausa de 20 días: 90 % del peso', () => {
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(20), unidad: 'kg', series: series(3, 20, 10) }] });
  assert.equal(m.regla, 'pausa');
  assert.equal(m.peso, 18);
});

test('pausa de 14 días todavía no aplica; de 30 días usa 80 %', () => {
  const h = (d) => [{ fecha: haceDias(d), unidad: 'kg', series: series(3, 20, 10) }];
  assert.equal(metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg, historial: h(14) }).regla, 'repeticion');
  assert.equal(metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg, historial: h(30) }).peso, 16);
});

test('cambio de unidad: historial en lb, ejercicio ahora en kg', () => {
  const maq = { tipo: 'maquina', unidad: 'kg', compuesto: false, musculo: 'cuadriceps' };
  const m = metaDeHoy({ ej: maq, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'lb', series: series(3, 100, 10) }] });
  assert.equal(m.peso, 45.4);
  assert.match(m.razon, /45\.4 kg/);
});

test('peso corporal: sube repeticiones y al tope agrega lastre', () => {
  const dom = { tipo: 'corporal', unidad: 'kg', compuesto: true, musculo: 'espalda' };
  const plan = { series: 3, min: 6, max: 12 };
  const a = metaDeHoy({ ej: dom, plan, hoy, cfg, historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 0, 5) }] });
  assert.deepEqual([a.peso, a.reps], [0, [6, 6, 6]]);
  const b = metaDeHoy({ ej: dom, plan, hoy, cfg, historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 0, 12) }] });
  assert.equal(b.peso, 2.5);
  assert.deepEqual(b.reps, [7, 7, 7]);
  assert.match(b.texto, /\+2\.5 kg de lastre/);
});

test('R2: todas al tope con RIR alto sube dos escalones; R7 suma 2 reps', () => {
  const m = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 20, 12, 3) }] });
  assert.equal(m.regla, 'subir-facil');
  assert.equal(m.peso, 24);
  const r7 = metaDeHoy({ ej: mancuerna, plan: { series: 3, min: 8, max: 12 }, hoy, cfg,
    historial: [{ fecha: haceDias(3), unidad: 'kg', series: series(3, 20, 9, 4) }] });
  assert.deepEqual(r7.reps, [11, 11, 11]);
});

test('escalones de mancuerna: de 1 en 1 hasta 10 kg, luego de 2 en 2', () => {
  assert.equal(subir(mancuerna, 9, cfg), 10);
  assert.equal(subir(mancuerna, 10, cfg), 12);
  assert.equal(bajarHasta(mancuerna, 12, 11.4, cfg), 10);
  assert.equal(bajarHasta(mancuerna, 10, 9.5, cfg), 9);
});

test('1RM: Epley con RIR, solo series válidas y peso corporal + lastre', () => {
  assert.equal(Math.round(epley(20, 10, 2) * 10) / 10, 28);
  assert.equal(e1rmSesion([{ peso: 100, reps: 5, rir: 1, hecha: true }, { peso: 60, reps: 20, hecha: true }]), 120);
  assert.equal(e1rmSesion([{ peso: 5, reps: 7, rir: 2, hecha: true }], { corporal: true, pesoCorporal: 83 }), 114.4);
  assert.equal(e1rmSesion([{ peso: 0, reps: 7, hecha: true }], { corporal: true }), null);
  assert.equal(e1rmSesion([]), null);
});

test('conversión kg/lb y volumen', () => {
  assert.equal(convertir(100, 'lb', 'kg'), 45.4);
  assert.equal(convertir(45.4, 'kg', 'lb'), 100.1);
  assert.equal(volumenKg(series(3, 100, 10), 'lb'), 1361);
});
