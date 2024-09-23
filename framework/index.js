import { Computed, Observable } from "./reactive-system/entities.js";
import * as factories from "./reactive-system/factories.js";
import { createElement, setElAttributes, setElChildren } from "./template.js";
import { isPlainObject, isWatchable } from "./utils.js";

const app = {
  context: new Observable(),
};

/** 
 * @param {import("./reactive-system/entities.js").Watchable} watchable
 * @param {(value: T) => void} fn 
 */
const watch = (watchable, fn) => {
  const unsubscribe = factories.watch(watchable, fn, app.context);

  return () => {
    unsubscribe();
  };
}

/** 
 * @param {() => T} fn
 */
const computed = (fn) => {
  const computed = factories.computed(fn, app.context);

  return computed;
}

/** 
 * @template T
 * @param {T} value 
 */
const observableOf = (value) => {
  const observableOf = factories.observableOf(value, app.context);

  return observableOf;
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
 * @param {Array<HTMLElement | String | import("./reactive-system/entities.js").Watchable>} children
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
      acc[attr] = value;
    }

    return acc;
  }, {});

  return normalizedAttributes;
}

/** 
 * @type {Record<string, {
 *   (children: Array<HTMLElement | String | import("./reactive-system/entities.js").Watchable>): HTMLElement,
 *   (props: object, children: Array<HTMLElement | String | import("./reactive-system/entities.js").Watchable>): HTMLElement
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

export {
  watch,
  computed,
  observableOf,
  elements,
};
