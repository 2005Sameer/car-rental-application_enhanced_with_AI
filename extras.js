export const EXTRAS = [
  { id: "insurance", label: "Damage waiver", price: 12 },
  { id: "gps", label: "Navigation unit", price: 5 },
  { id: "seat", label: "Child seat", price: 7 },
];

export function priceExtras(ids = [], days = 1) {
  return ids.reduce((sum, id) => {
    const extra = EXTRAS.find(e => e.id === id);
    return extra ? sum + extra.price * days : sum;
  }, 0);
}

export function daysBetween(pickupDate, dropoffDate) {
  const d = (new Date(dropoffDate) - new Date(pickupDate)) / 86400000;
  return d > 0 ? Math.round(d) : 1;
}
