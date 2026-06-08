const normalizeString = (value) => String(value || '').trim();

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidId = (value) => Number.isInteger(value) && value > 0;

const CITY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cityCache = new Map();

const isCityValid = async (value) => {
  const query = normalizeString(value);

  if (!query) return false;

  const cacheKey = query.toLowerCase();
  const cached = cityCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const fetchCity = await fetch(
      `https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    if (!fetchCity.ok) return false;

    const data = await fetchCity.json();

    if (!Array.isArray(data) || data.length === 0) {
      cityCache.set(cacheKey, { value: false, expiresAt: Date.now() + CITY_CACHE_TTL_MS });
      return false;
    }

    const result = { name: data[0].nome };
    cityCache.set(cacheKey, { value: result, expiresAt: Date.now() + CITY_CACHE_TTL_MS });

    return result;
  } catch (err) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  normalizeString,
  parseDate,
  isValidId,
  isCityValid
};
