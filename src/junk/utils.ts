import type { Entry } from "./types";

export function compareNameNoCase(entryA: Entry, entryB: Entry) {
  const a = entryA.name.toLowerCase(),
    b = entryB.name.toLowerCase();
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sortByName<input extends { name: string }>(
  items: input[]
): input[] {
  return items.sort(compareNameNoCase);
}

export function moveItem(item: any, srcArray: any[], destArray: any[]) {
  srcArray.splice(srcArray.indexOf(item), 1);
  destArray.push(item);
}

export function removeItem(item: any, array: any[]) {
  array.splice(array.indexOf(item), 1);
}
