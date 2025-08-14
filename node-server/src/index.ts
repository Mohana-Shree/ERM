import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
console.log('Raw SUPABASE_URL:', process.env.SUPABASE_URL?.substring(0, 20) + '...');
import authRouter from './routes/auth';
import { requireAuth, requireAdmin,AuthenticatedRequest } from './middleware/requireAuth';

// Load environment variables


const app = express();
const port = process.env.PORT || 4000;

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables are required');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'], // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Protected route example
app.get('/protected', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user 
  });
});

// Admin only route example
app.get('/admin-only', requireAuth, requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ 
    message: 'This is an admin-only route',
    user: req.user 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🔑 Supabase JWT Auth enabled`);
});

export default app;