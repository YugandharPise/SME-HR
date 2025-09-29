import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../.env' });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Basic Supabase client for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder for future API routes
app.get('/api/test', async (req, res) => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Backend is connected to Supabase!', data });
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
