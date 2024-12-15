import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Box,
  Pagination,
  Stack,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import MovieCard from '../components/MovieCard';
import axios from 'axios';
import { debounce } from 'lodash';

const API_KEY = 'b76406dee49c2d60af3bb528cdfbeccb';
const API_URL = 'https://api.themoviedb.org/3';    //api url call

const CATEGORIES = [
  { id: 'popular', label: 'Popular', endpoint: '/movie/popular' },
  { id: 'now_playing', label: 'Now Playing', endpoint: '/movie/now_playing' },
  { id: 'upcoming', label: 'Upcoming', endpoint: '/movie/upcoming' },
  { id: 'top_rated', label: 'Top Rated', endpoint: '/movie/top_rated' }
];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchMovies = async (categoryId, pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const category = CATEGORIES.find(cat => cat.id === categoryId);
      const response = await axios.get(
        `${API_URL}${category.endpoint}?api_key=${API_KEY}&language=en-US&page=${pageNum}`
      );
      setMovies(response.data.results);
      setTotalPages(Math.min(response.data.total_pages, 500));
      setLoading(false);
    } catch (err) {
      setError('Error fetching movies. Please try again later.');
      setLoading(false);
    }
  };

  const searchMovies = async (query, pageNum) => {
    if (!query.trim()) {
      setIsSearching(false);
      fetchMovies(activeCategory, pageNum);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNum}&include_adult=false`
      );
      setMovies(response.data.results);
      setTotalPages(Math.min(response.data.total_pages, 500));
      setLoading(false);
    } catch (err) {
      setError('Error searching movies. Please try again later.');
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((query, pageNum) => {
    searchMovies(query, pageNum);
  }, 500);

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      debouncedSearch(searchQuery, page);
    } else {
      fetchMovies(activeCategory, page);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [activeCategory, page, searchQuery]);

  const handleCategoryChange = (event, newValue) => {
    setSearchQuery('');
    setIsSearching(false);
    setActiveCategory(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(1);
  };

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
        Movies
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Categories Tabs - Hidden when searching */}
      {!isSearching && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {CATEGORIES.map(category => (
              <Tab
                key={category.id}
                label={category.label}
                value={category.id}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Results Title */}
      {!loading && (
        <Typography variant="h6" gutterBottom color="text.secondary">
          {isSearching 
            ? `Search results for "${searchQuery}" (${movies.length} movies found)`
            : `${CATEGORIES.find(cat => cat.id === activeCategory).label} Movies`
          }
        </Typography>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Movies Grid */}
          {movies.length > 0 ? (
            <Grid container spacing={3}>
              {movies.map((movie) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                  <MovieCard movie={movie} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No movies found
              </Typography>
            </Box>
          )}

          {/* Pagination - Show only if there are multiple pages */}
          {totalPages > 1 && (
            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
              <Typography variant="body2" color="text.secondary">
                Page {page} of {totalPages}
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Container>
  );
};

export default Home; 