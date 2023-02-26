import computeWPM from "../analysis/computeWPM";
import { LongSessionRow } from "../types";

const WPM = ({ session }: { session: LongSessionRow[] }) => {
  const wpm = computeWPM(session);
  return <div className="analysis-stat">WPM: {wpm}</div>;
};

export default WPM;
