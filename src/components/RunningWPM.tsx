import { ReactElement } from "react";
import ECharts from "echarts-for-react";
import { DataFrame } from "danfojs";
import computeRunningWPM from "../analysis/computeRunningWPM";

const RunningWPM = ({ session }: { session: DataFrame }): ReactElement => {
  // blah
  const runningWPM = computeRunningWPM(session);
  const options = {
    xAxis: {
      // generate labels: just 1 through n number of WPM calculations we made
      data: Array.from(new Array(runningWPM.length)).map((_, i) => i + 1),
      type: "category",
    },
    yAxis: {
      type: "value",
      name: "WPM",
      nameLocation: "center",
      nameGap: 32,
    },
    series: [
      {
        data: runningWPM,
        type: "line",
        smooth: true,
        name: "WPM",
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return (
    <div className="analysis-module">
      <ECharts option={options} />
    </div>
  );
};

export default RunningWPM;
