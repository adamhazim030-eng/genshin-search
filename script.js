async function searchChar() {
  const name = document.getElementById("search").value.toLowerCase().trim();
  const result = document.getElementById("result");

  if (!name) {
    alert("Sila masukkan nama watak!");
    return;
  }

  result.style.display = "block";
  result.innerHTML = "<p> Mencari data...</p>";

  try {
    const response = await fetch(`https://genshin.jmp.blue/characters/${name}`);

    if (!response.ok) {
      throw new Error("Watak tidak dijumpai");
    }

    const data = await response.json();

    result.innerHTML = `
      <img src="https://genshin.jmp.blue/characters/${name}/icon-big" alt="${data.name}">
      <h2>${data.name}</h2>
      <p><b>Elemen:</b> ${data.vision}</p>
      <p><b>Senjata:</b> ${data.weapon}</p>
      <p><b>Rarity:</b>  ${data.rarity}</p>
      <p><b>Wilayah:</b> ${data.nation}</p>
    `;

  } catch (error) {
    result.innerHTML = `<p style="color:red;">Watak tidak dijumpai. Pastikan ejaan betul.</p>`;
  }
}