import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RxDocument } from "rxdb";
import { pivotSessionLong } from "../analysis/sessionPostProcessing";
import dbManagerInstance from "../analysis/sessionStorage";
import Accuracy from "../components/Accuracy";
import NGram from "../components/NGram";
import RunningWPM from "../components/RunningWPM";
import WPM from "../components/WPM";
import "../styles/Analysis.scss";
import { LongSessionRow, Word } from "../types";
import { SessionType } from "../types/sessionSchema";

const Vis = () => {
  const [sessionList, setSessionList]: [
    { uuid: string; timestamp: number; wpm: number; accuracy: number }[],
    Function
  ] = useState([]);
  const [selectedSession, setSelectedSession]: [
    LongSessionRow[] | undefined,
    Function
  ] = useState();
  const [selectedSessionUUID, setSelectedSessionUUID] = useState("");
  const selectSession = async (uuid: string): Promise<void> => {
    setSelectedSessionUUID(uuid);
    const db = await dbManagerInstance.getDB();
    const res: RxDocument = await db.sessions
      .findOne({ selector: { uuid } })
      .exec();
    const { history } = res.toJSON() as { history: Word[] };
    const latestSessionDF = pivotSessionLong(history);
    setSelectedSession(latestSessionDF);
  };

  // get recent sessions, ordered by timestamp
  // and select the most recent one
  useEffect(() => {
    const getSessions = async () => {
      const db = await dbManagerInstance.getDB();
      const res: RxDocument[] = await db.sessions
        .find({
          sort: [{ timestamp: "desc" }],
        })
        .exec();
      // generate list of all recent sessions
      const newSessionList = res.map((r) => {
        const { uuid, timestamp, wpm, accuracy } = r.toJSON() as SessionType;
        return { uuid, timestamp, wpm, accuracy };
      });
      setSessionList(newSessionList);
      // display the most recent test result
      const latestSessionUUID = res[0].get("uuid");
      selectSession(latestSessionUUID);
    };
    getSessions();
  }, []);

  const SessionListDisplay = sessionList.map(
    ({ uuid, timestamp, wpm, accuracy }) => (
      <button
        key={uuid}
        className={`analysis-test-listitem btn btn-${
          uuid === selectedSessionUUID ? "" : "outline-"
        }dark d-block mb-1`}
        onClick={() => selectSession(uuid)}
      >
        {new Date(timestamp).toLocaleDateString()}: {wpm} WPM, {accuracy * 100}%
      </button>
    )
  );

  return (
    <div className="mb-4 mt-4">
      <div className="d-flex">
        <div className="d-flex flex-column">{SessionListDisplay}</div>
        <div>
          {selectedSession ? (
            <div>
              <WPM session={selectedSession} />
              <Accuracy session={selectedSession} />
              <RunningWPM session={selectedSession} />
              <NGram session={selectedSession} />
            </div>
          ) : null}
          <Link to="/" className="btn btn-success mt-3">
            test again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Vis;
