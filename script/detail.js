const params = new URLSearchParams(window.location.search);
const name = params.get("name");

const charName = document.getElementById("charName");
const charTitle = document.getElementById("charTitle");
const charImg = document.getElementById("charImg");
const charDescription = document.getElementById("charDescription");
const tags = document.getElementById("tags");
const visionField = document.getElementById("vision");
const weaponTypeField = document.getElementById("weaponType");
const nationField = document.getElementById("nation");
const affiliationField = document.getElementById("affiliation");
const rarityField = document.getElementById("rarity");
const constellationNameField = document.getElementById("constellationName");
const birthdayField = document.getElementById("birthday");
const releaseDateField = document.getElementById("releaseDate");
const talentGrid = document.getElementById("talentGrid");
const passiveGrid = document.getElementById("passiveGrid");
const materialGrid = document.getElementById("materialGrid");
const constellationGrid = document.getElementById("constellationGrid");
const recommendGrid = document.getElementById("recommendGrid");
const themeToggle = document.getElementById('themeToggle');

// Fungsi pembantu format teks untuk API & CDN
const formatSlug = (str) => str ? str.toLowerCase().replace(/_/g, '-') : '';
const formatToCdnName = (str) => str ? str.replace(/ /g, '_') : '';

const weaponRecommendations = {
  SWORD: ['mistsplitter-reforged','aquila-favonia','primordial-jade-cutter'],
  CLAYMORE: ['wolfs-gravestone','song-of-broken-pines','serpent-spine'],
  POLEARM: ['staff-of-homa','primordial-jade-winged-spear','skyward-spine'],
  BOW: ['thundering-pulse','amos-bow','polar-star'],
  CATALYST: ['lost-prayer-to-the-sacred-winds','skyward-atlas','kaguras-verity']
};

const teamRecommendations = {
  CRYO: ['kamisato-ayaka','kamisato-ayato','sangonomiya-kokomi','zhongli'],
  PYRO: ['hu-tao','xiao','bennett','zhongli'],
  HYDRO: ['xingqiu','mona','sangonomiya-kokomi','jean'],
  ANEMO: ['kaedehara-kazuha','venti','sucrose','albedo'],
  ELECTRO: ['raiden-shogun','fischl','beidou','kuki-shinobu'],
  DENDRO: ['tighnari','collei','yae-miko','nilou'],
  GEO: ['zhongli','albedo','noelle','gorou']
};

function getWeaponIconUrl(slug) {
  return `https://genshin.jmp.blue/weapons/${formatSlug(slug)}/icon`;
}

function getCharacterIconUrl(charName) {
  return `https://genshin.jmp.blue/characters/${formatSlug(charName)}/icon`;
}

function getMaterialCdnUrl(matName) {
  return `https://api.ambr.top/assets/UI/${formatToCdnName(matName)}.png`;
}

async function fetchWeaponData(slug) {
  try {
    const res = await fetch(`https://genshin.jmp.blue/weapons/${formatSlug(slug)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function fetchCharacterData(charName) {
  try {
    const res = await fetch(`https://genshin.jmp.blue/characters/${formatSlug(charName)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "light" ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  setTheme(savedTheme === 'light' ? 'light' : 'dark');
}

function createCard(content) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = content;
  return card;
}

function renderList(items, container) {
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => container.appendChild(item));
}

function setLoadingState(message) {
  if (charName) charName.textContent = 'Loading...';
  if (charDescription) charDescription.textContent = message;
}

function createMaterialCard(name) {
  const card = document.createElement('div');
  card.className = 'card material-card';
  
  card.innerHTML = `
    <img src="${getMaterialCdnUrl(name)}" alt="${name}" class="mat-img" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto 8px; display: block;">
    <p style="font-size: 0.9rem; margin: 0;">${name}</p>
  `;
  
  const img = card.querySelector('.mat-img');
  img.onerror = () => {
    img.src = 'https://genshin.jmp.blue/materials/common-currency/mora'; 
  };
  return card;
}

function createTalentCard(title, description, vision, typeLabel) {
  const visionSlug = formatSlug(vision || 'anemo');
  return createCard(`
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; text-align: left;">
      <img src="https://genshin.jmp.blue/elements/${visionSlug}/icon" alt="${vision}" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; padding: 4px; flex-shrink: 0;">
      <div>
        <h3 style="margin: 0; font-size: 1.1rem;">${title}</h3>
        <small style="color: #ffc107; font-weight: bold;">${typeLabel}</small>
      </div>
    </div>
    <p style="text-align: left; margin: 0; font-size: 0.95rem; line-height: 1.5; opacity: 0.9;">${description}</p>
  `);
}

