import { Router, Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabaseAdmin, supabaseAnon } from '../supabase';

// Extend Express Request type to include userId
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

// Validation schemas
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as string | number });
};

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Signup endpoint - uses Supabase Auth
router.post('/signup', async (req, res) => {
  try {
    const parse = SignupSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ 
        error: 'Invalid payload', 
        details: parse.error.issues 
      });
    }

    const { email, password, name } = parse.data;

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user with Supabase Auth
    

    // Create user profile in users table
    const userId = crypto.randomUUID();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        password_hash: hashedPassword,
        role: 'user', // You can implement email verification later
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('User creation error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    return res.status(201).json({ 
      message: 'Account created successfully!',
      user
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint - uses Supabase Auth
router.post('/login', async (req, res) => {
  try {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { email, password } = parse.data;

    // Sign in with Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash, role, phone, avatar_url')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    const { password_hash: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint - verifies Supabase JWT
router.get('/me',authenticateToken, async (req :any, res) => {
  try {
    // Get fresh user profile from database
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, phone, avatar_url, created_at, updated_at')
      .eq('id', req.userId)
      .single();

    if (error) {
      console.error('User fetch error:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({user:profile});

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session endpoint
router.get('/session',authenticateToken, async (req, res) => {
  try {
    // Get user profile using JWT userId
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, phone, avatar_url') 
      .eq('id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ session: null });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    return res.json({ 
      session: {
        access_token: token,
        user: profile
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    return res.json({ session: null });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', async (req, res) => {
  try {
    // In JWT, logout is primarily handled client-side by removing the token
    // You could implement a token blacklist here if needed for extra security
    console.log(`User ${req.userId} logged out`);
    
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.json({ message: 'Logged out successfully' });
  }
});

export default router;