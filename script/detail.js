const params = new URLSearchParams(window.location.search);
let currentName = params.get("name") || "furina"; // Default watak jika tiada parameter

const charNameEl = document.getElementById("charName");
const charLevelEl = document.getElementById("charLevel");
const rarityStarsEl = document.getElementById("rarityStars");
const charImgEl = document.getElementById("charImg");
const weaponTypeNameEl = document.getElementById('weaponTypeName');
const weaponTypeIconEl = document.getElementById('weaponTypeIcon');
const weaponTypeSourceEl = document.getElementById('weaponTypeSource');
const characterScrollRow = document.getElementById("characterScrollRow");
const themeToggle = document.getElementById("themeToggle");

const characterDataUrls = [
  (slug) => `https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/English/characters/${slug}.json`,
  (slug) => `https://genshin.jmp.blue/characters/${slug}`
];

const characterImageMapPromise = fetch('https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/image/characters.json')
  .then(response => response.ok ? response.json() : {})
  .catch(() => ({}));

// Fungsi format slug API
const formatSlug = (str) => str ? str.toLowerCase().replace(/ /g, '-') : '';
const formatCleanName = (slug) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function getWeaponType(data) {
  const rawWeapon = data.weaponText || data.weapon || data.weaponType || '';
  const rawValue = typeof rawWeapon === 'string' ? rawWeapon : rawWeapon.name || rawWeapon.type || '';
  const value = rawValue.toLowerCase();
  if (value.includes('claymore')) return 'Claymore';
  if (value.includes('polearm')) return 'Polearm';
  if (value.includes('catalyst')) return 'Catalyst';
  if (value.includes('bow')) return 'Bow';
  if (value.includes('sword')) return 'Sword';
  return '';
}

// 1. Urus Tema Terang/Gelap
function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  if (themeToggle) themeToggle.textContent = theme === "light" ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains("light");
    setTheme(isLight ? "dark" : "light");
  });
}
setTheme(localStorage.getItem('theme') || "dark");

// 2. Muat Senarai Karusel Watak di Atas
async function initCarousel() {
  try {
    const res = await fetch('https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/characters');
    if (!res.ok) return;
    const files = await res.json();
    const slugs = files.filter(file => file.type === 'file' && file.name.endsWith('.json'))
      .map(file => file.name.replace(/\.json$/, ''));
    const imageMap = await characterImageMapPromise;
    
    characterScrollRow.innerHTML = "";
    slugs.forEach(slug => {
      const imageData = imageMap[slug] || imageMap[slug.replace(/[^a-z0-9]/gi, '').toLowerCase()] || {};
      const iconUrl = imageData['hoyolab-avatar'] || imageData.hoyowiki_icon || imageData.mihoyo_icon || `https://genshin.jmp.blue/characters/${slug}/icon`;
      const div = document.createElement("div");
      div.className = `char-mini-icon ${slug === formatSlug(currentName) ? 'active' : ''}`;
      div.innerHTML = `<img src="${iconUrl}" alt="${slug}" onerror="this.style.display='none'">`;
      
      div.addEventListener("click", () => {
        currentName = slug;
        window.history.pushState({}, '', `?name=${slug}`);
        loadCharacterDetails(slug);
        
        document.querySelectorAll('.char-mini-icon').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
      });

      characterScrollRow.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal memuatkan karusel watak:", err);
  }
}

// 3. Muat Data Watak Terperinci & Build Game8
async function loadCharacterDetails(slug) {
  try {
    let data = null;
    const formattedSlug = formatSlug(slug);
    for (const makeUrl of characterDataUrls) {
      const res = await fetch(makeUrl(formattedSlug));
      if (res.ok) {
        data = await res.json();
        break;
      }
    }
    if (!data) throw new Error("Watak tidak dijumpai");

    const weaponType = getWeaponType(data);
    const weaponIcons = { Sword: '⚔️', Claymore: '🗡️', Polearm: '🔱', Catalyst: '✨', Bow: '🏹' };
    weaponTypeNameEl.textContent = weaponType || 'Data tidak tersedia';
    weaponTypeIconEl.textContent = weaponIcons[weaponType] || '⚔️';
    weaponTypeSourceEl.textContent = weaponType
      ? 'Kategori senjata daripada data API watak'
      : 'Respons API ini tidak menyertakan jenis senjata.';

    // Paparkan Nama & Gambar Gacha Splash / Portrait
    charNameEl.textContent = data.name || formatCleanName(slug);
    charImgEl.alt = data.name || formatCleanName(slug);
    const imageMap = await characterImageMapPromise;
    const imageData = imageMap[formattedSlug] || imageMap[formattedSlug.replace(/[^a-z0-9]/gi, '')] || {};
    charImgEl.src = imageData.hoyowiki_icon || imageData['hoyolab-avatar'] || imageData.mihoyo_icon || `https://genshin.jmp.blue/characters/${formattedSlug}/gacha-splash`;
    charImgEl.onerror = () => {
      charImgEl.src = `https://genshin.jmp.blue/characters/${formattedSlug}/icon-big`;
    };

    // Paparkan paras dan rarity jika tersedia
    charLevelEl.textContent = data.level || 90;
    rarityStarsEl.textContent = '⭐'.repeat(data.rarity || 5);

    // Rawak anggaran stat UI
    document.getElementById("statHp").textContent = Math.floor(12000 + Math.random() * 5000);
    document.getElementById("statAtk").textContent = Math.floor(1100 + Math.random() * 600);
    document.getElementById("statDef").textContent = Math.floor(600 + Math.random() * 300);
    document.getElementById("statCritRate").textContent = (5.0 + Math.random() * 45).toFixed(1) + "%";
    document.getElementById("statCritDmg").textContent = (50.0 + Math.random() * 120).toFixed(1) + "%";
    document.getElementById("statHealing").textContent = (data.healingBonus || 0).toFixed(1) + "%";
    document.getElementById("statEm").textContent = Math.floor(data.elementalMastery || Math.random() * 250);
    document.getElementById("statEr").textContent = ((data.energyRecharge || 100) + Math.random() * 20).toFixed(1) + "%";
    document.getElementById("statElemBonus").textContent = ((data.elementalDmgBonus || 0) + Math.random() * 15).toFixed(1) + "%";

  } catch (err) {
    console.error("Ralat memuatkan data watak:", err);
    charNameEl.textContent = "Watak Tidak Dijumpai";
    charImgEl.src = "";
    weaponTypeNameEl.textContent = 'Data tidak tersedia';
    weaponTypeSourceEl.textContent = 'Gagal mendapatkan data jenis senjata.';
  }
}

// Mulakan proses
initCarousel();
loadCharacterDetails(currentName);