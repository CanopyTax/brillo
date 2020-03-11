const { BrilloMain } = require('./main');
const { BrilloRenderer } = require('./renderer');
const { currentWindow } = require('electron');

const mainResponse = 'mainResponse';
const rendererResponse = 'rendererResponse';

const brilloMain = new BrilloMain({
  mainAction: async () => {
    return mainResponse
  }
});

const brilloRenderer = new BrilloRenderer({
  rendererAction: async () => {
    return rendererResponse;
  },
})

test('sending message to main process should return a response', (done) => {
  brilloRenderer.talk('mainAction').subscribe(res => {
    expect(res).toEqual(mainResponse);
    done()
  });
});

test('sending message to renderer should return a response', (done) => {
  brilloMain.talk('rendererAction', null, currentWindow).subscribe(res => {
    expect(res).toEqual(rendererResponse);
    done();
  })
});