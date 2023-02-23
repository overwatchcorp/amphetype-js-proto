import { Link } from "react-router-dom";
import {
  localStorageKey,
  pivotSessionLong,
} from "../analysis/sessionPostProcessing";
import RunningWPM from "../components/RunningWPM";
import { StorageData } from "../types";
import "../styles/Analysis.scss";

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
