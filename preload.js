const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wenuup', {
  state: () => ipcRenderer.invoke('get-state'),
  status: () => ipcRenderer.invoke('get-status'),
  setPack: (id) => ipcRenderer.invoke('set-pack', id),
  java: () => ipcRenderer.invoke('get-java'),
  installJava: () => ipcRenderer.invoke('install-java'),
  memory: () => ipcRenderer.invoke('get-state').then(s => s.memory),
  setMemory: (gb) => ipcRenderer.invoke('set-memory', gb),
  openLink: (url) => ipcRenderer.invoke('open-link', url),
  play: (args) => ipcRenderer.invoke('login-play', args),
  onProgress: (cb) => ipcRenderer.on('progress', (_e, d) => cb(d)),
  onJava: (cb) => ipcRenderer.on('java', (_e, d) => cb(d)),
  onLog: (cb) => ipcRenderer.on('log', (_e, d) => cb(d)),
});
