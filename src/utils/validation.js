const normalizeString = (value) => String(value || '').trim();

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidId = (value) => Number.isInteger(value) && value > 0;

const isCityValid = async (value) => {
  
  const fetchCity = await fetch(`https://brasilapi.com.br/api/cptec/v1/cidade/${value}`);

  if (fetchCity.type === "city_error") {

    return false;
  } else {

    return true;
  }
}

module.exports = {
  normalizeString,
  parseDate,
  isValidId,
  isCityValid
};