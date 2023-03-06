interface FinalOutputItem {
  key: string;
  timestamp: number;
}
// we need to get the final output i.e. the key events minus the ones that were followed by backspace
export const createFinalOutput = (
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
