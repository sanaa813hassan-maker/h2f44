// Wishlist utility using localStorage

const KEY = 'h2f_wishlist';

export const getWishlist = () => JSON.parse(localStorage.getItem(KEY) || '[]');

export const isInWishlist = (productId) => getWishlist().some(item => item.id === productId);

export const toggleWishlist = (product) => {
  const wishlist = getWishlist();
  const index = wishlist.findIndex(item => item.id === product.id);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
    });
  }
  localStorage.setItem(KEY, JSON.stringify(wishlist));
  window.dispatchEvent(new Event('wishlist-updated'));
  return index === -1; // returns true if added, false if removed
};
