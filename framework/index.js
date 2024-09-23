import { Computed, Observable, ObservableOf } from "./reactive-system/entities.js";
import * as factories from "./reactive-system/factories.js";
import { createElement, setElAttributes, setElChildren } from "./template.js";
import { isPlainObject, isWatchable } from "./utils.js";


/** 
 * @template T
 * @param {import("./reactive-system/entities.js").WatchableValue<T> | Observable} observable
 * @param {(value: T) => void} fn 
 */
const watch = (observable, fn) => {
  const handler = () => {
    fn(observable.get());
  }

  observable.subscribe(handler);

  const unsubscribe = () => {
    observable.unsubscribe(handler);
  };

  return unsubscribe;
}

let currentWatchable = new ObservableOf(null);

/**
 * @template T
 * @param {() => T} fn
 */
const computed = (fn) => {
  /** @type {Set<import("./reactive-system/entities.js").WatchableValue<T>>} */
  const deps = new Set();

  /** @type {() => void | null} */
  let registerDependencies = () => {
    currentWatchable.subscribe(() => {
      if (currentWatchable.get() == null) {
        return;
      }

      deps.add(currentWatchable.get());
    });
  }

  const computed = factories.computed(() => {
    if (registerDependencies) {
      registerDependencies();
      registerDependencies = null;
    }

    return fn();
  });

  deps.forEach((dep) => {
    dep.subscribe(() => {
      computed.update();
    });
  });

  deps.clear();
  currentWatchable.unsubscribeAll();

  return new Proxy(computed, {
    get(target, prop) {
      if (prop === 'get') {
        currentWatchable.update(target);
      }

      return Reflect.get(target, prop);
    }
  });
}

/** 
 * @template T
 * @param {T} value 
 */
const observableOf = (value) => {
  const observableOf = factories.observableOf(value);

  return new Proxy(observableOf, {
    get(target, prop) {
      if (prop === 'get') {
        currentWatchable.update(target);
      }

      return Reflect.get(target, prop);
    }
  });
}


function normalizeElData(...args) {
  let attrs = {};
  let children = [];

  if (args.length === 1) {
    if (isPlainObject(args[0])) {
      attrs = args[0];
    } else if (Array.isArray(args[0])) {
      children = args[0];
    } else if (typeof args[0] === 'string') {
      children = [args[0]];
    } else {
      throw new Error('Invalid arguments');
    }

  } else if (args.length > 1) {
    if (isPlainObject(args[0])) {
      attrs = args[0];
      children = Array.isArray(args[1]) ? args[1] : args.slice(1);
    } else if (args[0] === null) {
      children = args.slice(1);
    } else {
      children = args;
    }
  }

  return { attrs, children };
}


/**
 * @template T
 * @param {Array<HTMLElement | String | import("./reactive-system/entities.js").WatchableValue<T>>} children
 * 
 * @returns {Array<HTMLElement | String>}
 */
function normalizeChildren(children) {
  return children.map(child => {
    if (isWatchable(child)) {
      return child.get();
    }
    return child;
  });
}

/** 
 * @param {{[key: string]: string | Array}} attributes
 * 
 * @return {object}
 */
function normalizeAttributes(attributes) {
  const normalizedAttributes = Object.entries(attributes).reduce((acc, [attr, value]) => {
    if (Array.isArray(value)) {
      acc[attr] = value.map(value => {
        if (isWatchable(value)) {
          return value.get();
        }
        return value;
      }).join(' ');
    } else {
      if (isWatchable(value)) {
        acc[attr] = value.get();
      } else {
        acc[attr] = value;
      }
    }

    return acc;
  }, {});

  return normalizedAttributes;
}

/** 
 * @template T
 * @type {Record<string, {
 *   (children: Array<HTMLElement | String | import("./reactive-system/entities.js").WatchableValue<T>>): HTMLElement,
 *   (props: object, children: Array<HTMLElement | String | import("./reactive-system/entities.js").WatchableValue<T>>): HTMLElement
 * }} 
 * 
 */
const elements = new Proxy({}, {
  get: (_, name) => {
    return (...args) => {
      const { attrs, children } = normalizeElData(...args);

      const renderElement = () => createElement(
        name,
        normalizeAttributes(attrs),
        normalizeChildren(children)
      );

      let domEl = renderElement();

      for (const [attr, value] of Object.entries(attrs)) {
        if (attr.startsWith('on')) {
          continue;
        }

        if (Array.isArray(value)) {
          for (const child of value) {
            if (isWatchable(child)) {
              watch(child, () => {
                setElAttributes(domEl, normalizeAttributes({ [attr]: attrs[attr] }));
              });
            }
          }
        } else {
          if (isWatchable(value)) {
            watch(value, () => {
              setElAttributes(domEl, normalizeAttributes({ [attr]: attrs[attr] }));
            });
          }
        }
      }

      for (const child of children) {
        if (isWatchable(child)) {
          watch(child, () => {
            setElChildren(domEl, normalizeChildren(children));
          });
        }
      }

      return domEl;
    };
  }
});

/** 
 * @template T
 * 
 * @param {HTMLElement} domParent
 * @param {import("./reactive-system/entities.js").WatchableValue<Array<T>>} array
 * @param {(data: T) => HTMLElement} elConstructor
 * 
 */
const mapReactiveElement = (domParent, array, elConstructor) => {

  const render = () => {
    domParent.innerHTML = '';
    for (const data of array.get()) {
      const el = elConstructor(data);
      if (el) {
        domParent.append(elConstructor(data));
      }
    }
  };

  watch(array, render);

  render();

  return domParent;
}

/**
 * @template T
 * 
 * @param {import("./reactive-system/entities.js").WatchableValue<T>} observable 
 * @param {(data: T) => HTMLElement} elConstructor 
 */
const addReactiveElement = (observable, elConstructor) => {
  let dom = elConstructor(observable.get());

  if (!dom) {
    dom = document.createComment('');
  }

  watch(observable, () => {
    const newDom = elConstructor(observable.get());
    dom.replaceWith(newDom);
    dom = newDom;
  });

  return dom;
}

export {
  watch,
  computed,
  observableOf,
  elements,
  mapReactiveElement,
  addReactiveElement
};
