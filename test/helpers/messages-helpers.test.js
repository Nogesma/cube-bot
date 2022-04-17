import fs from "fs-extra";
import dayjs from "dayjs";
import {
  _displayMonthDate,
  helpMessage,
} from "../../app/helpers/messages-helpers.js";

describe("helpMessage", () => {
  test("returns help message with discord markdown tag", async () => {
    expect(await helpMessage()).toBe(
      "```Markdown\n" +
        (await fs.readFile("./app/raw-data/help.md", "utf8")) +
        "\n```"
    );
  });
});

describe("_displayMonthDate", () => {
  test("returns 'en cours' if it's the current month", () => {
    expect(_displayMonthDate(dayjs().format("YYYY-MM"))).toBe("en cours");
  });

  test("returns the date in YYYY-MM if it's not the current month", () => {
    expect(_displayMonthDate("2020-03")).toBe("2020-03");
    expect(_displayMonthDate("2012-01")).toBe("2012-01");
  });
});
