const { ipcMain, BrowserWindow } = require('electron');
const { Subject } = require('rxjs');
const {
  rendererToMain,
  mainToRenderer,
  mainToRendererResponse,
  rendererToMainResponse,
  isObject
} = require('./shared');

class BrilloMain {
  constructor() {
    this.__actions = {};
    this.__listenerMap = new Map();
    this.__index = 0;

    ipcMain.on(rendererToMain, (e, id, action, payload) => {
      if (this.__actions[action]) {
        this.__actions[action](payload).then((payloadResponse) => {
          e.reply(mainToRendererResponse, id, payloadResponse);
        });
      }
    });

    ipcMain.on(rendererToMainResponse, (e, id, payload) => {
      const listener = this.__listenerMap.get(id);
      if (listener.obs) {
        listener.obs.next(payload);
        const emit = listener.emit + 1;
        if (emit === listener.winCount) {
          this.__listenerMap.delete(id);
        } else {
          this.__listenerMap.set(id, {
            obs: listener.obs,
            action: listener.action,
            emit,
            winCount: listener.winCount,
          });
        }
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
      throw Error('Argument "actions" must be an object of functions');
    }
  }

  talk(action, payload, window) {
    const obs = new Subject();
    const id = this.__index;
    if (window) {
      this.__listenerMap.set(id, { obs, action, emit: 0, winCount: 1 });
      window.send(mainToRenderer, id, action, payload);
    } else {
      const windows = BrowserWindow.getAllWindows();
      this.__listenerMap.set(id, { obs, action, emit: 0, winCount: windows.length });
      windows.forEach(win => {
        win.send(mainToRenderer, id, action, payload);
      });
    }
    this.__index++;
    return obs;
  }
}

exports.brilloMain = new BrilloMain();