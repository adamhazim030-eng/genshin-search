const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const gachaBtn = document.getElementById("gachaBtn");
const gachaDisplay = document.getElementById("gachaDisplay");
const pityValue = document.getElementById("pityValue");
const wishCount = document.getElementById("wishCount");
const wishHistory = document.getElementById("wishHistory");

// --- 1. PENGURUSAN TEMA ---
function setTheme(theme) {
  body.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
  }
}

const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(body.classList.contains("light") ? "dark" : "light");
  });
}

// --- 2. LOGIK DROPDOWN CHANNEL HOYOLAB ---
const channelToggle = document.getElementById("channelToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

if (channelToggle && dropdownMenu) {
  channelToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== channelToggle) {
      dropdownMenu.classList.remove("show");
    }
  });
}

// --- 3. LOGIK WISH SIMULATOR GACHA ---
let allCharacters = [];
let characterImageMap = {};
let pity = 0;
let totalWishes = 0;

const formatSlug = (str) => str ? str.toLowerCase().replace(/ /g, '-') : '';
function formatCleanName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Warna ikut rarity: 5★ = emas, 4★ = ungu, 3★ = biru
const RARITY_COLORS = {
  five:  { color: "#ffd76b", glow: "#fff3c4", deep: "#7a5200", label: "5 STAR" },
  four:  { color: "#c58bff", glow: "#e9d4ff", deep: "#3d1f66", label: "4 STAR" },
  three: { color: "#7ec9ff", glow: "#dff3ff", deep: "#1e4a73", label: "3 STAR" }
};

async function initGacha() {
  try {
    const [listResponse, imageResponse] = await Promise.all([
      fetch('https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/characters'),
      fetch('https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/image/characters.json')
    ]);
    if (!listResponse.ok) throw new Error(`Character list HTTP ${listResponse.status}`);
    const files = await listResponse.json();
    allCharacters = files
      .filter(file => file.type === 'file' && file.name.endsWith('.json'))
      .map(file => file.name.replace(/\.json$/, ''));
    if (imageResponse.ok) characterImageMap = await imageResponse.json();
  } catch (err) {
    console.error("Gagal memuatkan data gacha:", err);
  }
}

function getCharacterImage(slug) {
  const key = slug.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const image = characterImageMap[slug] || characterImageMap[key] || {};
  return image['hoyowiki_icon'] || image['hoyolab-avatar'] || image.mihoyo_icon || image.image || `https://genshin.jmp.blue/characters/${slug}/icon`;
}

