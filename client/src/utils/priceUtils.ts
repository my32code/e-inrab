export const isSinglePrice = (price: string | null | undefined): boolean => {
  if (!price) return false;
  const numbers = price.match(/\d+/g) || [];
  return numbers.length === 1;
}; 