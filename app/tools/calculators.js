import {
  __,
  always,
  ascend,
  divide,
  equals,
  filter,
  head,
  ifElse,
  length,
  lt,
  map,
  match,
  min,
  path,
  pipe,
  prop,
  reduce,
  reverse,
  slice,
  sort,
  sortWith,
  split,
  subtract,
  sum,
} from "ramda";

const timeToSeconds = (time) => {
  if (!time || time === "DNF") {
    return Infinity;
  }

  return Number(
    head(
      match(
        /\d+(\.\d{1,2})?/g,
        String(reduce((acc, t) => 60 * acc + Number(t), 0, split(":", time)))
      )
    )
  );
};

const secondsToTime = (time) => {
  if (time === Infinity) {
    return "DNF";
  }

  const min = Math.floor(time / 60);
  let s = (time - min * 60).toFixed(2);
  if (min > 0 && s.length === 4) {
    s = "0" + s;
  }

  return `${min ? min + ":" : ""}${s}`;
};

const meanOfThreeCalculator = pipe(
  sum,
  divide(__, 3),
  (x) => x.toFixed(2),
  Number
);

const averageOfFiveCalculator = ifElse(
  pipe(filter(lt(0)), length, equals(5)),
  pipe(sort(subtract), slice(1, -1), meanOfThreeCalculator, Number),
  always(-Infinity)
);

const getBestTime = reduce(min, Infinity);

const computeScore = (numberOfContestants, rank) =>
  min(100, Math.ceil((-50 / (numberOfContestants - 1)) * rank) + 100);

const sorter = map(pipe(prop, ascend), ["average", "single"]);

const sortRankings = (ranks) =>
  sortWith(
    ifElse(pipe(path([0, "event"]), equals("3BLD")))(always(reverse(sorter)))(
      always(sorter)
    )(ranks)
  )(ranks);

export {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings,
  meanOfThreeCalculator,
};
