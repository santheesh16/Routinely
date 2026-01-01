import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import budgetRoutes from './routes/budget.js';
import gymRoutes from './routes/gym.js';
import dsaRoutes from './routes/dsa.js';
import dsaTopicRoutes from './routes/dsaTopic.js';
import dsaProblemCardRoutes from './routes/dsaProblemCard.js';
import germanRoutes from './routes/german.js';
import germanWordCardRoutes from './routes/germanWordCard.js';
import cashbookRoutes from './routes/cashbook.js';
import habitRoutes from './routes/habit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
// Note: More specific routes must come before more general ones
app.use('/api/budget', budgetRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/dsa/problems', dsaProblemCardRoutes); // Must come before /api/dsa/topics
app.use('/api/dsa/topics', dsaTopicRoutes); // Must come before /api/dsa/:id
app.use('/api/dsa', dsaRoutes);
app.use('/api/german/cards', germanWordCardRoutes); // Must come before /api/german/:id
app.use('/api/german', germanRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/habits', habitRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
