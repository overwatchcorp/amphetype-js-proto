import { tidy, select } from "@tidyjs/tidy";
import { LongSessionRow } from "../types";

const computeWPM = (session: LongSessionRow[]): number => {
  const first = session[0]["timestamp"];
  const last = session[session.length - 1]["timestamp"];
  // get the total duration of the test
  const duration = last - first;
  // divide to get minutes
  const durationInMin = duration / 60000;
  // get the number of correct characters typed
  const chars = tidy(session, select("correct")).length;
  // assume an average word is 5 characters
  const words = chars / 5;
  const wpm = words / durationInMin;
  return Math.round(wpm);
};

export default computeWPM;
