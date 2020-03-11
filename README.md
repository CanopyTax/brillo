# Brillo
### Simple IPC communication within Electron using rxjs

Instantiate the class with an action:

```javascript 
/** MAIN PROCESS **/
import { BrilloMain } from 'brillo/main';

const brilloMain = new BrilloMain({
  async mainAction() {
    return 5 + 5;
  }
});
```

Then call that action from the renderer and wait for a response:

```javascript
/** RENDERER PROCESS **/
import { BrilloRenderer } from 'brillo/renderer';

const brilloRenderer = new BrilloRenderer();

brilloRenderer.talk('mainAction').subscribe(response => {
  console.log(response); // outputs '10'
});
```

Easy-peasy.

## BrilloMain

### `actions`

Within the main process, instantiate the `BrilloMain` class with all of the actions you need to make available to the
renderer process.

```javascript
import { BrilloMain } from 'brillo/main';

const brilloMain = new BrilloMain({
  async action1() {},
  async action2() {},
});
```

Actions must return a promise.
