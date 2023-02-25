import { DataFrame } from "danfojs";

const computeAccuracy = (session: DataFrame): number => {
  // get everything that ins't backspace
  const mask = session["key"].values.map((k: string) => k !== "Backspace");
  const correctMask = session.query(mask)["correct"].values;
  const incorrectMask = session
    .query(mask)
    ["correct"].values.map((v: boolean) => v === false);
  const correct = session.query(correctMask).values.length;
  const incorrect = session.query(incorrectMask).values.length;
  // console.log(correctMask, incorrectMask);
  return +(correct / (correct + incorrect)).toFixed(2);
};

export default computeAccuracy;
