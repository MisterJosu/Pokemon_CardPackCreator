const API_KEY = "d619c5e3-acdd-403b-853e-5ea282d4a1f0";

// Toma n elementos aleatorios de un array
function sampleArray(arr, n) {
  const copy = arr.slice();
  return Array.from({length: n}, () =>
    copy.splice(Math.floor(Math.random() * copy.length), 1)[0]
  );
}

async function fetchPack() {
  const btn = document.getElementById("reload-btn");
  const loader = document.getElementById("loader");
  const container = document.getElementById("card-container");

  // Feedback UI
  btn.disabled = true;
  loader.style.display = "block";
  container.innerHTML = ""; // limpia

  const countsMap = {
    original: { common: 4, uncommon: 3, holo: 3 },
    japanese: { common: 2, uncommon: 2, holo: 1 },
    luxory:   { common: 0, uncommon: 5, holo: 5 },
    ultra:    { common: 0, uncommon: 0, holo: 10 }
  };
  const packType = document.querySelector('input[name="packType"]:checked').value;
  const counts = countsMap[packType] || countsMap.original;

  try {
    // 1) totalCount
    const metaRes = await fetch(
      "https://api.pokemontcg.io/v2/cards?pageSize=1",
      { headers: {"X-Api-Key": API_KEY} }
    );
    const { totalCount } = await metaRes.json();

    // 2) página aleatoria
    const pageSize = 100;
    const pages = Math.ceil(totalCount / pageSize);
    const randomPage = Math.floor(Math.random() * pages) + 1;
    const dataRes = await fetch(
      `https://api.pokemontcg.io/v2/cards?pageSize=${pageSize}&page=${randomPage}`,
      { headers: {"X-Api-Key": API_KEY} }
    );
    const { data: allCards } = await dataRes.json();

    // 3) filtra por rareza
    const commons   = allCards.filter(c => c.rarity === "Common");
    const uncommons = allCards.filter(c => c.rarity === "Uncommon");
    const holos     = allCards.filter(c => c.rarity && c.rarity.includes("Holo"));

    // 4) crea pack
    const pack = [
      ...sampleArray(commons,   counts.common),
      ...sampleArray(uncommons, counts.uncommon),
      ...sampleArray(holos,     counts.holo)
    ];

    // 5) renderiza las cartas en GRID
    pack.forEach((card, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "card-wrapper";

      const cardEl = document.createElement("div");
      cardEl.className = "card shadow-sm fade-in-up";
      cardEl.style.animationDelay = `${0.1 * i}s`;

      cardEl.innerHTML = `
        <img src="${card.images.small}" class="card-img-top" alt="${card.name}">
        <div class="card-body p-2 text-center">
          <p class="mb-0">${card.name}</p>
        </div>`;

      wrapper.appendChild(cardEl);
      container.appendChild(wrapper);
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
