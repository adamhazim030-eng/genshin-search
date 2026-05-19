// script.js

const suggestions = [
  "raiden-shogun",
  "nahida",
  "furina",
  "zhongli",
  "venti",
  "kamisato-ayaka",
  "kamisato-ayato",
  "hutao",
  "xiao",
  "ganyu",
  "keqing",
  "yoimiya",
  "klee",
  "alhaitham"
];

const input = document.getElementById("search");
const suggestBox = document.getElementById("suggestBox");
const result = document.getElementById("result");
const searchWrapper = document.querySelector(".search-wrapper");

const clearSuggestions = () => {
  suggestBox.innerHTML = "";
};

const showSuggestions = (value) => {
  const normalized = value.toLowerCase().trim();
  clearSuggestions();

  if (!normalized) return;

  const filtered = suggestions.filter((char) =>
    char.includes(normalized)
  );

  filtered.slice(0, 6).forEach((char) => {
    const div = document.createElement("div");
    div.className = "suggest-item";
    div.textContent = char;

    div.onclick = () => {
      input.value = char;
      clearSuggestions();
      searchChar();
    };

    suggestBox.appendChild(div);
  });
};

input.addEventListener("input", () => {
  showSuggestions(input.value);
});

input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    clearSuggestions();
    searchChar();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-wrapper")) {
    clearSuggestions();
  }
});

async function searchChar() {
  const name = input.value.toLowerCase().trim();

  if (!name) {
    alert("Sila masukkan nama watak Genshin.");
    return;
  }

  clearSuggestions();
  result.style.display = "block";
  result.classList.remove("show");
  result.innerHTML = `
    <div class="loader"></div>
    <p class="loading-text">Mencari maklumat...</p>
  `;

  try {
    const response = await fetch(`https://genshin.jmp.blue/characters/${name}`);

    if (!response.ok) {
      throw new Error("Tak jumpa");
    }

    const data = await response.json();

    result.innerHTML = `
      <div class="character-layout">
        <div class="left-panel">
            <img
              class="character-img"
              src="https://genshin.jmp.blue/characters/${name}/gacha-splash"
              alt="${data.name}"
              onerror="this.onerror=null; this.src='https://genshin.jmp.blue/characters/${name}/portrait'; this.addEventListener('error', ()=>{ this.src='https://genshin.jmp.blue/characters/${name}/icon-big'; });">
          </div>

        <div class="right-panel">
          <h2>${data.name}</h2>

          <div class="rarity">
            ${"⭐".repeat(data.rarity)}
          </div>

          <div class="info-grid">
            <div class="info-card">
              <span>⚡ Elemen</span>
              <h3>${data.vision}</h3>
            </div>

            <div class="info-card">
              <span>🗡️ Senjata</span>
              <h3>${data.weapon}</h3>
            </div>

            <div class="info-card">
              <span>🌍 Wilayah</span>
              <h3>${data.nation}</h3>
            </div>

            <div class="info-card">
              <span>⭐ Rarity</span>
              <h3>${data.rarity} Star</h3>
            </div>
          </div>

          <a class="detail-btn" href="detail.html?name=${name}">
            ✨ Detail Penuh
          </a>
        </div>
      </div>
    `;

    setTimeout(() => {
      result.classList.add("show");
    }, 50);
  } catch (error) {
    result.innerHTML = `
      <p class="error-text">
        Watak tidak dijumpai. Sila cuba nama lain.
      </p>
    `;
    result.classList.add("show");
  }
}