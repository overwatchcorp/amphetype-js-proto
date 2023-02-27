import { pivotSessionLong } from "../analysis/sessionPostProcessing";
import { Word } from "../types";
import { SessionType } from "../types/sessionSchema";
import Accuracy from "./Accuracy";
import NGram from "./NGram";
import RunningWPM from "./RunningWPM";
import WPM from "./WPM";

const SingleSession = ({ session }: { session: SessionType }) => {
  const { history } = session as { history: Word[] };
  const sessionData = pivotSessionLong(history);

  return (
    <div>
      <WPM session={sessionData} />
      <Accuracy session={sessionData} />
      <RunningWPM session={sessionData} />
      <NGram session={sessionData} />
    </div>
  );
};

export default SingleSession;
