import { isObject } from './shared';

const { Subject } = require('rxjs');
const { ipcRenderer } = require('electron');
const uuid = require('uuid/v4');

const {
  mainToRenderer,
  mainToRendererResponse,
  rendererToMain,
  rendererToMainResponse
} = require('./shared');

export class BrilloRenderer {
  constructor() {
    this.__actions = {};
    this.__listenerMap = new Map();

    ipcRenderer.on(mainToRenderer, (e, id, action, payload) => {
      if (this.__actions[action]) {
        this.__actions[action](payload).then((res) => {
          ipcRenderer.send(rendererToMainResponse, id, res);
        });
      }
    });

    ipcRenderer.on(mainToRendererResponse, (e, id, payload) => {
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

  talk(action, payload) {
    const id = uuid();
    const obs = new Subject();
    this.__listenerMap.set(id, obs);
    ipcRenderer.send(rendererToMain, id, action, payload);
    return obs;
  }
}

export const brilloRenderer = new BrilloRenderer();