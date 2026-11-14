// Gráfica de línea sencilla en SVG (sin librerías, funciona sin internet).
import { fechaCorta } from './formato.js';

/** puntos: [{x: Date|ISO, y: número}] ordenados por fecha */
export function lineaSVG(puntos, { unidad = '', marcas = [] } = {}) {
  if (!puntos.length) return '<p class="vacio">Todavía no hay datos en este rango.</p>';
  const W = 340, H = 200, izq = 40, der = 10, arr = 12, abj = 28;
  const xs = puntos.map((p) => new Date(p.x).getTime());
  const ys = puntos.map((p) => p.y);
  let ymin = Math.min(...ys), ymax = Math.max(...ys);
  const marg = Math.max((ymax - ymin) * 0.15, ymax * 0.03, 1);
  ymin -= marg; ymax += marg;
  const x0 = xs[0], x1 = xs[xs.length - 1];
  const X = (t) => (x1 === x0 ? (izq + W - der) / 2 : izq + ((t - x0) / (x1 - x0)) * (W - izq - der));
  const Y = (v) => arr + (1 - (v - ymin) / (ymax - ymin)) * (H - arr - abj);
  const lineas = [0, 0.5, 1].map((f) => {
    const v = ymin + f * (ymax - ymin);
    return `<line x1="${izq}" x2="${W - der}" y1="${Y(v)}" y2="${Y(v)}" class="g-rejilla"/>
      <text x="${izq - 6}" y="${Y(v) + 4}" text-anchor="end" class="g-eje">${Math.round(v)}</text>`;
  }).join('');
  const pts = puntos.map((p, i) => `${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`);
  const circulos = puntos.map((p, i) =>
    `<circle cx="${X(xs[i])}" cy="${Y(p.y)}" r="${marcas[i] ? 5 : 3.5}" class="${marcas[i] ? 'g-marca' : 'g-punto'}"><title>${fechaCorta(p.x)}: ${p.y} ${unidad}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="grafica" role="img" aria-label="Gráfica de ${puntos.length} puntos">
    ${lineas}
    <polyline points="${pts.join(' ')}" class="g-linea"/>
    ${circulos}
    <text x="${izq}" y="${H - 8}" class="g-eje">${fechaCorta(puntos[0].x)}</text>
    <text x="${W - der}" y="${H - 8}" text-anchor="end" class="g-eje">${fechaCorta(puntos[puntos.length - 1].x)}</text>
  </svg>`;
}
