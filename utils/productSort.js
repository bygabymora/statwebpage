import { getAvailableStock } from "./functions/stock";

export function enrichAndSortForPublic(products) {
  return products
    .map((p) => {
      const eachStock = getAvailableStock(p.each);
      const boxStock = getAvailableStock(p.box);
      const eachPrice = p.each?.wpPrice ?? 0;
      const boxPrice = p.box?.wpPrice ?? 0;

      const hasStock = eachStock > 0 || boxStock > 0;
      const hasPrice = eachPrice > 0 || boxPrice > 0;

      let rank = 2; // default: sin stock
      if (hasStock && hasPrice)
        rank = 0; // stock + precio
      else if (hasStock && !hasPrice) rank = 1; // stock + "call for price"

      return {
        ...p,
        each: p.each ? { ...p.each, countInStock: eachStock } : p.each,
        box: p.box ? { ...p.box, countInStock: boxStock } : p.box,
        hasStock,
        hasPrice,
        rank,
      };
    })
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });
}
