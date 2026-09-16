const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value) {
  const match = DATE_ONLY_RE.exec(value ?? '');
  if (!match) {
    throw new Error(`Expected an ISO calendar date (YYYY-MM-DD), received: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${value}`);
  }

  return { year, month, day, date };
}

export function formatDateOnly(value) {
  const { date } = parseDateOnly(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

export function getYearFromDate(value) {
  return parseDateOnly(value).year;
}

export function compareDateDesc(a, b) {
  parseDateOnly(a);
  parseDateOnly(b);
  return b.localeCompare(a);
}
