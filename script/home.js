const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const gachaBtn = document.getElementById("gachaBtn");
const gachaBtn10 = document.getElementById("gachaBtn10");
const gachaDisplay = document.getElementById("gachaDisplay");
const pityValue = document.getElementById("pityValue");
const pityLabel = document.getElementById("pityLabel");
const pityLimit = document.getElementById("pityLimit");
const wishCount = document.getElementById("wishCount");
const wishHistory = document.getElementById("wishHistory");
const characterBannerTab = document.getElementById("characterBannerTab");
const weaponBannerTab = document.getElementById("weaponBannerTab");
const bannerEyebrow = document.getElementById("bannerEyebrow");
const bannerTitle = document.getElementById("bannerTitle");
const bannerSubtitle = document.getElementById("bannerSubtitle");

// --- 1. PENGURUSAN TEMA ---
function setTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  body.classList.toggle("light", nextTheme === "light");
  localStorage.setItem("theme", nextTheme);
  if (themeToggle) {
    themeToggle.textContent = nextTheme === "light" ? "☀️ Light" : "🌙 Dark";
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "light"));
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

// --- 3. WISH SIMULATOR (animasi sinematik) ---
const KEY = "gf.wish.v1";
const COL = { 3: "#6fb0ee", 4: "#b48cf5", 5: "#f4c65c" };
const norm = (s) => String(s).replace(/[^a-z0-9]/gi, "").toLowerCase();

let allCharacters = [];
let characterImageMap = {};
let allWeapons = [];

// Data dari genshin-db tiada rarity, jadi senarai 5★ ditetapkan di sini (tambah nama baru jika perlu)
const FIVE = new Set(("hutao diluc jean keqing mona qiqi tighnari dehya yelan nilou cyno nahida wanderer alhaitham ganyu xiao zhongli venti klee " +
  "tartaglia albedo kamisatoayaka yoimiya raidenshogun sangonomiyakokomi aratakiitto yaemiko shenhe kamisatoayato baizhu lyney neuvillette " +
  "wriothesley furina navia chiori arlecchino clorinde sigewinne emilie mualani kinich xilonen chasca mavuika citlali").split(" "));
const STD5 = ["diluc", "jean", "keqing", "mona", "qiqi", "tighnari", "dehya"];
const FEATURED = "hutao"; // watak utama banner
const SKIP = /traveler|aether|lumine|manekin|mannequin|anemo|geo$|electro|dendro|hydro|pyro|cryo/;
const NAME_FIX = { hutao: "Hu Tao" };
const FALLBACK = ["hu-tao","diluc","jean","keqing","mona","qiqi","tighnari","dehya","amber","barbara","beidou","bennett","chongyun","fischl","kaeya","lisa","ningguang","noelle","razor","sucrose","xiangling","xingqiu","xinyan","yanfei","diona"];
const W3 = [["cool-steel","Cool Steel"],["harbinger-of-dawn","Harbinger of Dawn"],["magic-guide","Magic Guide"],["black-tassel","Black Tassel"],["slingshot","Slingshot"],["sharpshooters-oath","Sharpshooter's Oath"],["raven-bow","Raven Bow"],["emerald-orb","Emerald Orb"],["debate-club","Debate Club"],["skyrider-sword","Skyrider Sword"]]
  .map(([id, n]) => ({ t: "w", id, n }));
const WEAPON_FIVE = new Set(("aquilafavonia amosbow aquasimulacra azurelight cashflowsupervision engulfinglightning everlastingmoonglow freedomsworn jadefallssplendor kagurasverity keyofkhajnisut lightoffoliarincision lostprayertothesacredwinds mistsplitterreforged primordialjadecutter primordialjadewingedspear redhornstonethresher songofbrokenpines staffofhoma summitshaper thunderingpulse tomeoftheeternalflow urakumisugiri vortexvanquisher wolfsgravestone" ).split(" "));

const formatSlug = (str) => str ? str.toLowerCase().replace(/ /g, '-') : '';
function formatCleanName(slug) {
  if (NAME_FIX[norm(slug)]) return NAME_FIX[norm(slug)];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];

