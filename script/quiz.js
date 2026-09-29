const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const newQuizBtn = document.getElementById('newQuizBtn');
const startQuizBtn = document.getElementById('startQuizBtn');
const introCard = document.getElementById('introCard');
const quizCard = document.getElementById('quizCard');
const resultCard = document.getElementById('resultCard');
const questionImage = document.getElementById('questionImage');
const statusText = document.getElementById('statusText');
const scoreValue = document.getElementById('scoreValue');
const progressValue = document.getElementById('progressValue');
const progressFill = document.getElementById('progressFill');
const progressTrack = document.querySelector('.progress-track');
const imageIndex = document.getElementById('imageIndex');
const streakValue = document.getElementById('streakValue');
const timerValue = document.getElementById('timerValue');
const themeToggle = document.getElementById('themeToggle');

const characters = [
  { slug: 'amber', name: 'Amber', aliases: ['amber'] },
  { slug: 'kaeya', name: 'Kaeya', aliases: ['kaeya'] },
  { slug: 'diluc', name: 'Diluc', aliases: ['diluc'] },
  { slug: 'razor', name: 'Razor', aliases: ['razor'] },
  { slug: 'venti', name: 'Venti', aliases: ['venti'] },
  { slug: 'jean', name: 'Jean', aliases: ['jean'] },
  { slug: 'qiqi', name: 'Qiqi', aliases: ['qiqi'] },
  { slug: 'ganyu', name: 'Ganyu', aliases: ['ganyu'] },
  { slug: 'ayaka', name: 'Ayaka', aliases: ['ayaka'] },
  { slug: 'xiao', name: 'Xiao', aliases: ['xiao'] },
  { slug: 'raiden-shogun', name: 'Raiden Shogun', aliases: ['raiden shogun', 'raiden', 'ei'] },
  { slug: 'zhongli', name: 'Zhongli', aliases: ['zhongli'] },
  { slug: 'kazuha', name: 'Kazuha', aliases: ['kazuha'] },
  { slug: 'xinyan', name: 'Xinyan', aliases: ['xinyan'] },
  { slug: 'yanfei', name: 'Yanfei', aliases: ['yanfei'] },
  { slug: 'sucrose', name: 'Sucrose', aliases: ['sucrose'] },
  { slug: 'fischl', name: 'Fischl', aliases: ['fischl'] },
  { slug: 'albedo', name: 'Albedo', aliases: ['albedo'] },
  { slug: 'mona', name: 'Mona', aliases: ['mona'] },
  { slug: 'bennett', name: 'Bennett', aliases: ['bennett'] },
  { slug: 'noelle', name: 'Noelle', aliases: ['noelle'] },
  { slug: 'klee', name: 'Klee', aliases: ['klee'] },
  { slug: 'barbara', name: 'Barbara', aliases: ['barbara'] },
  { slug: 'sara', name: 'Kujou Sara', aliases: ['kujousara', 'kujou sara', 'sara'] }
];

const TOTAL_QUESTIONS = 20;
let quizList = [];
let currentIndex = 0;
let answeredState = [];
let timerId = null;
let secondsLeft = 900;
let currentStreak = 0;
let bestStreak = 0;
let isQuizActive = false;

function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function updateScore() {
  const totalCorrect = answeredState.filter(item => item.state === 'correct').length;
  scoreValue.textContent = totalCorrect;
}

