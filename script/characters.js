const grid = document.getElementById("grid");
const charSearch = document.getElementById("charSearch");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let allCharsData = [];
let currentRegion = 'all';
let currentWeapon = 'all';

const regions = [
  { key: 'all', label: 'Semua', image: 'images/regions/all.jpg' },
  { key: 'mondstadt', label: 'Mondstadt', image: 'images/regions/mondstadt.jpg' },
  { key: 'liyue', label: 'Liyue', image: 'images/regions/liyue.jpg' },
  { key: 'inazuma', label: 'Inazuma', image: 'images/regions/inazuma.jpg' },
  { key: 'sumeru', label: 'Sumeru', image: 'images/regions/sumeru.jpg' },
  { key: 'fontaine', label: 'Fontaine', image: 'images/regions/fontaine.jpg' },
  { key: 'natlan', label: 'Natlan', image: 'images/regions/natlan.jpg' },
  { key: 'nod-krai', label: 'Nod-Krai', image: 'images/regions/all.jpg' },
  { key: 'snezhnaya', label: 'Snezhnaya', image: 'images/regions/all.jpg' }
];

const apiEndpoints = [
  {
    name: 'genshin-db (GitHub)',
    listUrl: 'https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/characters',
    listParser: (data) => data
      .filter(file => file.type === 'file' && file.name.endsWith('.json'))
      .map(file => file.name.replace(/\.json$/, '')),
    detailUrl: (name) => `https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/English/characters/${name}.json`,
    imageMapUrl: 'https://raw.githubusercontent.com/theBowja/genshin-db/main/src/data/image/characters.json'
  },
  {
    name: 'genshin.jmp.blue',
    listUrl: 'https://genshin.jmp.blue/characters',
    detailUrl: (name) => `https://genshin.jmp.blue/characters/${name}`
  },
  {
    name: 'api.genshin.dev',
    listUrl: 'https://api.genshin.dev/characters',
    detailUrl: (name) => `https://api.genshin.dev/characters/${name.replace(/-/g, '_').toUpperCase()}`
  },
  {
    name: 'genshin-db-api',
    listUrl: 'https://genshin-db-api.vercel.app/api/characters',
    detailUrl: (name) => `https://genshin-db-api.vercel.app/api/characters/${name}`
  }
];

// Fungsi format slug untuk asset CDN rasmi
const formatImageSlug = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/['.]/g, '')
    .replace(/\s+/g, '');
};

async function tryFetchCharList(){
  for(const api of apiEndpoints){
    try{
      console.log(`Trying ${api.name}...`);
      const res = await fetch(api.listUrl);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const responseData = await res.json();
      const data = api.listParser ? api.listParser(responseData) : responseData;
      if(Array.isArray(data) && data.length > 0){
        console.log(`✅ Successfully fetched from ${api.name}`);
        return {api, list: data};
      }
    }catch(e){
      console.log(`❌ ${api.name} failed: ${e.message}`);
    }
  }
  throw new Error('All APIs failed');
}

async function fetchCharDetail(name, api){
  try{
    const url = api.detailUrl(name);
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }catch(e){
    console.log(`Failed to fetch ${name} from ${api.name}: ${e.message}`);
    return null;
  }
}

function normalizeImageKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

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

const verifiedFandomImages = {
  lanyan: 'https://images.wikia.com/gensin-impact/images/e/e6/Lan_Yan_Icon.png/revision/latest?cb=20250128195304',
  varka: 'https://images.wikia.com/gensin-impact/images/9/98/Varka_Icon.png/revision/latest?cb=20260119061922',
  yumemizukimizuki: 'https://images.wikia.com/gensin-impact/images/f/f6/Yumemizuki_Mizuki_Icon.png/revision/latest?cb=20250212014631'
};

async function fetchFandomImages(names) {
  const imageMap = { ...verifiedFandomImages };
  const fileNames = names.map(name => {
    const title = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return `${title} Icon.png`;
  });

  for (let start = 0; start < fileNames.length; start += 30) {
    const titles = fileNames.slice(start, start + 30).map(fileName => `File:${fileName}`).join('|');
    const url = `https://genshin-impact.fandom.com/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url&format=json&origin=*`;

    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const result = await response.json();
      Object.values(result.query?.pages || {}).forEach(page => {
        const imageUrl = page.imageinfo?.[0]?.url;
        if (imageUrl) {
          const fileName = page.title.replace(/^File:/, '').replace(/[_ ]Icon\.png$/i, '');
          imageMap[normalizeImageKey(fileName)] = imageUrl.replace('static.wikia.nocookie.net', 'images.wikia.com');
        }
      });
    } catch (error) {
      console.warn('Fandom image lookup failed:', error);
    }
  }

  return imageMap;
}

async function loadChars(region){
  currentRegion = region;
  grid.innerHTML = '<div class="loader">🔄 Memuatkan data watak...</div>';

  try{
    const {api, list} = await tryFetchCharList();
    let imageMap = {};
    if (api.imageMapUrl) {
      const imageResponse = await fetch(api.imageMapUrl);
      if (imageResponse.ok) imageMap = await imageResponse.json();
    }
    const fandomImages = await fetchFandomImages(list);
    console.log(`Fetching details for ${list.length} characters...`);
    const detailPromises = list.map(name =>
      fetchCharDetail(name, api).then(d => {
        if (!d) return null;
        const mappedImageData = imageMap[name] || imageMap[normalizeImageKey(name)] || {};
        return {
          nameKey: name,
          data: d,
          imageUrl: fandomImages[normalizeImageKey(name)]
            || mappedImageData['hoyolab-avatar']
            || mappedImageData.mihoyo_icon
            || mappedImageData.hoyowiki_icon
            || mappedImageData.image
            || mappedImageData.portrait
            || ''
        };
      }).catch(() => null)
    );
    const settled = await Promise.allSettled(detailPromises);
    allCharsData = settled.map(s => (s.status==='fulfilled' ? s.value : null)).filter(Boolean);
    if(allCharsData.length === 0){
      throw new Error('No character data retrieved');
    }
    console.log(`✅ Loaded ${allCharsData.length} characters`);
    renderList();
  }catch(e){
    console.error('Error loading characters:', e);
    grid.innerHTML = '<div class="loader">❌ Gagal memuat data. Sila cuba lagi.</div>';
  }
}

