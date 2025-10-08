import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MODEL = 'text-embedding-3-small';
const apiKey = process.env.OPENAI_API_KEY;

type Product = { id: string; name: string; tags?: string[]; description?: string };

const PRODUCTS: Product[] = [
  { id:'1', name:'Vector Embeddings 101', tags:['ai','nlp'], description:'Intro' },
  { id:'2', name:'Angular Signals Deep Dive', tags:['angular'], description:'Patterns' },
  { id:'3', name:'Fuzzy Search with Fuse.js', tags:['search'], description:'Config' },
];

// cosine helper
function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// If no key, we’ll return deterministic dummy scores so UI still works
const openai = apiKey ? new OpenAI({ apiKey }) : null;

app.get('/products', (req, res) => {
    res.json(PRODUCTS);
});

app.post('/embed', async (req, res) => {
  const { query, items } = req.body as { query: string; items: { id: string; text: string }[] };

  // Fallback: no key present
  if (!openai) {
    const q = (query || '').toLowerCase();
    const out: Record<string, number> = {};
    for (const it of items) {
      // super-simple heuristic so results move a bit
      const txt = it.text.toLowerCase();
      const overlap = q && txt.includes(q) ? 1 : 0;
      out[it.id] = 0.4 + overlap * 0.4; // 0.4 .. 0.8
    }
    return res.json(out);
  }

  try {
    const [qEmb, ...iEmb] = await Promise.all([
      openai.embeddings.create({ model: MODEL, input: query }),
      ...items.map((it) => openai.embeddings.create({ model: MODEL, input: it.text })),
    ]);
    const qVec = qEmb.data[0].embedding as number[];
    const out: Record<string, number> = {};
    items.forEach((it, idx) => {
      const v = iEmb[idx].data[0].embedding as number[];
      out[it.id] = (cosine(qVec, v) + 1) / 2; // map -1..1 → 0..1
    });
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'embedding_failed' });
  }
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => console.log('Embed server on :' + port + (apiKey ? '' : ' (NO OPENAI_API_KEY, using dummy scores)')));
