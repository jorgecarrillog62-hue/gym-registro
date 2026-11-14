# Referencias de diseño — app de registro de gym

Etapa 0. Patrones de uso tomados de 5 apps conocidas. No se copia ninguna marca, icono, texto ni estilo visual.

**Importante: no pude ver las pantallas de ninguna de las 5 apps.** Todo lo de abajo sale de sus centros de ayuda, páginas oficiales, fichas de tienda y reseñas escritas. La carpeta `referencias/` estaba vacía. Si puedes, pon ahí capturas de la pantalla de registrar series, del historial y de las gráficas de RP Hypertrophy (la más importante) y de Hevy o Strong, y ajusto los bocetos.

## Las 5 apps

Además de RP Hypertrophy, elegí estas 4:
- **Hevy**: es la que más calificaciones tiene en las tiendas y su versión gratis ya trae registro completo y gráficas.
- **Strong**: es la referencia de "registro rápido y sin adornos"; casi todas las reseñas la ponen como el estándar.
- **JEFIT**: es de las más antiguas y descargadas (dice tener más de 10 millones de descargas, aunque ese dato lo publica la propia empresa).
- **FitNotes**: es solo para Android, gratis y funciona sin internet, igual que la tuya.

| App | Registrar una serie | La última vez | Descanso | Historial y récords | Gráficas |
|---|---|---|---|---|---|
| **RP Hypertrophy** | Cada serie es una fila de 3 casillas: peso, repeticiones y una casilla de "hecha" a la derecha. El peso que escribes en la 1.ª serie se copia solo a las demás. Las casillas vacías te dicen cuántas series tocan. | Ya trae escritos el peso y las repeticiones meta de la semana. | No encontré información sobre esto. | Organizado por mesociclo y semana. | Casi no tiene; lo suyo es la prescripción. |
| **Hevy** | Fila por serie con peso y repeticiones (y RPE si lo activas). Tocas la casilla de hecha y arranca el descanso. Si tocas el número de la serie, la marcas como calentamiento, drop set o al fallo. | Columna "Anterior" en cada fila. Puedes escoger si es tu última vez en general o la última vez con esa rutina. Los valores vienen ya llenos. | Se inicia solo al marcar la serie y se configura por ejercicio. | Aviso de récord en vivo al marcar la serie (1RM, más repeticiones). Menú ⋮ por ejercicio para reordenar, sustituir y quitar, y notas fijas por ejercicio. | Músculos trabajados, frecuencia, constancia. Algunas son de pago. |
| **Strong** | Unos 3 toques por serie una vez dentro de la sesión. | El peso y las repeticiones anteriores aparecen junto a cada serie. | Se inicia solo después de cada serie y se configura por ejercicio. | Historial por sesión y por ejercicio desde la primera vez. | 1RM estimado en el tiempo, progresión de peso, series por músculo (de pago). |
| **JEFIT** | Registro clásico de peso y repeticiones con mucho contenido alrededor. | — | Sí tiene. | Calendario y registro. | 1RM, tiempo de recuperación del músculo. Muy cargada de funciones. |
| **FitNotes** | Campos de peso y repeticiones con botones − y + y un botón "Guardar". | Historial del ejercicio en orden de fecha. | Sí tiene (no lo confirmé en reseñas). | Marca los récords automáticamente; tiene calendario. | Volumen por músculo y peso corporal junto a los entrenamientos. |

### RP Hypertrophy en detalle (se parece a tu "meta de hoy")
- **Repeticiones en reserva (RIR):** RP no te pide escribir tu RIR. Te da un RIR objetivo por semana del mesociclo y la casilla de repeticiones muestra la meta. Tú anotas las repeticiones que salieron. Si fallas el objetivo, la app dice que "se ajusta sola".
- **Ajuste de una sesión a otra:** según su centro de ayuda, sube el peso unos pocos puntos porcentuales por semana. **Si el siguiente escalón de peso es demasiado grande, mejor suma una repetición por serie.** Es la misma idea que tu doble progresión.
- **Cómo comunica la meta:** no lo explica con texto; escribe directamente el peso y las repeticiones meta en las casillas. Siempre puedes sobrescribirlos, añadir o quitar series. Nunca te bloquea.
- **Lo que no tomamos de RP:** las preguntas de bombeo, dolor y carga de trabajo después de cada ejercicio para cambiar el número de series (no lo pediste), y los mesociclos automáticos. Las reseñas se quejan de que no funciona sin internet y de que mover series es incómodo.

