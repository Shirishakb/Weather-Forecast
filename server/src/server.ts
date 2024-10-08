import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load environment variables from .env file
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Define __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client dist folder
app.use(express.static(join(__dirname, '../client/dist')));

// Connect the routes
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