async function initGacha() {
  try {
    const [listResponse, imageResponse, weaponResponse] = await Promise.all([
      fetch('https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/characters'),
      fetch('https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/image/characters.json'),
      fetch('https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/weapons')
    ]);
    if (!listResponse.ok) throw new Error(`Character list HTTP ${listResponse.status}`);
    const files = await listResponse.json();
    allCharacters = files
      .filter(file => file.type === 'file' && file.name.endsWith('.json'))
      .map(file => file.name.replace(/\.json$/, ''));
    if (imageResponse.ok) characterImageMap = await imageResponse.json();
    if (weaponResponse.ok) {
      const weaponFiles = await weaponResponse.json();
      allWeapons = weaponFiles
        .filter(file => file.type === "file" && file.name.endsWith(".json"))
        .map(file => file.name.replace(/\.json$/, ""));
    }
  } catch (err) {
    console.error("Gagal memuatkan data gacha (guna senarai sandaran):", err);
  }
}

function getCharacterImage(slug) {
  const key = norm(slug);
  const image = characterImageMap[slug] || characterImageMap[key] || {};
  return image['hoyowiki_icon'] || image['hoyolab-avatar'] || image.mihoyo_icon || image.image || `https://genshin.jmp.blue/characters/${slug}/icon`;
}
function getSplash(slug) {
  const image = characterImageMap[slug] || characterImageMap[norm(slug)] || {};
  return image.filename_gachaSplash ? `https://enka.network/ui/${image.filename_gachaSplash}.png` : `https://genshin.jmp.blue/characters/${slug}/gacha-splash`;
}

let S5 = [], P4 = [], featSlug = null;
function buildPools(list) {
  const ok = list.filter(s => !SKIP.test(norm(s)));
  S5 = ok.filter(s => STD5.includes(norm(s)));
  P4 = ok.filter(s => !FIVE.has(norm(s)));
  featSlug = ok.find(s => norm(s) === FEATURED) || null;
}
function ensurePools() {
  buildPools(allCharacters.length ? allCharacters : FALLBACK);
  if (!S5.length || !P4.length) buildPools(FALLBACK);
}

/* ---- State ---- */
let st = { p: 0, p5: 0, p4: 0, g: false, h: [], wp: 0, wp5: 0, wp4: 0, wh: [] };
try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
let activeBanner = "character";
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
const chr = (slug, r) => ({ r, t: "c", slug, n: formatCleanName(slug) });

function roll() {
  st.p++; st.p5++; st.p4++;
  const r5 = st.p5 >= 90 ? 1 : st.p5 >= 74 ? 0.006 + 0.06 * (st.p5 - 73) : 0.006;
  if (Math.random() < r5) {
    const feat = st.g || Math.random() < 0.5;
    st.g = !feat; st.p5 = 0;
    return chr(feat ? (featSlug || pick(S5)) : pick(S5), 5);
  }
  if (st.p4 >= 10 || Math.random() < 0.051) { st.p4 = 0; return chr(pick(P4), 4); }
  return { r: 3, ...pick(W3) };
}

function weapon(slug) {
  return { r: WEAPON_FIVE.has(norm(slug)) ? 5 : 4, t: "w", id: slug, n: formatCleanName(slug) };
}

function rollWeapon() {
  st.wp++; st.wp5++; st.wp4++;
  const fiveStars = allWeapons.filter(slug => WEAPON_FIVE.has(norm(slug)));
  const fourStars = allWeapons.filter(slug => !WEAPON_FIVE.has(norm(slug)));
  const r5 = st.wp5 >= 80 ? 1 : st.wp5 >= 63 ? 0.007 + 0.07 * (st.wp5 - 62) : 0.007;
  if (Math.random() < r5) { st.wp5 = 0; return weapon(pick(fiveStars.length ? fiveStars : W3.map(item => item.id))); }
  if (st.wp4 >= 10 || Math.random() < .06) { st.wp4 = 0; return weapon(pick(fourStars.length ? fourStars : W3.map(item => item.id))); }
  return { r: 3, ...pick(W3) };
}

