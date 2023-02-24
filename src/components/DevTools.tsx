import { useState } from "react";
import dbManagerInstance from "../analysis/sessionStorage";
import "../styles/DevTools.scss";

const DevTools = () => {
  // haha
  const dumpDB = async () => {
    const db = await dbManagerInstance.getDB();
    const dbDump = await db.exportJSON();
    console.log(dbDump);
  };

  const [confirmNuke, setConfirmNuke] = useState(0);

  const nukeDB = async () => {
    const db = await dbManagerInstance.getDB();
    await db.remove();
    setTimeout(() => setConfirmNuke(0), 5000);
  };

  return (
    <div className="amphetype-devtools">
      <button
        type="button"
        className={`btn btn-${confirmNuke >= 1 ? "outline-" : ""}danger`}
        onClick={() => {
          switch (confirmNuke) {
            case 0: {
              setConfirmNuke(1);
              break;
            }
            case 1: {
              setConfirmNuke(2);
              nukeDB();
              break;
            }
          }
        }}
      >
        {confirmNuke === 0 ? "nuke DB" : ""}
        {confirmNuke === 1 ? "confirm nuke" : ""}
        {confirmNuke === 2 ? "DB nuked!" : ""}
      </button>
      <button type="button" className="btn btn-danger" onClick={dumpDB}>
        dump DB to console
      </button>
    </div>
  );
};

export default DevTools;
