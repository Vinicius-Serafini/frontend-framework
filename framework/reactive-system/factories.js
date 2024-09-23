import { Computed, Observable, ObservableOf } from "./entities.js";

/**
 * @template T
 * 
 * @param {() => T} fn 
 * @param {import("./entities.js").WatchableValue<T> | Observable} context
 */
export const computed = (fn) => {
  const computed = new Computed(fn);

  return computed;
}

/**
 * @template T
 * 
 * @param {T} value 
 * @param {import("./entities.js").WatchableValue<T> | Observable} context
 */
export const observableOf = (value) => {
  const observable = new ObservableOf(value);

  return observable;
}
