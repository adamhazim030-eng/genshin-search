const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const landingSearch = document.getElementById("landingSearch");
const landingBtn = document.getElementById("landingBtn");

// Fungsi untuk menguruskan mod tema (Light/Dark)
function setTheme(theme) {
  body.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
  }
}

// Memuatkan tema yang disimpan atau tetapan asal (dark)
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);

// Event Listener untuk butang tukar tema
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(body.classList.contains("light") ? "dark" : "light");
  });
}

// Fungsi utama untuk melakukan carian watak
function searchCharacter() {
  if (!landingSearch) return;
  
  const value = landingSearch.value.trim();
  if (!value) {
    alert("Masukkan nama character!");
    return;
  }

  // PEMBETULAN UTAMA: Menggunakan '?name=' supaya data API terkait di halaman detail.html
  window.location.href = `detail.html?name=${encodeURIComponent(value)}`;
}

// Fungsi apabila pengguna menekan butang 'Enter' pada papan kekunci
function onLandingKeypress(e) {
  if (e.key === "Enter") {
    searchCharacter();
  }
}

// Menghubungkan fungsi carian kepada elemen Input dan Butang
if (landingSearch) {
  landingSearch.addEventListener("keypress", onLandingKeypress);
}

if (landingBtn) {
  landingBtn.addEventListener("click", searchCharacter);
}