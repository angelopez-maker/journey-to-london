const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '12mb' }));

// ── Block sensitive server-side files ─────────────────────────────────────────
const BLOCKED = ['/server.js', '/package.json', '/package-lock.json', '/scores.json', '/books.json', '/gate4-data.json', '/ket-diagnostics.json', '/repaso-plan.json', '/ket-session.json', '/pet-session.json'];
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

// ── KET Diagnostics — historial de diagnósticos Cambridge A2 Key por alumno ────
// Antes vivía solo en memoria del navegador (_ketSess en index.html) y se perdía al cerrar la
// pestaña — la única forma de recuperar un diagnóstico pasado era el PDF ya exportado. Mismo
// patrón que scores.json: JSON simple en DATA_DIR, sin secreto (no hay login en esta app), un
// array de registros por alumno para poder comparar diagnósticos a lo largo del tiempo.
// El registro del 19 ago 2026 de Fernando se siembra acá como valor por defecto porque esa sesión
// ya pasó y solo existe reconstruida desde el PDF — con la interpretación corregida (20 ago: el
// evaluador decía "Reading es la habilidad más fuerte" cuando en realidad Writing 60% era más alto
// que Reading 50%; ver fix en ketResults() de index.html).
const KET_FILE = path.join(DATA_DIR, 'ket-diagnostics.json');

function readKETDiagnostics() {
  try {
    if (fs.existsSync(KET_FILE)) return JSON.parse(fs.readFileSync(KET_FILE, 'utf8'));
  } catch (e) {}
  return {
    rodrigo: [],
    fernando: [
      {
        date: '2026-08-19',
        scores: { reading: '11/22', writing: '6/10', listening: '5/10', speaking: '5/10' },
        percentages: { reading: 50, writing: 60, listening: 50, speaking: 50 },
        speakingEvaluation: {
          score: 5, maxScore: 10,
          fluency: { score: 2, max: 3, comment: 'Frequent pauses and hesitations; some repetition (e.g. "yes yes I prefer family").' },
          grammar: { score: 1, max: 3, comment: 'Missing subjects, incorrect verb forms (e.g. "have" for "has").' },
          taskCompletion: { score: 1, max: 2, comment: 'Question 9 left blank; surname spelling not provided.' }
        },
        writingEvaluation: {
          score: 6, maxScore: 10,
          notes: 'All three task elements present (timing, location, item to bring). Grammar errors: missing subjects, lowercase "i", inverted punctuation, "exited" for "excited". Inconsistency: Friday vs. Saturday.'
        },
        report: {
          overallLevel: 'Borderline A2',
          overallSummary: "Fernando is at the lower end of A2, with three of four skills tied at exactly 50% (Reading, Listening, Speaking) and Writing slightly ahead at 60% — his only skill above the halfway mark. He demonstrates willingness to communicate and handles familiar topics, but shared grammar gaps (subject-verb agreement, incomplete sentences) are dragging Speaking, Writing, and indirectly Listening down together, rather than four separate weaknesses. He is not yet secure at A2 and would regress to A1+ in speaking contexts.",
          readingAnalysis: 'Reading scores 11/22 (50%), tied for the lowest result alongside Listening and Speaking. This suggests Fernando decodes familiar vocabulary but struggles with inference, detail comprehension, or longer passages — it is not currently a relative strength.',
          writingAnalysis: "Writing is Fernando's strongest skill at 6/10 (60%), the only score above the halfway mark. All three task elements are present, but grammar errors (missing subjects, 'exited' for 'excited', lowercase 'i') and a Friday/Saturday inconsistency hold the score back from higher.",
          listeningAnalysis: 'Listening ties for the lowest score at 5/10 (50%), suggesting Fernando struggles to process continuous speech or extract specific information from audio — likely relying on isolated word recognition rather than full-message comprehension.',
          speakingAnalysis: "Speaking ties for the lowest score at 5/10 (50%), with fluency 2/3, grammar just 1/3, and task completion 1/2. He shows slow, hesitant speech with repetition, multiple grammar errors, and incomplete answers — leaving Question 9 blank and not providing his surname spelling.",
          strengths: [
            'Shows genuine confidence and willingness to attempt extended answers on familiar topics (family, hobbies, activities), rather than giving single-word responses.',
            'Understands the gist of most direct questions and can identify relevant vocabulary (cinema, theme park, picnic, delicious, reservoir) from A2 topic areas.',
            'Completes written task requirements — all three email elements present — showing he can organize ideas across a short text.'
          ],
          toImprove: [
            "Grammar fundamentals — subject-verb agreement and complete sentences: practice 5–8 sentence frames with subject + verb + object until automatic.",
            "Answer every part of every question precisely: 'read-mark-check' for writing, 'listen-wait-answer' for speaking. Blank answers (Q9) and missing surname cost marks.",
            "Reduce repetition and expand vocabulary range: build a bank of 10 adjectives and practice one sentence with each daily.",
            "Fluency through sentence building, not speed: drill 3–4 sentence starters ('I like…', 'My favourite…', 'On [day] I…') until they flow without pauses."
          ],
          criticalGaps: [
            "Subject-verb agreement and complete sentences (Speaking grammar 1/3) — these are A1-level errors; mastering them is the precondition for solid A2.",
            'Listening comprehension at 50% — cannot yet reliably extract information from continuous speech or follow multi-step instructions.',
            'Task completion and precision — blank answers, missing details, and the Friday/Saturday inconsistency suggest rushing or not re-reading.',
            "Fluency and confidence under pressure — frequent pauses suggest a lack of automaticity with basic structures rather than a vocabulary problem."
          ],
          roadmapToBl: 'Focus first on making basic sentence construction (subject + verb + object) automatic, since that single gap is dragging down Speaking, Writing, and indirectly Listening at once. Layer in structured listening practice for multi-step instructions, and drill precision habits (answer every part, re-read before submitting) so easy marks stop being lost. Writing, his current relative strength, can be used as the anchor skill to build confidence while the others catch up.',
          priority: 'speaking'
        },
        notes: 'Primera sesión — sesión accidentada (bug de interpretación en el evaluador, corregido el 20 ago 2026). Reconstruido desde el PDF exportado por Angel; fuente de verdad para futuras comparaciones.'
      }
    ]
  };
}

