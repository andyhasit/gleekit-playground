type Getters<T> = {
  [K in string]: (obj: T) => any;
};

type GetterResults<G> = {
  [K in keyof G]: G[K] extends (obj: any) => infer R ? R : never;
};

function getter<T, K extends string, R>(
  obj: T,
  key: K,
  fn: (obj: T) => R
): void {
  Object.defineProperty(obj, key, {
    get() {
      return fn(obj);
    },
    enumerable: true,
  });
}

export function withGetters<T, G extends Getters<T>>(
  object: T,
  getters: G
): T & GetterResults<G> {
  for (const key in getters) {
    getter(object, key, getters[key]);
  }
  return object as T & GetterResults<G>;
}
