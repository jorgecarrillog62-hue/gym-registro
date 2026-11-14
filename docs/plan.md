# Plan breve

## Estructura de archivos
```
index.html               la app (una sola página)
manifest.webmanifest     datos para "Instalar app"
sw.js                    service worker: guarda la app para usarla sin internet (VERSION de caché)
progresion.json          reglas de progresión editables (salen de la sección 9 del plan)
package.json             solo para correr las pruebas con Node (la app no lo usa)
css/tema.css             colores, letras y espacios (tokens). Se cambia aquí el diseño
css/app.css              acomodo de las pantallas
icons/                   iconos de 192 y 512 px
js/app.js                pantallas y botones
js/db.js                 guardar y leer en el teléfono (IndexedDB)
js/datos-iniciales.js    catálogo de ejercicios y las 3 rutinas de arranque
js/grafica.js            gráfica de línea hecha a mano (SVG, sin librerías)
js/formato.js            fechas y horas en español de México (12 h, am/pm)
js/calc/pesos.js         unidades kg/lb, escalones de peso (mancuernas 1 en 1 hasta 10 kg, luego 2 en 2)
js/calc/e1rm.js          1RM estimado (Epley con RIR) y volumen
js/calc/meta.js          meta de hoy (doble progresión)
tests/                   pruebas: node --test tests/
docs/                    este plan y el informe de referencias
```
No hay librería de gráficas: una línea en SVG ocupa unas 60 líneas de código y funciona sin internet.

## Modelo de datos (IndexedDB, base "gym-registro")
- **ejercicios**: `{id, nombre, musculo, secundarios[], tipo (barra|mancuerna|maquina|polea|corporal), unidad (kg|lb), incremento (vacío = automático), compuesto (sí/no), inicio {series, reps, peso}}`. El `inicio` es el punto de partida que me diste: solo sirve para la primera meta. No aparece en el historial ni en las gráficas.
- **rutinas**: `{id, nombre, dias:[{id, nombre, diaSemana, ejercicios:[{ejercicioId, series, min, max, descanso}]}]}`. El rango está en el día, porque el mismo ejercicio puede tener distinto rango en cada rutina.
- **sesiones**: `{id, inicio, fin, nombre, rutinaId, diaId, ejercicios:[{uid, ejercicioId, unidad, plan, nota, meta, series:[{peso, reps, rir, calentamiento, hecha}]}]}`. Una sesión sin `fin` es la que está a medias.
- **pesoCorporal**: `{id: "AAAA-MM-DD", kg}`. Hace falta para el 1RM de dominadas y fondos (peso corporal + lastre).
- **ajustes**: rutina activa, tema, precargar con meta o con la última sesión, fecha del último respaldo.

## Decisiones que tomamos
- Rango por defecto 8–12. Los ejercicios de 5×5/5×6 se quedan con 5 series y rango 5–8. Fondos usa 6–12 (como el plan).
- Meta: tus reglas en orden, más R2 (si te quedó fácil, sube 2 incrementos), R5 y R7 del plan. Bajar 5 % solo tras 2 sesiones seguidas bajo el mínimo. Pausas según la tabla del plan (90/85/80 %). Para subir de peso, el RIR debe quedar en el tope del plan (3 en compuestos, 2 en aislamiento).
- 1RM = peso × (1 + (reps + RIR) / 30). Si no anotaste el RIR, cuenta como 0.
- Incrementos: mancuerna 1 kg hasta 10 kg y luego 2 kg; barra 2.5 kg; máquinas 5 lb; lastre 2.5 kg.
- **Supuestos míos (los puedes cambiar en Rutina):** poleas en libras con pasos de 5 lb. Máquinas en kg (hack squat) con pasos de 2.5 kg. "Deltoides anterior" agregado a la lista de músculos porque el plan lo usa.
- Peso corporal sin lastre: como no se puede bajar el peso, la meta siempre sube repeticiones hasta el tope.

## Orden de construcción
1. Cálculos puros y sus pruebas (meta, 1RM, pesos).
2. Base de datos, datos iniciales y progresion.json.
3. Pantallas: Entrenar (inicio y sesión con autoguardado), Historial, Progreso (gráfica del 1RM) y Rutina (activar, editar, exportar/importar).
4. PWA (manifest, iconos, sw.js), guía de instalación y prueba completa.
5. Etapa 4: banda esperada, modo déficit, series por músculo, récords, calendario, temporizador, recordatorio de exportar.
