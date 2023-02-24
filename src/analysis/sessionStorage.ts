import { createRxDatabase, RxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBJsonDumpPlugin } from "rxdb/plugins/json-dump";
import { sessionSchema } from "../types/sessionSchema";
import to from "await-to-js";

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
    // used to dump the entire DB to console haha
    addRxPlugin(RxDBJsonDumpPlugin);

    const [dbErr, db] = await to(
      createRxDatabase({
        name: "amphetypedb",
        storage: getRxStorageDexie(),
      })
    );

    if (dbErr) {
      console.warn(
        "warning! the database creation failed—did you attempt to create an instance when one already exists?",
        dbErr
      );
      if (this._dbInstance !== undefined) {
        console.warn("returning existing instance of DB!");
        return this._dbInstance;
      }
    }
    if (db === undefined)
      throw new Error("fatal error: database creation failed!");

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
