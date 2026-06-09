const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Add this enhanced debug middleware after CORS
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Mythic Games backend is running',
	});
});

app.get('/', (req, res) => {
	res.json({
		success: true,
		message: 'Mythic Games backend is running',
	});
});

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeDatabase, getConnectionInfo } = require('./database/db');

const port = Number(process.env.PORT || 5000);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	});
});

app.use((error, req, res, next) => {
	console.error("🔥 BACKEND ERROR:", error); // show real error

	res.status(500).json({
		success: false,
		message: error.message, // IMPORTANT: show actual DB error
	});
});

async function startServer() {
	try {
		await initializeDatabase();

		const connectionInfo = await getConnectionInfo();

		console.log(
			`Server connected successfully to PostgreSQL database "${connectionInfo.database}" at ${connectionInfo.host}:${connectionInfo.port}`
		);

		app.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error(
			'Server failed to connect to PostgreSQL:',
			error.message || error
		);

		process.exit(1);
	}
}

startServer();