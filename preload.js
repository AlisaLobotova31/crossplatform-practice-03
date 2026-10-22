// Скрипт предзагрузки: отдает интерфейсу только нужные функции
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listDir: (dir) => ipcRenderer.invoke('list-dir', dir)
});
