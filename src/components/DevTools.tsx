import { useEffect, useState } from "react";
import dbManagerInstance from "../analysis/sessionStorage";
import "../styles/DevTools.scss";

const DevTools = () => {
  const [confirmNuke, setConfirmNuke] = useState(0);
  // reset to 0 if user doesnt click confirm w/in 5 seconds
  useEffect(() => {
    setTimeout(() => {
      if (confirmNuke === 1) setConfirmNuke(0);
    }, 5000);
  });

  const dumpDB = async () => {
    const db = await dbManagerInstance.getDB();
    const dbDump = await db.exportJSON();
    console.log(dbDump);
  };
  const nukeDB = async () => {
    const db = await dbManagerInstance.getDB();
    const res = await db.remove();
    console.log(res);
    setConfirmNuke(2);
    // reload page once we nuke DB so the app can reinit everything
    window.location.reload();
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
