// Скрипт предзагрузки: отдает интерфейсу только нужные функции
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listDir: (dir) => ipcRenderer.invoke('list-dir', dir),
  watchDir: (dir) => ipcRenderer.invoke('watch-dir', dir),
  unwatchDir: () => ipcRenderer.invoke('unwatch-dir'),
  onNewFile: (callback) => ipcRenderer.on('new-file', (event, info) => callback(info))
});
