import { createRxDatabase, RxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { sessionSchema } from "../types/sessionSchema";

// we need to manage the DB instance to prevent creating duplicates
class DatabaseManager {
  _dbInstance: RxDatabase | undefined = undefined;

  async __init__(): Promise<void> {
    await this._initDB();
  }

  async _initDB(): Promise<RxDatabase> {
    // just return the db if this gets called multiple times
    if (this._dbInstance !== undefined) return this._dbInstance;

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

    this._dbInstance = db;
    return this._dbInstance;
  }

  async getDB(): Promise<RxDatabase> {
    if (this._dbInstance === undefined) return await this._initDB();
    else return this._dbInstance;
  }
}

const dbManagerInstance = new DatabaseManager();

export default dbManagerInstance;