function writeKETDiagnostics(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(KET_FILE, JSON.stringify(data, null, 2));
}

// ── KET Session — progreso EN CURSO del diagnóstico (por sección), centralizado ────────────────
// 20 agosto: la pérdida de progreso de Fernando (tuvo que rehacer Reading y Writing) se arregló
// primero solo con localStorage — pero eso únicamente protege ante una recarga en el MISMO
// dispositivo/navegador. Angel señaló, con razón, que si Fernando cambia de dispositivo o de
// navegador, o se borra el localStorage, el progreso se pierde igual. Fix real: centralizar el
// progreso EN CURSO acá en el servidor (mismo patrón que ket-diagnostics.json, pero para la
// sesión sin terminar todavía) — localStorage se mantiene en el cliente solo como caché
// instantánea, pero el servidor es la fuente de verdad.
const KET_SESSION_FILE = path.join(DATA_DIR, 'ket-session.json');

function readKETSession() {
  try {
    if (fs.existsSync(KET_SESSION_FILE)) return JSON.parse(fs.readFileSync(KET_SESSION_FILE, 'utf8'));
  } catch (e) {}
  return { rodrigo: null, fernando: null };
}

function writeKETSession(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(KET_SESSION_FILE, JSON.stringify(data, null, 2));
}

// ── PET Session — mismo parche que KET Session, aplicado a _petFullResults ─────────────────────
// 20 agosto: Angel pidió el mismo arreglo para PET Training antes de probarlo él mismo — misma
// clase de bug que _ketSess (progreso de las secciones ya completadas viviendo solo en memoria del
// navegador, sin servidor), esta vez en _petFullResults (index.html). Mismo patrón, archivo aparte.
const PET_SESSION_FILE = path.join(DATA_DIR, 'pet-session.json');

function readPETSession() {
  try {
    if (fs.existsSync(PET_SESSION_FILE)) return JSON.parse(fs.readFileSync(PET_SESSION_FILE, 'utf8'));
  } catch (e) {}
  return { rodrigo: null, fernando: null };
}

function writePETSession(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PET_SESSION_FILE, JSON.stringify(data, null, 2));
}

// ── Plan de Repaso — calendario guiado generado a partir del KET Diagnostic ────
// 20 agosto: Angel pidió un plan de repaso "automatizado" dentro de la app, no solo un documento
// aparte. Mismo patrón que scores.json/ket-diagnostics.json: JSON simple en DATA_DIR, un array de
// días por alumno, cada uno con foco/acción concreta y estado done/not-done que el frontend puede
// marcar y que sobrevive entre sesiones y dispositivos. El calendario de Fernando (20 ago → 9 sep,
// alineado con la fecha de re-test sugerida) se siembra acá como valor por defecto, construido a
// partir de los gaps del diagnóstico del 19 ago 2026 — ver "Plan de Refuerzo - Fernando.md" para el
// razonamiento completo. type:'app' trae una acción real de la app (module); type:'habit' es un
// hábito breve sin módulo asociado; type:'rest' es un día libre, no cuenta en el progreso.
const REPASO_FILE = path.join(DATA_DIR, 'repaso-plan.json');

