export const wishlistKey = (userId: string) => `riris:wishlist:v1:${userId}`;

export function parseWishlist(raw: string | null): string[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(id => typeof id === 'string' && id.length > 0 && id.length <= 128)) {
    throw new Error('Invalid wishlist data');
  }
  return [...new Set(value)];
}
