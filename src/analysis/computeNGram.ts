import { DataFrame } from "danfojs";
import { nGramFeedback, WordPerformance } from "../types";

const transformIntoWords = (input: DataFrame): WordPerformance[] => {
  // create list of words w/ array of targetID's
  const targets: { [key: string]: number[] } = {};
  input.values.forEach((rv: any, rowIndex: number) => {
    const row = input.iloc({ rows: [rowIndex] });
    const { target: targetValues, targetID: targetIDValues } = row;
    const target = targetValues.values[0];
    const targetID = targetIDValues.values[0];
    if (targets[target] === undefined) targets[target] = [targetID];
    // only add targetID to array once
    else if (targets[target].indexOf(targetID) < 0)
      targets[target] = [...targets[target], targetID];
  });

  const words: WordPerformance[] = [];
  Object.keys(targets).forEach((target) => {
    const thisWordPerf: WordPerformance = { target, attempts: [] };

    targets[target].forEach((targetID) => {
      const row = input.query(input["targetID"].eq(targetID));
      const { correct, timestamp, key } = row;
      thisWordPerf.attempts.push({
        key: key.values,
        correct: correct.values,
        timestamps: timestamp.values,
      });
    });
    words.push(thisWordPerf);
  });

  return words;
};

interface FinalOutputItem {
  key: string;
  timestamp: number;
}
// we need to get the final output i.e. the key events minus the ones that were followed by backspace
const createFinalOutput = (
  keys: string[],
  timestamp: number[]
): FinalOutputItem[] => {
  let out: FinalOutputItem[] = [];
  keys.forEach((k, i) => {
    if (k !== "Backspace") out.push({ key: k, timestamp: timestamp[i] });
    else out = out.slice(0, out.length - 1);
  });
  return out;
};

interface NGramTarget {
  nGram: string;
  startIndex: number;
  endIndex: number;
}

// get corresponding performance data for a given nGram
const dumpNGrams = (
  nGramsInTarget: NGramTarget[],
  correct: boolean[],
  timestamps: number[]
) =>
  nGramsInTarget.flatMap(({ nGram, startIndex, endIndex }) => {
    const duration = timestamps[endIndex] - timestamps[startIndex];
    const nGramCorrect = correct.slice(startIndex, endIndex + 1);
    return {
      nGram,
      performance: [
        {
          correct: nGramCorrect,
          duration,
        },
      ],
    } as nGramFeedback;
  });

const createNGramsFromWords = (
  words: WordPerformance[],
  nGramSize: number
): nGramFeedback[] => {
  const out = words.flatMap(({ target, attempts }) => {
    const letters = target.split("");
    // get all the nGrams of a given length, as well as their start and end indexes in the typing targets
    const nGramsInTarget = letters.flatMap(
      (t: string, startIndex: number): NGramTarget | [] => {
        const endIndex = startIndex + nGramSize - 1;
        const nGram =
          endIndex <= letters.length - 1
            ? target.slice(startIndex, endIndex + 1)
            : [];
        return nGram.length === 0
          ? []
          : ({ nGram, startIndex, endIndex } as NGramTarget);
      }
    );
    const individualNGramPerformance = attempts.flatMap(
      ({ key, correct, timestamps }): nGramFeedback[] => {
        // if ever key press was correct, then we can just dump that into the nGram object
        // if there was a miss, we need to figure out what we can work with
        // the simplest is when there's just a mistyped character but the string is still the same length as the target
        if (correct.indexOf(false) <= -1 || target.length === key.length) {
          return dumpNGrams(nGramsInTarget, correct, timestamps);
        }
        // if there's backspaces, then we need to create the full visual history so we can calculate the nGram duration
        const finalTyped = createFinalOutput(key, timestamps);
        // if the lengths are the same, then it can be treated like a simply mistype
        if (finalTyped.length === target.length) {
          return dumpNGrams(nGramsInTarget, correct, timestamps);
        }
        // if the lengths differ, then there's probably a way we could handle it,
        // but i don't want to implement it right now :-P
        return [];
      }
    );
    return individualNGramPerformance;
  });
  // take all of the instances of the nGrams and put them into an object that concats their performance data
  const concatNGramFeedback: { [key: string]: nGramFeedback } = {};
  out.forEach(({ nGram, performance }) => {
    if (nGram in concatNGramFeedback === false)
      concatNGramFeedback[nGram] = { nGram, performance };
    else {
      concatNGramFeedback[nGram].performance = [
        ...concatNGramFeedback[nGram].performance,
        ...performance,
      ];
    }
  });
  // then turn that into an array so it's easily iterable
  const feedbackAsArray = Object.keys(concatNGramFeedback).map(
    (k) => concatNGramFeedback[k]
  );
  return feedbackAsArray;
};

const computeNGram = (
  session: DataFrame,
  nGramSize: number
): nGramFeedback[] => {
  const words = transformIntoWords(session);
  const nGrams = createNGramsFromWords(words, nGramSize);
  return nGrams;
};

export default computeNGram;