function bindQuestion() {
  const question = quizList[currentIndex];
  questionImage.src = `https://genshin.jmp.blue/characters/${question.slug}/icon-big`;
  questionImage.alt = question.name;
  progressValue.textContent = `${currentIndex + 1}/${TOTAL_QUESTIONS}`;
  progressTrack.setAttribute('aria-valuenow', currentIndex + 1);
  progressFill.style.width = `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%`;
  imageIndex.textContent = `NO. ${String(currentIndex + 1).padStart(2, '0')}`;
  answerInput.value = '';
  answerInput.disabled = false;
  submitBtn.disabled = false;
  giveUpBtn.disabled = false;
  statusText.textContent = 'Taip jawapan dan tekan Hantar jawapan.';

  const current = answeredState[currentIndex];
  if (current.state === 'correct') {
    answerInput.value = question.name;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    giveUpBtn.disabled = true;
    statusText.textContent = `✅ Betul — ${question.name}`;
  } else if (current.state === 'skipped') {
    answerInput.disabled = true;
    submitBtn.disabled = true;
    giveUpBtn.disabled = true;
    statusText.textContent = `🔎 Jawapan: ${question.name}`;
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.textContent = currentIndex === TOTAL_QUESTIONS - 1 ? 'Keputusan →' : 'Seterusnya →';
}

function revealAnswer() {
  if (!isQuizActive || answeredState[currentIndex].state !== 'pending') return;
  const question = quizList[currentIndex];
  answeredState[currentIndex] = { state: 'skipped' };
  answerInput.disabled = true;
  submitBtn.disabled = true;
  giveUpBtn.disabled = true;
  currentStreak = 0;
  streakValue.textContent = currentStreak;
  statusText.textContent = `🔎 Jawapan: ${question.name}`;
}

function finishQuiz() {
  if (!isQuizActive) return;
  isQuizActive = false;
  clearInterval(timerId);
  const totalCorrect = answeredState.filter(item => item.state === 'correct').length;
  const savedBest = Number(localStorage.getItem('quiz-best-score') || 0);
  const bestScore = Math.max(savedBest, totalCorrect);
  localStorage.setItem('quiz-best-score', bestScore);
  document.getElementById('resultScore').innerHTML = `${totalCorrect}<span>/${TOTAL_QUESTIONS}</span>`;
  document.getElementById('resultCorrect').textContent = `${totalCorrect}/${TOTAL_QUESTIONS}`;
  document.getElementById('resultStreak').textContent = bestStreak;
  document.getElementById('bestScoreValue').textContent = `${bestScore}/${TOTAL_QUESTIONS}`;

  const resultTitle = document.getElementById('resultTitle');
  const resultCopy = document.getElementById('resultCopy');
  if (totalCorrect === TOTAL_QUESTIONS) {
    resultTitle.textContent = 'Legenda Teyvat.';
    resultCopy.textContent = 'Sempurna. Setiap wajah berjaya anda kenal. Paimon pun kagum!';
  } else if (totalCorrect >= 15) {
    resultTitle.textContent = 'Pengembara elit.';
    resultCopy.textContent = 'Memang padu. Pengetahuan Teyvat anda jauh melepasi biasa.';
  } else if (totalCorrect >= 8) {
    resultTitle.textContent = 'Makin kenal Teyvat.';
    resultCopy.textContent = 'Asas anda dah kuat. Satu lagi pusingan mungkin pecahkan rekod.';
  } else {
    resultTitle.textContent = 'Pengembaraan baru bermula.';
    resultCopy.textContent = 'Masih banyak wajah untuk dikenali. Cuba lagi dan buru skor lebih tinggi.';
  }

  quizCard.hidden = true;
  resultCard.hidden = false;
}

function handleSubmit() {
  if (!isQuizActive || answeredState[currentIndex].state !== 'pending') return;
  const guess = normalize(answerInput.value);
  if (!guess) {
    statusText.textContent = 'Sila taip jawapan dahulu.';
    return;
  }

  const question = quizList[currentIndex];
  if (question.aliases.some(alias => normalize(alias) === guess)) {
    answeredState[currentIndex] = { state: 'correct' };
    currentStreak += 1;
    bestStreak = Math.max(bestStreak, currentStreak);
    streakValue.textContent = currentStreak;
    updateScore();
    answerInput.disabled = true;
    submitBtn.disabled = true;
    giveUpBtn.disabled = true;
    statusText.textContent = currentStreak >= 3
      ? `🔥 ${currentStreak} streak! Betul, ini ${question.name}.`
      : `✓ Tepat! Ini ${question.name}. Teruskan streak anda.`;
  } else {
    currentStreak = 0;
    streakValue.textContent = currentStreak;
    statusText.textContent = 'Belum tepat. Cuba lagi, pengembara.';
  }
}

function nextQuestion() {
  if (!isQuizActive) return;
  if (currentIndex < TOTAL_QUESTIONS - 1) {
    currentIndex += 1;
    bindQuestion();
    return;
  }
  finishQuiz();
}

function prevQuestion() {
  if (isQuizActive && currentIndex > 0) {
    currentIndex -= 1;
    bindQuestion();
  }
}

function startQuiz() {
  clearInterval(timerId);
  quizList = shuffle(characters).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  answeredState = Array.from({ length: TOTAL_QUESTIONS }, () => ({ state: 'pending' }));
  secondsLeft = 900;
  currentStreak = 0;
  bestStreak = 0;
  isQuizActive = true;
  updateScore();
  streakValue.textContent = currentStreak;
  timerValue.textContent = formatTime(secondsLeft);
  bindQuestion();
  nextBtn.disabled = false;
  introCard.hidden = true;
  resultCard.hidden = true;
  quizCard.hidden = false;
  answerInput.focus();

  timerId = setInterval(() => {
    secondsLeft -= 1;
    timerValue.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      finishQuiz();
    }
  }, 1000);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('quiz-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️ Light';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  themeToggle.textContent = isLight ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('quiz-theme', isLight ? 'light' : 'dark');
}

window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  startQuizBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', handleSubmit);
  nextBtn.addEventListener('click', nextQuestion);
  prevBtn.addEventListener('click', prevQuestion);
  giveUpBtn.addEventListener('click', revealAnswer);
  newQuizBtn.addEventListener('click', startQuiz);
  answerInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  });

  themeToggle.addEventListener('click', toggleTheme);
});
