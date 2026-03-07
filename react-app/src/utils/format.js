export function formatPrice(value) {
  if (!value || Number(value) === 0) {
    return "Free";
  }

  return `$${Number(value).toFixed(2)}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function slugifyCategory(category) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function starsFromRating(rating) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return {
    full,
    hasHalf,
    empty,
  };
}