/* ---- Gambar (ada fallback berlapis) ---- */
window.__gfImgErr = function (img) {
  if (img.dataset.fb) { img.src = img.dataset.fb; img.removeAttribute("data-fb"); return; }
  const b = document.createElement("b");
  b.className = "ph"; b.textContent = (img.alt || "?")[0];
  img.replaceWith(b);
};
function im(x, big, cls) {
  let src, fb = "";
  if (x.t === "w") src = `https://genshin.jmp.blue/weapons/${x.id}/icon`;
  else if (big) { src = getSplash(x.slug); fb = getCharacterImage(x.slug); }
  else src = getCharacterImage(x.slug);
  return `<img class="${cls}" src="${src}" ${fb ? `data-fb="${fb}"` : ""} alt="${x.n}" onerror="__gfImgErr(this)">`;
}

/* ---- Overlay ---- */
const wf = document.createElement("div");
wf.className = "wf"; wf.dataset.s = "fall";
wf.setAttribute("role", "dialog"); wf.setAttribute("aria-label", "Animasi wish");
wf.innerHTML = '<div class="wf-night"></div><div class="wf-sky"></div><div class="wf-met"></div><canvas class="wf-c"></canvas><div class="wf-rv"></div><div class="wf-res"><div class="wf-row"></div></div><div class="wf-flash"></div><div class="wf-hint">Klik watak untuk lihat detail</div><button class="wf-skip" type="button">Langkau ▸▸</button><button class="wf-x" type="button" aria-label="Tutup" hidden>×</button>';
document.body.appendChild(wf);
const cv = wf.querySelector("canvas"), cx = cv.getContext("2d"), rv = wf.querySelector(".wf-rv"), row = wf.querySelector(".wf-row");
const bSkip = wf.querySelector(".wf-skip"), bX = wf.querySelector(".wf-x");

/* ---- Zarah ---- */
let P = [], raf = 0;
const sz = () => { cv.width = innerWidth; cv.height = innerHeight; };
function burst(col, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, v = 2 + Math.random() * 9;
    P.push({ x: cv.width / 2, y: cv.height / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: col, s: 1 + Math.random() * 3 });
  }
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  P = P.filter(p => p.l > 0);
  for (const p of P) {
    p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy = p.vy * .97 + .06; p.l -= .011;
    cx.globalAlpha = Math.max(p.l, 0); cx.fillStyle = p.c;
    cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 6.283); cx.fill();
  }
  raf = wf.classList.contains("on") ? requestAnimationFrame(loop) : 0;
}

/* ---- Urutan animasi ---- */
let busy = false, skip = false, poke = null, last = [];
const set = (s) => { wf.dataset.s = s; };
const wait = (ms) => new Promise((r) => { const d = () => { clearTimeout(t); poke = null; r(); }; const t = setTimeout(d, ms); poke = d; });

function show(x) {
  const stars = [...Array(x.r)].map((_, i) => `<i style="--i:${i}">★</i>`).join("");
  rv.innerHTML = `<div class="rv r${x.r}">${im(x, true, "rv-img")}<div class="rv-info"><div class="rv-st">${stars}</div><h2>${x.n}</h2></div></div>`;
  burst(COL[x.r], x.r === 5 ? 140 : 60);
}

async function run(rs) {
  skip = false; last = rs;
  const best = Math.max(...rs.map(x => x.r));
  wf.style.setProperty("--m", COL[best]);
  sz(); wf.classList.add("on"); bX.hidden = true; bSkip.hidden = false;
  set("fall"); cancelAnimationFrame(raf); loop();
  await wait(2700);
  for (const x of rs.filter(x => x.r >= 4)) {
    if (skip) break;
    set("reveal"); show(x);
    await wait(x.r === 5 ? 3400 : 1700);
  }
  set("result");
  row.innerHTML = rs.map((x, i) => `<div class="wc r${x.r}" ${x.t === "c" ? `data-slug="${x.slug}"` : ""} style="--d:${(i * 0.16).toFixed(2)}s">${im(x, false, "wc-i")}<div class="wc-n">${x.n}</div><div class="wc-s">${"★".repeat(x.r)}</div></div>`).join("");
  if (best === 5) setTimeout(() => burst(COL[5], 120), 350);
  bSkip.hidden = true; bX.hidden = false; bX.focus();
}

