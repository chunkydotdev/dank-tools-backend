import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import pollRoutes from './routes/poll.route';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polls')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: mongoose.Error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/polls', pollRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 