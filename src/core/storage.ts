/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

const isNodeJs = typeof process !== 'undefined' && process.versions && process.versions.node;

type StrAnyObj = { [key: string]: any };

function storageAvailable(type: string): boolean {
  let storage: Storage;

  try {
    // @ts-ignore
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // @ts-ignore acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

const lsAvailable = !isNodeJs && storageAvailable('localStorage');
let backup: { [key: string]: string } = {};
let ls: Storage | null = null;

if (lsAvailable) {
  ls = window.localStorage;
} else if (isNodeJs) {
  const LocalStorage = require('node-localstorage').LocalStorage;

  ls = new LocalStorage('./mtproto-storage');
}

export function setItem<T>(key: string, value: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const val = JSON.stringify(value);

    if (lsAvailable && ls) {
      try {
        ls.setItem(key, val);
      } catch (e) {
        reject(e);
      }
    } else {
      backup[key] = val;
    }

    resolve(value);
  });
}

export function set(obj: StrAnyObj): Promise<Array<any>> {
  return Promise.all(Object.keys(obj).map((key) => setItem(key, obj[key])));
}

export function removeItem(key: string): Promise<string> {
  return new Promise((resolve) => {
    if (lsAvailable && ls) {
      ls.removeItem(key);
    } else {
      delete backup[key];
    }

    resolve(key);
  });
}

export function remove(...keys: Array<string>): Promise<Array<string>> {
  return Promise.all(keys.map((key) => removeItem(key)));
}

export function getItem(key: string): Promise<any> {
  return new Promise((resolve) => {
    const val = (lsAvailable && ls ? ls.getItem(key) : backup[key]) || null;

    resolve(val ? JSON.parse(val) : null);
  });
}

export function get(...keys: Array<string>): Promise<Array<any>> {
  return Promise.all(keys.map((key) => getItem(key)));
}

export function key(index: number): Promise<string | null> {
  return new Promise((resolve) => {
    const val = (lsAvailable && ls) ? ls.key(index) : Object.keys(backup)[index] || null;

    resolve(val);
  });
}

export function keys(...indices: Array<number>): Promise<Array<string | null>> {
  return Promise.all(indices.map((index) => key(index)));
}

export function clear(): Promise<{}> {
  return new Promise((resolve) => {
    if (lsAvailable && ls) {
      ls.clear();
    } else {
      backup = {};
    }

    resolve();
  });
}

export class KVStorage {
  private readonly prefix: string;

  get length(): number {
    if (lsAvailable && ls) {
      return ls.length
    } else {
      return Object.keys(backup).length;
    }
  }

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  setItem<T>(key: string, value: T): Promise<T> {
    return setItem(this.prefix + key, value);
  }

  set(obj: StrAnyObj): Promise<Array<any>> {
    const nObj: StrAnyObj = {};

    Object.keys(obj).forEach((key) => {
      nObj[this.prefix + key] = obj[key];
    });

    return set(nObj);
  }

  removeItem(key: string): Promise<string> {
    return removeItem(this.prefix + key);
  }

  remove(...keys: Array<string>): Promise<Array<string>> {
    return remove(...keys.map((key) => this.prefix + key));
  }

  getItem(key: string): Promise<any> {
    return getItem(this.prefix + key);
  }

  get(...keys: Array<string>): Promise<Array<any>> {
    return get(...keys.map((key) => this.prefix + key));
  }

  clear(): Promise<{}> {
    return clear();
  }
}

export const getStorage = (prefix: string = '') => new KVStorage(prefix);

export default {
  getItem,
  get,
  setItem,
  set,
  removeItem,
  remove,
  clear,
  KVStorage,
  getStorage
};