function renderList(){
  grid.innerHTML = '';
  const q = (charSearch.value || '').trim().toLowerCase();

  for(const item of allCharsData){
    const data = item.data;
    const nameKey = item.nameKey;
    if(!data) continue;
    const region = (data.nation || data.region || '').toLowerCase();
    const weaponType = getWeaponType(data);
    
    if(currentRegion !== 'all' && region !== currentRegion) continue;
    if(currentWeapon !== 'all' && weaponType !== currentWeapon) continue;
    if(q && (!data.name || !data.name.toLowerCase().includes(q))) continue;

    const div = document.createElement('div');
    div.className = 'card';
    
    const cleanKey = formatImageSlug(nameKey);
    const cleanName = formatImageSlug(data.name || '');

    // Utamakan imej daripada dataset karakter; CDN lama menjadi fallback.
    const mappedImg = item.imageUrl;
    const primaryImg = mappedImg || `https://genshin.jmp.blue/characters/${nameKey}/icon-big`;
    const secondaryImg = `https://genshin.jmp.blue/characters/${nameKey}/icon`;
    const tertiaryImg = `https://api.ambr.top/assets/UI/avatar/UI_AvatarIcon_${cleanKey}.png`;
    const fallbackImg = `https://api.ambr.top/assets/UI/avatar/UI_AvatarIcon_${cleanName}.png`;
    const placeholderImg = 'https://genshin.jmp.blue/elements/geo/icon';
    const imageSources = [primaryImg, secondaryImg, tertiaryImg, fallbackImg, placeholderImg]
      .filter((url, index, sources) => url && sources.indexOf(url) === index);

    const img = document.createElement('img');
    img.src = imageSources[0];
    img.alt = data.name || nameKey;

    // Sistem rantaian fallback sekiranya gambar gagal dimuat
    img.onerror = function() {
      const currentIndex = imageSources.indexOf(this.src);
      if (currentIndex >= 0 && currentIndex < imageSources.length - 1) {
        this.src = imageSources[currentIndex + 1];
      } else {
        this.style.display = 'none'; // Sembunyikan jika semua sumber gagal
      }
    };

    div.appendChild(img);

    const nameP = document.createElement('p');
    nameP.textContent = data.name || nameKey;
    div.appendChild(nameP);

    const small = document.createElement('small');
    small.textContent = data.nation || data.region || '';
    div.appendChild(small);

    const weapon = document.createElement('small');
    weapon.className = 'card-weapon-type';
    weapon.textContent = weaponType ? `⚔ ${weaponType}` : 'Jenis senjata tiada';
    div.appendChild(weapon);

    div.onclick = () => openDetail(nameKey);
    grid.appendChild(div);
  }

  if(grid.children.length === 0){
    grid.innerHTML = '<div class="loader">Tiada watak ditemui.</div>';
  }
}

function openDetail(name){
  window.location.href = `detail.html?name=${name}`;
}

function renderRegionButtons(){
  const container = document.getElementById('regionButtons');
  container.innerHTML = '';
  regions.forEach(region => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = region.key === currentRegion ? 'active' : '';
    button.dataset.region = region.key;
    button.innerHTML = `
      <img src="${region.image}" alt="${region.label}">
      <span>${region.label}</span>
    `;
    button.addEventListener('click', () => {
      loadChars(region.key);
      document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
    container.appendChild(button);
  });
}

function renderWeaponButtons() {
  const container = document.getElementById('weaponFilters');
  const weaponTypes = [
    { key: 'all', label: 'Semua', icon: '✦' },
    { key: 'Sword', label: 'Sword', icon: '⚔' },
    { key: 'Claymore', label: 'Claymore', icon: '🗡' },
    { key: 'Polearm', label: 'Polearm', icon: '🔱' },
    { key: 'Catalyst', label: 'Catalyst', icon: '✧' },
    { key: 'Bow', label: 'Bow', icon: '🏹' }
  ];

  container.innerHTML = '';
  weaponTypes.forEach(weapon => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = weapon.key === currentWeapon ? 'active' : '';
    button.setAttribute('aria-pressed', String(weapon.key === currentWeapon));
    button.innerHTML = `<span aria-hidden="true">${weapon.icon}</span>${weapon.label}`;
    button.addEventListener('click', () => {
      currentWeapon = weapon.key;
      container.querySelectorAll('button').forEach(filterButton => {
        const isActive = filterButton === button;
        filterButton.classList.toggle('active', isActive);
        filterButton.setAttribute('aria-pressed', String(isActive));
      });
      renderList();
    });
    container.appendChild(button);
  });
}

function loadTheme(){
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light');
    themeToggle.textContent = '☀️ Light';
  } else {
    themeToggle.textContent = '🌙 Dark';
  }
}

function toggleTheme(){
  body.classList.toggle('light');
  const isLight = body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

searchBtn.addEventListener('click', ()=>renderList());
charSearch.addEventListener('keyup', (e)=>{ if(e.key==='Enter') renderList(); });

renderRegionButtons();
renderWeaponButtons();
loadTheme();
loadChars('all');
themeToggle.addEventListener('click', toggleTheme);