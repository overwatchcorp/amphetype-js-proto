import { DataFrame } from "danfojs";

const computeWPM = (session: DataFrame): number => {
  const first = session.head(1)["timestamp"];
  const last = session.tail(1)["timestamp"];
  // get the total duration of the test
  const duration = last.sub(first).values[0];
  // divide to get minutes
  const durationInMin = duration / 60000;
  // get the number of correct characters typed
  const chars = session.query(session["correct"]).shape[0];
  // assume an average word is 5 characters
  const words = chars / 5;
  const wpm = words / durationInMin;
  return Math.round(wpm);
};

export default computeWPM;
