'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cafeteriaElectron', {
  getAppInfo: async () => {
    const info = await ipcRenderer.invoke('cafeteria-electron:get-app-info');
    return info;
  },
});
