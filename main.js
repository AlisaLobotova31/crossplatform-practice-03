// Главный процесс: окно приложения, жизненный цикл и обработчики IPC
const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

let win = null;
let watcher = null;

function createWindow() {
  win = new BrowserWindow({
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

// Вариант 6: наблюдение за каталогом и уведомление о новом файле
ipcMain.handle('watch-dir', async (event, dir) => {
  const fullPath = path.resolve(dir);
  if (watcher) watcher.close();

  // Запоминаем текущий состав каталога, чтобы отличать новые файлы
  const known = new Set(await fsp.readdir(fullPath));

  watcher = fs.watch(fullPath, async (eventType, fileName) => {
    if (eventType !== 'rename' || !fileName || known.has(fileName)) return;
    try {
      await fsp.access(path.join(fullPath, fileName)); // rename приходит и при удалении
    } catch {
      return;
    }
    known.add(fileName);

    new Notification({
      title: 'Новый файл в каталоге',
      body: `${fileName}\n${fullPath}`
    }).show();

    if (win && !win.isDestroyed()) {
      win.webContents.send('new-file', { name: fileName, dir: fullPath });
    }
  });

  return fullPath;
});

ipcMain.handle('unwatch-dir', () => {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
});

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('ru.fa.student.fileexplorer'); // нужно для уведомлений Windows
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (watcher) watcher.close();
  if (process.platform !== 'darwin') app.quit();
});
