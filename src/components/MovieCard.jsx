import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Rating,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Grid,
  Stack
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder,
  MoreVert as MoreVertIcon,
  Collections as CollectionsIcon,
  Note as NoteIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import {
  getMovieNote,
  addMovieNote,
  getMovieRating,
  rateMovie,
  getCollections,
  addMovieToCollection,
  addToWishlist,
  removeFromWishlist,
  isInWishlist
} from '../services/api';

const MovieCard = ({ movie, onWishlistUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [collectionsDialogOpen, setCollectionsDialogOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        // Load wishlist status
        const wishlistStatus = await isInWishlist(movie.id);
        setIsLiked(wishlistStatus);

        // Load rating
        const ratingResponse = await getMovieRating(movie.id);
        setRating(ratingResponse.data.rating || 0);

        // Load note
        const noteResponse = await getMovieNote(movie.id);
        setNote(noteResponse.data.note || '');

        // Load collections
        const collectionsResponse = await getCollections();
        setCollections(collectionsResponse.data);
      } catch (error) {
        console.error('Error loading movie data:', error);
      }
    };

    loadMovieData();
  }, [movie.id]);

  const handleLikeClick = async () => {
    try {
      if (isLiked) {
        await removeFromWishlist(movie.id);
      } else {
        await addToWishlist(movie.id);
      }
      setIsLiked(!isLiked);
      if (onWishlistUpdate) onWishlistUpdate();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleRatingChange = async (event, newValue) => {
    try {
      await rateMovie(movie.id, newValue);
      setRating(newValue);
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNoteOpen = () => {
    setNoteDialogOpen(true);
    handleMenuClose();
  };

  const handleNoteClose = () => {
    setNoteDialogOpen(false);
  };

  const handleNoteSave = async () => {
    try {
      await addMovieNote(movie.id, note);
      setNoteDialogOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleCollectionsOpen = () => {
    setCollectionsDialogOpen(true);
    handleMenuClose();
  };

  const handleCollectionsClose = () => {
    setCollectionsDialogOpen(false);
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      await addMovieToCollection(collectionId, movie.id);
      setCollectionsDialogOpen(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  };

  const handleCardClick = () => {
    setDetailsDialogOpen(true);
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
        onClick={handleCardClick}
      >
        <CardMedia
          component="img"
          sx={{
            height: 400,
            objectFit: 'cover',
          }}
          image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography 
            gutterBottom 
            variant="h6" 
            component="div"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              minHeight: '2.4em'
            }}
          >
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {movie.release_date?.split('-')[0]}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5,
              flex: 1
            }}
          >
            {movie.overview}
          </Typography>
          <Rating
            value={rating}
            onChange={handleRatingChange}
            size="small"
            sx={{ mt: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'space-between' }} onClick={(e) => e.stopPropagation()}>
          <Box>
            <IconButton 
              onClick={handleLikeClick}
              color={isLiked ? 'primary' : 'default'}
            >
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          {note && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Has notes
            </Typography>
          )}
        </CardActions>
      </Card>

      {/* Movie Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Typography variant="h4" component="h2">
                  {movie.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={movie.vote_average / 2} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary">
                    ({movie.vote_count} votes)
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip icon={<CalendarIcon />} label={movie.release_date} />
                  <Chip icon={<LanguageIcon />} label={movie.original_language?.toUpperCase()} />
                  {movie.adult && <Chip color="error" label="Adult" />}
                </Stack>

                <Typography variant="body1" paragraph>
                  {movie.overview}
                </Typography>

                {movie.genres && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Genres
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {movie.genres.map((genre) => (
                        <Chip key={genre.id} label={genre.name} variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Your Rating
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={handleRatingChange}
                    icon={<StarIcon fontSize="inherit" />}
                  />
                </Box>

                {note && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Your Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {note}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNoteOpen}>
          <NoteIcon sx={{ mr: 1 }} /> Add/Edit Note
        </MenuItem>
        <MenuItem onClick={handleCollectionsOpen}>
          <CollectionsIcon sx={{ mr: 1 }} /> Add to Collection
        </MenuItem>
      </Menu>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={handleNoteClose}>
        <DialogTitle>Add Note for {movie.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoteClose}>Cancel</Button>
          <Button onClick={handleNoteSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Collections Dialog */}
      <Dialog open={collectionsDialogOpen} onClose={handleCollectionsClose}>
        <DialogTitle>Add to Collection</DialogTitle>
        <DialogContent>
          {collections.length === 0 ? (
            <Typography>No collections yet. Create one from the Collections page.</Typography>
          ) : (
            collections.map((collection) => (
              <MenuItem 
                key={collection.id} 
                onClick={() => handleAddToCollection(collection.id)}
              >
                {collection.name}
              </MenuItem>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionsClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MovieCard; 