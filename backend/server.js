const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fs = require('fs'); // ADD THIS LINE
const multer = require('multer');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const { initializeDatabase, getConnectionInfo } = require('./database/db');

const app = express();
const port = Number(process.env.PORT || 5000);

// --- Multer Configuration for File Uploads ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});
// --- End Multer Configuration ---

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.get('/health', (req, res) => {
	res.json({ success: true, message: 'Mythic Games backend is running' });
});

app.get('/', (req, res) => {
	res.json({ success: true, message: 'Mythic Games backend is running' });
});

app.use('/uploads', express.static(UPLOAD_DIR)); // New: Serve uploaded files
app.use('/api/users', userRoutes(upload)); // Modified: Pass upload middleware to userRoutes
app.use('/api/auth', authRoutes);

app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
	if (error instanceof multer.MulterError) {
		if (error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ success: false, message: 'File is too large. Max limit is 2MB.' });
		}
	}

	console.error('Server Error:', error.message);
	res.status(500).json({
		success: false,
		message: error.message || 'Internal server error',
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
			console.log(`Server is running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error('Server failed to connect to PostgreSQL:', error.message || error);
		process.exit(1);
	}
}

startServer();
