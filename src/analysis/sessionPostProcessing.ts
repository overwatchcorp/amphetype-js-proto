import { v4 as uuidv4 } from "uuid";
import { LongSessionRow, Word } from "../types";
import computeAccuracy from "./computeAccuracy";
import computeWPM from "./computeWPM";
import dbManager from "./sessionStorage";

export const localStorageKey = "amphetype-proto-storage";

export const dumpSession = async (session: Word[]): Promise<void> => {
  const db = await dbManager.getDB();

  const sessionDF = pivotSessionLong(session);
  const wpm = computeWPM(sessionDF);
  const accuracy = computeAccuracy(sessionDF);

  await db.sessions.insert({
    uuid: uuidv4(),
    timestamp: Date.now(),
    wpm,
    accuracy,
    history: session,
  });
  return;
};

// create a dataframe where each typing event takes up one row
export const pivotSessionLong = (session: Word[]): LongSessionRow[] => {
  const rows = session.flatMap(({ target, history }) =>
    history.map((e) => ({
      target,
      ...e,
    }))
  ) as LongSessionRow[];

  const out = rows;
  return out;
};
