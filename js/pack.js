const API_KEY = "d619c5e3-acdd-403b-853e-5ea282d4a1f0";

function sampleArray(arr, n) {
  const result = [];
  const copy = [...arr];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

async function fetchPack() {
  const btn = document.getElementById("reload-btn");
  const loader = document.getElementById("loader");
  const container = document.getElementById("card-container");

  // Desactivar boton y mostrar loader
  btn.disabled = true;
  loader.style.display = "block";
  container.innerHTML = "";

  const countsMap = {
    original: { common: 4, uncommon: 3, holo: 3 },
    japanese: { common: 2, uncommon: 2, holo: 1 },
    luxory:   { common: 0, uncommon: 5, holo: 5 },
    ultra:    { common: 0, uncommon: 0, holo: 10 }
  };
  const packType = document.querySelector('input[name="packType"]:checked').value;
  const counts = countsMap[packType] || countsMap.original;

  try {
    const metaRes = await fetch(
      "https://api.pokemontcg.io/v2/cards?pageSize=1",
      { headers: { "X-Api-Key": API_KEY } }
    );
    const { totalCount } = await metaRes.json();
    const pageSize = 100;
    const pages = Math.ceil(totalCount / pageSize);
    const randomPage = Math.floor(Math.random() * pages) + 1;

    const dataRes = await fetch(
      `https://api.pokemontcg.io/v2/cards?pageSize=${pageSize}&page=${randomPage}`,
      { headers: { "X-Api-Key": API_KEY } }
    );
    const { data: allCards } = await dataRes.json();

    const commons   = allCards.filter(c => c.rarity === "Common");
    const uncommons = allCards.filter(c => c.rarity === "Uncommon");
    const holos     = allCards.filter(c => c.rarity && c.rarity.includes("Holo"));

    const pack = [
      ...sampleArray(commons,   counts.common),
      ...sampleArray(uncommons, counts.uncommon),
      ...sampleArray(holos,     counts.holo)
    ];

    pack.forEach((card, i) => {
      if (i === counts.common + counts.uncommon) {
        const br = document.createElement("div");
        br.className = "w-100";
        container.appendChild(br);
      }
      const col = document.createElement("div");
      col.className = "col-6 col-md-2 text-center mb-4";
      col.innerHTML = `
        <div class="card shadow-sm">
          <img src="${card.images.small}" class="card-img-top" alt="${card.name}">
          <div class="card-body p-2">
            <p class="mb-0">${card.name}</p>
          </div>
        </div>`;
      container.appendChild(col);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger text-center">Error al cargar cartas</p>`;
  } finally {
    loader.style.display = "none";
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("reload-btn").addEventListener("click", fetchPack);
});