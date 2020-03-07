import { ipcMain, BrowserWindow } from 'electron';
import { Observable, Subject } from 'rxjs';
import uuid from 'uuid/v4';

import { rendererToMain, mainToRenderer, mainToRendererResponse } from './shared';

export class BrilloMain {
  constructor(actionMap) {
    this.__actions = actionMap;
    this.__listenerMap = new Map();

    ipcMain.on(rendererToMain, (e, id, action, payload) => {
      if (this.__actions[action]) {
        this.__actions[action](payload).then((payloadResponse) => {
          console.log('here')
          e.sender.send(mainToRendererResponse, id, payloadResponse);
        });
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