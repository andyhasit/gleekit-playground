import { getDb } from "../../lib/filedb";
import { Data } from "./types";

const adapter = getDb({});
export const db = adapter.file<Data>({
  path: "main.json",
  default: () => ({ root: [] }),
});