// Suntik CSS animation sekali sahaja (meteor / letupan / diamond field)
let gachaStylesInjected = false;
function ensureGachaAnimStyles() {
  if (gachaStylesInjected) return;
  gachaStylesInjected = true;
  const style = document.createElement("style");
  style.id = "gacha-anim-styles";
  style.textContent = `
.gacha-display { --rarity-color:#ffd76b; --rarity-glow:#fff3c4; --rarity-deep:#7a5200; }

/* ---------- FASA 1: MENTEOR MELINTAS LANGIT ---------- */
.gacha-sky {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(180deg, #060814 0%, #101c3d 35%, #2f5f9e 68%, #bfe3ff 100%);
}
.sky-stars {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(2px 2px at 20% 20%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 60% 10%, #fff, transparent),
    radial-gradient(2px 2px at 80% 30%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 35% 40%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 90% 15%, #fff, transparent);
  opacity: 0.7;
  animation: twinkle 1.6s ease-in-out infinite alternate;
}
@keyframes twinkle { from { opacity: 0.3; } to { opacity: 0.85; } }

.meteor-group {
  position: absolute;
  top: -25%; left: -15%;
  width: 8px; height: 240px;
  transform: rotate(35deg);
  opacity: 0;
  animation: meteorFall 1.5s cubic-bezier(.3,.6,.35,1) forwards;
}
.meteor-group.side { width: 4px; height: 140px; opacity: 0; }
.meteor-group.side-a { animation: meteorFallSide 1.5s ease-in .1s forwards; top: -30%; left: 10%; }
.meteor-group.side-b { animation: meteorFallSide 1.5s ease-in .25s forwards; top: -35%; left: -30%; }

.meteor-tail {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent, var(--rarity-glow) 45%, var(--rarity-color) 100%);
  filter: blur(1.5px);
  border-radius: 50%;
}
.meteor-core {
  position: absolute; bottom: -4px; left: 50%;
  width: 14px; height: 14px;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 18px 6px var(--rarity-color), 0 0 40px 18px var(--rarity-glow);
}
.meteor-group.side .meteor-core { width: 8px; height: 8px; }

@keyframes meteorFall {
  0%   { top: -30%; left: -20%; opacity: 0; }
  12%  { opacity: 1; }
  100% { top: 58%; left: 58%; opacity: 1; }
}
@keyframes meteorFallSide {
  0%   { opacity: 0; }
  15%  { opacity: 0.85; }
  100% { top: 70%; opacity: 0; }
}

.sky-clouds { position: absolute; bottom: 0; left: 0; width: 100%; height: 90px; }
.sky-clouds span {
  position: absolute; bottom: -30px;
  width: 160px; height: 70px;
  background: #eaf6ff;
  border-radius: 50%;
  opacity: 0.9;
  filter: blur(1px);
}
.sky-clouds span:nth-child(1) { left: -20px; width: 220px; height: 90px; }
.sky-clouds span:nth-child(2) { left: 35%; width: 180px; height: 80px; bottom: -40px; }
.sky-clouds span:nth-child(3) { right: -30px; width: 240px; height: 100px; }

.meteor-caption {
  position: absolute; bottom: 12px; left: 0; right: 0;
  text-align: center; color: #fff; letter-spacing: 2px;
  font-size: 13px; text-shadow: 0 0 8px rgba(0,0,0,.6);
  margin: 0;
}

/* ---------- FASA 2: LETUPAN + DIAMOND FIELD + SILUET ---------- */
.gacha-burst {
  position: relative;
  width: 100%; height: 350px;
  overflow: hidden;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 55%, var(--rarity-deep) 0%, #0c0c14 70%);
  display: flex; align-items: center; justify-content: center;
}
.flash {
  position: absolute; top: 52%; left: 50%;
  width: 10px; height: 10px;
  background: #fff; border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 60px 30px var(--rarity-color);
  animation: flashExpand 0.7s ease-out forwards;
}
@keyframes flashExpand {
  0%   { width: 10px; height: 10px; opacity: 1; }
  55%  { width: 520px; height: 520px; opacity: 0.85; }
  100% { width: 760px; height: 760px; opacity: 0; }
}

.diamond-field { position: absolute; inset: 0; }
.diamond-field .diamond {
  position: absolute;
  width: 34px; height: 34px;
  background: linear-gradient(145deg, var(--rarity-glow), var(--rarity-color));
  border: 1px solid var(--rarity-glow);
  transform: rotate(45deg) scale(0);
  opacity: 0;
  box-shadow: 0 0 14px var(--rarity-color);
  animation: diamondPop 0.6s ease-out forwards;
}
.diamond-field .d0 { top: 15%; left: 20%; width: 26px; height: 26px; animation-delay: .05s; }
.diamond-field .d1 { top: 10%; left: 65%; width: 44px; height: 44px; animation-delay: .12s; }
.diamond-field .d2 { top: 60%; left: 12%; width: 30px; height: 30px; animation-delay: .18s; }
.diamond-field .d3 { top: 68%; left: 78%; width: 36px; height: 36px; animation-delay: .08s; }
.diamond-field .d4 { top: 30%; left: 8%;  width: 20px; height: 20px; animation-delay: .22s; }
.diamond-field .d5 { top: 22%; left: 85%; width: 22px; height: 22px; animation-delay: .16s; }
.diamond-field .d6 { top: 78%; left: 45%; width: 24px; height: 24px; animation-delay: .28s; }
.diamond-field .d7 { top: 5%;  left: 40%; width: 18px; height: 18px; animation-delay: .32s; }
.diamond-field .d8 { top: 50%; left: 50%; width: 60px; height: 60px; opacity: 0; animation: diamondPop 0.6s ease-out .02s forwards, diamondSpin 4s linear infinite; }
@keyframes diamondPop {
  0%   { transform: rotate(45deg) scale(0); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: rotate(45deg) scale(1); opacity: 0.9; }
}
@keyframes diamondSpin {
  from { transform: rotate(45deg) scale(1); }
  to   { transform: rotate(405deg) scale(1); }
}

.char-silhouette {
  position: relative;
  max-height: 320px;
  filter: brightness(0) drop-shadow(0 0 25px var(--rarity-color));
  opacity: 0.95;
  transition: filter 0.8s ease, opacity 0.8s ease, transform 0.8s ease;
  transform: translateY(10px) scale(0.96);
}
.char-silhouette.revealed {
  filter: brightness(1) drop-shadow(0 0 25px var(--rarity-color));
  transform: translateY(0) scale(1);
}

.wish-reveal .gacha-burst { transition: background 0.8s ease; }

.result-fade-in { animation: resultFadeIn 0.5s ease forwards; }
@keyframes resultFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
  document.head.appendChild(style);
}

// Fungsi satu wish dengan animation meteor -> letupan -> reveal (ikut warna rarity)
async function dapatkanGacha() {
  if (allCharacters.length === 0) {
    gachaDisplay.innerHTML = `<p style="color:red;">Data tidak tersedia. Sila semak internet.</p>`;
    return;
  }

  ensureGachaAnimStyles();
  gachaBtn.disabled = true;

  // Tentukan hasil pull dahulu supaya warna animation boleh dipadankan
  const randomSlug = allCharacters[Math.floor(Math.random() * allCharacters.length)];
  pity += 1;
  totalWishes += 1;
  const rarity = Math.random() < 0.05 ? 5 : (Math.random() < 0.25 ? 4 : 3);
  const pulledItem = {
    slug: randomSlug,
    name: formatCleanName(randomSlug),
    image: getCharacterImage(randomSlug),
    rarity
  };

  const rarityKey = rarity === 5 ? "five" : rarity === 4 ? "four" : "three";
  const rarityClass = `rarity-${rarityKey}`;
  const colors = RARITY_COLORS[rarityKey];
  gachaDisplay.style.setProperty("--rarity-color", colors.color);
  gachaDisplay.style.setProperty("--rarity-glow", colors.glow);
  gachaDisplay.style.setProperty("--rarity-deep", colors.deep);

  // FASA 1 — meteor melintas langit
  gachaDisplay.className = "gacha-display wish-animating";
  gachaDisplay.innerHTML = `
    <div class="gacha-sky">
      <div class="sky-stars"></div>
      <div class="meteor-group main"><div class="meteor-tail"></div><div class="meteor-core"></div></div>
      <div class="meteor-group side side-a"><div class="meteor-tail"></div><div class="meteor-core"></div></div>
      <div class="meteor-group side side-b"><div class="meteor-tail"></div><div class="meteor-core"></div></div>
      <div class="sky-clouds"><span></span><span></span><span></span></div>
      <p class="meteor-caption">MEMBELAH LANGIT TAKDIR...</p>
    </div>
  `;
  await wait(1500);

  // FASA 2 — letupan cahaya + diamond field + siluet watak
  gachaDisplay.className = "gacha-display wish-burst";
  gachaDisplay.innerHTML = `
    <div class="gacha-burst">
      <div class="flash"></div>
      <div class="diamond-field">
        ${Array.from({ length: 9 }).map((_, i) => `<span class="diamond d${i}"></span>`).join("")}
      </div>
      <img class="char-silhouette" src="${pulledItem.image}" alt="" onerror="this.style.display='none'">
    </div>
  `;
  await wait(900);

  // FASA 3 — reveal (siluet bertukar warna penuh)
  const silImg = gachaDisplay.querySelector(".char-silhouette");
  if (silImg) silImg.classList.add("revealed");
  await wait(800);

  // FASA 4 — kad hasil akhir (boleh klik untuk lihat detail)
  pityValue.textContent = pity >= 90 ? 0 : pity;
  wishCount.textContent = totalWishes;
  if (pity >= 90) pity = 0;
  wishHistory.insertAdjacentHTML("afterbegin", `<span>${pulledItem.name} • ${pulledItem.rarity}★</span>`);

  gachaDisplay.className = "gacha-display wish-results";
  gachaDisplay.innerHTML = `
    <button class="wish-result-card ${rarityClass} result-fade-in" type="button" onclick="window.location.href='detail.html?name=${encodeURIComponent(pulledItem.slug)}'">
      <span class="result-label">${colors.label}</span>
      <img src="${pulledItem.image}" alt="${pulledItem.name}" onerror="this.src='https://genshin.jmp.blue/elements/anemo/icon'">
      <strong>${pulledItem.name}</strong>
      <span>${"⭐".repeat(pulledItem.rarity)}</span>
    </button>
  `;

  gachaBtn.disabled = false;
}

initGacha();
if (gachaBtn) {
  gachaBtn.addEventListener("click", dapatkanGacha);
}

// --- 4. LOGIK MODAL LOGIN ---
const loginOverlay = document.getElementById("loginOverlay");
const loginClose = document.getElementById("loginClose");
const loginForm = document.getElementById("loginForm");
const userAvatarBtn = document.getElementById("userAvatarBtn");

function openLoginModal() {
  if (loginOverlay) loginOverlay.classList.add("visible");
}

function closeLoginModal() {
  if (loginOverlay) loginOverlay.classList.remove("visible");
}

if (loginClose) loginClose.addEventListener("click", closeLoginModal);

if (loginOverlay) {
  loginOverlay.addEventListener("click", (event) => {
    if (event.target === loginOverlay) closeLoginModal();
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    closeLoginModal();
  });
}

if (userAvatarBtn) {
  userAvatarBtn.addEventListener("click", openLoginModal);
}