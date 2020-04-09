import { ipcRenderer } from 'electron';

import { isObject } from './shared';

import {
  mainToRenderer,
  mainToRendererResponse,
  rendererToMain,
  rendererToMainResponse
} from './shared';

class BrilloRenderer {
  constructor() {
    this.__actions = {};
    this.__listenerMap = new Map();
    this.__eventMap = new Map();
    this.__index = 0;

    if (process && process.type === 'renderer') {
      ipcRenderer.on(mainToRenderer, (e, id, action, payload) => {
        if (this.__actions[action]) {
          this.__actions[action](payload).then((res) => {
            ipcRenderer.send(rendererToMainResponse, id, 'resolve', res);
          }, (err) => {
            ipcRenderer.send(rendererToMainResponse, id, 'reject', err);
          }).catch(err => {
            const callback = this.__eventMap.get('error');
            if (callback) callback(err);
          });
        }
      });

      ipcRenderer.on(mainToRendererResponse, (e, id, promiseAction, payload) => {
        const { promise, action } = this.__listenerMap.get(id);
        if (promise) {
          promise[promiseAction](payload);
          this.__listenerMap.delete(id);
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

  talk(action, payload) {
    const id = this.__index;
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    this.__listenerMap.set(id, {
      promise: { resolve, reject },
      action,
    });
    ipcRenderer.send(rendererToMain, id, action, payload);
    this.__index++
    return promise;
  }
}

export const brilloRenderer = new BrilloRenderer();