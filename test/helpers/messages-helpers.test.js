import fs from 'fs-extra';
import dayjs from 'dayjs';
import {
  helpMessage,
  displayMonthDate_,
  ensureDate,
  dailyRankingsFormat,
  monthlyRankingsFormat,
} from '../../app/helpers/messages-helpers.js';

describe('helpMessage', () => {
  test('returns help message with discord markdown tag', async () => {
    expect(await helpMessage()).toBe(
      '```Markdown\n' +
        (await fs.readFile('./app/raw-data/help.md', 'utf8')) +
        '\n```'
    );
  });
});

describe('displayMonthDate_', () => {
  test("returns 'en cours' if it's the current month", () => {
    expect(displayMonthDate_(dayjs().format('YYYY-MM'))).toBe('en cours');
  });

  test("returns the date in YYYY-MM if it's not the current month", () => {
    expect(displayMonthDate_('2020-03')).toBe('2020-03');
    expect(displayMonthDate_('2012-01')).toBe('2012-01');
  });
});

describe('ensureDate', () => {
  test("makes sure the input is not changed if it's a date in the past", () => {
    expect(ensureDate(dayjs('2020-09-05'))).toEqual(dayjs('2020-09-05'));
  });

  test('returns the current date if the input is not a date, or if it is in the future', () => {
    expect(ensureDate('foo').format('YYYY-MM-DD')).toBe(
      dayjs().format('YYYY-MM-DD')
    );
    expect(ensureDate(dayjs().add(1, 'd')).format('YYYY-MM-DD')).toBe(
      dayjs().format('YYYY-MM-DD')
    );
  });
});
