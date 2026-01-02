import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { script } = req.query;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('script', script)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { script, content } = req.body;

    if (!content || content.length < 3) {
      return res.status(400).json({ error: 'Comentario inválido' });
    }

    const { error } = await supabase
      .from('comments')
      .insert([{ script, content }]);

    if (error) return res.status(500).json(error);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
