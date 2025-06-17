const API_KEY = "d619c5e3-acdd-403b-853e-5ea282d4a1f0";
let currentPage = 1;
const pageSize = 20;
let totalPages = 1;

// Carga las expansiones en el select al iniciar
async function loadSets() {
  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": API_KEY }
    });
    const data = await res.json();
    data.data.forEach(set => {
      $("#set").append(
        `<option value="${set.id}">${set.name}</option>`
      );
    });
  } catch (err) {
    console.error("Error cargando sets:", err);
  }
}

// Construye la query de búsqueda según los filtros
function buildQuery() {
  const name   = $("#name").val().trim();
  const type   = $("#type").val();
  const rarity = $("#rarity").val();
  const set    = $("#set").val();
  const parts = [];
  if (name)   parts.push(`name:${name}*`);
  if (type)   parts.push(`types:${type}`);
  if (rarity) parts.push(`rarity:"${rarity}"`);
  if (set)    parts.push(`set.id:${set}`);
  return parts.length ? `q=${parts.join(" AND ")}` : "";
}

// Renderiza un array de cartas en el contenedor de resultados
function renderCards(cards) {
  const $results = $("#search-results").empty();
  if (!cards.length) {
    $results.html(
      `<p class="text-center">No se encontraron cartas.</p>`
    );
    return;
  }
  cards.forEach(card => {
    const html = `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card h-100 fade-in-up" style="animation-delay:0s">
          <img src="${card.images.small}" class="card-img-top" alt="${card.name}">
          <div class="card-body p-2 text-center">
            <p class="mb-1">${card.name}</p>
            <button class="btn capsule-button detail-btn"
                    data-id="${card.id}">
              Ver detalle
            </button>
          </div>
        </div>
      </div>`;
    $results.append(html);
  });
}

// Consulta la API y actualiza la paginación
async function fetchCards(page = 1) {
  const query = buildQuery();
  const url = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}&${query}`;

  try {
    const res = await fetch(url, {
      headers: { "X-Api-Key": API_KEY }
    });
    const json = await res.json();
    renderCards(json.data);
    totalPages = Math.ceil(json.totalCount / pageSize);
    currentPage = page;
    $("#prev-btn").prop("disabled", page <= 1);
    $("#next-btn").prop("disabled", page >= totalPages);
  } catch (err) {
    console.error("Error buscando cartas:", err);
    $("#search-results").html(
      `<p class="text-center text-danger">Error al cargar resultados.</p>`
    );
  }
}

// Muestra el modal con detalle de una carta
async function showDetail(id) {
  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`, {
      headers: { "X-Api-Key": API_KEY }
    });
    const card = (await res.json()).data;

    // Título
    $("#modal-title").text(`${card.name} (${card.set.name} #${card.number})`);

    // Imagen
    $("#modal-img")
      .attr("src", card.images.large)
      .attr("alt", card.name);

    // Flavor text
    $("#modal-text").text(card.flavorText || "");

    const $detail = $(".detail-text").empty();

    // Abilities
    if (card.abilities && card.abilities.length) {
      $detail.append("<h6>Habilidades</h6><ul class='list-unstyled mb-2'>");
      card.abilities.forEach(abil => {
        $detail.append(`
          <li>
            <strong>${abil.name}:</strong> ${abil.text}
          </li>`);
      });
      $detail.append("</ul>");
    }

    // Attacks
    if (card.attacks && card.attacks.length) {
      $detail.append("<h6>Ataques</h6><ul class='list-unstyled mb-2'>");
      card.attacks.forEach(atk => {
        const cost = atk.cost.join(" ");
        $detail.append(`
          <li>
            <strong>${atk.name}</strong> (${cost})
            <br>
            Daño: ${atk.damage || 0}
            <br>
            ${atk.text || ""}
          </li>`);
      });
      $detail.append("</ul>");
    }

    // Stats generales
    const stats = [
      ["HP", card.hp],
      ["Tipo(s)", (card.types||[]).join(", ")],
      ["Rareza", card.rarity],
      ["Supertipo", card.supertype],
      ["Subtipo", (card.subtypes||[]).join(", ")],
      ["Debilidad", (card.weaknesses||[]).map(w=>w.type+" x"+w.value).join(", ")],
      ["Resistencia", (card.resistances||[]).map(r=>r.type+" "+r.value).join(", ")],
      ["Coste de retirada", (card.retreatCost||[]).join(" ")]
    ];
    $detail.append("<h6>Estadísticas</h6><ul class='list-unstyled'>");
    stats.forEach(([label,val]) => {
      if (val) {
        $detail.append(`<li><strong>${label}:</strong> ${val}</li>`);
      }
    });
    $detail.append("</ul>");

    // Muestra modal
    new bootstrap.Modal("#cardModal").show();

  } catch (err) {
    console.error("Error al cargar detalle:", err);
  }
}

// Inicialización al cargar el DOM
$(function() {
  loadSets();

  $("#search-form").on("submit", e => {
    e.preventDefault();
    fetchCards(1);
  });

  $("#prev-btn").click(() => fetchCards(currentPage - 1));
  $("#next-btn").click(() => fetchCards(currentPage + 1));

  $("#search-results").on("click", ".detail-btn", function() {
    showDetail($(this).data("id"));
  });
});
