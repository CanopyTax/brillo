
const mainListeners = [];
const rendererListeners = [];

const eventFromRenderer = {
  reply: (returnChannel, ...returnArgs) => {
    rendererListeners.forEach((l) => {
      if (l.channel === returnChannel) {
        l.callback({}, ...returnArgs);
      }
    })
  },
}

exports.BrowserWindow = class BrowserWindow {
  static getAllWindows() {
    return [exports.currentWindow];
  }
}

exports.currentWindow = {
  send(channel, ...args) {
    rendererListeners.forEach(l => {
      if (l.channel === channel) {
        l.callback({}, ...args);
      }
    });
  },
};

exports.ipcMain = {
  on(channel, callback) {
    mainListeners.push({ channel, callback });
  },
};

exports.ipcRenderer = {
  on(channel, callback) {
    rendererListeners.push({ channel, callback });
  },
  send(channel, ...args) {
    mainListeners.forEach(l => {
      if (l.channel === channel) {
        l.callback(eventFromRenderer, ...args);
      }
    })
  },
};