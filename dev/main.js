const { app, BrowserWindow } = require('electron');
const { BrilloMain } = require('../build/main');

const brilloMain = new BrilloMain({
  mainAction: async () => {
    return 5 + 5;
  },
})

let win;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
  });
  win.loadFile('./renderer.html');
}

app.on('ready', createWindow);