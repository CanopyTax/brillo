import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';

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
    this.__index = 0;

    ipcRenderer.on(mainToRenderer, (e, id, action, payload) => {
      if (this.__actions[action]) {
        this.__actions[action](payload).then((res) => {
          ipcRenderer.send(rendererToMainResponse, id, res);
        });
      }
    });

    ipcRenderer.on(mainToRendererResponse, (e, id, payload) => {
      const { obs, action } = this.__listenerMap.get(id);
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
      throw Error('Argument "actions" must be an object of functions');
    }
  }

  talk(action, payload) {
    const id = this.__index;
    const obs = new Subject();
    this.__listenerMap.set(id, { obs, action });
    ipcRenderer.send(rendererToMain, id, action, payload);
    this.__index++
    return obs;
  }
}

exports.brilloRenderer = new BrilloRenderer();