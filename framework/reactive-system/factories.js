import { Computed, Observable, ObservableOf } from "./entities.js";

/**
 * @template T
 * 
 * @param {() => T} fn 
 * @param {Observable} context
 */
export const computed = (fn, context) => {
  const computed = new Computed(fn);

  context.subscribe(() => {
    computed.get();
  });

  return computed;
}

/**
 * @template T
 * 
 * @param {T} value 
 * @param {Observable} context
 */
export const observableOf = (value, context) => {
  const observable = new ObservableOf(value);

  observable.subscribe(context.notifyAll);

  return observable;
}

/** 
 * @param {import("./entities.js").Watchable} watchable 
 * @param {(value: T) => void} fn
 * 
 * @returns {() => void} stop function
 */
export const watch = (watchable, fn, context) => {
  const handler = () => {
    fn(watchable.get());
  }

  context.subscribe(handler);

  const unsubscribe = () => {
    context.unsubscribe(handler);
  };

  return unsubscribe;
}
