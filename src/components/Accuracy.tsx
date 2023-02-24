import { DataFrame } from "danfojs";
import computeAccuracy from "../analysis/computeAccuracy";

const Accuracy = ({ session }: { session: DataFrame }) => {
  return (
    <div className="analysis-stat">
      Accuracy: {(100 * computeAccuracy(session)).toFixed(0)}%
    </div>
  );
};

export default Accuracy;
