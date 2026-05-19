const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const gachaBtn = document.getElementById("gachaBtn");
const gachaDisplay = document.getElementById("gachaDisplay");

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

// --- 2. LOGIK GACHA ROULETTE ---
let allCharacters = [];

// Fungsi format teks
const formatSlug = (str) => str ? str.toLowerCase().replace(/ /g, '-') : '';
function formatCleanName(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Ambil senarai watak daripada API terlebih dahulu bersiap sedia
async function initGacha() {
  try {
    const res = await fetch("https://genshin.jmp.blue/characters");
    if (res.ok) {
      allCharacters = await res.json();
    }
  } catch (err) {
    console.error("Gagal memuatkan data gacha:", err);
  }
}

// Fungsi utama pusingan gacha rawak
async function dapatkanGacha() {
  if (allCharacters.length === 0) {
    gachaDisplay.innerHTML = `<p style="color:red;">Data tidak tersedia. Sila semak internet.</p>`;
    return;
  }

  // Kunci butang semasa animasi berjalan
  gachaBtn.disabled = true;
  gachaDisplay.className = "gacha-display animasi-pusing";
  gachaDisplay.innerHTML = `
    <div class="misteri-icon">💫</div>
    <h3 style="margin:0;">Menyeru...</h3>
    <p class="misteri-text">Menetapkan takdir bintang...</p>
  `;

  // Simulasi pusingan gacha selama 2 saat
  setTimeout(() => {
    // Pilih satu watak secara rawak
    const randomSlug = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    const cleanName = formatCleanName(randomSlug);
    const iconUrl = `https://genshin.jmp.blue/characters/${randomSlug}/icon`;

    // Kemas kini paparan keputusan gacha
    gachaDisplay.className = "gacha-display terbuka";
    gachaDisplay.innerHTML = `
      <p style="color:#ffc107; font-weight:bold; margin:0 0 10px; font-size:0.9rem;">⭐ KEPUTUSAN SERUAN ⭐</p>
      <img src="${iconUrl}" alt="${cleanName}" class="gacha-char-img" onerror="this.src='https://genshin.jmp.blue/elements/anemo/icon'">
      <h2 style="margin:5px 0; font-size:1.4rem;">${cleanName}</h2>
      <p style="font-size:0.85rem; opacity:0.7; margin:10px 0 0;">✨ Klik kad ini untuk melihat info & build team ✨</p>
    `;

    // Beri fungsi klik pada kad untuk pergi terus ke detail.html
    gachaDisplay.onclick = () => {
      window.location.href = `detail.html?name=${encodeURIComponent(randomSlug)}`;
    };

    // Buka semula kunci butang
    gachaBtn.disabled = false;
  }, 2000);
}

// Jalankan persediaan dan pasang event listener
initGacha();
if (gachaBtn) {
  gachaBtn.addEventListener("click", dapatkanGacha);
}