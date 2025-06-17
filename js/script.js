// CARGA Y ANIMA ÍTEMS DEL CARRUSEL
async function cargarCartasPokemon() {
  const track = document.getElementById('carousel-track');
  track.innerHTML = ''; // limpia antes de recargar

  try {
    const res = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=50');
    const data = await res.json();
    const cartas = data.data;

    // Selecciona 6 cartas al azar
    const aleatorias = cartas.sort(() => 0.5 - Math.random()).slice(0, 6);
    // Duplica para bucle infinito
    const dobles = [...aleatorias, ...aleatorias];

    dobles.forEach((carta, i) => {
      const div = document.createElement('div');
      div.className = 'carousel-item-custom fade-in-up';
      // Delay escalonado: 0.1s * índice
      div.style.animationDelay = `${0.1 * i}s`;
      div.innerHTML = `<img src="${carta.images.large}" alt="${carta.name}">`;
      track.appendChild(div);
    });
  } catch (err) {
    console.error('Error al cargar cartas Pokémon:', err);
  }
}

// Inicializa al cargar DOM
document.addEventListener('DOMContentLoaded', cargarCartasPokemon);
