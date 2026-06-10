const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing req.body

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes(upload));

app.get('/', (req, res) => res.send('Mythic Games API is running'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});