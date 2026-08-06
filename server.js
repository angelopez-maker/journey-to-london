const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '12mb' }));

// ── Block sensitive server-side files ─────────────────────────────────────────
const BLOCKED = ['/server.js', '/package.json', '/package-lock.json', '/scores.json', '/books.json'];
app.use((req, res, next) => {
  if (BLOCKED.some(p => req.path === p)) return res.status(404).end();
  next();
});

// ── Static files ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ── Scores storage ─────────────────────────────────────────────────────────────
// DATA_DIR can be set to a Railway Volume mount path for persistence across deploys
const DATA_DIR = process.env.DATA_DIR || __dirname;
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

function readScores() {
  try {
    if (fs.existsSync(SCORES_FILE)) return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
  } catch (e) {}
  return {
    rodrigo:  { km: 0, prestige: { stars: 0, trophies: 0, bens: 0 }, streak: { count: 0, lastDate: '' } },
    fernando: { km: 0, prestige: { stars: 0, trophies: 0, bens: 0 }, streak: { count: 0, lastDate: '' } }
  };
}

function writeScores(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

// ── Book Club — texto real de los libros que Fernando está leyendo ─────────────
// Igual que scores.json, vive solo en DATA_DIR (la carpeta persistente de Railway), NUNCA en el
// repo de git (que Angel confirmó que es público) — así el texto de un libro con copyright no queda
// expuesto de forma permanente. Se llena una vez por libro vía /api/admin/book-upload (protegido
// con ADMIN_SECRET) y Book Club lo consulta capítulo por capítulo vía /api/book-chapter — nunca se
// le muestra el texto real al alumno, solo se usa como base para que la IA genere el chequeo de
// comprensión con contenido real en vez de "lo que recuerda" del libro.
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');

function readBooks() {
  try {
    if (fs.existsSync(BOOKS_FILE)) return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  } catch (e) {}
  return {};
}

function writeBooks(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(data, null, 2));
}

function normalizeBookTitle(title) {
  return String(title || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

// ── Rate limiter (simple in-memory, no extra deps) ─────────────────────────────
const _hits = new Map();
function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - 60_000;
    const times = (_hits.get(ip) || []).filter(t => t > windowStart);
    times.push(now);
    _hits.set(ip, times);
    if (times.length > maxPerMin)
      return res.status(429).json({ error: { message: 'Too many requests. Please slow down.' } });
    next();
  };
}

// ── Scores API ─────────────────────────────────────────────────────────────────
app.get('/api/scores', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readScores());
});

app.post('/api/scores/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });

  const scores = readScores();
  const incoming = req.body;

  // A lower incoming km is normally treated as an accidental reset (e.g. cleared
  // localStorage) and rejected — we keep the higher value. BUT a real reset to 0
  // happens on purpose every time a star/trophy/Big Ben is earned. We detect that
  // by checking whether prestige went up: if it did, trust the client's km as-is,
  // even though it's lower. Otherwise, keep the old "always keep the higher value" guard.
  const prestigeScore = p => (p?.bens || 0) * 25 + (p?.trophies || 0) * 5 + (p?.stars || 0);
  const prevPrestige = scores[profile].prestige;
  const earnedPrestige = incoming.prestige && prestigeScore(incoming.prestige) > prestigeScore(prevPrestige);

  if (typeof incoming.km === 'number')
    scores[profile].km = earnedPrestige ? incoming.km : Math.max(scores[profile].km || 0, incoming.km);

  if (incoming.prestige) scores[profile].prestige = incoming.prestige;
  if (incoming.streak)   scores[profile].streak   = incoming.streak;

  writeScores(scores);
  res.json({ ok: true, scores: scores[profile] });
});

// ── Book Club — texto real de capítulos ─────────────────────────────────────────
// Lectura pública (sin secreto): solo devuelve el capítulo puntual pedido, nunca el libro completo,
// y solo si Angel ya lo cargó a propósito — mismo nivel de exposición que cualquier otro contenido
// de la app (no hay sistema de login en Journey to London, es un supuesto ya aceptado del proyecto).
app.get('/api/book-chapter', rateLimit(60), (req, res) => {
  const book = normalizeBookTitle(req.query.book);
  const ch = String(req.query.chapter || '');
  if (!book || !ch) return res.status(400).json({ error: { message: 'Missing book or chapter.' } });

  const books = readBooks();
  const entry = books[book];
  const text = entry?.chapters?.[ch];
  if (!text) return res.status(404).json({ error: { message: 'No confirmed text for this book/chapter.' } });

  res.json({ title: entry.title, author: entry.author, chapter: ch, text });
});

