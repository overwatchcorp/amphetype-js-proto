import * as dfd from "danfojs";
import { v4 as uuidv4 } from "uuid";
import { LongSessionRow, Word } from "../types";
import dbManager from "./sessionStorage";

export const localStorageKey = "amphetype-proto-storage";

export const dumpSession = async (session: Word[]): Promise<void> => {
  const db = await dbManager.getDB();

  await db.sessions.insert({
    uuid: uuidv4(),
    timestamp: Date.now(),
    history: session,
  });
  return;
};

// create a dataframe where each typing event takes up one row
export const pivotSessionLong = (session: Word[]): dfd.DataFrame => {
  const rows = session.flatMap(({ target, history }) =>
    history.map((e) => ({
      target,
      ...e,
    }))
  ) as LongSessionRow[];

  const out = new dfd.DataFrame(rows);
  return out;
};