function closeWish() {
  if (bX.hidden) return;
  wf.classList.remove("on"); busy = false; rv.innerHTML = "";
  updateUI();
}

function renderBanner() {
  const isWeapon = activeBanner === "weapon";
  last = [];
  if (gachaDisplay) {
    gachaDisplay.className = "gacha-display";
    gachaDisplay.innerHTML = '<div class="misteri-icon">✦</div><p class="misteri-text">Make a wish</p>';
  }
  document.body.classList.toggle("weapon-mode", isWeapon);
  characterBannerTab?.classList.toggle("is-active", !isWeapon);
  weaponBannerTab?.classList.toggle("is-active", isWeapon);
  characterBannerTab?.setAttribute("aria-selected", String(!isWeapon));
  weaponBannerTab?.setAttribute("aria-selected", String(isWeapon));
  if (bannerEyebrow) bannerEyebrow.textContent = isWeapon ? "⚔ Weapon Event Wish" : "✨ Character Event Wish";
  if (bannerTitle) bannerTitle.textContent = isWeapon ? "Epitome Invocation" : "Character Chronicle";
  if (bannerSubtitle) bannerSubtitle.textContent = isWeapon ? "Senjata terkini daripada genshin-db" : "Watak terkini daripada genshin-db";
  if (pityLabel) pityLabel.textContent = isWeapon ? "Weapon Pity" : "Character Pity";
  if (pityLimit) pityLimit.textContent = isWeapon ? "80" : "90";
  updateUI();
}

/* ---- UI halaman home ---- */
function updateUI() {
  const isWeapon = activeBanner === "weapon";
  if (pityValue) pityValue.textContent = isWeapon ? st.wp5 : st.p5;
  if (wishCount) wishCount.textContent = isWeapon ? st.wp : st.p;
  if (wishHistory) wishHistory.innerHTML = (isWeapon ? st.wh : st.h).slice(0, 20).map(x => `<span class="wh r${x.r}">${"★".repeat(x.r)} ${x.n}</span>`).join("");
  if (gachaDisplay && last.length) {
    const b = last.reduce((a, x) => x.r > a.r ? x : a);
    gachaDisplay.className = "gacha-display";
    gachaDisplay.innerHTML = `<div class="last">${im(b, false, "")}<strong>${b.n}</strong><span>${"★".repeat(b.r)}</span></div>`;
  }
}

let ready = null;
async function wish(n) {
  if (busy) return;
  busy = true;
  await ready;
  ensurePools();
  const rs = []; for (let i = 0; i < n; i++) rs.push(activeBanner === "weapon" ? rollWeapon() : roll());
  const history = rs.map(x => ({ r: x.r, n: x.n })).reverse();
  if (activeBanner === "weapon") st.wh = history.concat(st.wh).slice(0, 30);
  else st.h = history.concat(st.h).slice(0, 30);
  save(); run(rs);
}

ready = initGacha();
if (gachaBtn) gachaBtn.addEventListener("click", () => wish(1));
if (gachaBtn10) gachaBtn10.addEventListener("click", () => wish(10));
characterBannerTab?.addEventListener("click", () => { if (!busy) { activeBanner = "character"; renderBanner(); } });
weaponBannerTab?.addEventListener("click", () => { if (!busy) { activeBanner = "weapon"; renderBanner(); } });

wf.addEventListener("click", (e) => {
  const card = e.target.closest(".wc[data-slug]");
  if (card && wf.dataset.s === "result") { window.location.href = `detail.html?name=${encodeURIComponent(card.dataset.slug)}`; return; }
  if (e.target === bX) closeWish();
  else if (e.target === bSkip) { skip = true; poke && poke(); }
  else if (poke) poke();
});
addEventListener("keydown", (e) => {
  if (!wf.classList.contains("on")) return;
  if (e.key === "Escape") closeWish();
  else if ((e.key === " " || e.key === "Enter") && e.target === document.body) { if (!bX.hidden) closeWish(); else if (poke) poke(); }
});
addEventListener("resize", sz);
updateUI();
renderBanner();

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