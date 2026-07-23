const output = document.getElementById('output');
const statusEl = document.getElementById('status');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function show(data) {
  output.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

document.getElementById('btn-hello').addEventListener('click', async () => {
  try {
    show(await fetchJson('/api/hello?name=开发者'));
  } catch (err) {
    show(`请求失败: ${err.message}`);
  }
});

document.getElementById('btn-info').addEventListener('click', async () => {
  try {
    show(await fetchJson('/api/info'));
  } catch (err) {
    show(`请求失败: ${err.message}`);
  }
});

(async function checkHealth() {
  try {
    const data = await fetchJson('/api/health');
    statusEl.textContent = `服务正常 · uptime ${data.uptimeSeconds}s · ${data.timestamp}`;
    statusEl.classList.add('status-ok');
  } catch (err) {
    statusEl.textContent = `服务异常: ${err.message}`;
    statusEl.classList.add('status-err');
  }
})();
