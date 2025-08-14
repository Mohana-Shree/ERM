import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin, supabaseAnon } from '../supabase';

const router = Router();

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

    // Create user with Supabase Auth
    const { data: signUpData, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: { 
        data: { name } // Store name in user metadata
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!signUpData.user) {
      return res.status(500).json({ error: 'No user data returned from signup' });
    }

    // Create user profile in users table
    const userId = signUpData.user.id;
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email,
        name,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id' 
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't return error here as auth user was created successfully
    }

    return res.status(201).json({ 
      message: 'Account created successfully! Please sign in with your new credentials.',
      user: signUpData.user
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
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }

    const { session, user } = data;
    if (!session || !user) {
      return res.status(401).json({ error: 'No session created' });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, phone, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Unknown',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id, email, name, role, phone, avatar_url')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return res.status(500).json({ error: 'Failed to create user profile' });
        }

        return res.json({
          message: 'Login successful',
          session,
          user: newProfile
        });
      }
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    return res.json({
      message: 'Login successful',
      session,
      user: profile
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint - verifies Supabase JWT
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get fresh user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, phone, avatar_url, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    return res.json({ user: profile });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session endpoint
router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ session: null });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      return res.json({ session: null });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, phone, avatar_url')
      .eq('id', user.id)
      .single();

    return res.json({ 
      session: {
        access_token: token,
        user: profile || user
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
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Verify token to get user ID
      const { data: { user }, error: getUserError } = await supabaseAnon.auth.getUser(token);
      if (user) {
        // Optional: You can call Supabase signOut to invalidate the session
        const { error } = await supabaseAdmin.auth.admin.signOut(user.id);
      }
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.json({ message: 'Logged out successfully' });
  }
});

export default router;