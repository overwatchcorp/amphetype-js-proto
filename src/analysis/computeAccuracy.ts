import { tidy, filter, tally } from "@tidyjs/tidy";
import { LongSessionRow } from "../types";

const computeAccuracy = (session: LongSessionRow[]): number => {
  const correct: number = tidy(
    session,
    filter(({ correct }) => correct === true),
    tally()
  )[0]["n"];
  const incorrect: number = tidy(
    session,
    filter(({ correct, key }) => correct === false && key !== "Backspace"),
    tally()
  )[0]["n"];

  return +(correct / (correct + incorrect)).toFixed(2);
};

export default computeAccuracy;
