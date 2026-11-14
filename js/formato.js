// Fechas y horas en español de México, zona horaria del teléfono, 12 horas con am/pm.
const L = 'es-MX';

export const hora = (f) => new Date(f).toLocaleTimeString(L, { hour: 'numeric', minute: '2-digit', hour12: true });
export const fechaLarga = (f) => new Date(f).toLocaleDateString(L, { weekday: 'long', day: 'numeric', month: 'long' });
export const fechaCorta = (f) => new Date(f).toLocaleDateString(L, { day: 'numeric', month: 'short' });
export const fechaConAnio = (f) => new Date(f).toLocaleDateString(L, { day: 'numeric', month: 'short', year: 'numeric' });
export const numero = (n) => n.toLocaleString(L);

/** "AAAA-MM-DD" del día local (no UTC). */
export function diaLocal(f = new Date()) {
  const d = new Date(f);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function duracion(ms) {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function reloj(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60) % 60).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return s >= 3600 ? `${Math.floor(s / 3600)}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const descanso = (s) => (s >= 60 ? `${s % 60 ? (s / 60).toFixed(1) : s / 60} min` : `${s} s`);
