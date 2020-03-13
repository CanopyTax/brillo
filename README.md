# Brillo
### Simple IPC communication within Electron using rxjs

Here's a simple example - register some main actions:

```javascript
/** MAIN PROCESS **/
import { brilloMain } from 'brillo/main';

brilloMain.register({
  async mainAction() {
    return 5 + 5;
  }
});
```

Then call that action from the renderer and wait for a response:

```javascript
/** RENDERER PROCESS **/
import { brilloRenderer } from 'brillo/renderer';

brilloRenderer.talk('mainAction').subscribe(response => {
  console.log(response); // outputs '10'
});
```

Easy-peasy.

----

## `brilloMain(actions)`

### Methods

The `brilloMain` module has the following methods:

#### `brilloMain.register(actions)`

  - `actions` Object - set of methods you can 'talk' to from a renderer
  
**Note:** Actions must return a promise.

```javascript
import { BrilloMain } from 'brillo/main';

brilloMain.register({
  async action1() {},
  async action2() {},
});
```

#### `brilloMain.talk(action, payload, window)`

- `action` String - name of `brilloRenderer` action
- `payload` Any - data subject to same limitations as electron's IPC modules
- `window` BrowserWindow instance (optional) - send message to one window only (defaults to all open windows)

Returns `rxjs` observable.

```javascript
import { brilloMain } from 'brillo/main';
import { BrowserWindow } from 'electron';

const win = new BrowserWindow();

brilloMain.talk('rendererAction', 'someData', win)
  .subscribe(response => console.log(response));
```

----

## `brilloRenderer(actions)`

### Methods

The `brilloRenderer` module has the following methods:

#### `brilloRenderer.register(actions)`

- `actions` Object - set of methods you can 'talk' to from the main process

**Note:** Actions must return a promise

```javascript
import { brilloRenderer } from 'brillo/renderer';

brilloRenderer.register({
  async action1() {},
  async action2() {},
});
```

#### `brilloRenderer.talk(action, payload)`

- `action` String - name of `brilloMain` action
- `payload` Any - data subject to same limitations as electron's IPC modules

Returns `rxjs` observable.

```javascript
import { brilloRenderer } from 'brillo/renderer';

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
import { brilloRenderer } from 'brillo/renderer';

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

