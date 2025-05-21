const API_KEY = "d619c5e3-acdd-403b-853e-5ea282d4a1f0";

// Genera un array aleatorio de longitud n
def sampleArray(arr, n) {
  const result = [];
  const copy = [...arr];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// Lógica para abrir pack según tipo seleccionado
async function fetchPack() {
  const loader = document.getElementById("loader");
  const container = document.getElementById("card-container");
  loader.style.display = "block";
  container.innerHTML = "";

  // Detectar tipo de pack (japonés u occidental)
  const type = document.querySelector('input[name="packType"]:checked').value;
  // Configuración: japones = 2 comunes,2 poco comunes,1 holo; occidental = 4,3,3
  const counts = type === 'japanese'
    ? { common: 2, uncommon: 2, holo: 1 }
    : { common: 4, uncommon: 3, holo: 3 };

  try {
    // Obtener total de cartas para paginación
    const meta = await fetch("https://api.pokemontcg.io/v2/cards?pageSize=1", {
      headers: { "X-Api-Key": API_KEY }
    }).then(res => res.json());
    const total = meta.totalCount;
    const pageSize = 100;
    const randomPage = Math.floor(Math.random() * Math.ceil(total / pageSize)) + 1;

    // Cargar bloque de cartas aleatorio
    const data = await fetch(
      `https://api.pokemontcg.io/v2/cards?pageSize=${pageSize}&page=${randomPage}`,
      { headers: { "X-Api-Key": API_KEY } }
    ).then(res => res.json());
    const all = data.data;

    // Filtrar por rareza
    const commons = all.filter(c => c.rarity === 'Common');
    const uncommons = all.filter(c => c.rarity === 'Uncommon');
    const holos = all.filter(c => c.rarity && c.rarity.includes('Holo'));

    // Seleccionar cartas según counts
    const pack = [
      ...sampleArray(commons, counts.common),
      ...sampleArray(uncommons, counts.uncommon),
      ...sampleArray(holos, counts.holo)
    ];

    // Renderizar pack
    pack.forEach(card => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-2 text-center';
      col.innerHTML = `
        <div class="card shadow">
          <img src="${card.images.small}" class="card-img-top" alt="${card.name}">
          <div class="card-body">
            <h5 class="card-title">${card.name}</h5>
            <p class="card-text"><small>${card.rarity || ''}</small></p>
          </div>
        </div>`;
      container.appendChild(col);
    });
  } catch (error) {
    console.error('Error al generar el pack:', error);
    container.innerHTML = "<p class='text-danger text-center'>Error al cargar las cartas.</p>";
  } finally {
    loader.style.display = "none";
  }
}

// Enlazar evento al botón al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reload-btn').addEventListener('click', fetchPack);
});
