import dbManagerInstance from "../analysis/sessionStorage";
import "../styles/DevTools.scss";

const DevTools = () => {
  // haha
  const dumpDB = async () => {
    const db = await dbManagerInstance.getDB();
    const dbDump = await db.exportJSON();
    console.log(dbDump);
  };
  return (
    <div className="amphetype-devtools">
      <button type="button" className="btn btn-danger" onClick={dumpDB}>
        dump DB to console
      </button>
    </div>
  );
};

export default DevTools;
