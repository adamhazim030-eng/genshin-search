const images = [
  'images/promotion-genshin-impact/1.webp',
  'images/promotion-genshin-impact/2.jpg',
  'images/promotion-genshin-impact/3.jpg'
];

let currentImageIndex = 0;
const carouselImg = document.getElementById('carouselImg');
const carouselNav = document.getElementById('carouselNav');
const themeToggle = document.getElementById('themeToggle');

function showImage(index) {
  currentImageIndex = index;
  carouselImg.src = images[currentImageIndex];
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentImageIndex);
  });
}

function buildCarouselDots() {
  carouselNav.innerHTML = '';
  images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.addEventListener('click', () => showImage(index));
    carouselNav.appendChild(dot);
  });
}

function loadTheme() {
  const savedTheme = localStorage.getItem('genshin-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️ Light';
  } else {
    themeToggle.textContent = '🌙 Dark';
  }
}

function toggleTheme() {
  const lightMode = document.body.classList.toggle('light');
  themeToggle.textContent = lightMode ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('genshin-theme', lightMode ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
  buildCarouselDots();
  showImage(currentImageIndex);
  loadTheme();

  themeToggle.addEventListener('click', toggleTheme);

  setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showImage(currentImageIndex);
  }, 5000);
});