## Esto sí lo adoptamos
1. **Valores precargados + un toque para marcar la serie como hecha** (todas). Si cumpliste la meta, registrar la serie es **1 toque**.
2. **La meta escrita dentro de las casillas** (RP), con una línea arriba que explica la razón (lo tuyo, que RP no tiene).
3. **El peso de la serie 1 se copia a las siguientes** cuando lo cambias (RP).
4. **Lo de la última vez en una columna pequeña junto a cada serie** (Hevy, Strong).
5. **Botones − y + grandes junto al número**; si tocas el número, sale el teclado numérico (FitNotes).
6. **Tocar el número de la serie la cambia a calentamiento** (Hevy).
7. **Menú ⋮ por ejercicio:** nota, sustituir, mover arriba/abajo, añadir/quitar serie, quitar ejercicio (Hevy).
8. **El descanso arranca solo al marcar la serie**, con tiempo por ejercicio, y se puede apagar (Hevy, Strong). Va en la etapa 4.
9. **Aviso de récord en el momento** de marcar la serie (Hevy). Va en la etapa 4.
10. **Gráfica de 1RM estimado por ejercicio** (Strong) y **récords por rango de repeticiones** (FitNotes).
11. **Calendario de días entrenados** (FitNotes, JEFIT).

## Esto no, y por qué
- Red social, seguidores y compartir: es una app solo para ti.
- Planes de pago, cuenta, nube y sincronización: todo vive en el teléfono.
- Videos o animaciones de ejercicios y biblioteca gigante: ya conoces tus ejercicios; el catálogo es solo el tuyo.
- Rutinas prediseñadas y coach virtual o con IA: tu rutina sale del plan.
- Cardio, nutrición y medidas corporales (salvo el peso corporal): no lo pediste.
- Preguntas de bombeo y dolor, y mesociclos automáticos (RP): no lo pediste; la meta sale solo de tus series.
- Calculadora de discos, de calentamiento, drop sets, superseries y myoreps: son funciones extra.
- Reloj inteligente y widgets: son funciones extra.

## Boceto de pantallas
Barra inferior con 4 pestañas: **Inicio · Historial · Progreso · Rutina**.

```
[1] INICIO                          [2] ENTRENANDO: Torso A    00:42  [Terminar]
 ┌───────────────────────────┐      ┌─────────────────────────────────────────┐
 │  ▶ Empezar: Push (lunes)  │      │ Press de mancuernas en banco   3×8–12 ⋮ │
 │  (botón grande, verde)    │      │ Meta de hoy: 3×11 con 22 kg             │
 └───────────────────────────┘      │ (la última vez 3×10 con 22 kg, RIR 2)   │
  Otro día ▾   ·  Libre             │ #  Anterior   Peso      Reps    RIR  ✓  │
  Peso corporal hoy: [ 83.4 ] kg    │ 1  22×10    − 22 +   − 11 +  0-4  ○  │
  Último entrenamiento: martes      │ C  10×10    − 10 +   − 10 +       ●  │
  (Si tienes una sesión a medias:   │ + serie                                 │
   "Continuar entrenamiento")       └─────────────────────────────────────────┘
                                     + Añadir ejercicio
```
- **Flujo:** abres la app → **1 toque** en "Empezar" (sugiere el siguiente día de la rutina activa; "Otro día" o "Libre" para elegir). Cada serie: 1 toque si cumpliste la meta, o − / + y después ✓. RIR: 1 toque en un número del 0 al 4 (es opcional). Se guarda solo después de cada cambio. Si cierras la app a la mitad, Inicio muestra "Continuar entrenamiento".
- **[3] Historial:** lista por fecha (día, hora en am/pm, duración, volumen). Si tocas una sesión, se abre el detalle editable con la opción "Borrar". El calendario mensual va arriba (etapa 4).
- **[4] Progreso:** eliges un ejercicio → gráfica de 1RM estimado con selector 4 sem / 3 m / 6 m / todo. En la etapa 4 se suman la banda esperada, el indicador por debajo/dentro/por encima, los récords, las series por músculo por semana, los entrenamientos por semana y el peso corporal.
- **[5] Rutina:** muestra tus rutinas y te deja activar una con un toque. Desde ahí editas los días y ejercicios (series, rango, descanso, músculos, tipo, unidad, incremento), las reglas de progresión, el modo déficit (etapa 4), Exportar/Importar y el tema claro/oscuro.

