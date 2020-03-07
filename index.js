import uuid from 'uuid/v4';
import { Subject } from 'rxjs';

const sendChannel = 'brillo-send';
const receiveChannel = 'brillo-receive';

function isMain() {
  return process && process.type !== 'renderer';
}


export class Brillo {
  constructor(options) {
    this.log = !!options.log;
    this.browserWindows = [];
    this.queue = {};
    this.ipc = isMain()
      ? require('electron').ipcMain
      : require('electron').ipcRenderer;

    this.ipc.on(receiveChannel, (e, action, payload) => {
      if (isMain()) return this.receiveMain(action, payload);
      return this.receiveRenderer(action, payload);
    });
  }

  addWindow = (window) => {
    this.browserWindows.push(window);
  }


  receiveMain = () => {

  }

  receiveRenderer = (action, payload) => {
    if (payload.id && this.queue[payload.id]) {
      this.queue[payload.id].next(payload.body);
    }
    if (this.log) {
      console.info('-------------------------');
      console.info(`"${action}"`, payload.body || payload);
    }
  }

  send = (action, payload) => {
    if (!isMain()) return this.ipc.send(sendChannel, action, payload);
    return this.browserWindows.forEach(browserWindow => {
      if (browserWindow) browserWindow.webContents.send(sendChannel, action, payload);
    });


    const id = uuid();
    const obs = new Subject();
    this.queue[id] = obs;
    this.ipc.send('')
    return obs;
  }

  on = () => {

  }
}