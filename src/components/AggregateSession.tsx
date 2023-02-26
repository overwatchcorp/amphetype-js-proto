import { tidy, mean, select, summarize, sort, desc } from "@tidyjs/tidy";
import EChartsReact from "echarts-for-react";
import { pivotSessionLong } from "../analysis/sessionPostProcessing";
import { Word } from "../types";
import { SessionType } from "../types/sessionSchema";
import NGram from "./NGram";

const AggregateSession = ({ sessions }: { sessions: SessionType[] }) => {
  const avgWPM = tidy(
    sessions,
    select("wpm"),
    summarize({ avgWPM: mean("wpm") })
  )[0]["avgWPM"] as number;
  const avgAcc = tidy(
    sessions,
    select("accuracy"),
    summarize({ avgAcc: mean("accuracy") })
  )[0]["avgAcc"] as number;

  // aggregate data so we can compute nGrams
  const aggHist: Word[] = sessions.flatMap((s) => s.history) as Word[];
  const aggData = pivotSessionLong(aggHist);

  // graph wpm and accuracy for each test
  const wpmSeq = tidy(sessions, select("wpm")).map(({ wpm }) => wpm);
  const accSeq = tidy(sessions, select("accuracy")).map(({ accuracy }) =>
    accuracy !== undefined ? accuracy * 100 : -1
  );
  const maxAcc = tidy(
    sessions,
    select("accuracy"),
    sort([desc("accuracy")])
  )[0]["accuracy"] as number;
  const chartOpts = {
    xAxis: {
      // generate arbitrary x axis w/ each number representing 1 test
      data: Array.from(new Array(wpmSeq.length)).map((_, i) => i + 1),
      type: "category",
      interval: 1,
    },
    yAxis: [
      {
        type: "value",
        name: "WPM",
      },
      {
        type: "value",
        name: "Accuracy",
      },
    ],
    series: [
      {
        data: wpmSeq,
        type: "line",
        name: "WPM",
      },
      {
        data: accSeq,
        type: "line",
        name: "Accuracy",
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };

  return (
    <div>
      <div className="analysis-stat">Avg. WPM: {Math.round(avgWPM)}</div>
      <div className="analysis-stat">
        Avg. Accuracy: {Math.round(avgAcc * 100)}%
      </div>
      <div className="analysis-module">
        <EChartsReact option={chartOpts} />
      </div>
      <NGram session={aggData} />
    </div>
  );
};

export default AggregateSession;
