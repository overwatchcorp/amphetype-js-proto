import {
  tidy,
  filter,
  mutate,
  groupBy,
  summarize,
  first,
  last,
} from "@tidyjs/tidy";
import { LongSessionRow } from "../types";

const computeRunningWPM = (session: LongSessionRow[]): number[] => {
  // filter out incorrect key presses
  const correctEvents = tidy(
    session,
    filter(({ key }) => key !== "Backspace")
  );
  // if there are not enough correct events, then stop and return -1
  if (correctEvents.length < 5) return [-1];
  // create groups of 5 characters and measure how long each one took
  // to prevent having too small a last group, we'll only take n rows up to a number divisible by 5
  const lastGroup = Math.trunc(correctEvents.length / 5);
  let rowNum = 0;
  const annotatedSession = tidy(
    correctEvents,
    mutate({
      wpmGroup: () => {
        const group = Math.trunc(rowNum / 5);
        rowNum += 1;
        return group;
      },
    }),
    filter(({ wpmGroup }) => wpmGroup < lastGroup)
  );

  const runningWPMValues = tidy(
    annotatedSession,
    groupBy("wpmGroup", [
      summarize({ start: first("timestamp"), end: last("timestamp") }),
    ]),
    mutate({
      // this is the time it took to type 5 characters ie one word
      duration: ({ start, end }) => (end - start) / 1000,
    }),
    mutate({
      // so we can extrapolate that out to 60 seconds to get WPM
      wpm: ({ duration }) => Math.round(60 / duration),
    })
  );

  return runningWPMValues.map(({ wpm }) => wpm);
};

export default computeRunningWPM;
