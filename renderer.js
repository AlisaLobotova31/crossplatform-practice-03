// Процесс отрисовки: только интерфейс, системные вызовы идут через window.api
const dirInput = document.getElementById('dir');
const list = document.getElementById('list');
const current = document.getElementById('current');
const status = document.getElementById('status');

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
    status.textContent = 'Не удалось прочитать каталог: ' + err.message;
    status.className = 'error';
  }
}

document.getElementById('refresh').addEventListener('click', loadDir);

// Проверка изоляции: в renderer нет функции require
console.log('typeof require в renderer:', typeof require);

loadDir();
