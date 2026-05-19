const grid = document.getElementById("grid");
const charSearch = document.getElementById("charSearch");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let allCharsData = [];
let currentRegion = 'all';

const regions = [
  { key: 'all', label: 'Semua', image: 'images/regions/all.jpg' },
  { key: 'mondstadt', label: 'Mondstadt', image: 'images/regions/mondstadt.jpg' },
  { key: 'liyue', label: 'Liyue', image: 'images/regions/liyue.jpg' },
  { key: 'inazuma', label: 'Inazuma', image: 'images/regions/inazuma.jpg' },
  { key: 'sumeru', label: 'Sumeru', image: 'images/regions/sumeru.jpg' },
  { key: 'fontaine', label: 'Fontaine', image: 'images/regions/fontaine.jpg' },
  { key: 'natlan', label: 'Natlan', image: 'images/regions/natlan.jpg' },
  { key: 'snezhnaya', label: 'Snezhnaya', image: 'images/regions/all.jpg' }
];

const apiEndpoints = [
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

async function tryFetchCharList(){
  for(const api of apiEndpoints){
    try{
      console.log(`Trying ${api.name}...`);
      const res = await fetch(api.listUrl);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
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

async function loadChars(region){
  currentRegion = region;
  grid.innerHTML = '<div class="loader">🔄 Memuatkan data watak...</div>';

  try{
    const {api, list} = await tryFetchCharList();
    console.log(`Fetching details for ${list.length} characters...`);
    const detailPromises = list.map(name =>
      fetchCharDetail(name, api).then(d => d ? {nameKey:name, data:d} : null).catch(() => null)
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
    if(currentRegion !== 'all' && data.nation && data.nation.toLowerCase() !== currentRegion) continue;
    if(q && (!data.name || !data.name.toLowerCase().includes(q))) continue;

    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`
      <img src="https://genshin.jmp.blue/characters/${nameKey}/icon-big">
      <p>${data.name}</p>
      <small>${data.nation || ''}</small>
    `;
    div.onclick = ()=>openDetail(nameKey);
    grid.appendChild(div);
  }

  if(grid.children.length===0){
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
loadTheme();
loadChars('all');
themeToggle.addEventListener('click', toggleTheme);
