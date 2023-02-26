import { tidy, filter, select, map } from "@tidyjs/tidy";
import { createFinalOutput } from "../bin/createFinalOutput";
import { pullColumns } from "../bin/pullColumns";
import { LongSessionRow, nGramFeedback, WordPerformance } from "../types";

interface NGramTarget {
  nGram: string;
  startIndex: number;
  endIndex: number;
}

const transformIntoWords = (input: LongSessionRow[]): WordPerformance[] => {
  // create list of words w/ list of each words instance's targetID's
  const targets: { [key: string]: number[] } = {};
  // create separate array of words so we can easily iterate through
  const targetWords: string[] = [];
  input.forEach((row: LongSessionRow) => {
    const { target, targetID } = row;
    // if this is a new word, then create a new key/value pair in the targets object
    if (targets[target] === undefined) {
      targets[target] = [targetID];
      targetWords.push(target);
    }
    // only add targetID to array once
    else if (targets[target].indexOf(targetID) < 0)
      targets[target] = [...targets[target], targetID];
  });

  const words: WordPerformance[] = [];
  // create array that contains each word and every attempt made to type the word
  targetWords.forEach((target) => {
    const thisWordPerf: WordPerformance = { target, attempts: [] };

    targets[target].forEach((targetID) => {
      const row = tidy(
        input,
        filter(({ targetID: searchID }) => searchID === targetID)
      );
      const [key, correct, timestamp] = pullColumns(
        tidy(row, select(["key", "correct", "timestamp"])),
        ["key", "correct", "timestamp"]
      ) as [string[], boolean[], number[]];
      thisWordPerf.attempts.push({
        key,
        correct,
        timestamp,
      });
    });
    words.push(thisWordPerf);
  });

  return words;
};

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
      ({ key, correct, timestamp }): nGramFeedback[] => {
        // if ever key press was correct, then we can just dump that into the nGram object
        // if there was a miss, we need to figure out what we can work with
        // the simplest is when there's just a mistyped character but the string is still the same length as the target
        if (correct.indexOf(false) <= -1 || target.length === key.length) {
          return dumpNGrams(nGramsInTarget, correct, timestamp);
        }
        // if there's backspaces, then we need to create the full visual history so we can calculate the nGram duration
        const finalTyped = createFinalOutput(key, timestamp);
        // if the lengths are the same, then it can be treated like a simply mistype
        if (finalTyped.length === target.length) {
          return dumpNGrams(nGramsInTarget, correct, timestamp);
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
  session: LongSessionRow[],
  nGramSize: number
): nGramFeedback[] => {
  const words = transformIntoWords(session);
  console.log(words);
  const nGrams = createNGramsFromWords(words, nGramSize);
  return nGrams;
};

export default computeNGram;
