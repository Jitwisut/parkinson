const dayjs = require("dayjs");

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : null;
}

function startOfRange(from) {
  return from ? dayjs(from).startOf("day").toDate() : undefined;
}

function endOfRange(to) {
  return to ? dayjs(to).endOf("day").toDate() : undefined;
}

module.exports = { parseDate, startOfRange, endOfRange };
