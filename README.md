# Brillo
### Simple IPC communication within Electron using rxjs

Here's a simple example - register some main actions:

```javascript
/** MAIN PROCESS **/
import { brilloMain } from 'brillo';

brilloMain.register({
  async mainAction() {
    return 5 + 5;
  }
});
```

Then call that action from the renderer and wait for a response:

```javascript
/** RENDERER PROCESS **/
import { brilloRenderer } from 'brillo';

brilloRenderer.talk('mainAction').subscribe(response => {
  console.log(response); // outputs '10'
});
```

Easy-peasy.

## Install

Brillo requires `electron` as a peer dependency (version >= 6).

```shell
# yarn
yarn add -D electron
yarn add brillo
```

```shell
# npm
npm install -D electron
npm install -S brillo
```

## `brilloMain`

### `brilloMain.register(actions)`

  - `actions` Object - set of methods you can 'talk' to from a renderer
  
**Note:** Actions must return a promise.

```javascript
import { brilloMain } from 'brillo';

brilloMain.register({
  async action1() {},
  async action2() {},
});
```

### `brilloMain.talk(action, payload, window)`

- `action` String - name of `brilloRenderer` action
- `payload` Any - data subject to same limitations as electron's IPC modules
- `window` BrowserWindow instance (optional) - send message to one window only (defaults to all open windows)

Returns `rxjs` observable.

```javascript
import { brilloMain } from 'brillo';
import { BrowserWindow } from 'electron';

const win = new BrowserWindow();

brilloMain.talk('rendererAction', 'someData', win)
  .subscribe(response => console.log(response));
```

## `brilloRenderer`

### `brilloRenderer.register(actions)`

- `actions` Object - set of methods you can 'talk' to from the main process

**Note:** Actions must return a promise

```javascript
import { brilloRenderer } from 'brillo';

brilloRenderer.register({
  async action1() {},
  async action2() {},
});
```

### `brilloRenderer.talk(action, payload)`

- `action` String - name of `brilloMain` action
- `payload` Any - data subject to same limitations as electron's IPC modules

Returns `rxjs` observable.

```javascript
import { brilloRenderer } from 'brillo';

brilloRenderer.talk('mainAction', 'someData')
  .subscribe(response => console.log(response));
```

## A somewhat practical example

From the main process, set up a resource for the renderer to 'talk' to:

```javascript
/** MAIN PROCESS **/
import { brilloMain } from 'electron';

brilloMain.register({
  async getUser({ id }) {
    return await getUserById(id);
  },
});
```

Now let's call that resource from the renderer:

```javascript
/** RENDERER PROCESS **/
import React, { useEffect, useState } from 'react';
import { brilloRenderer } from 'brillo';

export function ShowUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    brilloRenderer.talk('getUser', { id: 15 })
      .subscribe(setUser);
  }, []);

  return user ? (
    <div>
      {user.name} has loaded successfully!
    </div>
  ) : (
    <div>
      No user yet!
    </div>
  ); 
}
```

## Helpful tips

#### Make some constant helpers

Since IDE's can't 'intellisense' strings, remembering and typing action names can be error-prone. Instead, create a
list of helpers in a shared file that you can access from both your main and renderer processes: 

```javascript
// shared.js
const actions = {
  getUser: 'getUser',
  getProfile: 'getProfile',
};
```

```javascript
// main.js
import { brilloMain } from 'brillo';
import { actions } from './shared';

brilloMain.register({
  [actions.getUser]: async (id) => {
    return await getUser(id);
  }
});
```

## License

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.