// Meta de hoy por ejercicio: doble progresión con reglas (sección 9 del plan). Función pura.
import { convertir, subir, bajarHasta } from './pesos.js';
import { epley, repsAlFallo, seriesTrabajo } from './e1rm.js';

const DIA = 86400000;
const soloFecha = (f) => {
  const d = new Date(f);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const diasEntre = (a, b) => Math.round((soloFecha(b) - soloFecha(a)) / DIA);

const PIERNA = ['cuadriceps', 'isquiotibiales', 'gluteo', 'pantorrilla'];

/** "3×10", "11/10/10" */
export const fmtReps = (reps) =>
  reps.every((r) => r === reps[0]) ? `${reps.length}×${reps[0]}` : reps.join('/');

export function fmtPeso(peso, ej) {
  if (ej.tipo === 'corporal') {
    if (!peso) return 'con tu peso corporal';
    return `con ${peso > 0 ? '+' : ''}${peso} ${ej.unidad} de lastre`;
  }
  return `con ${peso} ${ej.unidad}`;
}

function fmtRir(series) {
  const rirs = series.map((s) => s.rir);
  if (rirs.some((r) => r == null)) return '';
  if (rirs.every((r) => r === rirs[0])) {
    return ` y ${rirs[0]} ${rirs[0] === 1 ? 'repetición' : 'repeticiones'} en reserva`;
  }
  return ` y RIR ${rirs.join('/')}`;
}

/**
 * @param ej        ejercicio {tipo, unidad, compuesto, musculo, incremento?}
 * @param plan      {series, min, max}
 * @param historial sesiones anteriores con este ejercicio, la más reciente primero:
 *                  [{fecha, unidad, series:[{peso, reps, rir, calentamiento, hecha}]}]
 * @param hoy       Date
 * @param cfg       contenido de progresion.json
 * @returns {peso, reps[], regla, texto, razon}  (peso null = primera vez)
 */
export function metaDeHoy({ ej, plan, historial = [], hoy = new Date(), cfg }) {
  const { series: n, min, max } = plan;
  const llenar = (arr) => Array.from({ length: n }, (_, i) => arr[Math.min(i, arr.length - 1)]);

  const previas = historial
    .map((h) => ({
      fecha: h.fecha,
      series: seriesTrabajo(h.series).map((s) => ({
        ...s,
        peso: convertir(s.peso, h.unidad || ej.unidad, ej.unidad),
      })),
    }))
    .filter((h) => h.series.length);

  if (!previas.length) {
    return {
      peso: null,
      reps: llenar([min]),
      regla: 'primera',
      texto: 'Primera vez: elige tu peso',
      razon: `apunta a ${n}×${min}–${max}`,
    };
  }

  const alPesoDeTrabajo = (h) => {
    const p = Math.max(...h.series.map((s) => s.peso));
    return { peso: p, series: h.series.filter((s) => s.peso === p) };
  };
  const ult = alPesoDeTrabajo(previas[0]);
  const pesoRef = ult.peso;
  const sr = ult.series;
  const repsUlt = sr.map((s) => s.reps);
  const ultimaVez = `la última vez hiciste ${fmtReps(repsUlt)} ${fmtPeso(pesoRef, ej)}${fmtRir(sr)}`;
  const corporalSinLastre = ej.tipo === 'corporal' && !pesoRef;
  const umbral = ej.compuesto ? cfg.umbralRIR.compuesto : cfg.umbralRIR.aislamiento;

  const res = (peso, reps, regla, extra = '') => ({
    peso,
    reps,
    regla,
    texto: `Meta de hoy: ${fmtReps(reps)} ${fmtPeso(peso, ej)}`,
    razon: ultimaVez + (extra ? `; ${extra}` : ''),
  });

  // 5. Retomar tras una pausa
  const dias = previas[0].fecha ? diasEntre(previas[0].fecha, hoy) : 0;
  const pausa = [...cfg.pausas].sort((a, b) => b.desdeDias - a.desdeDias).find((p) => dias >= p.desdeDias);
  if (pausa) {
    const peso = corporalSinLastre ? pesoRef : bajarHasta(ej, pesoRef, (pesoRef * pausa.porcentaje) / 100, cfg);
    return res(peso, llenar(repsUlt), 'pausa', `pasaron ${dias} días: retoma al ${pausa.porcentaje}% del peso`);
  }

  // 1. Subir de peso (todas las series al tope del rango)
  if (sr.length >= n && sr.every((s) => s.reps >= max)) {
    if (ej.tipo === 'corporal') {
      return res(subir(ej, pesoRef, cfg), llenar([Math.min(max, min + 1)]), 'lastre',
        `llegaste a ${max} en todas: agrega lastre`);
    }
    const facil = cfg.subirDobleSiFacil && sr.every((s) => s.rir != null && s.rir > umbral);
    if (facil) {
      const veces = ej.tipo === 'barra' && !PIERNA.includes(ej.musculo) ? 1 : 2;
      return res(subir(ej, pesoRef, cfg, veces), llenar([Math.min(max, min + 1)]), 'subir-facil',
        `te sobraron repeticiones: sube ${veces === 2 ? 'dos escalones' : 'un escalón'}`);
    }
    const nuevo = subir(ej, pesoRef, cfg);
    const e1 = Math.max(...sr.map((s) => epley(s.peso, s.reps, s.rir)));
    const objetivo = Math.floor(repsAlFallo(e1, nuevo) - umbral);
    const reps = Math.min(max, Math.max(min, objetivo));
    return res(nuevo, llenar([reps]), 'subir', `llegaste a ${max} en todas: toca subir de peso`);
  }

  // Peso corporal sin lastre: siempre sube repeticiones hasta el tope
  const masReps = (r, s) =>
    r >= max ? max : Math.min(max, r + (s?.rir != null && s.rir >= cfg.rirAlto.desde ? cfg.rirAlto.sumaReps : 1));
  if (corporalSinLastre) {
    const base = llenar(sr);
    return res(0, base.map((s) => masReps(s.reps, s)), 'repeticion');
  }

  const bajoMin = (h) => h.series.some((s) => s.reps < min);
  if (bajoMin(ult)) {
    // 4. Bajar: bajo el mínimo en N sesiones seguidas
    const necesarias = cfg.bajar.sesionesSeguidasBajoMinimo;
    const seguidas = previas.slice(0, necesarias).map(alPesoDeTrabajo);
    if (seguidas.length === necesarias && seguidas.every((h) => bajoMin(h) && h.peso >= pesoRef)) {
      const pct = cfg.bajar.porcentaje;
      const peso = bajarHasta(ej, pesoRef, (pesoRef * (100 - pct)) / 100, cfg);
      return res(peso, llenar([Math.min(max, min + cfg.bajar.repsSobreMinimo)]), 'bajar',
        `quedaste bajo ${min} dos sesiones seguidas: baja ${pct}%`);
    }
    // 3. Mantener (R5: si solo una serie, no la primera, quedó 1 abajo, llévala al mínimo)
    let reps = llenar(repsUlt);
    const abajo = repsUlt.map((r, i) => (r < min ? i : -1)).filter((i) => i >= 0);
    if (abajo.length === 1 && abajo[0] > 0 && repsUlt[abajo[0]] === min - 1) {
      reps = reps.map((r, i) => (i === abajo[0] ? min : r));
    }
    return res(pesoRef, reps, 'mantener', `quedaste bajo el mínimo de ${min}: repite`);
  }

  // 2. Subir una repetición en las series que no llegaron al tope
  const base = llenar(sr);
  return res(pesoRef, base.map((s) => masReps(s.reps, s)), 'repeticion');
}
