import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RxDocument } from "rxdb";
import dbManagerInstance from "../analysis/sessionStorage";
import AggregateSession from "../components/AggregateSession";
import Header from "../components/Header";
import SingleSession from "../components/SingleSession";
import "../styles/Analysis.scss";
import { SessionType } from "../types/sessionSchema";

const Vis = () => {
  const [sessionList, setSessionList]: [
    { uuid: string; timestamp: number; wpm: number; accuracy: number }[],
    Function
  ] = useState([]);
  const [selectedSessionUUID, setSelectedSessionUUID] = useState("");
  // single session data
  const [single, setSingle]: [SessionType | undefined, Function] = useState();
  // aggregate session data
  const [agg, setAgg]: [SessionType[] | undefined, Function] = useState();

  const selectSession = async (uuid: string): Promise<void> => {
    setSelectedSessionUUID(uuid);
    const db = await dbManagerInstance.getDB();
    if (uuid === "all_results") {
      const res: RxDocument[] = await db.sessions
        .find({
          selector: {},
          sort: [{ timestamp: "asc" }],
          limit: 25,
        })
        .exec();
      const sessions = res.map((d) => d.toJSON()) as SessionType[];
      // clear individual session data
      setSingle();
      // set aggregate data
      setAgg(sessions);
    } else {
      const res = (
        await db.sessions.findOne({ selector: { uuid } }).exec()
      ).toJSON() as SessionType;
      // clear aggregate data
      setAgg();
      // set individual session data
      setSingle(res);
    }
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
  useEffect(() => {
    selectSession(selectedSessionUUID);
  }, [selectedSessionUUID]);

  const SessionListDisplay = [
    <button
      className={`analysis-test-listitem btn btn-${
        selectedSessionUUID === "all_results" ? "" : "outline-"
      }dark mb-1`}
      onClick={() => selectSession("all_results")}
    >
      all results
    </button>,
    ...sessionList.map(({ uuid, timestamp, wpm, accuracy }) => (
      <button
        key={uuid}
        className={`analysis-test-listitem btn btn-${
          uuid === selectedSessionUUID ? "" : "outline-"
        }dark d-block mb-1`}
        onClick={() => selectSession(uuid)}
      >
        {new Date(timestamp).toLocaleDateString()}: {wpm} WPM, {accuracy * 100}%
      </button>
    )),
  ];

  return (
    <div>
      <Header />
      <div className="mb-4 mt-4">
        <div className="d-flex align-items-top justify-content-center">
          <div className="d-flex flex-column me-1">{SessionListDisplay}</div>
          <div className="text-center">
            {single ? <SingleSession session={single} /> : null}
            {agg ? <AggregateSession sessions={agg} /> : null}
            <Link to="/" className="btn btn-success mt-3">
              test again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vis;
