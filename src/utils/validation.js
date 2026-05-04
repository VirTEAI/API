const normalizeString = (value) => String(value || '').trim();

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidId = (value) => Number.isInteger(value) && value > 0;

module.exports = {
  normalizeString,
  parseDate,
  isValidId
};