import { DataFrame } from "danfojs";
import computeWPM from "../analysis/computeWPM";

const WPM = ({ session }: { session: DataFrame }) => {
  const wpm = computeWPM(session);
  return <div className="fs-1">WPM: {wpm}</div>;
};

export default WPM;
