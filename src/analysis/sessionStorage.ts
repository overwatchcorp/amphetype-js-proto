import { createRxDatabase, RxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { sessionSchema } from "../types/sessionSchema";

let dbInstance: RxDatabase | null = null;

const initDB = async () => {
  if (dbInstance !== null) return dbInstance;
  // take this out when we eventually build a production version
  addRxPlugin(RxDBDevModePlugin);

  const db = await createRxDatabase({
    name: "amphetypedb",
    storage: getRxStorageDexie(),
  });
  await db.addCollections({
    sessions: {
      schema: sessionSchema,
    },
  });

  // log every change to database
  db.$.subscribe((changeEvent) => console.dir(changeEvent));

  return db;
};

export const getDB = async () => {
  if (dbInstance === null) dbInstance = await initDB();
  return dbInstance;
};
