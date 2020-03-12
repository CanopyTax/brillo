const { brilloMain } = require('./main');
const { brilloRenderer } = require('./renderer');
const { currentWindow } = require('electron');

const mainResponse = 'mainResponse';
const rendererResponse = 'rendererResponse';

brilloMain.register({
  mainAction: async () => {
    return mainResponse
  }
});

brilloRenderer.register({
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