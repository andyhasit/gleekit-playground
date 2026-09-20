export interface Entry {
  name: string;
  sub?: Entry[]; // if present, it is a folder.
}

export interface Data {
  sub: Entry[];
}
