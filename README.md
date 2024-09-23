# Frontend framework
A minimal reactive ui framework made for learning purposes. 

## Examples

### Hello world!

```js
import { addReactiveElement, computed, elements, mapReactiveElement, observableOf } from "../../framework/index.js";
import { div, h1 } from elements;

const App = () => {
  return div(
    h1('Hello world!'),
  );
}

const root = document.getElementById('app');
root.append(App());

```

### Reactive state
```js
import { elements, observableOf } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const App = () => {
  const count = observableOf(0);

  return div(
    h1("Counter"),
    p('Count: ', count),
    div(
      button({
        onclick: () => count.update((x) => x + 1),
      }, '👆'),
      button({
        onclick: () => count.update((x) => x - 1),
      }, '👇'),
    )
  );
}

const root = document.getElementById('app');
root.append(App());
```

### Computed state
```js
import { elements, observableOf, computed } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const App = () => {
  const count = observableOf(0);
  const isGreaterThanFive = computed(() => count.get() > 5 ? 'Yes' : 'No');

  return div(
    h1("Counter"),
    p('Count: ', count),
    p('The counter is greater than five?', isGreaterThanFive)
    div(
      button({
        onclick: () => count.update((x) => x + 1),
      }, '👆'),
      button({
        onclick: () => count.update((x) => x - 1),
      }, '👇'),
    )
  );
}

const root = document.getElementById('app');
root.append(App());
```

### Watch state
```js
import { elements, observableOf, watch } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const App = () => {
  const count = observableOf(0);
  watch(count, (count) => {
    console.log(`The counter was clicked ${count} times`);
  });

  return div(
    h1("Counter"),
    p('Count: ', count),
    div(
      button({
        onclick: () => count.update((x) => x + 1),
      }, '👆'),
      button({
        onclick: () => count.update((x) => x - 1),
      }, '👇'),
    )
  );
}

const root = document.getElementById('app');
root.append(App());
```

### Conditional rendering
```js
import { elements, observableOf, addReactiveElement } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const App = () => {
  const isShowing = observableOf(false);

  return div(
    h1("Counter"),
    addReactiveElement(isShowing, (isShowing) => {
      return isShowing ? p('Hello world!') : null
    })
    div(
      button({
        onclick: () => count.update(true),
      }, 'Show element'),
      button({
        onclick: () => count.update(false),
      }, 'Hide element'),
    )
  );
}

const root = document.getElementById('app');
root.append(App());

```

### Reactive list rendering
```js
import { elements, observableOf, mapReactiveElement } from "../../framework/index.js";
const { h1, div, p, button } = elements;

const App = () => {
  const list = observableOf(['1', '2', '3']);

  return div(
    mapReactiveElement(
      ul(), list, (item) => {
      return li(item);
    })
  );
}

const root = document.getElementById('app');
root.append(App());
```

#### More elabored examples inside de `./example` folder