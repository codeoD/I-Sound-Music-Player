// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
const { opendir, readdir } = require("fs/promises");
const { opendirSync, writeFileSync, readFileSync, existsSync } = require("fs");
const { getFilesFromDir } = require("./utils");
// const spawn = require("child_process").spawn;

let sheetFileContent = {};

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 歌单路径
  const sheetPath = path.join(__dirname + "/sheet.json");
  // 当前歌单的默认歌曲
  const sheetFile = readFileSync(sheetPath);
  /**
   * @type {{name: string, children: [{name:string, type: string, songs: Array<{source: string}>}]}}
   */
  sheetFileContent = JSON.parse(sheetFile.toString());
  const sheetSongs = sheetFileContent.children.filter(
    (v) => v.name === "默认歌单"
  )[0].songs;

  let addedSongs = [];

  const menu = Menu.buildFromTemplate([
    {
      label: "菜单", //app.name,
      submenu: [
        {
          click: () => {
            mainWindow.webContents.send("start-add-sheet");
          },
          label: "新建歌单",
        },
        {
          click: () => {
            const paths = dialog.showOpenDialogSync(mainWindow, {
              title: "请选择歌曲所在文件夹",
              properties: ["openDirectory", "multiSelections"],
            });
            console.log(paths);
            if (paths?.length > 0) {
              let songs = [];
              paths.forEach((path) => {
                const tempSongs = getFilesFromDir(path);
                songs = songs.concat(tempSongs);
              });
              console.log("songs:", songs);
              addedSongs = addedSongs.concat(songs);
              mainWindow.webContents.send("added-songs", songs);
            } else {
            }
          },
          label: "导入歌曲",
        },
      ],
    },
    {
      label: "关于",
      click: () => {
        createAboutWindow();
      },
    },
  ]);

  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadFile("./renderer/index.html").then(() => {
    // 主进程与渲染进程交互
    mainWindow.webContents.send("sheets-ready", sheetFileContent);
  });

  return {
    mainWindow,
  };
}

async function getSongList(path) {
  const res = [];
  try {
    const dir = await opendir(path);
    for await (const dirent of dir) {
      if (!/.lrc$/.test(dirent.name)) {
        res.push(dirent.name);
      }
    }
  } catch (error) {}
  return res;
}

function createAboutWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 300,
    useContentSize: true,
    title: "I SOUND",
    titleBarStyle: "hiddenInset",
    minimizable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, "about.html"));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 检测是否存在歌单文件
  const sheetPath = path.join(__dirname + "/sheet.json");
  if (!existsSync(sheetPath)) {
    writeFileSync(
      sheetPath,
      JSON.stringify({
        name: "sheets",
        children: [
          {
            name: "默认歌单",
            type: "default",
            songs: [],
          },
        ],
      })
    );
  }

  // renderer的日志输出整合到这里
  ipcMain.on("log", (e, ...v) => {
    console.log(...v);
  });

  const { mainWindow: mainWin } = createWindow();

  // BrowserWindow 关闭后执行持久化操作
  mainWin.on("close", () => {
    // mainWin.webContents.send("window-will-close");
  });
  ipcMain.handle("update-json", (e, data) => {
    console.log(data);
    sheetFileContent.children = JSON.parse(data);
    writeFileSync(sheetPath, JSON.stringify(sheetFileContent));
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
// 退出前执行全局的持久化操作（多窗口时）
app.on("before-quit", (e) => {});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
