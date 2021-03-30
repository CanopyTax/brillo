import { ipcMain, BrowserWindow } from 'electron';
import uniqid from 'uniqid';
import {
  rendererToMain,
  mainToRenderer,
  mainToRendererResponse,
  rendererToMainResponse,
  isObject
} from './shared';

export class BrilloMain {
  constructor() {
    this.__actions = {};
    this.__listenerMap = new Map();
    this.__eventMap = new Map();

    if (process && process.type !== 'renderer') {
      ipcMain.on(rendererToMain, (e, id, action, payload) => {
        if (this.__actions[action]) {
          this.__actions[action](payload).then((res) => {
            e.reply(mainToRendererResponse, id, 'resolve', res);
          }, (err) => {
            e.reply(mainToRendererResponse, id, 'reject', err);
          });
        }
      });

      ipcMain.on(rendererToMainResponse, (e, id, promiseAction, payload) => {
        const listener = this.__listenerMap.get(id);
        if (listener.promise) {
          listener.promise[promiseAction](payload);
          const emit = listener.emit + 1;
          if (emit === listener.winCount) {
            this.__listenerMap.delete(id);
          } else {
            this.__listenerMap.set(id, {
              ...listener,
              emit: listener.emit + 1,
            });
          }
        }
      });
    }
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

  send(action, payload, window) {
    const id = uniqid();
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    if (window) {
      this.__listenerMap.set(id, {
        promise: { resolve, reject },
        action,
        emit: 0,
        winCount: 1,
      });
      window.send(mainToRenderer, id, action, payload);
    } else {
      const windows = BrowserWindow.getAllWindows();
      this.__listenerMap.set(id, {
        promise: { resolve, reject },
        action,
        emit: 0,
        winCount: windows.length,
      });
      windows.forEach(win => {
        win.send(mainToRenderer, id, action, payload);
      });
    }
    return promise;
  }
}