export function formatPrice(value) {
  if (!value || Number(value) === 0) {
    return "Free";
  }

  return `$${Number(value).toFixed(2)}`;
}

export function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function slugifyCategory(category) {
  return category.toLowerCase().replace(/\s+/g, "-");
}
