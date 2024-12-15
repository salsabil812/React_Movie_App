const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
};

// Database setup
const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  db.serialize(() => {
    // Collections table
    db.run(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Movies in collections table
    db.run(`
      CREATE TABLE IF NOT EXISTS collection_movies (
        collection_id INTEGER,
        movie_id INTEGER,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (collection_id, movie_id),
        FOREIGN KEY (collection_id) REFERENCES collections (id) ON DELETE CASCADE
      )
    `);

    // Movie notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS movie_notes (
        movie_id INTEGER PRIMARY KEY,
        note TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Movie ratings table
    db.run(`
      CREATE TABLE IF NOT EXISTS movie_ratings (
        movie_id INTEGER PRIMARY KEY,
        rating INTEGER CHECK (rating >= 0 AND rating <= 5),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Wishlist table
    db.run(`
      CREATE TABLE IF NOT EXISTS wishlist (
        movie_id INTEGER PRIMARY KEY,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

// Routes

// Collections
app.get('/api/collections', async (req, res, next) => {
  try {
    const collections = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM collections ORDER BY created_at DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

app.get('/api/collections/:id', async (req, res, next) => {
  try {
    const collection = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM collections WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }
    
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

app.post('/api/collections', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await new Promise((resolve, reject) => {
      db.run('INSERT INTO collections (name) VALUES (?)', [name.trim()], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    res.status(201).json({ 
      id: result.lastID, 
      name: name.trim(),
      created_at: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/collections/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const collection = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM collections WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM collections WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Movies in collections
app.post('/api/collections/:collectionId/movies', async (req, res, next) => {
  try {
    const { collectionId } = req.params;
    const { movieId } = req.body;

    if (!movieId) {
      res.status(400).json({ error: 'Movie ID is required' });
      return;
    }

    const collection = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM collections WHERE id = ?', [collectionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO collection_movies (collection_id, movie_id) VALUES (?, ?)',
        [collectionId, movieId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/collections/:collectionId/movies/:movieId', async (req, res, next) => {
  try {
    const { collectionId, movieId } = req.params;

    const result = await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM collection_movies WHERE collection_id = ? AND movie_id = ?',
        [collectionId, movieId],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    if (result.changes === 0) {
      res.status(404).json({ error: 'Movie not found in collection' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.get('/api/collections/:collectionId/movies', async (req, res, next) => {
  try {
    const { collectionId } = req.params;

    const collection = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM collections WHERE id = ?', [collectionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    const movies = await new Promise((resolve, reject) => {
      db.all(
        'SELECT movie_id FROM collection_movies WHERE collection_id = ?',
        [collectionId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// Notes
app.get('/api/movies/:movieId/notes', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const note = await new Promise((resolve, reject) => {
      db.get(
        'SELECT note FROM movie_notes WHERE movie_id = ?',
        [movieId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json(note || { note: '' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/movies/:movieId/notes', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { note } = req.body;

    if (note === undefined) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO movie_notes (movie_id, note) VALUES (?, ?)',
        [movieId, note],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Ratings
app.get('/api/movies/:movieId/ratings', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const rating = await new Promise((resolve, reject) => {
      db.get(
        'SELECT rating FROM movie_ratings WHERE movie_id = ?',
        [movieId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json(rating || { rating: 0 });
  } catch (err) {
    next(err);
  }
});

app.post('/api/movies/:movieId/ratings', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { rating } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      res.status(400).json({ error: 'Valid rating (0-5) is required' });
      return;
    }

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO movie_ratings (movie_id, rating) VALUES (?, ?)',
        [movieId, rating],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Wishlist
app.get('/api/wishlist', async (req, res, next) => {
  try {
    const wishlist = await new Promise((resolve, reject) => {
      db.all('SELECT movie_id FROM wishlist', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(wishlist);
  } catch (err) {
    next(err);
  }
});

app.post('/api/wishlist', async (req, res, next) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      res.status(400).json({ error: 'Movie ID is required' });
      return;
    }

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO wishlist (movie_id) VALUES (?)',
        [movieId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/wishlist/:movieId', async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM wishlist WHERE movie_id = ?', [movieId], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    if (result.changes === 0) {
      res.status(404).json({ error: 'Movie not found in wishlist' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 