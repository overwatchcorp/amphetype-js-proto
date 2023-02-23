import { StorageData, Word } from "../types";

export const localStorageKey = "amphetype-proto-storage";

const dumpSession = (session: Word[]): void => {
  console.log(session);
  const oldRawStorage = localStorage.getItem(localStorageKey);
  // if localStorage contains no value, set it to an empty object and restart the function
  if (oldRawStorage === null) {
    localStorage.setItem(localStorageKey, JSON.stringify({}));
    return dumpSession(session);
  }
  const oldStorage: StorageData = JSON.parse(oldRawStorage);
  const newData = {} as StorageData;
  const storageKey: number = Date.now();
  newData[storageKey] = session;
  const newStorage = Object.assign(oldStorage, newData);
  localStorage.setItem(localStorageKey, JSON.stringify(newStorage));
};
export default dumpSession;
