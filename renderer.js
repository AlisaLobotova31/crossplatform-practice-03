// Процесс отрисовки: только интерфейс, системные вызовы идут через window.api
const dirInput = document.getElementById('dir');
const list = document.getElementById('list');
const current = document.getElementById('current');
const status = document.getElementById('status');
const log = document.getElementById('log');
const watchButton = document.getElementById('watch');

let watching = false;

function showError(message) {
  status.textContent = message;
  status.className = 'error';
}

async function loadDir() {
  status.textContent = '';
  status.className = '';
  try {
    const result = await window.api.listDir(dirInput.value);
    current.textContent = 'Каталог: ' + result.path;
    list.innerHTML = '';
    for (const entry of result.entries) {
      const li = document.createElement('li');
      li.textContent = (entry.isDir ? '[папка] ' : '') + entry.name;
      if (entry.isDir) li.className = 'dir';
      list.appendChild(li);
    }
  } catch (err) {
    list.innerHTML = '';
    current.textContent = '';
    showError('Не удалось прочитать каталог: ' + err.message);
  }
}

async function toggleWatch() {
  try {
    if (watching) {
      await window.api.unwatchDir();
      watching = false;
      watchButton.textContent = 'Следить за каталогом';
      status.textContent = 'Наблюдение остановлено';
    } else {
      const fullPath = await window.api.watchDir(dirInput.value);
      watching = true;
      watchButton.textContent = 'Остановить наблюдение';
      status.textContent = 'Идет наблюдение за каталогом ' + fullPath;
    }
  } catch (err) {
    showError('Не удалось начать наблюдение: ' + err.message);
  }
}

window.api.onNewFile((info) => {
  const li = document.createElement('li');
  li.textContent = new Date().toLocaleTimeString() + ' - ' + info.name;
  log.appendChild(li);
  loadDir();
});

document.getElementById('refresh').addEventListener('click', loadDir);
watchButton.addEventListener('click', toggleWatch);

// Проверка изоляции: в renderer нет функции require
console.log('typeof require в renderer:', typeof require);

loadDir();
