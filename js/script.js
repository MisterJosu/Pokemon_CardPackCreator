const API_KEY = 'd619c5e3-acdd-403b-853e-5ea282d4a1f0';

function sampleArray(arr, n) {
  const result = [];
  const copy = [...arr];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

async function loadCarousel() {
  const track = document.getElementById('carousel-track');
  track.innerHTML = '';

  try {
    // 1) Pedimos meta para saber totalCount
    const metaRes = await fetch(
      'https://api.pokemontcg.io/v2/cards?pageSize=1',
      { headers: { 'X-Api-Key': API_KEY } }
    );
    const metaJson = await metaRes.json();
    const total = metaJson.totalCount;

    // 2) Definimos tamaño de página y página aleatoria
    const pageSize = 50;
    const pages = Math.ceil(total / pageSize);
    const randomPage = Math.floor(Math.random() * pages) + 1;

    // 3) Descargamos ese lote de cartas
    const dataRes = await fetch(
      `https://api.pokemontcg.io/v2/cards?pageSize=${pageSize}&page=${randomPage}`,
      { headers: { 'X-Api-Key': API_KEY } }
    );
    const { data: cartas } = await dataRes.json();

    // 4) Muestreamos 5 aleatorias
    const seleccion = sampleArray(cartas, 5);

    // 5) Inyectamos cada carta y luego duplicamos para el bucle
    [...seleccion, ...seleccion].forEach(carta => {
      const div = document.createElement('div');
      div.className = 'carousel-item-custom';
      div.innerHTML = `<img src="${carta.images.large}" alt="${carta.name}">`;
      track.appendChild(div);
    });
  } catch (e) {
    console.error('Error cargando carrusel:', e);
  }
}

document.addEventListener('DOMContentLoaded', loadCarousel);