'use strict';

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

const DEV_URL = (process.env.ELECTRON_DEV_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
const PROD_URL = (process.env.ELECTRON_PROD_URL || '').trim().replace(/\/+$/, '');
const ALLOWED_ORIGINS = (process.env.ELECTRON_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const TERMINAL_PATH_PREFIX = '/terminal';

const parseHttpUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

const isTerminalPath = (pathname) =>
  pathname === TERMINAL_PATH_PREFIX || pathname.startsWith(`${TERMINAL_PATH_PREFIX}/`);

const isAllowedHttpUrl = (rawUrl) => {
  const url = parseHttpUrl(rawUrl);
  if (!url) {
    return false;
  }

  const devOrigin = new URL(DEV_URL).origin;
  const prodOrigin = PROD_URL ? new URL(PROD_URL).origin : null;
  const isDevOrigin = url.origin === devOrigin;
  const isProdOrigin = Boolean(prodOrigin) && url.origin === prodOrigin;

  if (isDevOrigin) {
    // Desarrollo: servidor Vite unificado; sólo la experiencia de terminal.
    return isTerminalPath(url.pathname);
  }

  if (isProdOrigin) {
    // Producción: HTTPS, origen permitido por la API y sólo la ruta de terminal.
    const isHttps = url.protocol === 'https:';
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(url.origin) || url.origin === prodOrigin;
    return isHttps && isAllowedOrigin && isTerminalPath(url.pathname);
  }

  if (ALLOWED_ORIGINS.includes(url.origin)) {
    // Orígenes adicionales autorizados: sólo la ruta de terminal.
    return isTerminalPath(url.pathname);
  }

  return false;
};

const buildDevUrl = () => `${DEV_URL}${TERMINAL_PATH_PREFIX}`;

const resolveProductionUrl = () => (PROD_URL ? `${PROD_URL}${TERMINAL_PATH_PREFIX}` : null);

const isProduction = () => app.isPackaged || process.env.NODE_ENV === 'production';

const createMainWindow = () => {
  const productionUrl = resolveProductionUrl();
  const targetUrl = isProduction() ? productionUrl : buildDevUrl();
  const allowed = Boolean(targetUrl) && isAllowedHttpUrl(targetUrl);

  if (!allowed) {
    console.error('[electron] URL de destino no permitida o ausente; no se abre ventana.');
    return null;
  }

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      preloadPath: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.loadURL(targetUrl);

  win.webContents.on('will-navigate', (event, urlToNavigate) => {
    if (!isAllowedHttpUrl(urlToNavigate)) {
      event.preventDefault();
    }
  });

  win.webContents.on('new-window', (event, url) => {
    const target = parseHttpUrl(url);
    const isAllowedExternal = Boolean(target) && ALLOWED_ORIGINS.includes(target.origin);
    if (isAllowedExternal) {
      event.preventDefault();
      void shell.openExternal(url);
    } else {
      event.preventDefault();
    }
  });

  win.webContents.on('will-attach-webview', (event) => {
    // Sin ventanas auxiliares durante la migración unificada.
    event.preventDefault();
  });

  win.on('closed', () => {
    if (app.getAllWindows().length === 0) {
      app.quit();
    }
  });

  return win;
};

app.whenReady().then(() => {
  const win = createMainWindow();
  if (!win) {
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

ipcMain.handle('cafeteria-electron:get-app-info', () => ({
  name: 'CoffeePOS Terminal',
  version: app.getVersion(),
  isDev: !isProduction(),
  devUrl: DEV_URL,
  prodUrl: PROD_URL,
  allowedOrigins: [...ALLOWED_ORIGINS],
}));
