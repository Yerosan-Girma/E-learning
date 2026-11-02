export function formatPrice(value) {
  if (!value || Number(value) === 0) {
    return "Free";
  }

  return `${Number(value).toLocaleString("en-US")} ETB`;
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("en-US")} ETB`;
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
