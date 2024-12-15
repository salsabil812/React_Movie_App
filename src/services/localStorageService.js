const WISHLIST_KEY = 'movieWishlist';

export const getWishlist = () => {
  const wishlist = localStorage.getItem(WISHLIST_KEY);
  return wishlist ? JSON.parse(wishlist) : [];
};

export const addToWishlist = (movie) => {
  const wishlist = getWishlist();
  if (!wishlist.some(item => item.id === movie.id)) {
    wishlist.push(movie);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }
};

export const removeFromWishlist = (movieId) => {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter(movie => movie.id !== movieId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
};

export const isInWishlist = (movieId) => {
  const wishlist = getWishlist();
  return wishlist.some(movie => movie.id === movieId);
}; 