// Carga protegida — pensada para usarse UNA VEZ por libro, pegando un fetch() en la consola del
// navegador con ADMIN_SECRET (variable de entorno nueva en Railway, la elige Angel). No hay UI para
// esto a propósito: es un paso de configuración puntual, no una función que use un niño.
app.post('/api/admin/book-upload', rateLimit(5), (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret)
    return res.status(500).json({ error: { message: 'ADMIN_SECRET not configured on server.' } });

  const { secret, title, author, chapters } = req.body || {};
  if (secret !== adminSecret)
    return res.status(403).json({ error: { message: 'Invalid secret.' } });
  if (!title || !chapters || typeof chapters !== 'object')
    return res.status(400).json({ error: { message: 'Missing title or chapters.' } });

  const books = readBooks();
  const key = normalizeBookTitle(title);
  books[key] = { title, author: author || '', chapters };
  writeBooks(books);

  res.json({ ok: true, book: key, chapterCount: Object.keys(chapters).length });
});

// ── Claude proxy (hardened) ────────────────────────────────────────────────────
const ALLOWED_MODELS = ['claude-haiku-4-5-20251001', 'claude-haiku-4-5', 'claude-haiku'];
const MAX_TOKENS_CAP = 2000;

app.post('/api/chat', rateLimit(30), async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: { message: 'API key not configured on server.' } });

  // Force safe model and cap tokens — ignore whatever the client sends
  const body = {
    ...req.body,
    model: 'claude-haiku-4-5-20251001',
    max_tokens: Math.min(req.body.max_tokens || 1500, MAX_TOKENS_CAP),
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── Whisper STT proxy ──────────────────────────────────────────────────────────
// Recibe audio grabado en el navegador (base64) y lo transcribe con la API de Whisper
// de OpenAI. Reemplaza el reconocimiento de voz nativo del navegador, que tenía mala
// precisión con acento infantil. Requiere OPENAI_API_KEY configurada en el entorno.
app.post('/api/transcribe', rateLimit(30), async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: { message: 'OpenAI API key not configured on server.' } });

  const { audio, mimeType } = req.body || {};
  if (!audio)
    return res.status(400).json({ error: { message: 'Missing audio.' } });

  try {
    const buffer = Buffer.from(audio, 'base64');
    const ext = (mimeType || '').includes('webm') ? 'webm' : 'wav';
    const blob = new Blob([buffer], { type: mimeType || 'audio/webm' });

    const form = new FormData();
    form.append('file', blob, `audio.${ext}`);
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const data = await response.json();
    if (!response.ok)
      return res.status(response.status).json({ error: data.error || { message: 'Whisper API error.' } });

    res.json({ text: data.text || '' });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── OpenAI TTS proxy ────────────────────────────────────────────────────────────
// Genera audio real (voz de Oliver / tutor / narrador) con el modelo TTS de OpenAI, en vez de
// la síntesis nativa del navegador (robótica y distinta según SO/navegador). Mismo patrón de
// seguridad que /api/transcribe — key solo en servidor, rate limit. Reutiliza la misma
// OPENAI_API_KEY ya configurada para Whisper (el permiso "Text-to-speech: Request" ya está
// habilitado en esa key). Si esta llamada falla o se demora, el cliente (ttsSpeak() en
// index.html) cae automáticamente de vuelta a speechSynthesis — la voz nueva nunca debe ser el
// motivo de que algo se sienta roto frente a los niños.
app.post('/api/tts', rateLimit(60), async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: { message: 'OpenAI API key not configured on server.' } });

  const { text, instructions, voice } = req.body || {};
  if (!text || !text.trim())
    return res.status(400).json({ error: { message: 'Missing text.' } });

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: voice || 'echo',
        input: text.slice(0, 2000),
        instructions: instructions || 'Speak as an upbeat, enthusiastic British teenager, around 16-18 years old — energetic and playful, clear pronunciation, natural conversational pace, genuinely excited and fun.',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errData.error || { message: 'OpenAI TTS error.' } });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.json({ audio: buffer.toString('base64'), mimeType: 'audio/mpeg' });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── Fallback: serve index.html ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  // Only serve HTML for non-API routes
  if (req.path.startsWith('/api/'))
    return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Process stability ──────────────────────────────────────────────────────────
process.on('uncaughtException',  err => console.error('[uncaughtException]', err));
process.on('unhandledRejection', err => console.error('[unhandledRejection]', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Journey to London running on port ${PORT}`));
