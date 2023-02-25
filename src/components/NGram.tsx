import { DataFrame } from "danfojs";
import { Series } from "danfojs/dist/danfojs-base";
import computeNGram from "../analysis/computeNGram";
import { nGramFeedback } from "../types";

interface ProcessedNGramData {
  nGram: string;
  meanDuration: number;
  meanAccuracy: number;
  nGramCount: number;
}

const processNGramData = (nGrams: nGramFeedback[]): ProcessedNGramData[] =>
  nGrams.map(({ nGram, performance }) => {
    const meanDuration = Math.round(
      new Series(performance.map(({ duration }) => duration)).mean()
    );
    const correctData = performance.flatMap(
      ({ correct }) => correct.indexOf(false) <= -1
    );
    const meanAccuracy =
      correctData.filter((e) => e).length / correctData.length;
    return {
      nGram,
      meanDuration,
      meanAccuracy,
      nGramCount: performance.length,
    };
  });

type NGramSortables = "meanDuration" | "meanAccuracy" | "nGramCount";

const displayNGramData = (
  nGrams: ProcessedNGramData[],
  nRows: number,
  sortBy: NGramSortables
) =>
  nGrams
    .slice(0, nRows)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .map(({ nGram, meanDuration, nGramCount, meanAccuracy }) => (
      <tr>
        <th scope="row">{nGram}</th>
        <td>{nGramCount}</td>
        <td>{meanDuration}ms</td>
        <td>{Math.round(meanAccuracy * 100)}%</td>
      </tr>
    ));

const NGram = ({ session }: { session: DataFrame }) => {
  const sortBy: NGramSortables = "nGramCount";
  const nRows = 10;

  const bigrams = computeNGram(session, 2);
  const bigramDisplayData = processNGramData(bigrams);
  const bigramDisplay = displayNGramData(bigramDisplayData, nRows, sortBy);

  const trigrams = computeNGram(session, 3);
  const trigramDisplayData = processNGramData(trigrams);
  const trigramDisplay = displayNGramData(trigramDisplayData, nRows, sortBy);

  return (
    <div>
      <div className="mb-3">
        <h4>Bigrams</h4>
        <table className="table">
          <thead>
            <th scope="col">Bigram</th>
            <th scope="col">Occurrences</th>
            <th scope="col">Avg. Duration</th>
            <th scope="col">Accuracy</th>
          </thead>
          <tbody>{bigramDisplay}</tbody>
        </table>
        {bigramDisplayData.length > nRows ? (
          <div>{bigramDisplayData.length - nRows} bigrams not shown</div>
        ) : null}
      </div>
      <div className="mb-3">
        <h4>Trigrams</h4>
        <table className="table">
          <thead>
            <th scope="col">nGram</th>
            <th scope="col">Occurrences</th>
            <th scope="col">Avg. Duration</th>
            <th scope="col">Accuracy</th>
          </thead>
          <tbody>{trigramDisplay}</tbody>
        </table>
        {trigramDisplayData.length > nRows ? (
          <div>{trigramDisplayData.length - nRows} trigrams not shown</div>
        ) : null}
      </div>
    </div>
  );
};

export default NGram;
