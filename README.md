# Brillo

[![npm version](https://badge.fury.io/js/brillo.svg)](https://badge.fury.io/js/brillo)

Electron IPC using promises.

## Install

Brillo requires `electron` as a peer dependency (version >= 10).

```shell
# yarn
yarn add -D electron
yarn add brillo

# npm
npm install -D electron
npm install brillo
```

## Usage

First, you need to instantiate your brillo instances:

```javascript
// ./main
import { BrilloMain  } from 'brillo';
export const brilloMain = new BrilloMain();

// ./renderer
import { BrilloRenderer  } from 'brillo';
export const brilloRenderer = new BrilloRenderer();
```

Second, register your actions:

```javascript
// ./main
brilloMain.register({
  async mainAction() {
    return 5 + 5;
  }
});
```

Then call that action from the renderer and wait for a response:

```javascript
// ./renderer
brilloRenderer.send('mainAction').then(response => {
  console.log(response); // outputs '10'
});
```

## `new BrilloMain`

### `brilloMain.register(actions)`

  - `actions` Object - set of methods you can 'send' to from a renderer
  
**Note:** Each action must return a promise.

```javascript
import { brilloMain } from 'brillo';

brilloMain.register({
  async action1() {},
  async action2() {},
});
```

### `brilloMain.send(action, payload[, window])`

- `action` String - name of `brilloRenderer` action
- `payload` Any - data subject to same limitations as electron's IPC modules
- `window` BrowserWindow instance (optional) - send message to one window only (defaults to all windows)

Returns a promise.

```javascript
import { brilloMain } from 'brillo';
import { BrowserWindow } from 'electron';

const win = new BrowserWindow();

brilloMain.send('rendererAction', 'someData', win)
  .then(response => console.log(response));
```

## `new BrilloRenderer`

### `brilloRenderer.register(actions)`

- `actions` Object - set of methods you can 'send' to from the main process

**Note:** Actions must return a promise

```javascript
import { brilloRenderer } from 'brillo';

brilloRenderer.register({
  async action1() {},
  async action2() {},
});
```

### `brilloRenderer.send(action, payload)`

- `action` String - name of `brilloMain` action
- `payload` Any - data subject to same limitations as electron's IPC modules

Returns a promise.

```javascript
import { brilloRenderer } from 'brillo';

brilloRenderer.send('mainAction', 'someData')
  .then(response => console.log(response));
```

## React Example

From the main process, set up a resource for the renderer to 'send' to:

```javascript
/** MAIN PROCESS **/
import { BrilloMain } from 'electron';
const brilloMain = new BrilloMain();

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
import { BrilloRenderer } from 'brillo';
const brilloRenderer = new BrilloRenderer();

export function ShowUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    brilloRenderer.send('getUser', { id: 15 })
      .then(setUser);
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

Since IDE's can't "intellisense" string primitives, remembering and typing action names can be
error-prone. Instead, create a list of helpers in a shared file that you can access from both
your main and renderer processes: 

```javascript
// shared.js
const actions = {
  getUser: 'getUser',
  getProfile: 'getProfile',
};
```

```javascript
// ./main
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