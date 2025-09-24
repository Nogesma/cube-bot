import {
  averageOfFiveCalculator,
  computeScore,
  getBestTime,
  secondsToTime,
  sortRankings,
  timeToSeconds,
} from "../../app/tools/calculators.js";

describe("averageOfFiveCalculator", () => {
  test("invalid data in array", () => {
    expect(averageOfFiveCalculator([2, 3, 4, 6, NaN])).toBe(-Infinity);
  });

  test("array length is not 5", () => {
    expect(averageOfFiveCalculator([2, 3, 4, 5])).toBe(-Infinity);
    expect(averageOfFiveCalculator([2, 3, 4, 5, 6, 7])).toBe(-Infinity);
  });

  test("negative number in array", () => {
    expect(averageOfFiveCalculator([-2, 3, 4, 5, 6])).toBe(-Infinity);
  });

  test("contains correct values", () => {
    expect(averageOfFiveCalculator([13, 4, 5, 3, 6])).toBe(5);
    expect(averageOfFiveCalculator([12, 13, 17, 15, 22])).toBe(15);
    expect(averageOfFiveCalculator([Infinity, 4, Infinity, 3, 6])).toBe(
      Infinity,
    );
    expect(averageOfFiveCalculator([15, Infinity, 5, 3, 6])).toBe(8.67);
    expect(averageOfFiveCalculator([12.34, 0.05, 78.32, 34.21, 9.95])).toBe(
      18.83,
    );
    expect(averageOfFiveCalculator([12.34, 0.05, 78.32, 34.21, 9.99])).toBe(
      18.85,
    );
    expect(averageOfFiveCalculator([12.78, 12.87, 12.84, 15.59, 10.41])).toBe(
      12.83,
    );
  });
});

describe("timeToSeconds", () => {
  test("time is not valid", () => {
    expect(timeToSeconds("foo")).toBe(NaN);
    expect(timeToSeconds("1.2.3")).toBe(NaN);
  });

  test("truncate time to two decimal places", () => {
    expect(timeToSeconds("12.3")).toBe(12.3);
    expect(timeToSeconds("12")).toBe(12);
    expect(timeToSeconds("12.345")).toBe(12.34);
    expect(timeToSeconds("1.0151")).toBe(1.01);
    expect(timeToSeconds("12.340")).toBe(12.34);
    expect(timeToSeconds("12.349")).toBe(12.34);
    expect(timeToSeconds("74.4052929")).toBe(74.4);
  });

  test("convert time from mm:ss.ms to s", () => {
    expect(timeToSeconds("1:02.34")).toBe(62.34);
    expect(timeToSeconds("5:24.53")).toBe(324.53);
  });

  test("does not change time already in ss.ms format", () => {
    expect(timeToSeconds("12.34")).toBe(12.34);
    expect(timeToSeconds("5.30")).toBe(5.3);
    expect(timeToSeconds("5.00")).toBe(5);
    expect(timeToSeconds("77.65")).toBe(77.65);
  });

  test("convert dnf to Infinity", () => {
    expect(timeToSeconds("DNF")).toBe(Infinity);
  });
});

describe("secondsToTime", () => {
  test("convert seconds to mm:ss.ms", () => {
    expect(secondsToTime(Infinity)).toBe("DNF");
    expect(secondsToTime(94.23)).toBe("1:34.23");
    expect(secondsToTime(14.56)).toBe("14.56");
    expect(secondsToTime(62.56)).toBe("1:02.56");
  });
});

describe("computeScore", () => {
  test("return max points when first", () => {
    expect(computeScore(10, 0)).toBe(100);
    expect(computeScore(1, 0)).toBe(100);
  });

  test("return min points when last", () => {
    expect(computeScore(10, 9)).toBe(50);
    expect(computeScore(23, 22)).toBe(50);
  });

  test("return points between 100 and 50 based on rank", () => {
    expect(computeScore(3, 1)).toBe(75);
    expect(computeScore(10, 5)).toBe(73);
    expect(computeScore(301, 122)).toBe(80);
  });
});
describe("getBestTime", () => {
  test("return the lowest number in the array", () => {
    expect(getBestTime([1, 2, 3, 4, 5])).toBe(1);
    expect(getBestTime([2.35, 5.43, 2.34, Infinity])).toBe(2.34);
  });
});

describe("sortRankings", () => {
  test("return the rankings sorted", () => {
    expect(
      sortRankings([
        {
          solves: ["8.32", "11.77", "11.75", "8.47", "10.95"],
          author: "2",
          average: 10.39,
          single: 8.32,
          event: "333",
        },
        {
          solves: ["7.77", "10.83", "8.41", "8.38", "8.46"],
          author: "1",
          average: 8.42,
          single: 7.77,
          event: "333",
        },
        {
          solves: ["21.58", "22.00", "22.44", "23.31", "22.54"],
          author: "3",
          average: 22.33,
          single: 21.58,
          event: "333",
        },
      ]),
    ).toEqual([
      {
        author: "1",
        average: 8.42,
        event: "333",
        single: 7.77,
        solves: ["7.77", "10.83", "8.41", "8.38", "8.46"],
      },
      {
        author: "2",
        average: 10.39,
        event: "333",
        single: 8.32,
        solves: ["8.32", "11.77", "11.75", "8.47", "10.95"],
      },
      {
        author: "3",
        average: 22.33,
        event: "333",
        single: 21.58,
        solves: ["21.58", "22.00", "22.44", "23.31", "22.54"],
      },
    ]);
    expect(
      sortRankings([
        {
          solves: ["1:58.00", "2:38.54", "DNF", "DNF", "DNF"],
          author: "1",
          average: Infinity,
          single: 118,
          event: "3BLD",
        },
        {
          solves: ["DNF", "33.88", "DNF", "DNF", "DNF"],
          author: "2",
          average: Infinity,
          single: 33.88,
          event: "3BLD",
        },
        {
          solves: ["DNF", "DNF", "57.57", "DNF", "40.39"],
          author: "3",
          average: Infinity,
          single: 40.39,
          event: "3BLD",
        },
      ]),
    ).toEqual([
      {
        author: "2",
        average: Infinity,
        event: "3BLD",
        single: 33.88,
        solves: ["DNF", "33.88", "DNF", "DNF", "DNF"],
      },
      {
        author: "3",
        average: Infinity,
        event: "3BLD",
        single: 40.39,
        solves: ["DNF", "DNF", "57.57", "DNF", "40.39"],
      },
      {
        author: "1",
        average: Infinity,
        event: "3BLD",
        single: 118,
        solves: ["1:58.00", "2:38.54", "DNF", "DNF", "DNF"],
      },
    ]);
  });
});
