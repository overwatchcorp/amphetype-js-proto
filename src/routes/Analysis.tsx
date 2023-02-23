import * as dfd from "danfojs";
import { Link } from "react-router-dom";
import { localStorageKey } from "../analysis/dumpSession";
import RunningWPM from "../components/RunningWPM";
import { StorageData, Word, LongSessionRow } from "../types";
import "../styles/Analysis.scss";

// create a dataframe where each typing event takes up one row
const pivotSessionLong = (session: Word[]): dfd.DataFrame => {
  const rows = session.flatMap(({ target, history }) =>
    history.map((e) => ({
      target,
      ...e,
    }))
  ) as LongSessionRow[];

  const out = new dfd.DataFrame(rows);
  return out;
};

const Vis = () => {
  // get all of the sessions so far
  let rawStorage = localStorage.getItem(localStorageKey);
  if (rawStorage === null) {
    rawStorage = "{}";
  }
  // sort them by most recent to least recent
  const sessions = JSON.parse(rawStorage) as StorageData;
  const sessionKeys = Object.keys(sessions).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );
  const latestSession = sessions[sessionKeys[0]];

  const session = pivotSessionLong(latestSession);

  return (
    <div>
      <div>
        <RunningWPM session={session} />
      </div>
      <Link to="/" className="btn btn-success mt-2">
        test again
      </Link>
    </div>
  );
};

export default Vis;
