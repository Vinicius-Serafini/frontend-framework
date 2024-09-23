import { Computed, Observable } from "./reactive-system/entities.js";

/**
 * @param {any} obj
 * @returns {Boolean}
 */
export const isPlainObject = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj) || obj.constructor !== Object) {
    return false;
  }

  return true;
}

/**
 * 
 * @param {any} obj 
 * @returns {Boolean}
 */
export const isWatchable = (obj) => {
  return obj instanceof Observable || obj instanceof Computed;
}