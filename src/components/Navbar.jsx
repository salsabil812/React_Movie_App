import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CollectionsIcon from '@mui/icons-material/Collections';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1
          }}
        >
          <MovieIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Movies App
          </Typography>
        </Box>
        <Button
          color="inherit"
          component={RouterLink}
          to="/"
          sx={{ mr: 2 }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/collections"
          startIcon={<CollectionsIcon />}
          sx={{ mr: 2 }}
        >
          Collections
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/wishlist"
          startIcon={<FavoriteIcon />}
        >
          Wishlist
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 