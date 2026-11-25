# Electron — Frontend unificado

**Task:** TASK-20 de [FRONTEND-UNIFICATION-TASKS.md](./specs/frontend-unification/FRONTEND-UNIFICATION-TASKS.md)
**Estado:** Cerrada — commit `mismo commit`

## Objetivo

Adaptar el contenedor de escritorio Electron al frontend unificado: cargar la experiencia de terminal desde un origen HTTP(S) permitido con ruta inicial `/terminal`, sin `file://` ni modo offline, y con empaquetado Windows/macOS.

## Variables de entorno

| Variable | Default | Descripción |
| --- | --- | --- |
| `ELECTRON_DEV_URL` | `http://localhost:5173` | Servidor Vite unificado en desarrollo. La ventana abre `${ELECTRON_DEV_URL}/terminal`. |
| `ELECTRON_PROD_URL` | *(vacío)* | URL de distribución (HTTPS) a la que se añade la ruta `/terminal` (`${ELECTRON_PROD_URL}/terminal`). Obligatoria fuera de desarrollo. |
| `ELECTRON_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Orígenes adicionales autorizados (separados por coma) sobre los que sólo se admite la ruta de terminal. |

## Scripts

| Script | Comando | Uso |
| --- | --- | --- |
| `dev:electron` | `electron .` | Desarrollo; requiere `npm run dev` del paquete unificado en `http://localhost:5173`. |
| `build:electron` | `electron-builder` | Build web + empaquetado (configuración por defecto de targets). |
| `dist:win` | `electron-builder --win` | Empaquetado Windows (NSIS, x64). Sólo ejecutable en Windows. |
| `dist:mac` | `electron-builder --mac` | Empaquetado macOS (DMG, x64). Sólo ejecutable en macOS autorizado. |

## Seguridad

- Ventana única; `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` y `webSecurity: true`.
- `preload` expone únicamente `window.cafeteriaElectron.getAppInfo` vía `contextBridge` + IPC; sin APIs de Node en la página.
- Navegación (`will-navigate`) permitida sólo al origen/ruta validados; URLs no permitidas se previenen.
- Ventanas auxiliares (`will-attach-webview`) bloqueadas.
- Enlaces externos: sólo orígenes de `ELECTRON_ALLOWED_ORIGINS` con protocolo `http(s)` pueden abrirse en ventana interna; el resto se previenen y se delegan al navegador del sistema mediante `shell.openExternal`.
- Producción exige `ELECTRON_PROD_URL` con HTTPS, origen permitido por backend y ruta `/terminal`; si no es válida no se abre ventana (fail-safe).

## Verificación

Perfil de task: V-ELECTRON — `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run dist:win` (en Windows); `npm run dist:mac` sólo en macOS autorizado.

Validación autorizada de login staff y mutación CSRF desde Electron queda registrada en TASK-21 contra entorno con HTTPS y `FRONTEND_ORIGIN` permitido.