function _repasoDay(date, week, type, label, module) {
  return { date, week, type, label, module: module || null, done: false };
}

function readRepasoPlan() {
  try {
    if (fs.existsSync(REPASO_FILE)) return JSON.parse(fs.readFileSync(REPASO_FILE, 'utf8'));
  } catch (e) {}
  return {
    rodrigo: null,
    fernando: {
      sourceDiagnosticDate: '2026-08-19',
      retestDate: '2026-09-09',
      days: [
        _repasoDay('2026-08-20', 1, 'habit', '5–8 frases sujeto + verbo + objeto, en voz alta y escritas'),
        _repasoDay('2026-08-21', 1, 'app', 'Versus Mode — Grammar Duel (concordancia sujeto-verbo)', 'versus'),
        _repasoDay('2026-08-22', 1, 'habit', '5–8 frases sujeto + verbo + objeto'),
        _repasoDay('2026-08-23', 1, 'rest', 'Descanso'),
        _repasoDay('2026-08-24', 1, 'app', 'Versus Mode — Grammar Duel', 'versus'),
        _repasoDay('2026-08-25', 1, 'habit', '5–8 frases sujeto + verbo + objeto'),
        _repasoDay('2026-08-26', 1, 'app', 'Versus Mode — Grammar Duel', 'versus'),
        _repasoDay('2026-08-27', 2, 'app', 'Show & Tell (oral) — responde TODAS las preguntas, nada en blanco', 'showtell'),
        _repasoDay('2026-08-28', 2, 'habit', 'Banco de vocabulario — 1 adjetivo nuevo en una frase'),
        _repasoDay('2026-08-29', 2, 'habit', 'Banco de vocabulario — 1 adjetivo nuevo'),
        _repasoDay('2026-08-30', 2, 'rest', 'Descanso'),
        _repasoDay('2026-08-31', 2, 'app', 'Show & Tell (oral) — responde todas las preguntas', 'showtell'),
        _repasoDay('2026-09-01', 2, 'habit', 'Banco de vocabulario — 1 adjetivo nuevo'),
        _repasoDay('2026-09-02', 2, 'habit', 'Regla leer-marcar-revisar: releer antes de entregar'),
        _repasoDay('2026-09-03', 3, 'app', 'Oliver Blackwood (Q&A Trivia) — conversación libre en inglés', 'oliver'),
        _repasoDay('2026-09-04', 3, 'habit', "Sentence starters: 'I like…' / 'My favourite…' / 'On [day] I…'"),
        _repasoDay('2026-09-05', 3, 'app', 'Oliver Blackwood (Q&A Trivia)', 'oliver'),
        _repasoDay('2026-09-06', 3, 'rest', 'Descanso'),
        _repasoDay('2026-09-07', 3, 'app', 'Free Practice — tema libre PET', 'free'),
        _repasoDay('2026-09-08', 3, 'app', 'Oliver Blackwood (Q&A Trivia)', 'oliver'),
        _repasoDay('2026-09-09', 3, 'app', '🎓 Re-test: KET Diagnostic completo', 'ket')
      ]
    }
  };
}

function writeRepasoPlan(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(REPASO_FILE, JSON.stringify(data, null, 2));
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

// ── Gate 4 — contenido real para un módulo de práctica separado (ver gate4.html) ───────────────
// Mismo mecanismo que books.json/DATA_DIR de arriba (vive solo en la carpeta persistente,
// nunca en el repo de git) — PERO con una diferencia deliberada respecto a /api/book-chapter:
// ese endpoint es de lectura pública porque un libro de clase no es secreto. El contenido que
// vive acá puede ser información real y sensible (agenda, cifras, puntos de una reunión), así
// que la lectura queda protegida con una clave (GATE4_PASSCODE) además de vivir fuera del repo.
// La carga sigue el mismo patrón sin UI que /api/admin/book-upload (protegido con ADMIN_SECRET,
// pensado para pegarse una vez por contenido con fetch() en la consola del navegador).
const GATE4_FILE = path.join(DATA_DIR, 'gate4-data.json');

function readGate4() {
  try {
    if (fs.existsSync(GATE4_FILE)) return JSON.parse(fs.readFileSync(GATE4_FILE, 'utf8'));
  } catch (e) {}
  return {};
}

function writeGate4(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(GATE4_FILE, JSON.stringify(data, null, 2));
}

function normalizeGate4Title(title) {
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

// ── KET Session API (progreso en curso, no el diagnóstico final) ────────────────
app.get('/api/ket-session/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readKETSession()[profile] || null);
});

app.post('/api/ket-session/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  const data = readKETSession();
  data[profile] = req.body && Object.keys(req.body).length ? req.body : null;
  writeKETSession(data);
  res.json({ ok: true });
});

