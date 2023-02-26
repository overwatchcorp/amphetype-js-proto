import computeAccuracy from "../analysis/computeAccuracy";
import { LongSessionRow } from "../types";

const Accuracy = ({ session }: { session: LongSessionRow[] }) => {
  return (
    <div className="analysis-stat">
      Accuracy: {(100 * computeAccuracy(session)).toFixed(0)}%
    </div>
  );
};

export default Accuracy;
