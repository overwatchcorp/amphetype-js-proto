import { DataFrame } from "danfojs";

const computeRunningWPM = (session: DataFrame): number[] => {
  // filter out incorrect key presses
  const correctEvents = session.query(session["correct"]);
  // create groups of 5 characters and measure how long each one took
  const totalRows = correctEvents.shape[0];
  const wpmGroupLabels = Array.from(Array(totalRows)).map((_, i) =>
    Math.trunc(i / 5)
  );
  const annotatedSession = correctEvents.addColumn("wpmGroup", wpmGroupLabels);
  const maxLabel = wpmGroupLabels.slice(-1)[0];
  // iterate through row groups and get duration
  const runningWPMValues = Array.from(new Array(maxLabel)).map(
    (_, i): number => {
      // grab the timestamp col for the 5 character group
      const group = annotatedSession.query(annotatedSession["wpmGroup"].eq(i))[
        "timestamp"
      ];
      // compute group duration in seconds
      const tStart = group.min({ axis: 1 });
      const tEnd = group.max({ axis: 1 });
      // this is the duration it took to type 5 characters
      const duration = (tEnd - tStart) / 60000;
      // so we can extrapolate that out to 1 minute to get the instantaneous WPM
      const groupWPM = duration * 6000;
      return Math.round(groupWPM);
    }
  );
  return runningWPMValues;
};

export default computeRunningWPM;
