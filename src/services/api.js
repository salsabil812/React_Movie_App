import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Collections
export const getCollections = () => api.get('/collections');
export const createCollection = (name) => api.post('/collections', { name });
export const addMovieToCollection = (collectionId, movieId) => 
  api.post(`/collections/${collectionId}/movies`, { movieId });
export const getCollectionMovies = (collectionId) => 
  api.get(`/collections/${collectionId}/movies`);
export const deleteCollection = (collectionId) => 
  api.delete(`/collections/${collectionId}`);

// Notes
export const getMovieNote = (movieId) => api.get(`/movies/${movieId}/notes`);
export const addMovieNote = (movieId, note) => 
  api.post(`/movies/${movieId}/notes`, { note });
export const deleteMovieNote = (movieId) => 
  api.delete(`/movies/${movieId}/notes`);

// Ratings
export const getMovieRating = (movieId) => api.get(`/movies/${movieId}/ratings`);
export const rateMovie = (movieId, rating) => 
  api.post(`/movies/${movieId}/ratings`, { rating });
export const deleteMovieRating = (movieId) => 
  api.delete(`/movies/${movieId}/ratings`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (movieId) => api.post('/wishlist', { movieId });
export const removeFromWishlist = (movieId) => api.delete(`/wishlist/${movieId}`);
export const isInWishlist = async (movieId) => {
  const response = await getWishlist();
  return response.data.some(item => item.movie_id === movieId);
}; 