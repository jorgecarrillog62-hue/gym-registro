// Unidades y escalones de peso. Funciones puras (sin pantalla ni base de datos).

export const LB_KG = 0.45359237;

/** Redondea a un decimal (22, 22.5, 87.6). */
export const r1 = (n) => Math.round(n * 10) / 10;

export function convertir(peso, de, a) {
  if (peso == null || de === a) return peso;
  return r1(de === 'lb' ? peso * LB_KG : peso / LB_KG);
}

export const aKg = (peso, unidad) => (unidad === 'lb' ? peso * LB_KG : peso);

/** Tamaño del siguiente escalón hacia arriba desde `peso`. */
export function paso(ej, peso, cfg) {
  if (ej.incremento) return ej.incremento;
  const inc = cfg.incrementos;
  if (ej.tipo === 'mancuerna') {
    return peso < inc.mancuerna.hasta ? inc.mancuerna.pasoChico : inc.mancuerna.pasoGrande;
  }
  if (ej.tipo === 'corporal') return inc.corporal;
  const v = inc[ej.tipo];
  return typeof v === 'number' ? v : v[ej.unidad];
}

/** Sube `veces` escalones. */
export function subir(ej, peso, cfg, veces = 1) {
  for (let i = 0; i < veces; i++) peso = r1(peso + paso(ej, peso, cfg));
  return peso;
}

/** Baja un escalón (el de mancuerna depende del peso de abajo: 12 → 10 → 9). */
export const bajarUno = (ej, peso, cfg) => r1(peso - paso(ej, peso - 0.001, cfg));

/** Mayor peso de la escalera que no pasa de `objetivo`, bajando desde `peso`. */
export function bajarHasta(ej, peso, objetivo, cfg) {
  let p = peso;
  for (let i = 0; i < 200 && p > objetivo + 1e-9; i++) p = bajarUno(ej, p, cfg);
  return ej.tipo === 'corporal' ? p : Math.max(0, p);
}
