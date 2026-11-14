// 1RM estimado y volumen. Funciones puras.
import { r1, aKg } from './pesos.js';

/** Epley ajustado por RIR (plan 9.1). Sin RIR anotado cuenta como 0. */
export const epley = (carga, reps, rir) => carga * (1 + (reps + (rir ?? 0)) / 30);

/** Epley al revés: cuántas repeticiones al fallo con `carga`. */
export const repsAlFallo = (e1rm, carga) => 30 * (e1rm / carga - 1);

/** Series que cuentan: hechas, que no son calentamiento y con repeticiones. */
export const seriesTrabajo = (series) =>
  series.filter((s) => s.hecha !== false && !s.calentamiento && s.reps > 0 && s.peso != null);

/** Carga real: en peso corporal es peso corporal + lastre (null si no hay peso corporal). */
export function carga(s, { corporal = false, pesoCorporal = null } = {}) {
  if (!corporal) return s.peso;
  return pesoCorporal ? pesoCorporal + (s.peso || 0) : null;
}

/**
 * Mejor 1RM estimado de una sesión. Usa las series válidas del plan
 * (reps + RIR ≤ 12 y RIR ≤ 3); si ninguna lo es, usa todas.
 */
export function e1rmSesion(series, opts = {}, cfg = { maxRepsMasRIR: 12, rirMaxSerieValida: 3 }) {
  const t = seriesTrabajo(series)
    .map((s) => ({ s, c: carga(s, opts) }))
    .filter((x) => x.c > 0);
  const validas = t.filter(
    ({ s }) => s.reps + (s.rir ?? 0) <= cfg.maxRepsMasRIR && (s.rir ?? 0) <= cfg.rirMaxSerieValida,
  );
  const usar = validas.length ? validas : t;
  if (!usar.length) return null;
  return r1(Math.max(...usar.map(({ s, c }) => epley(c, s.reps, s.rir))));
}

/** Volumen en kg (peso × reps de las series de trabajo). */
export function volumenKg(series, unidad, opts = {}) {
  return Math.round(
    seriesTrabajo(series).reduce((t, s) => t + aKg(carga(s, opts) ?? 0, unidad) * s.reps, 0),
  );
}
