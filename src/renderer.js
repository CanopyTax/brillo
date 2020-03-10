import { Subject } from 'rxjs';
import { ipcRenderer } from 'electron';
import { mainToRenderer, mainToRendererResponse, rendererToMain, rendererToMainResponse } from './shared';
import uuid from 'uuid/v4';

export class BrilloRenderer {
  constructor(actionMap) {
    this.__actions = actionMap;
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

  talk(action, payload) {
    const id = uuid();
    const obs = new Subject();
    this.__listenerMap.set(id, obs);
    ipcRenderer.send(rendererToMain, id, action, payload);
    return obs;
  }
}