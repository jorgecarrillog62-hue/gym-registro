# Guía de instalación — Registro Gym

Sigue los pasos en orden. Cada paso termina con una línea **✔ Comprueba**: no avances hasta que se cumpla.

Lo que necesitas:
- Tu computadora con esta carpeta (`C:\Documentos\Documentos\GYM`).
- Una cuenta de GitHub (gratis, en https://github.com).
- Tu teléfono Android con Chrome.

> Tus entrenamientos **nunca** se suben a GitHub. Solo se publica el código de la app. Tus datos viven únicamente en el teléfono.

---

## Parte 1. Crear el repositorio en GitHub

**1.** Abre https://github.com en tu computadora e inicia sesión.
✔ Comprueba: arriba a la derecha ves tu foto o tu inicial.

**2.** Arriba a la derecha toca el botón **+** y elige **New repository**.
✔ Comprueba: ves una página que dice "Create a new repository".

**3.** Llena así:
- **Repository name:** `gym-registro`
- Marca **Public** (GitHub Pages gratis solo funciona con repositorios públicos).
- **No** marques "Add a README", ni ".gitignore", ni "license" (el repositorio debe quedar vacío).

Toca **Create repository**.
✔ Comprueba: ves una página casi vacía con el título `tu-usuario/gym-registro` y una dirección que termina en `gym-registro.git`.

---

## Parte 2. Subir los archivos

Usa la **opción A** si en tu computadora ya subes cosas a GitHub con `git push` (así lo hiciste con Mi Plato). Si no, usa la **opción B**.

### Opción A: con `git push`

**4A.** Abre una terminal (PowerShell o Git Bash) dentro de la carpeta `C:\Documentos\Documentos\GYM`.
✔ Comprueba: al escribir `git log --oneline` ves varias líneas; una dice "Versión mínima" y la de hasta arriba dice "Guía de instalación".

**5A.** Escribe estos dos comandos, uno por uno. Cambia `TU-USUARIO` por tu usuario de GitHub:

```bash
git remote add origin https://github.com/TU-USUARIO/gym-registro.git
```

```bash
git push -u origin main
```

Si te pide iniciar sesión, hazlo en la ventana que se abre.
✔ Comprueba: recarga la página del repositorio en GitHub; ahora ves `index.html`, `sw.js`, las carpetas `css`, `js`, `icons`, `docs`, `tests` y este archivo de guía. **No** debe aparecer el archivo del plan ("Programa de entrenamiento…") ni la carpeta `referencias`.

### Opción B: arrastrando archivos en la web

**4B.** En la página vacía del repositorio toca el enlace **uploading an existing file**.
✔ Comprueba: ves un recuadro que dice "Drag files here".

**5B.** Abre la carpeta `C:\Documentos\Documentos\GYM` en el Explorador de Windows. Selecciona y arrastra al recuadro **solo esto**:
`index.html`, `manifest.webmanifest`, `sw.js`, `progresion.json`, `package.json`, `.gitignore`, `GUIA-INSTALACION-GYM.md` y las carpetas `css`, `js`, `icons`, `docs` y `tests`.

**No** arrastres el archivo "Programa de entrenamiento…" (trae tus datos personales), ni la carpeta `referencias`, ni la carpeta `.claude`.
Si no ves `.gitignore`, en el Explorador activa **Vista → Mostrar → Elementos ocultos**.

Abajo toca **Commit changes**.
✔ Comprueba: la página del repositorio muestra los archivos y carpetas de la lista (abre la carpeta `js` y verifica que dentro está la carpeta `calc`).

---

## Parte 3. Activar GitHub Pages

**6.** En el repositorio toca **Settings** (arriba, con un engrane). En el menú de la izquierda toca **Pages**.
✔ Comprueba: ves el título "GitHub Pages" y una sección "Build and deployment".

**7.** En **Source** elige **Deploy from a branch**. En **Branch** elige `main` y a su lado `/(root)`. Toca **Save**.
✔ Comprueba: la página dice algo como "GitHub Pages source saved".

**8.** Espera 1 o 2 minutos y recarga esa misma página de **Pages**.
✔ Comprueba: arriba aparece "Your site is live at `https://TU-USUARIO.github.io/gym-registro/`". Toca **Visit site** y en la computadora se abre la app con el botón verde "Empezar entrenamiento".

---

## Parte 4. Instalar en tu teléfono

**9.** En tu teléfono abre **Chrome** y escribe la dirección `https://TU-USUARIO.github.io/gym-registro/`.
✔ Comprueba: ves la barra azul "Entrenar" y el botón verde "Empezar entrenamiento".

**10.** Toca los **tres puntos ⋮** de Chrome (arriba a la derecha) y elige **Instalar app** (en algunos teléfonos dice **Agregar a la pantalla principal** y luego **Instalar**). Confirma.
✔ Comprueba: en tu pantalla de inicio aparece el icono azul con una mancuerna verde llamado **Gym**.

**11.** Cierra Chrome y abre la app desde ese icono.
✔ Comprueba: se abre a pantalla completa, **sin** la barra de direcciones de Chrome.

---

## Parte 5. Probar que funciona sin internet

**12.** Con la app abierta, ve a la pestaña **Rutina** y baja hasta el final.
✔ Comprueba: dice "Versión de la app: gym-v1". (Si dice "sin instalar", cierra la app, ábrela otra vez y vuelve a revisar).

**13.** Cierra la app por completo (desde el botón de apps recientes, deslízala hacia arriba). Activa el **modo avión**. Abre la app desde el icono.
✔ Comprueba: abre normal. Toca **Empezar entrenamiento**, marca una serie con ✓ y luego toca **Descartar entrenamiento**. Todo funciona sin conexión.

**14.** Desactiva el modo avión.
✔ Comprueba: la app sigue igual. No necesita internet para nada.

---

## Parte 6. Recibir actualizaciones

Cuando yo te entregue archivos nuevos o cambios:

**15.** Antes de subirlos, revisa que en `sw.js` la línea `const VERSION = 'gym-v…'` tenga un número más alto que la anterior (por ejemplo `gym-v2`). **Si no cambia ese número, el teléfono no recibe la actualización.**
✔ Comprueba: abre `sw.js` y mira la línea 3.

**16.** Sube los cambios: con `git push` (opción A) o arrastrando los archivos que cambiaron a la página del repositorio y tocando **Commit changes** (opción B). Espera 1 o 2 minutos.
✔ Comprueba: en GitHub, el archivo `sw.js` muestra el número nuevo.

**17.** En el teléfono, con internet, **abre la app, ciérrala por completo y ábrela otra vez** (dos veces). La primera vez descarga la versión nueva; la segunda ya la usa.
✔ Comprueba: en **Rutina**, hasta abajo, dice la versión nueva (por ejemplo "gym-v2").

---

## Parte 7. Respaldar y restaurar tus datos

Tus datos viven solo en el teléfono. **Si borras los datos de Chrome o desinstalas la app, se pierden.** Respalda seguido (por ejemplo, cada domingo).

**18. Respaldar.** En la app ve a **Rutina** → sección **Tus datos** → **Exportar respaldo (JSON)**.
✔ Comprueba: en la carpeta **Descargas** del teléfono aparece un archivo `gym-respaldo-AAAA-MM-DD.json`, y en la app dice "Último respaldo: (fecha de hoy)".

**19. Guardarlo fuera del teléfono.** Abre la app **Archivos** (o **Mis archivos**), busca ese archivo en **Descargas** y compártelo a tu Google Drive o mándalo a tu correo. **No** lo subas al repositorio de GitHub: es público.
✔ Comprueba: lo ves en tu Drive o en tu correo.

**20. (Opcional) Hoja de cálculo.** **Exportar series (CSV)** baja `gym-series-AAAA-MM-DD.csv`, con un renglón por serie, que se abre en Excel o Google Sheets. Sirve para revisar tus datos, **no** para restaurar.
✔ Comprueba: al abrirlo ves columnas fecha, hora, ejercicio, serie, peso, reps y rir.

**21. Restaurar.** Si cambias de teléfono o se borraron tus datos: instala la app (pasos 9 a 11), descarga tu respaldo `.json` al teléfono y en la app ve a **Rutina** → **Importar respaldo** → elige el archivo. La app te avisa cuántos entrenamientos trae y que **reemplazará todo** lo que haya en el teléfono. Toca **Reemplazar**.
✔ Comprueba: en **Historial** aparecen tus entrenamientos y en **Progreso** tus gráficas.

---

## Si algo falla

- **No aparece "Instalar app":** revisa que la dirección empiece con `https://` y termine en `/gym-registro/`. Recarga la página una vez y vuelve a abrir el menú ⋮.
- **La página dice 404:** espera 2 minutos más después del paso 7, y revisa que `index.html` esté en la raíz del repositorio (no dentro de otra carpeta).
- **No llegó una actualización:** confirma el paso 15 (el número de `VERSION` cambió) y repite el paso 17.
