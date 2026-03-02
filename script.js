const suggestions = [
  "raiden-shogun","nahida","furina","zhongli","venti","kamisato-ayaka",
  "kamisato-ayato","hutao","xiao","ganyu","keqing","yoimiya","klee","alhaitham"
];

const input = document.getElementById("search");

input.addEventListener("keyup", function(e){
  if(e.key === "Enter"){
    searchChar();
  }
});

async function searchChar() {
  const name = input.value.toLowerCase().trim();
  const result = document.getElementById("result");

  if (!name) {
    alert("Sila masukkan nama watak!");
    return;
  }

  result.style.display = "block";
  result.classList.remove("show");
  result.innerHTML = `<div class="loader"></div><p> Mencari maklumat...</p>`;

  try {
    const response = await fetch(`https://genshin.jmp.blue/characters/${name}`);

    if (!response.ok) throw new Error("Tak jumpa");

    const data = await response.json();

    result.innerHTML = `
      <img src="https://genshin.jmp.blue/characters/${name}/icon-big" alt="${data.name}">
      <h2>${data.name}</h2>
      <p><b>Elemen:</b> ${data.vision}</p>
      <p><b>Senjata:</b> ${data.weapon}</p>
      <p><b>Rarity:</b> ⭐ ${data.rarity}</p>
      <p><b>Wilayah:</b> ${data.nation}</p>
      <button class="detail-btn" onclick="goDetail('${name}')">📖 Lihat Detail</button>
    `;

    setTimeout(()=> result.classList.add("show"),100);

  } catch {
    result.innerHTML = `<p style="color:#ff7676;">Watak tidak dijumpai 😢</p>`;
  }
}

function goDetail(name){
  localStorage.setItem("char", name);
  window.location.href = "detail.html";
}