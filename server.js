const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

// ── Scores storage ──────────────────────────────────────────────────────────
const SCORES_FILE = path.join(__dirname, 'scores.json');

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
  try { fs.writeFileSync(SCORES_FILE, JSON.stringify(data, null, 2)); } catch (e) {}
}

// GET all scores
app.get('/api/scores', (req, res) => {
  res.json(readScores());
});

// POST update one profile's scores
app.post('/api/scores/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });

  const scores = readScores();
  const incoming = req.body;

  // Always keep the higher km value (prevents accidental resets)
  if (typeof incoming.km === 'number')
    scores[profile].km = Math.max(scores[profile].km || 0, incoming.km);

  if (incoming.prestige) scores[profile].prestige = incoming.prestige;
  if (incoming.streak)   scores[profile].streak   = incoming.streak;

  writeScores(scores);
  res.json({ ok: true, scores: scores[profile] });
});

// ── Claude proxy ────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: { message: 'API key not configured on server.' } });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// Fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Journey to London running on port ${PORT}`));
