// Guardado local en el teléfono (IndexedDB). Nada sale del dispositivo.
export const ALMACENES = ['ejercicios', 'rutinas', 'sesiones', 'pesoCorporal', 'ajustes'];
let conexion;

function abrir() {
  conexion ??= new Promise((ok, mal) => {
    const r = indexedDB.open('gym-registro', 1);
    r.onupgradeneeded = () => {
      for (const s of ALMACENES) if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s, { keyPath: 'id' });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
  return conexion;
}

async function tx(almacenes, modo, fn) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(almacenes, modo);
    const req = fn(t);
    t.oncomplete = () => ok(req?.result);
    t.onerror = () => mal(t.error);
    t.onabort = () => mal(t.error);
  });
}

export const todos = (s) => tx(s, 'readonly', (t) => t.objectStore(s).getAll());
export const guardar = (s, obj) => tx(s, 'readwrite', (t) => t.objectStore(s).put(obj));
export const borrar = (s, id) => tx(s, 'readwrite', (t) => t.objectStore(s).delete(id));

export async function leerTodo() {
  const o = {};
  for (const s of ALMACENES) o[s] = await todos(s);
  return o;
}

/** Borra todo y escribe `datos` en una sola transacción (si algo falla, no se pierde nada). */
export const reemplazarTodo = (datos) =>
  tx(ALMACENES, 'readwrite', (t) => {
    for (const s of ALMACENES) {
      const st = t.objectStore(s);
      st.clear();
      for (const o of datos[s] || []) st.put(o);
    }
  });
