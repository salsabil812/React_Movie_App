import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getCollections, createCollection, deleteCollection } from '../services/api';
import MovieCard from '../components/MovieCard';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const response = await getCollections();
      setCollections(response.data);
    } catch (error) {
      setError('Failed to load collections');
      console.error('Error loading collections:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      try {
        await createCollection(newCollectionName.trim());
        setNewCollectionName('');
        setDialogOpen(false);
        setSuccess('Collection created successfully');
        await loadCollections();
      } catch (error) {
        setError('Failed to create collection');
        console.error('Error creating collection:', error);
      }
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(collectionId);
      setSuccess('Collection deleted successfully');
      await loadCollections();
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    } catch (error) {
      setError('Failed to delete collection');
      console.error('Error deleting collection:', error);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess('');
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        My Collections
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Collection
        </Button>
      </Typography>

      {collections.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No collections yet. Create one to get started!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {collection.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {collection.movies?.length || 0} movies
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => setSelectedCollection(collection)}>
                    View Movies
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteCollection(collection.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selected Collection Movies */}
      {selectedCollection && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Movies in {selectedCollection.name}
            <Button 
              size="small" 
              sx={{ ml: 2 }}
              onClick={() => setSelectedCollection(null)}
            >
              Close
            </Button>
          </Typography>
          <Grid container spacing={3}>
            {selectedCollection.movies?.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                <MovieCard movie={movie} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Collections; 