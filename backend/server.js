const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const { initializeDatabase, getConnectionInfo } = require('./database/db');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ success: true, message: 'Mythic Games backend is running' });
});

app.get('/', (req, res) => {
	res.json({ success: true, message: 'Mythic Games backend is running' });
});

app.use('/api/users', userRoutes);

app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
	console.error(error);
	res.status(500).json({
		success: false,
		message: 'Internal server error',
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
