export interface Item {
  name: string;
}

export interface Location {
  name: string;
  sub: Entry[];
}

// Difference is if it has sub field.
export type Entry = Location & Item;

export interface Data {
  root: [];
}