// ── PET Session API (progreso en curso de _petFullResults) ──────────────────────
app.get('/api/pet-session/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readPETSession()[profile] || null);
});

app.post('/api/pet-session/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  const data = readPETSession();
  data[profile] = req.body && Object.keys(req.body).length ? req.body : null;
  writePETSession(data);
  res.json({ ok: true });
});

// ── KET Diagnostics API ──────────────────────────────────────────────────────
app.get('/api/ket-diagnostics/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readKETDiagnostics()[profile] || []);
});

app.post('/api/ket-diagnostics/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });

  const { date, scores, percentages, speakingEvaluation, writingEvaluation, report } = req.body || {};
  if (!scores) return res.status(400).json({ error: { message: 'Missing scores.' } });

  const data = readKETDiagnostics();
  if (!data[profile]) data[profile] = [];
  data[profile].push({
    date: date || new Date().toISOString().slice(0, 10),
    scores, percentages: percentages || null,
    speakingEvaluation: speakingEvaluation || null,
    writingEvaluation: writingEvaluation || null,
    report: report || null
  });
  writeKETDiagnostics(data);
  res.json({ ok: true, count: data[profile].length });
});

// ── Plan de Repaso API ───────────────────────────────────────────────────────
app.get('/api/repaso-plan/:profile', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });
  res.set('Access-Control-Allow-Origin', '*');
  res.json(readRepasoPlan()[profile] || null);
});

// Marca un día del plan como hecho/no hecho. No reemplaza el plan entero — solo togglea un día,
// así que si el plan por defecto de arriba cambia en el código, un plan ya persistido en disco NO
// se actualiza solo (mismo comportamiento ya aceptado que scores.json: el archivo en disco manda
// una vez que existe).
app.post('/api/repaso-plan/:profile/day', (req, res) => {
  const profile = req.params.profile;
  if (!['rodrigo', 'fernando'].includes(profile))
    return res.status(400).json({ error: 'Invalid profile' });

  const { date, done } = req.body || {};
  if (!date) return res.status(400).json({ error: { message: 'Missing date.' } });

  const data = readRepasoPlan();
  if (!data[profile] || !Array.isArray(data[profile].days))
    return res.status(404).json({ error: { message: 'No plan for this profile.' } });

  const day = data[profile].days.find(d => d.date === date);
  if (!day) return res.status(404).json({ error: { message: 'No such day in plan.' } });

  day.done = !!done;
  writeRepasoPlan(data);
  res.json({ ok: true, day });
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

// ── Gate 4 — lectura protegida ──────────────────────────────────────────────────
// A diferencia de /api/book-chapter, ACÁ la lectura exige una clave (GATE4_PASSCODE, variable de
// entorno nueva en Railway) — no es pública. Sin "topic" en el body, devuelve solo la lista de
// títulos disponibles (sin texto) para armar un selector; con "topic", devuelve el contenido de
// ese ítem puntual. Nunca se devuelve nada si la clave no calza, ni siquiera la lista de títulos.
app.post('/api/gate4-content', rateLimit(30), (req, res) => {
  const passcode = process.env.GATE4_PASSCODE;
  if (!passcode)
    return res.status(500).json({ error: { message: 'GATE4_PASSCODE not configured on server.' } });

  const { code, topic } = req.body || {};
  if (code !== passcode)
    return res.status(403).json({ error: { message: 'Invalid code.' } });

  const data = readGate4();

  if (!topic) {
    const topics = Object.values(data).map(e => ({ key: normalizeGate4Title(e.title), title: e.title }));
    return res.json({ topics });
  }

  const entry = data[normalizeGate4Title(topic)];
  if (!entry) return res.status(404).json({ error: { message: 'No content found for this topic.' } });
  res.json({ title: entry.title, text: entry.text });
});

// Carga protegida — mismo patrón sin UI que /api/admin/book-upload (pegar un fetch() en la
// consola del navegador con ADMIN_SECRET). Pensada para actualizarse cada vez que haya contenido
// nuevo que practicar; sobrescribe el título si ya existía.
app.post('/api/admin/gate4-upload', rateLimit(5), (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret)
    return res.status(500).json({ error: { message: 'ADMIN_SECRET not configured on server.' } });

  const { secret, title, text } = req.body || {};
  if (secret !== adminSecret)
    return res.status(403).json({ error: { message: 'Invalid secret.' } });
  if (!title || !text)
    return res.status(400).json({ error: { message: 'Missing title or text.' } });

  const data = readGate4();
  const key = normalizeGate4Title(title);
  data[key] = { title, text };
  writeGate4(data);

  res.json({ ok: true, topic: key });
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
