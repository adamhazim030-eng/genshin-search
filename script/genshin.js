const slides = [
  { src: 'images/promotion-genshin-impact/1.webp', alt: 'Promosi Genshin Impact', caption: 'Pengembaraan bermula di sini' },
  { src: 'images/promotion-genshin-impact/2.jpg', alt: 'Dunia Genshin Impact', caption: 'Temui keajaiban Teyvat' },
  { src: 'images/promotion-genshin-impact/3.jpg', alt: 'Watak-watak Genshin Impact', caption: 'Kumpulkan pasukan impian anda' },
  { src: 'images/promotion-genshin-impact/images%20(1).jpg', alt: 'Ilustrasi promosi Genshin Impact 4', caption: 'Kenangan baharu menanti' },
  { src: 'images/promotion-genshin-impact/images%20(2).jpg', alt: 'Ilustrasi promosi Genshin Impact 5', caption: 'Teroka setiap sudut Teyvat' },
  { src: 'images/promotion-genshin-impact/images%20(3).jpg', alt: 'Ilustrasi promosi Genshin Impact 6', caption: 'Pilih pasukan dan mulakan misi' },
  { src: 'images/promotion-genshin-impact/images%20(4).jpg', alt: 'Ilustrasi promosi Genshin Impact 7', caption: 'Satu pengembaraan, ramai teman' },
  { src: 'images/promotion-genshin-impact/images.jpg', alt: 'Ilustrasi promosi Genshin Impact 8', caption: 'Dunia Teyvat menunggu' }
];

let currentImageIndex = 0;
let carouselTimer;
const carouselImg = document.getElementById('carouselImg');
const carouselNav = document.getElementById('carouselNav');
const carouselCaption = document.getElementById('carouselCaption');
const promotionCarousel = document.getElementById('promotionCarousel');
const themeToggle = document.getElementById('themeToggle');

function showImage(index) {
  currentImageIndex = (index + slides.length) % slides.length;
  carouselImg.src = slides[currentImageIndex].src;
  carouselImg.alt = slides[currentImageIndex].alt;
  carouselCaption.textContent = slides[currentImageIndex].caption;
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    const isActive = i === currentImageIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-current', String(isActive));
  });
}

function buildCarouselDots() {
  carouselNav.innerHTML = '';
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Tunjuk imej ${index + 1}: ${slide.caption}`);
    dot.setAttribute('aria-current', String(index === 0));
    dot.addEventListener('click', () => showImage(index));
    carouselNav.appendChild(dot);
  });
}

function startCarousel() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => showImage(currentImageIndex + 1), 6000);
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
  document.getElementById('carouselPrev').addEventListener('click', () => showImage(currentImageIndex - 1));
  document.getElementById('carouselNext').addEventListener('click', () => showImage(currentImageIndex + 1));
  promotionCarousel.addEventListener('mouseenter', () => clearInterval(carouselTimer));
  promotionCarousel.addEventListener('mouseleave', startCarousel);
  promotionCarousel.addEventListener('focusin', () => clearInterval(carouselTimer));
  promotionCarousel.addEventListener('focusout', event => {
    if (!promotionCarousel.contains(event.relatedTarget)) startCarousel();
  });
  startCarousel();
});
