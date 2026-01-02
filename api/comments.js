import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { script } = req.query;

    if (!script) {
      return res.status(400).json({ error: 'no script specified' });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('script', script)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { script, content } = req.body || {};

    if (!script || !content) {
      return res.status(400).json({ error: 'missing data' });
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ script, content }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'missing id' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
