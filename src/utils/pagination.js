const parsePagination = (query, defaults = {}) => {
  const rawPage = Number(query?.page);
  const rawLimit = Number(query?.limit);

  const hasPage = Number.isFinite(rawPage) && rawPage > 0;
  const hasLimit = Number.isFinite(rawLimit) && rawLimit > 0;

  if (!hasPage && !hasLimit) {
    return defaults.skip != null && defaults.take != null
      ? { skip: defaults.skip, take: defaults.take, paginated: false }
      : { paginated: false };
  }

  const page = hasPage ? Math.floor(rawPage) : 1;
  const limit = Math.min(hasLimit ? Math.floor(rawLimit) : 50, 200);

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
    paginated: true,
  };
};

module.exports = { parsePagination };
