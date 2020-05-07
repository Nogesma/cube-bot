const fs = require('fs-extra');
const moment = require('moment-timezone');
const {
  helpMessage,
  displayMonthDate_,
} = require('../../app/helpers/messages-helpers');

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
    expect(
      displayMonthDate_(moment().tz('Europe/Paris').format('YYYY-MM'))
    ).toBe('en cours');
  });

  test("returns the date in YYYY-MM if it's not the current month", () => {
    expect(displayMonthDate_('2020-03')).toBe('2020-03');
    expect(displayMonthDate_('2012-01')).toBe('2012-01');
  });
});