## Preguntas para ti
1. **Archivo del plan:** el archivo tiene tu edad, estatura y peso, así que **lo dejé fuera del repositorio público** (en `.gitignore`). Solo los números de las reglas van a `progresion.json`. ¿Está bien así? (En tu mensaje lo llamas `plan-entrenamiento.md`; el archivo real tiene otro nombre).
2. **Press militar 18 kg:** ¿son 18 kg por mancuerna o con barra?
3. **Rangos de la rutina actual:** tu rutina dice "5×5" o "3×10", pero la meta de hoy necesita un rango (mínimo–máximo). ¿Uso los rangos que propone el plan para esos ejercicios (por ejemplo, press militar 5–8, fondos 6–12, extensión de cuádriceps 10–15) sin cambiar tus series? ¿O prefieres rango fijo (5–5), que suba el peso cada vez que completes todo?
4. **Tu ejemplo 2 contra el plan:** con rango 8–10 y 3×10 con 20 kg, tú pides "22 kg, 3×8". El plan dice que ese salto no cabe en el rango y prefiere primero una microcarga (21 kg). **Voy a seguir tu regla (22 kg, 3×8)**; confírmalo.
5. **Reglas del plan que tú no mencionaste:** ¿las incluyo? R2: "demasiado fácil" (RIR ≥ objetivo + 2), entonces sube 2 incrementos. R5/R6: el plan baja la carga **en la misma sesión siguiente** si la 1.ª serie o 2+ series quedan bajo el mínimo; tú pides bajar **tras 2 sesiones seguidas**. R7: si haces RIR 4, la meta sube 2 repeticiones. Mi propuesta es usar tu versión y dejar R2, R6 y R7 apagadas pero configurables.
6. **¿Cuánto bajar?** El plan dice "un incremento (≈5 %)" en R6 y "5–10 %" en R10. ¿Uso 5 %?
7. **Pausas:** el plan trae una tabla: 1 semana 95–100 %, 2 semanas 90–95 %, 3 semanas 85–90 %, 4 semanas 80–85 %. ¿La uso tomando el valor bajo de cada fila (15–21 días → 90 %, 22–28 → 85 %, más de 28 → 80 %), o solo el 90 % que mencionas?
8. **1RM estimado:** el plan usa Epley **sumando el RIR** (`peso × (1 + (reps + RIR)/30)`), válido hasta 12 en total. ¿Lo uso así? Si una serie no tiene RIR anotado, ¿cuento RIR 0?
9. **RIR objetivo por ejercicio:** el plan dice 1–3 en compuestos y 0–2 en aislamiento. ¿Uso el tope (3 y 2) como umbral para subir peso? El plan permite hasta objetivo + 1.
10. **Incrementos:** en tu gym, ¿de cuánto en cuánto suben las mancuernas (1, 2 o 2.5 kg)? ¿Y las máquinas en libras (5 o 10 lb)?
11. **Pesos de arranque:** no me diste pesos de elevaciones laterales, extensión de tríceps, jalón de tríceps ni pantorrilla sentado. Los dejo sin "última vez" (la meta dirá "primera vez: elige tu peso"). Los pesos que sí me diste los guardo como **punto de partida del ejercicio, no como una sesión del historial**, para no inventar entrenamientos. ¿De acuerdo?
12. **Segunda rutina:** el plan trae Versión A (4 días) y Versión B (3 días). ¿Cargo las dos o solo la A?
13. **Etapa 4, para ir adelantando:** ¿en qué escenario de la banda esperada estás: principiante (menos de 1 año), intermedio (1–3) o avanzado (más de 3)? Para series por músculo, ¿la referencia es 10–16 "fraccionarias" por semana (que es como las contamos)? En modo déficit, ¿el margen es 5 % (el plan dice 3–5 % en un día malo)? En la descarga, ¿reduzco las series 50 % (el plan dice 40–50 %), redondeando hacia arriba?

## Fuentes
- RP: [centro de ayuda, progresiones](https://help.rpstrength.com/hc/en-us/articles/43864744488599-Hypertrophy-App-Progressions), [registro de peso, repeticiones y series](https://help.rpstrength.com/hc/en-us/articles/43828601644055-Logging-Weights-Reps-Sets), [RIR](https://help.rpstrength.com/hc/en-us/articles/43549386649751-RIR-Reps-in-Reserve), [RIR fallido](https://help.rpstrength.com/hc/en-us/articles/32435225484183-Missed-RIR-Target), [reseñas de usuarios](https://ditchnet.org/t/can-anyone-share-an-honest-rp-hypertrophy-app-review/2143)
- Hevy: [registrar entrenamientos](https://www.hevyapp.com/features/track-workouts/), [guía de funciones](https://help.hevyapp.com/hc/en-us/articles/33106320824727)
- Strong: [reseña de repreturn](https://repreturn.com/strong-app-review/), [reseña de SensAI 2026](https://www.sensai.fit/blog/strong-app-review-2026)
- JEFIT: [10 millones de descargas](https://www.jefit.com/blog/jefit-app-celebrates-10-million-downloads-with-a-25-discount), [App Store](https://apps.apple.com/us/app/id449810000)
- FitNotes: [sitio oficial](https://www.fitnotesapp.com/), [reseña de WhistleOut](https://www.whistleout.com/CellPhones/Apps/fitnotes-app-review)
- Comparativas: [Boostcamp](https://www.boostcamp.app/best/workout-apps), [jeera 2026](https://jeera-landing.pages.dev/blog/best-workout-tracker-apps)
