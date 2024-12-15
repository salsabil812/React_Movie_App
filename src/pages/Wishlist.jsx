import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import MovieCard from '../components/MovieCard';
import { getWishlist } from '../services/api';
import axios from 'axios';

const Wishlist = () => {
  const [wishlistMovies, setWishlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      const movieIds = response.data.map(item => item.movie_id);
      
      // Fetch full movie details for each movie in wishlist
      const moviePromises = movieIds.map(async (movieId) => {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=b76406dee49c2d60af3bb528cdfbeccb&language=en-US`
        );
        return response.data;
      });

      const movies = await Promise.all(moviePromises);
      setWishlistMovies(movies);
      setLoading(false);
    } catch (err) {
      setError('Error loading wishlist. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Wishlist
      </Typography>
      {wishlistMovies.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Your wishlist is empty. Add some movies from the home page!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {wishlistMovies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <MovieCard movie={movie} onWishlistUpdate={loadWishlist} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist; 