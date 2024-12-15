const COLLECTIONS_KEY = 'movieCollections';
const MOVIE_NOTES_KEY = 'movieNotes';
const MOVIE_RATINGS_KEY = 'movieRatings';

// Collections
export const getCollections = () => {
  const collections = localStorage.getItem(COLLECTIONS_KEY);
  return collections ? JSON.parse(collections) : [];
};

export const createCollection = (collection) => {
  const collections = getCollections();
  const newCollection = {
    ...collection,
    id: Date.now(),
    movies: []
  };
  collections.push(newCollection);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  return newCollection;
};

export const addMovieToCollection = (collectionId, movie) => {
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId);
  if (collection && !collection.movies.some(m => m.id === movie.id)) {
    collection.movies.push(movie);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }
};

export const removeMovieFromCollection = (collectionId, movieId) => {
  const collections = getCollections();
  const collection = collections.find(c => c.id === collectionId);
  if (collection) {
    collection.movies = collection.movies.filter(m => m.id !== movieId);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }
};

export const deleteCollection = (collectionId) => {
  const collections = getCollections();
  const updatedCollections = collections.filter(c => c.id !== collectionId);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(updatedCollections));
};

// Notes
export const getMovieNotes = () => {
  const notes = localStorage.getItem(MOVIE_NOTES_KEY);
  return notes ? JSON.parse(notes) : {};
};

export const addMovieNote = (movieId, note) => {
  const notes = getMovieNotes();
  notes[movieId] = note;
  localStorage.setItem(MOVIE_NOTES_KEY, JSON.stringify(notes));
};

export const deleteMovieNote = (movieId) => {
  const notes = getMovieNotes();
  delete notes[movieId];
  localStorage.setItem(MOVIE_NOTES_KEY, JSON.stringify(notes));
};

// Ratings
export const getMovieRatings = () => {
  const ratings = localStorage.getItem(MOVIE_RATINGS_KEY);
  return ratings ? JSON.parse(ratings) : {};
};

export const rateMovie = (movieId, rating) => {
  const ratings = getMovieRatings();
  ratings[movieId] = rating;
  localStorage.setItem(MOVIE_RATINGS_KEY, JSON.stringify(ratings));
};

export const deleteMovieRating = (movieId) => {
  const ratings = getMovieRatings();
  delete ratings[movieId];
  localStorage.setItem(MOVIE_RATINGS_KEY, JSON.stringify(ratings));
}; 