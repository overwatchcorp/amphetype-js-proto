import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import words from "../corpra/english";
import "../styles/Challenge.scss";
import { Word, TypingEvent } from "../types";
import { dumpSession } from "../analysis/sessionPostProcessing";

const tape = (words: Word[], targetIndex: number) => {
  return words.map((word, i): ReactElement => {
    const { target, visibleHistory } = word;
    console.log();
    const wordDisplay = (
      <div className="tape-word">
        <div>
          {visibleHistory.split("").map((char: string, j: number) => {
            const correct = target[j] === char;
            return (
              <div
                className={`${correct ? "tape-wordinput" : "tape-incorrect"}`}
              >
                {char}
              </div>
            );
          })}
        </div>
        <div>
          {/* display remainder of target */}
          {[...target.slice(visibleHistory.length).split(""), " "].map(
            (l: string, k: number) =>
              k === 0 && i === targetIndex ? (
                <span
                  className={
                    l === " " ? "tape-cursor tape-space" : "tape-cursor"
                  }
                >
                  {l}
                </span>
              ) : (
                <span className={l === " " ? "tape-space" : ""}>{l}</span>
              )
          )}
        </div>
      </div>
    );
    return wordDisplay;
  });
};

const generateString = (length: number): Word[] => {
  const shuffledCorpus = words.sort(() => 0.5 - Math.random());
  const testString = shuffledCorpus.slice(0, length).join(" ");
  const initialString = testString
    .split(" ")
    .map((w): Word => ({ target: w, visibleHistory: "", history: [] }));
  return initialString;
};

function Challenge() {
  const [testLength, setTestLength]: [number, Function] = useState(10);
  const [complete, setComplete]: [boolean, Function] = useState(false);
  const [targets, setTargets]: [Word[], Function] = useState(
    generateString(testLength)
  );
  const [targetIndex, setTargetIndex]: [number, Function] = useState(0);

  // generate new test of testLength length whenever testLength changes
  useEffect(() => {
    setTargetIndex(0);
    setTargets(generateString(testLength));
  }, [testLength]);

  const navigate = useNavigate();

  useEffect(() => {
    if (complete === true) navigate("/vis");
  }, [complete, navigate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      // ignore input if we're done
      if (complete) return;
      const { key } = e;
      // filter out non-modifier keypresses by name length
      const recordKeypress = key.length === 1 && key !== " ";

      if (recordKeypress) {
        const { target, history, visibleHistory } = targets[targetIndex];
        const newVisibleHistory = `${visibleHistory}${key}`;
        history.push({
          key,
          correct: target[newVisibleHistory.length - 1] === key,
          backspace: false,
          timestamp: Date.now(),
        } as TypingEvent);

        const newTarget: Word = {
          target,
          history,
          visibleHistory: newVisibleHistory,
        };
        const newTargets = targets.map(
          (t: Word, i: number): Word => (i === targetIndex ? newTarget : t)
        );
        setTargets(newTargets);
        if (
          targetIndex === targets.length - 1 &&
          visibleHistory.length === target.length - 1 &&
          complete === false
        ) {
          dumpSession(targets);
          setComplete(true);
        }
      } else if (key === " ") {
        // space will move between words, as long as 1 character has been typed
        // make sure we type at least 1 char in current word before moving on
        const { history } = targets[targetIndex];
        const typedChars = history.flatMap((c) =>
          c.key === "Backspace" ? [] : true
        );
        if (typedChars.length > 0 && targetIndex < targets.length - 1)
          setTargetIndex(targetIndex + 1);
      } else if (key === "Backspace") {
        // handle backspace behavior—need to remove last char typed or move back one word
        const { target, history, visibleHistory } = targets[targetIndex];
        if (visibleHistory.length > 0) {
          // record the backspace to the history
          const newHistory = [
            ...history,
            {
              key: "Backspace",
              backspace: true,
              correct: false,
              timestamp: Date.now(),
            } as TypingEvent,
          ];
          const newTarget: Word = {
            target,
            history: newHistory,
            visibleHistory: visibleHistory.slice(0, visibleHistory.length - 1),
          };
          const newTargets = targets.map(
            (t: Word, i: number): Word => (i === targetIndex ? newTarget : t)
          );
          setTargets(newTargets);
        } else if (targetIndex > 0) {
          setTargetIndex(targetIndex - 1);
        }
      }
    },
    [targets, targetIndex, complete]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [targets, handleKeyDown]);

  const tapeInstance = tape(targets, targetIndex);

  const testLengths = [1, 10, 25, 50, 100];
  const testLengthButtons = () =>
    testLengths.map((l) => (
      <button
        type="button"
        className={`btn ${
          testLength === l ? "btn-outline-primary" : "btn-primary"
        }`}
        onClick={() => setTestLength(l)}
      >
        {l}
      </button>
    ));

  return (
    <div className="app">
      <div className="btn-group mb-3">{testLengthButtons()}</div>
      {complete ? <div>challenge complete!</div> : null}
      <div className="tape-glue">
        <div className="">{tapeInstance}</div>
      </div>
    </div>
  );
}

export default Challenge;
