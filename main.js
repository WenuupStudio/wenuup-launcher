const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Client, Authenticator } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const nbt = require('prismarine-nbt');
const Store = require('electron-store');

const cfg = require('./wenuup.config.json');
const defaultPack = (cfg.packs && cfg.packs.length > 0) ? cfg.packs[0].id : 'optimizado';
const store = new Store({ defaults: { pack: defaultPack } });
const ROOT = path.join(app.getPath('userData'), 'wenuup-mc');
const FABRIC_LOADER = cfg.loaderVersion || '0.16.14';
const FABRIC_INSTALLER = '1.1.1';

function send(win, ch, data) { if (win && !win.isDestroyed()) win.webContents.send(ch, data); }

async function bundledJavaW() {
  const base = path.join(ROOT, 'runtime');
  const walk = async (dir, depth) => {
    if (depth > 3) return null;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isFile() && e.name.toLowerCase() === 'javaw.exe') return p;
      if (e.isDirectory()) {
        const found = await walk(p, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(base, 0);
}

async function installJava(win) {
  const already = await findJavaW(win, true);
  if (already) {
    send(win, 'log', 'Java 21 ya listo: ' + already);
    return already;
  }
  send(win, 'log', 'Descargando Java 21 portable (~190MB)...');
  const zip = path.join(ROOT, 'runtime', 'temurin21.zip');
  const url = 'https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse';
  await download(url, zip, null, 0, (d, t) =>
    send(win, 'progress', { phase: `Java 21 ${(d / 1048576).toFixed(0)}MB`, done: d, total: t || d }));
  send(win, 'progress', { phase: 'Instalando Java 21...', done: 1, total: 1 });
  const { execSync } = require('child_process');
  execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip}' -DestinationPath '${path.join(ROOT, 'runtime')}' -Force"`);
  await fs.promises.rm(zip, { force: true }).catch(() => {});
  const jw = await bundledJavaW();
  if (!jw) throw new Error('No se pudo instalar Java 21.');
  send(win, 'log', 'Java 21 instalado: ' + jw);
  send(win, 'progress', { phase: 'Java 21 listo', done: 1, total: 1 });
  return jw;
}

async function findJavaW(win, quiet) {
  const bundled = await bundledJavaW();
  if (bundled) {
    if (!quiet) send(win, 'log', 'Java 21 portable: ' + bundled);
    return bundled;
  }
  const { execSync } = require('child_process');
  const cands = [];
  if (process.env.JAVA_HOME) cands.push(path.join(process.env.JAVA_HOME, 'bin', 'javaw.exe'));
  try {
    const out = execSync('where java', { encoding: 'utf8' });
    out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).forEach((p) => {
      cands.push(path.join(path.dirname(p), 'javaw.exe'));
    });
  } catch {}
  const bases = [
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
  ];
  for (const b of bases) {
    const dirs = await fs.promises.readdir(b).catch(() => []);
    for (const d of dirs) cands.push(path.join(b, d, 'bin', 'javaw.exe'));
  }
  for (const jw of cands) {
    const java = path.join(path.dirname(jw), 'java.exe');
    try {
      await fs.promises.access(jw);
      let out = '';
      try { out = execSync(`"${java}" -version 2>&1`, { encoding: 'utf8' }); } catch (e) { out = String((e && e.stdout) || '') + String((e && e.message) || ''); }
      const m = out.match(/version "(?:1\.)?(\d+)/);
      const major = m ? parseInt(m[1], 10) : 0;
      if (major >= 21) {
        send(win, 'log', 'Java ' + major + ': ' + jw);
        return jw;
      }
    } catch {}
  }
  send(win, 'log', 'Aviso: no se encontro Java 21. Usa el boton "Instalar Java 21".');
  return null;
}
function selectedPack() {
  const id = store.get('pack', 'optimizado');
  return (cfg.packs || []).some((p) => p.id === id) ? id : 'optimizado';
}
function packMods() {
  const id = selectedPack();
  return cfg.mods.filter((m) => (m.packs || []).includes(id));
}
function selectedMemory() {
  const m = store.get('memory', cfg.defaultMemory || '4G');
  return m + 'G';
}
function setMemory(gb) {
  store.set('memory', gb);
  return gb;
}

async function sha1(file) {
  const h = crypto.createHash('sha1');
  h.update(await fs.promises.readFile(file));
  return h.digest('hex');
}

async function download(url, dest, expectedSha1, expectedSize, onProgress) {
  const st = await fs.promises.stat(dest).catch(() => null);
  if (st && st.size > 0 && (!expectedSize || st.size === expectedSize)) {
    if (!expectedSha1 || (await sha1(dest)) === expectedSha1) return;
  }
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error('Descarga fallo ' + res.status + ' ' + url);
  const total = Number(res.headers.get('content-length')) || expectedSize || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let done = 0;
  for (;;) {
    const { done: fin, value } = await reader.read();
    if (fin) break;
    chunks.push(Buffer.from(value));
    done += value.length;
    onProgress && onProgress(done, total);
  }
  const buf = Buffer.concat(chunks);
  await fs.promises.writeFile(dest, buf);
  if (expectedSha1 && (await sha1(dest)) !== expectedSha1) throw new Error('SHA1 no coincide: ' + dest);
}

async function installedFabricId() {
  const vers = path.join(ROOT, 'versions');
  const dirs = await fs.promises.readdir(vers).catch(() => []);
  for (const d of dirs) {
    const jf = path.join(vers, d, `${d}.json`);
    const st = await fs.promises.stat(jf).catch(() => null);
    if (!st) continue;
    try {
      const j = JSON.parse(await fs.promises.readFile(jf, 'utf8'));
      const id = (j.id || d).toLowerCase();
      const isFabric = id.includes('fabric') || (j.libraries || []).some((l) => (l.name || '').toLowerCase().includes('fabric-loader'));
      if (!isFabric) continue;
      // check loader version
      const lib = (j.libraries || []).find((l) => (l.name || '').toLowerCase().includes('fabric-loader'));
      let lv = '';
      if (lib) {
        const parts = (lib.name || '').split(':');
        lv = parts[2] || '';
      } else {
        const m = id.match(/fabric-loader-([0-9.]+)/);
        lv = m ? m[1] : '';
      }
      if (lv && compareVersions(lv, FABRIC_LOADER) < 0) continue; // too old, reinstall
      return d;
    } catch {}
  }
  return null;
}

function compareVersions(a, b) {
  const pa = a.split('.').map((x) => parseInt(x, 10) || 0);
  const pb = b.split('.').map((x) => parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x - y;
  }
  return 0;
}

async function ensureFabric(win, javaPath) {
  let id = await installedFabricId();
  if (id) return id;
  send(win, 'log', 'Instalando Fabric (loader ' + FABRIC_LOADER + ') para MC ' + cfg.minecraft + ' (una sola vez)...');
  const url = `https://maven.fabricmc.net/net/fabricmc/fabric-installer/${FABRIC_INSTALLER}/fabric-installer-${FABRIC_INSTALLER}.jar`;
  const inst = path.join(ROOT, 'fabric-installer.jar');
  await download(url, inst, null, 0, (d, t) =>
    send(win, 'progress', { phase: `Fabric installer ${(d / 1048576).toFixed(0)}MB`, done: d, total: t || d }));
  send(win, 'progress', { phase: 'Instalando Fabric...', done: 1, total: 1 });
  const { execFileSync } = require('child_process');
  const javaExe = path.join(path.dirname(javaPath), 'java.exe');
  const zin = await fs.promises.stat(inst).catch(() => null);
  if (!zin || zin.size < 100000) throw new Error('Instalador Fabric incompleto, borra fabric-installer.jar y reintenta.');
  send(win, 'log', `Instalador ${(zin.size / 1048576).toFixed(1)}MB, ejecutando... (tarda varios minutos)`);
  const profiles = path.join(ROOT, 'launcher_profiles.json');
  if (!await fs.promises.stat(profiles).catch(() => null)) {
    await fs.promises.writeFile(profiles, JSON.stringify({
      profiles: {}, selectedProfile: '(Default)', clientToken: 'wenuup-launcher',
      authenticationDatabase: {}, launcherVersion: { name: '1.6.93', format: 21 },
    }));
  }
  try {
    execFileSync(javaExe, ['-jar', inst, 'client', '-dir', ROOT, '-mcversion', cfg.minecraft, '-loader', FABRIC_LOADER], { encoding: 'utf8', timeout: 600000, stdio: 'pipe' });
  } catch (e) {
    const detail = ['STDOUT:', e.stdout, 'STDERR:', e.stderr, 'STATUS:', e.status].filter(Boolean).join('\n').slice(-2000);
    send(win, 'log', detail || '(sin salida)');
    throw new Error('Fallo instalador Fabric (codigo ' + e.status + ')');
  }
  id = await installedFabricId();
  if (!id) throw new Error('Fabric no dejo version instalada.');
  send(win, 'log', 'Fabric instalado: ' + id);
  send(win, 'progress', { phase: 'Fabric listo', done: 1, total: 1 });
  return id;
}

async function writeServersDat() {
  if (!cfg.server) return;
  const ip = cfg.server.port && cfg.server.port !== 25565
    ? `${cfg.server.host}:${cfg.server.port}` : cfg.server.host;
  const data = {
    type: 'compound', name: '',
    value: {
      servers: {
        type: 'list',
        value: {
          type: 'compound',
          value: [{
            ip: { type: 'string', value: ip },
            name: { type: 'string', value: cfg.server.name },
          }],
        },
      },
    },
  };
  await fs.promises.mkdir(ROOT, { recursive: true });
  await fs.promises.writeFile(path.join(ROOT, 'servers.dat'), nbt.writeUncompressed(data, 'big'));
}

async function serverStatus() {
  if (!cfg.server) return { online: false, disabled: true };
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${cfg.server.host}:${cfg.server.port}`,
      { signal: AbortSignal.timeout(6000) });
    const j = await res.json();
    if (!j || !j.online) return { online: false };
    return {
      online: true,
      players: (j.players && j.players.online) || 0,
      max: (j.players && j.players.max) || 0,
      version: (j.version && j.version.name_clean) || j.version || '',
      motd: (j.motd && j.motd.clean ? j.motd.clean.join(' ') : ''),
    };
  } catch {
    return { online: false };
  }
}

let launcher = null;

async function syncMods(win) {
  const active = packMods();
  const activeNames = new Set(active.map((m) => m.name));
  const allKnown = new Set(cfg.mods.map((m) => m.name));
  const modDir = path.join(ROOT, 'mods');
  await fs.promises.mkdir(modDir, { recursive: true });
  // Remove jars that are not part of the active pack (including obsolete mods no longer in config)
  const existing = await fs.promises.readdir(modDir).catch(() => []);
  for (const f of existing) {
    if (!f.toLowerCase().endsWith('.jar')) continue;
    if (!activeNames.has(f)) {
      await fs.promises.rm(path.join(modDir, f), { force: true }).catch(() => {});
    }
  }
  for (const m of active) {
    send(win, 'progress', { phase: 'Mod ' + (m.label || m.name), done: 0, total: m.size });
    if (m.local) {
      try {
        const candidates = [
          path.join(__dirname, 'assets', m.local),
          path.join(__dirname, m.local),
          path.join(process.resourcesPath || __dirname, 'assets', m.local),
        ];
        let src = null;
        for (const c of candidates) {
          if (await fs.promises.stat(c).catch(() => null)) { src = c; break; }
        }
        if (!src) throw new Error('ENOENT');
        const dest = path.join(modDir, m.name);
        const st = await fs.promises.stat(dest).catch(() => null);
        if (!st || st.size !== m.size || (await sha1(dest)) !== m.sha1) {
          await fs.promises.copyFile(src, dest);
        }
      } catch (e) {
        const code = e && e.code === 'ENOENT' ? '' : ' (' + (e && e.message ? e.message : e) + ')';
        send(win, 'log', `Omitiendo ${m.label || m.name}: no incluido en el repositorio, requiere licencia propia${code}. El juego arranca sin el.`);
      }
      send(win, 'progress', { phase: 'Mod ' + (m.label || m.name), done: m.size, total: m.size });
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        await download(m.url, path.join(modDir, m.name), null, m.size, (d, t) =>
          send(win, 'progress', { phase: 'Mod ' + (m.label || m.name) + ` (intento ${attempt})`, done: d, total: t }));
        const h = await sha1(path.join(modDir, m.name));
        if (h === m.sha1) { ok = true; break; }
        send(win, 'log', `Aviso ${m.name}: hash distinto (intento ${attempt}), reintentando...`);
        await fs.promises.rm(path.join(modDir, m.name), { force: true }).catch(() => {});
      } catch (e) {
        send(win, 'log', `Aviso ${m.name} intento ${attempt}: ` + (e && e.message ? e.message : e));
      }
    }
    if (!ok) {
      send(win, 'log', `OMITIENDO ${m.name}: no coincide con el esperado. El juego arranca sin el.`);
    }
  }
  send(win, 'progress', { phase: 'Mods listos', done: 1, total: 1 });
  send(win, 'log', `Pack ${selectedPack()}: ${active.length} mods instalados.`);
}

let syncPromise = null;
function syncModsLocked(win) {
  if (!syncPromise) {
    syncPromise = syncMods(win).finally(() => { syncPromise = null; });
  }
  return syncPromise;
}

async function play(win, { mode, username }) {
  const onLog = (d) => send(win, 'log', String(d));

  let auth;
  if (mode === 'offline') {
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username || '')) {
      throw new Error('Nombre inválido (3-16, letras/números/_).');
    }
    send(win, 'log', 'Entrando sin cuenta como ' + username + '...');
    auth = await Authenticator.getAuth(username);
  } else {
    send(win, 'log', 'Abriendo login Microsoft...');
    const authManager = new Auth('select_account');
    const xboxManager = await authManager.launch('electron');
    const token = await xboxManager.getMinecraft();
    auth = token.mclc();
    send(win, 'log', 'Hola ' + auth.name);
  }

  if (cfg.server) {
    send(win, 'progress', { phase: 'Servidor en lista', done: 0, total: 1 });
    await writeServersDat();
  }
  launcher = new Client();
  launcher.on('progress', (e) => send(win, 'progress', { phase: `${e.type} ${e.task}/${e.total}`, done: e.task, total: e.total }));
  launcher.on('data', onLog);
  launcher.on('debug', onLog);
  launcher.on('close', (code) => {
    send(win, 'log', 'Juego cerrado (' + code + ')');
    if (!win.isDestroyed()) win.restore();
  });

  await syncModsLocked(win);

  send(win, 'progress', { phase: 'Preparando Java...', done: 1, total: 1 });
  const javaPath = await findJavaW(win);
  if (!javaPath) throw new Error('Falta Java 21: pulsa "Instalar Java 21".');
  const fabricId = await ensureFabric(win, javaPath);

  send(win, 'progress', { phase: 'Lanzando Minecraft', done: 1, total: 1 });
  await launcher.launch({
    authorization: auth,
    root: ROOT,
    javaPath,
    version: { number: cfg.minecraft, type: 'release', custom: fabricId },
    memory: { max: selectedMemory(), min: '2G' },
  });
  send(win, 'log', 'Minecraft lanzado (sin consola).');
  if (!win.isDestroyed()) win.minimize();
}

function createWindow() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1100, height: 920, resizable: true,
    minWidth: 760, minHeight: 560,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.once('did-finish-load', async () => {
    let jw = await findJavaW(win, true);
    if (!jw) {
      try { jw = await installJava(win); }
      catch (e) { send(win, 'log', 'Auto-instalacion Java fallo: ' + (e && e.message ? e.message : e)); }
    }
    send(win, 'java', jw);
  });

  ipcMain.handle('get-state', () => ({
    version: require('./package.json').version,
    brand: cfg.brand,
    minecraft: cfg.minecraft,
    server: cfg.server || null,
    links: cfg.links || {},
    mods: cfg.mods.map((m) => ({ name: m.name, label: m.label || m.name, packs: m.packs || [] })),
    packs: cfg.packs || [],
    pack: selectedPack(),
    memory: selectedMemory(),
  }));
  ipcMain.handle('set-pack', (_e, id) => {
    if ((cfg.packs || []).some((p) => p.id === id)) store.set('pack', id);
    const cur = selectedPack();
    syncModsLocked(win).catch((e) => send(win, 'log', 'Error mods: ' + (e && e.message ? e.message : e)));
    return cur;
  });
  ipcMain.handle('set-memory', (_e, gb) => setMemory(gb));
  ipcMain.handle('get-status', () => serverStatus());
  ipcMain.handle('get-java', () => findJavaW(win, true));
  ipcMain.handle('install-java', async () => {
    try {
      const jw = await installJava(win);
      return { ok: true, path: jw };
    } catch (e) {
      send(win, 'log', 'Error Java: ' + (e && e.message ? e.message : e));
      return { ok: false, error: String(e && e.message ? e.message : e) };
    }
  });
  ipcMain.handle('open-link', (_e, url) => {
    if (typeof url === 'string' && /^https:\/\//.test(url)) { shell.openExternal(url); return true; }
    return false;
  });
  ipcMain.handle('login-play', async (_e, args) => {
    try {
      await play(win, args || {});
      return { ok: true };
    } catch (e) {
      send(win, 'log', 'Error: ' + (e && e.message ? e.message : e));
      return { ok: false, error: String(e && e.message ? e.message : e) };
    }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
