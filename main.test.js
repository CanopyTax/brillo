const { brilloMain } = require('./main');
const { brilloRenderer } = require('./renderer');
const { currentWindow } = require('electron');


brilloMain.register({
  async mainAction() {
    return 'mainResponse'
  },
  async anotherAction() {
    return 5 + 5;
  },
});

brilloRenderer.register({
  async rendererAction() {
    return 'rendererResponse';
  },
})

test('sending message to main process should return a response', (done) => {
  brilloRenderer.talk('mainAction').subscribe(res => {
    expect(res).toEqual('mainResponse');
    done()
  });
});

test('sending message to renderer should return a response', (done) => {
  brilloMain.talk('rendererAction', null, currentWindow).subscribe(res => {
    expect(res).toEqual('rendererResponse');
    done();
  })
});

test('sending another message works too', (done) => {
  brilloRenderer.talk('anotherAction').subscribe(res => {
    expect(res).toEqual(10);
    done();
  });
});