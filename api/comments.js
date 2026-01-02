import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res
      .status(204)
      .set(CORS_HEADERS)
      .end();
  }

  res.set(CORS_HEADERS);

  try {
    if (req.method === 'GET') {
      const { script } = req.query || {};

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('script', script)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase SELECT error:', error);
        return res.status(500).json({ error: { message: error.message || 'DB select error' } });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { script, content } = req.body || {};

      if (!script || !content || typeof content !== 'string' || content.trim().length < 3) {
        return res.status(400).json({ error: { message: 'Invalid input: script & content required (min 3 chars)' } });
      }

      const payload = { script, content: content.trim() };

      const { data, error } = await supabase
        .from('comments')
        .insert([payload]);

      if (error) {
        console.error('Supabase INSERT error:', error);
        return res.status(500).json({ error: { message: error.message || 'DB insert error' } });
      }

      return res.status(200).json({ ok: true, inserted: data });
    }

    return res.status(405).json({ error: { message: 'Method not allowed' } });
  } catch (err) {
    console.error('Unhandled error in function:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error' } });
  }
}
