import { getJsonDbx, putJsonDbx, gleekit } from "gleekit";

interface FileOptions<Shape> {
  path: string;
  default: () => Shape;
  parse?: (raw: string) => Shape;
  serialise?: (raw: Shape) => string;
}

interface FileSetOptions<Key, Shape> {
  path: (key: Key) => string;
  default: (key?: Key) => Shape;
  parse?: (raw: string) => Shape;
  serialise?: (raw: Shape) => string;
}
const parseJson = (raw) => JSON.parse(raw);
const serialiseJson = (raw) => JSON.stringify(raw);

interface FileDbOptions {
  dbName: string;
}

/*
For now this just goes straing to dropbox. Will add caching later.

*/

class FileSet<Key, Shape> {
  path: (key: Key) => string;
  parse: (raw: string) => Shape;
  default: (key?: Key) => Shape;
  serialise: (raw: Shape) => string;
  constructor(db: FileDb, opts: FileSetOptions<Key, Shape>) {
    this.path = opts.path;
    this.parse = opts.parse || parseJson;
    this.serialise = opts.serialise || serialiseJson;
    this.default = opts.default;
  }
  async get(key: Key): Promise<Shape> {
    // should it also cache the deserialised copy if asked to?
    // certain number, but then how do we limit?
    // or pass a map which you manage
    const raw = await getJsonDbx(this.path(key));
    // What happens on 409?
    return raw.ok ? this.parse(raw) : this.default(key);
  }
  put(key: Key, val: Shape) {
    return putJsonDbx(this.path(key), val);
  }
}

class File<Shape> {
  path: string;
  parse: (raw: string) => Shape;
  default: () => Shape;
  serialise: (raw: Shape) => string;
  constructor(db: FileDb, opts: FileOptions<Shape>) {
    this.path = opts.path;
    this.parse = opts.parse || parseJson;
    this.serialise = opts.serialise || serialiseJson;
    this.default = opts.default;
  }
  async get(): Promise<Shape> {
    const raw = await getJsonDbx(this.path);
    return raw.ok ? this.parse(raw) : this.default();
  }
  put(val: Shape) {
    return putJsonDbx(this.path, val);
  }
}

class FileDb {
  // pass dbAdapter, apiAdapter, uiAdapter
  constructor(options: FileDbOptions) {}
  fileSet<Key, Shape>(opts: FileSetOptions<Key, Shape>) {
    return new FileSet(this, opts);
  }
  file<Shape>(opts: FileOptions<Shape>) {
    return new File(this, opts);
  }
  /**
   * Gets a file from IndexedDb, else from Dropbox.
   */
  get() {}
  /**
   * Puts a file to IndexedDb, and adds operation to batch.
   */
  put() {}
  /**
   * Deletes a file from IndexedDb, and adds operation to batch.
   */
  delete() {}
  /**
   * Synchronises local changes to Dropbox.
   */
  flush() {}
}

export const getDb = (options: FileDbOptions) => new FileDb(options);
