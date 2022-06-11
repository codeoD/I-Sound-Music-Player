// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  const os = require("os");

  for (const type of ["chrome", "node", "electron", "v8"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
  replaceText("os-version", `${os.type()} ${os.arch()} ${os.release()}`);
});

const { contextBridge, ipcRenderer } = require("electron");
const { url } = require("inspector");

contextBridge.exposeInMainWorld("eAPI", {
  log: (logInfo) => ipcRenderer.send("log", logInfo),
  // 导入歌曲
  onAddedSongs: (cb) => ipcRenderer.on("added-songs", cb),
  // 获取所有歌单信息
  onSheetsReady: (cb) => ipcRenderer.on("sheets-ready", cb),
  // 新建歌单
  onStartAddSheet: (cb) => ipcRenderer.on("start-add-sheet", cb),
  addSheet: (sheetName) => ipcRenderer.invoke("add-sheet", sheetName),
  // 持久化歌单数据
  updateJSON: (data) => {
    ipcRenderer.invoke("update-json", data);
  },
  onWindowWillClose: (cb) => ipcRenderer.on("window-will-close", cb),

  // 获取歌词
  getLyric: (path) => ipcRenderer.invoke("get-lyric", path),

  // 清空播放列表
  clearPlaylist: (cb) => ipcRenderer.on("clear-playlist", cb),

  // 使用默认浏览器打开链接
  openURL: (url) => ipcRenderer.send("open-url", url),
});
