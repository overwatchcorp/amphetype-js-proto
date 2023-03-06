// returns array of each column's data as an array
// assume that all objects contain the same number of keys
export const pullColumns = (items: Object[], columns: string[]): any[][] => {
  const colData: { [key: string]: any[] } = {};
  columns.forEach((c) => (colData[c] = []));
  items.forEach((i: { [key: string]: any }) =>
    columns.forEach((c) => {
      colData[c].push(i[c]);
    })
  );
  return columns.map((c) => colData[c]);
};
