const { ipcMain, BrowserWindow } = require('electron');
const { Subject } = require('rxjs');
const uuid = require('uuid/v4');
const {
  rendererToMain,
  mainToRenderer,
  mainToRendererResponse,
  rendererToMainResponse,
  isObject
} = require('./shared');

export class BrilloMain {
  constructor() {
    this.__actions = {};
    this.__listenerMap = new Map();

    ipcMain.on(rendererToMain, (e, id, action, payload) => {
      if (this.__actions[action]) {
        this.__actions[action](payload).then((payloadResponse) => {
          e.sender.send(mainToRendererResponse, id, payloadResponse);
        });
      }
    });

    ipcMain.on(rendererToMainResponse, (e, id, payload) => {
      const obs = this.__listenerMap.get(id);
      if (obs) {
        obs.next(payload);
        this.__listenerMap.delete(id);
      }
    });
  }

  register(actions) {
    if (isObject(actions)) {
      this.__actions = {
        ...this.__actions,
        ...actions,
      };
    } else {
      throw Error('Argument "actions" must be an object of named functions (key/value)');
    }
  }

  talk(action, payload, window) {
    const obs = new Subject();
    const id = uuid();
    this.__listenerMap.set(id, obs);
    if (window) {
      window.send(mainToRenderer, id, action, payload);
    } else {
      BrowserWindow.getAllWindows().forEach(win => {
        win.send(mainToRenderer, id, action, payload);
      });
    }
    return obs;
  }
}

export const brilloMain = new BrilloMain();