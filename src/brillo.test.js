const { BrilloMain } = require('./brillo-main');
const { BrilloRenderer } = require('./brillo-renderer');
const { currentWindow } = require('electron');

const brilloMain = new BrilloMain();
process.type = 'renderer'; // fake out renderer process
const brilloRenderer = new BrilloRenderer();


brilloMain.register({
  async mainAction() {
    return 'mainResponse'
  },
  async anotherAction() {
    return 5 + 5;
  },
  async rejectedAction() {
    throw Error('things are changing!');
  },
});

brilloRenderer.register({
  async rendererAction() {
    return 'rendererResponse';
  },
  async anotherRendererAction() {
    return 20 + 20;
  },
});

describe('Brillo', () => {
  test('sending message to main process should return a response', (done) => {
    brilloRenderer.send('mainAction').then(res => {
      expect(res).toEqual('mainResponse');
      done()
    });
  });

  test('sending message to renderer should return a response', (done) => {
    brilloMain.send('rendererAction', null, currentWindow).then(res => {
      expect(res).toEqual('rendererResponse');
      done();
    })
  });

  test('sending another message to main should work too', (done) => {
    brilloRenderer.send('anotherAction').then(res => {
      expect(res).toEqual(10);
      done();
    });
  });

  test('should send message to all windows', (done) => {
    brilloMain.send('anotherRendererAction').then(res => {
      expect(res).toEqual(40);
      done();
    });
  });

  test('should handle rejected promises', (done) => {
    brilloRenderer.send('rejectedAction').then(() => {}, err => {
      expect(err.message).toEqual('things are changing!');
      done();
    });
  });
});