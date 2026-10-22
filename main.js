// Главный процесс: окно приложения, жизненный цикл и обработчики IPC
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // изолированный контекст для preload
      nodeIntegration: false  // в renderer нет require и модулей Node.js
    }
  });
  win.loadFile('index.html');
}

// Задание 3: чтение каталога выполняется только в главном процессе
ipcMain.handle('list-dir', async (event, dir) => {
  const fullPath = path.resolve(dir);
  const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
  return {
    path: fullPath,
    entries: entries.map(e => ({ name: e.name, isDir: e.isDirectory() }))
  };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
