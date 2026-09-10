// will be part of gleekit
import { getJsonDbx, getRawDbx, putJsonDbx, gleekit } from "gleekit";

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
For now this just goes straight to dropbox. Will add caching later.

*/

class FileSet<Key, Shape> {
  db: FileDb;
  path: (key: Key) => string;
  parse: (raw: string) => Shape;
  default: (key?: Key) => Shape;
  serialise: (raw: Shape) => string;
  constructor(db: FileDb, opts: FileSetOptions<Key, Shape>) {
    this.db = db;
    this.path = opts.path;
    this.parse = opts.parse || parseJson;
    this.serialise = opts.serialise || serialiseJson;
    this.default = opts.default;
  }
  async get(key: Key): Promise<Shape> {
    // What happens on 409?
    const raw = await getRawDbx(this.path(key));
    return raw.ok ? raw.json() : this.default();
  }
  put(key: Key, value: Shape) {
    return this.db.put(this.path(key), value);
  }
}

class File<Shape> {
  db: FileDb;
  path: string;
  parse: (raw: string) => Shape;
  default: () => Shape;
  serialise: (raw: Shape) => string;
  constructor(db: FileDb, opts: FileOptions<Shape>) {
    this.db = db;
    this.path = opts.path;
    this.parse = opts.parse || parseJson;
    this.serialise = opts.serialise || serialiseJson;
    this.default = opts.default;
  }
  async get(): Promise<Shape> {
    // Need to carry raw response to point of usage.
    const raw = await getRawDbx(this.path);
    return raw.ok ? raw.json() : this.default();
  }
  put(value: Shape) {
    return this.db.put(this.path, value);
  }
}

class Delayer {
  delay: number;
  queue: Record<string, any>;
  timeout: any;
  constructor() {
    this.queue = {};
    this.delay = 3000;
  }
  flush() {
    // could something be added while it it doing this?
    for (const path in this.queue) {
      putJsonDbx(path, this.queue[path]);
      delete this.queue[path];
    }
  }
  push(path: string, value: any) {
    this.queue[path] = value;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => this.flush(), this.delay);
  }
}

class FileDb {
  delayer: Delayer;
  // pass dbAdapter, apiAdapter, uiAdapter
  constructor(options: FileDbOptions) {
    this.delayer = new Delayer();
  }
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
  put(path, value) {
    this.delayer.push(path, value);
  }
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
