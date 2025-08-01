// Import necessary modules
import express from 'express';
import dotenv from 'dotenv';    
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { connectDB } from './config/db.js';
import { swaggerUi, swaggerDocs } from './config/swagger.js'; // Import Swagger setup
import cookieParser from 'cookie-parser';

dotenv.config(); 

// Initialize express app
const app = express();

// Enable express to parse JSON
app.use(
  cors({
      origin: 'http://localhost',
      credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('controllers'));
// app.use(express.static('frontend'));

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Serve Swagger documentation

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

const port = process.env.PORT || 5000;

// Listen on the specified port
app.listen(port, () => {
    connectDB(); // Connect to MongoDB
    console.log(`Server started at http://localhost:${port}`);
});

// Basic health check route
app.get("/home", (req, res) => {
    res.status(200).send("You have everything installed!");
});

// Define your API routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);