function createConstellationCard(constellation, index, vision) {
  const visionSlug = formatSlug(vision || 'anemo');
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; text-align: left;">
      <img src="https://genshin.jmp.blue/elements/${visionSlug}/icon" alt="${vision}" style="width: 40px; height: 40px; opacity: 0.8; flex-shrink: 0;">
      <h3 style="margin: 0; font-size: 1.1rem;">C${index}: ${constellation.name}</h3>
    </div>
    <p style="text-align: left; margin: 0; font-size: 0.95rem; line-height: 1.5; opacity: 0.9;">${constellation.effect || constellation.info || constellation.description || ''}</p>
  `;
  return card;
}

function createRecommendCard(content) {
  const card = document.createElement('div');
  card.className = 'recommend-card';
  card.innerHTML = content;
  return card;
}

function createWeaponRecommendCard(slug, weaponData) {
  const card = createRecommendCard(`
    <img src="${getWeaponIconUrl(slug)}" alt="${weaponData?.name || slug}" loading="lazy" class="rec-wpn-img">
    <h3>${weaponData?.name || slug}</h3>
    <p class="recommend-label">Weapon</p>
    <p class="recommend-type">${weaponData?.type || 'Weapon'}</p>
    <p>${weaponData?.passiveDesc || 'Rekomendasi senjata untuk watak ini.'}</p>
  `);

  const img = card.querySelector('.rec-wpn-img');
  img.onerror = () => {
    img.src = 'https://genshin.jmp.blue/weapons/dull-blade/icon';
  };
  return card;
}

function createTeamRecommendCard(memberKey, memberData) {
  const card = createRecommendCard(`
    <img src="${getCharacterIconUrl(memberKey)}" alt="${memberData?.name || memberKey}" loading="lazy" class="rec-char-img">
    <h3>${memberData?.name || memberKey}</h3>
    <p class="recommend-label">Vision</p>
    <p class="recommend-type">${memberData?.vision || 'Unknown'} • ${memberData?.weapon || 'Unknown'}</p>
    <p>${memberData?.nation ? `Dari ${memberData.nation}` : 'Anggota tim yang baik.'}</p>
  `);

  const img = card.querySelector('.rec-char-img');
  img.onerror = () => {
    img.src = `https://genshin.jmp.blue/elements/${formatSlug(memberData?.vision || 'anemo')}/icon`;
  };
  return card;
}

async function loadChar() {
  if (!name) {
    if (charName) charName.textContent = "Watak tidak ditentukan";
    if (charDescription) charDescription.textContent = "Sila pilih watak dari halaman characters.";
    return;
  }

  setLoadingState('Memuat maklumat watak...');

  try {
    const res = await fetch(`https://genshin.jmp.blue/characters/${formatSlug(name)}`);
    if (!res.ok) throw new Error("Gagal mengambil data dari API.");
    
    const data = await res.json();
    
    if (charName) charName.textContent = data.name;
    if (charTitle) charTitle.textContent = data.title || "";
    if (charDescription) charDescription.textContent = data.description || "Tiada deskripsi tersedia.";

    const splashUrls = [
      `https://genshin.jmp.blue/characters/${formatSlug(name)}/portrait`,
      `https://genshin.jmp.blue/characters/${formatSlug(name)}/gacha-splash`,
      `https://genshin.jmp.blue/characters/${formatSlug(name)}/icon-big`
    ];

    let imgIndex = 0;
    if (charImg) {
      charImg.src = splashUrls[imgIndex];
      charImg.onerror = () => {
        imgIndex++;
        if (imgIndex < splashUrls.length) {
          charImg.src = splashUrls[imgIndex];
        } else {
          charImg.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.textContent = 'Gambar Utama Tidak Tersedia';
          placeholder.style.cssText = 'padding: 40px; text-align: center; color: rgba(255,255,255,0.5); font-style: italic; border: 1px dashed #555;';
          charImg.parentNode.appendChild(placeholder);
        }
      };
    }

    if (tags) {
      tags.innerHTML = `
        <span class="tag">${data.vision || 'Unknown'}</span>
        <span class="tag">${data.weapon || 'Unknown'}</span>
        <span class="tag">${data.nation || 'Unknown'}</span>
        <span class="tag">${data.rarity || '0'} ⭐</span>
      `;
    }

    if (visionField) visionField.textContent = data.vision || '-';
    if (weaponTypeField) weaponTypeField.textContent = data.weapon || '-';
    if (nationField) nationField.textContent = data.nation || '-';
    if (affiliationField) affiliationField.textContent = data.affiliation || '-';
    if (rarityField) rarityField.textContent = data.rarity ? `${data.rarity} ⭐` : '-';
    if (constellationNameField) constellationNameField.textContent = data.constellation || '-';
    if (birthdayField) birthdayField.textContent = data.birthday || '-';
    if (releaseDateField) releaseDateField.textContent = data.release || '-';

    const talentLabels = ['Normal Attack', 'Elemental Skill', 'Elemental Burst'];
    const talentCards = data.skillTalents?.map((talent, index) => createTalentCard(
      talent.name,
      talent.description || 'Deskripsi tidak tersedia.',
      data.vision,
      talentLabels[index] || 'Active Skill'
    )) || [];
    renderList(talentCards, talentGrid);

    const passiveCards = data.passiveTalents?.map((passive, index) => createTalentCard(
      passive.name,
      passive.description || 'Deskripsi tidak tersedia.',
      data.vision,
      `Passive Talent ${index + 1}`
    )) || [];
    renderList(passiveCards, passiveGrid);

    const constellationCards = data.constellations?.map((cons, i) => 
      createConstellationCard(cons, i + 1, data.vision)
    ) || [];
    renderList(constellationCards, constellationGrid);

    const materialCards = (data.materials || []).map((mat) => createMaterialCard(mat.name));
    renderList(materialCards, materialGrid);

    const weaponSlugs = weaponRecommendations[data.weapon?.toUpperCase()] || [];
    const teamKeys = teamRecommendations[data.vision?.toUpperCase()] || [];

    const weaponCards = await Promise.all(
      weaponSlugs.map(async (slug) => {
        const weaponData = await fetchWeaponData(slug);
        return createWeaponRecommendCard(slug, weaponData);
      })
    );

    const teamCards = await Promise.all(
      teamKeys.map(async (key) => {
        const memberData = await fetchCharacterData(key);
        return createTeamRecommendCard(key, memberData);
      })
    );

    renderList([...weaponCards, ...teamCards], recommendGrid);

  } catch (err) {
    console.error(err);
    if (charName) charName.textContent = 'Gagal memuatkan watak';
    if (charDescription) charDescription.textContent = 'Sila semak semula sambungan internet anda atau pilih watak lain.';
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  if (themeToggle) themeToggle.textContent = isLight ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

loadTheme();
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
loadChar();