export const EXTRAS = [
  { id: "insurance", label: "Damage waiver", price: 12 },
  { id: "gps", label: "Navigation unit", price: 5 },
  { id: "seat", label: "Child seat", price: 7 },
];

export function daysBetween(pickupDate, dropoffDate) {
  const d = (new Date(dropoffDate) - new Date(pickupDate)) / 86400000;
  return d > 0 ? Math.round(d) : 1;
}

export function fmt(n) {
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
