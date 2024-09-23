/**
 * @typedef {Observable | Computed } Watchable
 */
export class Observable {
  /** @type {Set<() => void>} */
  #subscribers;

  constructor() {
    this.#subscribers = new Set();

    this.notifyAll = this.notifyAll.bind(this);
    this.unsubscribeAll = this.unsubscribeAll.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /** @param {() => void} fn */
  subscribe(fn) {
    this.#subscribers.add(fn);
  }

  unsubscribe(fn) {
    this.#subscribers.delete(fn);
  }

  notifyAll() {
    this.#subscribers.forEach(fn => fn());
  }

  unsubscribeAll() {
    this.#subscribers.clear();
  }
}

/**
 * @template T
 * 
 * @extends {Observable}
 */
export class ObservableOf extends Observable {
  /** @type {T} */
  #value;

  /** @param {T} value */
  constructor(value) {
    super();
    this.#value = value;

    this.get = this.get.bind(this);
    this.update = this.update.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  get() {
    if (typeof this.#value === 'object') {
      return structuredClone(this.#value);
    }

    return this.#value;
  }

  /** 
   * @param {T | (value: T) => T} value
   */
  update(value) {
    this.#value = typeof value === 'function' ? value(this.#value) : value;

    this.notifyAll();
  }

  /** @param {(value: T) => void} fn */
  subscribe(fn) {
    super.subscribe(() => {
      fn(this.get());
    });
  }

  unsubscribe(fn) {
    super.unsubscribe(fn);
  }
}

/**
 * @template T
 */
export class Computed {
  /** @type {() => T} */
  #fn;

  /** @type {ObservableOf<T>} */
  #observable;

  /** @param {() => T} fn */
  constructor(fn) {
    this.#fn = fn;
    this.#observable = new ObservableOf(fn());

    this.get = this.get.bind(this);
    this.update = this.update.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /** @returns {T} */
  get() {
    this.update();
    return this.#observable.get();
  }

  update() {
    this.#observable.update(this.#fn());
  }

  /** @param {() => void} fn */
  subscribe(fn) {
    this.#observable.subscribe(fn);
  }

  unsubscribe(fn) {
    this.#observable.unsubscribe(fn);
  }
}