import { ipcMain, BrowserWindow } from 'electron';
import { Subject } from 'rxjs';
import uuid from 'uuid/v4';

import { rendererToMain, mainToRenderer, mainToRendererResponse, rendererToMainResponse } from './shared';

export class BrilloMain {
  constructor(actionMap) {
    this.__actions = actionMap;
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