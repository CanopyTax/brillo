const { app, BrowserWindow } = require('electron');
const { BrilloMain } = require('../build/main');

let win;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
  });
  win.loadFile('./renderer.html').then(() => {
    brilloMain.talk('rendererAction', null, win).subscribe((answer) => {
      console.log('main answer:', answer);
    });
  });

  const brilloMain = new BrilloMain({
    mainAction: async () => {
      return 5 + 5;
    },
  });

}

app.on('ready', createWindow);