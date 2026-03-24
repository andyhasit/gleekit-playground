import { watch } from "wallace";

const accessError = () => {
  throw new Error("Attempted to modify protected object");
};
type WatchedFieldSet<T> = [string[], (rootObject: T) => void];

/**
 * A Watcher yields proxies of objects which trigger callbacks when certain
 * fields are modified.
 */
export class Watcher<T> {
  handler: {
    get(target: any, key: string): any;
    set(target: any, key: string, value: any): boolean;
  };
  constructor(...fieldSets: WatchedFieldSet<T>[]) {
    const fieldMap = new Map();
    fieldSets.forEach((fieldSet) => {
      const [fields, callback] = fieldSet;
      fields.forEach((field) => {
        fieldMap.set(field, callback);
      });
    });
    const getCallback = (key, target) => {
      let cb;
      return (cb = fieldMap.get(key)) ? () => cb(target) : accessError;
    };
    const handler = {
      get(target, key) {
        if (key == "isProxy") return true;
        const prop = target[key],
          propType = typeof prop;
        if (propType === "undefined") return;
        if (propType === "object") return watch(prop, getCallback(key, target));
        return prop;
      },
      set(target, key, value) {
        target[key] = value;
        getCallback(key, target)();
        return true;
      },
    };
    this.handler = handler;
  }
  watch(target: T): T {
    return new Proxy(target, this.handler);
  }
  map(targets: T[]): T[] {
    return targets.map((target) => new Proxy(target, this.handler));
  }
}
