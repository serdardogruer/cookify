import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import kitchenRoutes from './routes/kitchen.routes';
import categoryRoutes from './routes/category.routes';
import pantryRoutes from './routes/pantry.routes';
import marketRoutes from './routes/market.routes';
import moduleRoutes from './routes/module.routes';
import recipeRoutes from './routes/recipe.routes';
import consumptionRoutes from './routes/consumption.routes';
import customMealRoutes from './routes/custom-meal.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://cookify-ecru-alpha.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Cookify API is running',
    cors: process.env.FRONTEND_URL 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/custom-meals', customMealRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});

export default app;
