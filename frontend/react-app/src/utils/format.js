export function formatPrice(value) {
  if (!value || Number(value) === 0) {
    return "Free";
  }

  const rounded = Math.round(Number(value));
  return `${rounded.toLocaleString("en-US")} ETB`;
}

export function formatCurrency(value) {
  const rounded = Math.round(Number(value || 0));
  return `${rounded.toLocaleString("en-US")} ETB`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function slugifyCategory(category) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function deslugifyCategory(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
