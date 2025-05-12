document.addEventListener('DOMContentLoaded', function() {
    const carouselInner = document.getElementById('carouselInner');
    const apiUrl = 'https://api.pokemontcg.io/v2/cards?pageSize=5'; // Ejemplo: Obtiene 5 cartas
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.data && data.data.length > 0) {
          data.data.forEach((card, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            if (index === 0) {
              carouselItem.classList.add('active');
            }
  
            const img = document.createElement('img');
            img.src = card.images.large; // Usa la imagen grande de la carta
            img.classList.add('d-block', 'w-100');
            img.alt = card.name;
  
            carouselItem.appendChild(img);
            carouselInner.appendChild(carouselItem);
          });
        } else {
          carouselInner.innerHTML = '<div class="carousel-item active"><p class="text-center">No se encontraron cartas.</p></div>';
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos de la API:', error);
        carouselInner.innerHTML = '<div class="carousel-item active"><p class="text-center">Error al cargar las cartas.</p></div>';
      });
  });