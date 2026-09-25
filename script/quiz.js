const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const newQuizBtn = document.getElementById('newQuizBtn');
const questionImage = document.getElementById('questionImage');
const statusText = document.getElementById('statusText');
const scoreValue = document.getElementById('scoreValue');
const progressValue = document.getElementById('progressValue');
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
  { slug: 'jean', name: 'Jean', aliases: ['jean'] },
  { slug: 'fischl', name: 'Fischl', aliases: ['fischl'] },
  { slug: 'albedo', name: 'Albedo', aliases: ['albedo'] },
  { slug: 'mona', name: 'Mona', aliases: ['mona'] },
  { slug: 'bennett', name: 'Bennett', aliases: ['bennett'] },
  { slug: 'noelle', name: 'Noelle', aliases: ['noelle'] },
  { slug: 'klee', name: 'Klee', aliases: ['klee'] },
  { slug: 'barbara', name: 'Barbara', aliases: ['barbara'] },
  { slug: 'xinyan', name: 'Xinyan', aliases: ['xinyan'] },
  { slug: 'sara', name: 'Kujou Sara', aliases: ['kujousara', 'kujou sara', 'sara'] }
];

const TOTAL_QUESTIONS = 20;
let quizList = [];
let currentIndex = 0;
let answeredState = [];
let timerId = null;
let secondsLeft = 900;

function normalize(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
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
  answerInput.value = '';
  answerInput.disabled = false;
  submitBtn.disabled = false;
  giveUpBtn.disabled = false;
  statusText.textContent = 'Taip jawapan dan klik Semak. Jika anda tidak pasti, gunakan Give Up.';

  const current = answeredState[currentIndex];
  if (current.state === 'correct') {
    answerInput.value = question.name;
    answerInput.disabled = true;
    statusText.textContent = `✅ Betul — ${question.name}`;
  } else if (current.state === 'skipped') {
    answerInput.disabled = true;
    statusText.textContent = `🔎 Jawapan: ${question.name}`;
  }

  prevBtn.disabled = currentIndex === 0;
  nextBtn.textContent = currentIndex === TOTAL_QUESTIONS - 1 ? 'Selesai' : 'Next →';
}

function revealAnswer() {
  const question = quizList[currentIndex];
  answeredState[currentIndex] = { state: 'skipped' };
  answerInput.disabled = true;
  statusText.textContent = `🔎 Jawapan: ${question.name}`;
  updateScore();
}

function finishQuiz() {
  clearInterval(timerId);
  const totalCorrect = answeredState.filter(item => item.state === 'correct').length;
  statusText.textContent = `🎉 Kuiz selesai! Skor akhir anda ialah ${totalCorrect}/${TOTAL_QUESTIONS}.`;
  submitBtn.disabled = true;
  giveUpBtn.disabled = true;
  nextBtn.disabled = true;
  answerInput.disabled = true;
}

function handleSubmit() {
  const guess = normalize(answerInput.value);
  if (!guess) {
    statusText.textContent = 'Sila taip jawapan dahulu.';
    return;
  }

  const question = quizList[currentIndex];
  if (question.aliases.some(alias => normalize(alias) === guess)) {
    if (answeredState[currentIndex].state !== 'correct') {
      answeredState[currentIndex] = { state: 'correct' };
    }
    updateScore();
    answerInput.disabled = true;
    statusText.textContent = `✅ Betul! Jawapan ialah ${question.name}. Tekan Next untuk soalan seterusnya.`;
  } else {
    statusText.textContent = '✖ Jawapan tidak tepat. Cuba lagi atau tekan Give Up.';
  }
}

function nextQuestion() {
  if (currentIndex < TOTAL_QUESTIONS - 1) {
    currentIndex += 1;
    bindQuestion();
    return;
  }
  finishQuiz();
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    bindQuestion();
  }
}

function resetQuiz() {
  clearInterval(timerId);
  quizList = shuffle(characters).slice(0, TOTAL_QUESTIONS);
  currentIndex = 0;
  answeredState = Array.from({ length: TOTAL_QUESTIONS }, () => ({ state: 'pending' }));
  secondsLeft = 900;
  updateScore();
  timerValue.textContent = formatTime(secondsLeft);
  bindQuestion();
  submitBtn.disabled = false;
  giveUpBtn.disabled = false;
  nextBtn.disabled = false;
  answerInput.disabled = false;

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
  resetQuiz();
  submitBtn.addEventListener('click', handleSubmit);
  nextBtn.addEventListener('click', nextQuestion);
  prevBtn.addEventListener('click', prevQuestion);
  giveUpBtn.addEventListener('click', revealAnswer);
  newQuizBtn.addEventListener('click', resetQuiz);
  answerInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  });

  themeToggle.addEventListener('click', toggleTheme);
});
