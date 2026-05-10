const API_URL = "https://pokeapi.co/api/v2/pokemon";
const container = document.getElementById("pokedexContainer");

document
  .getElementById("btnConsultar")
  .addEventListener("click", loadPokemons);

window.addEventListener("DOMContentLoaded", loadPokemons);

async function loadPokemons() {
  const search = document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();

  const type = document.getElementById("typeFilter").value;

  container.innerHTML = `<p class="loading">Carregando...</p>`;

  try {

    // BUSCA DIRETA
    if (search) {
      const pokemon = await fetchPokemon(search);

      if (
        type !== "all" &&
        !pokemon.types.some(t => t.type.name === type)
      ) {
        container.innerHTML = "<p>Nenhum Pokémon encontrado.</p>";
        return;
      }

      renderCards([pokemon]);
      return;
    }

    // LISTA SIMPLES
    const response = await fetch(`${API_URL}?limit=20`);
    const data = await response.json();

    const pokemons = [];

    for (const item of data.results) {
      const pokemon = await fetchPokemon(item.name);

      if (
        type === "all" ||
        pokemon.types.some(t => t.type.name === type)
      ) {
        pokemons.push(pokemon);
      }
    }

    renderCards(pokemons);

  } catch (error) {
    container.innerHTML = "<p>Erro ao carregar Pokémon.</p>";
  }
}

async function fetchPokemon(name) {
  const response = await fetch(`${API_URL}/${name}`);

  if (!response.ok) {
    throw new Error("Pokémon não encontrado");
  }

  return response.json();
}

function renderCards(pokemons) {
  container.innerHTML = "";

  pokemons.forEach(pokemon => {

    const types = pokemon.types
      .map(t => `<span class="type">${t.type.name}</span>`)
      .join("");

    container.innerHTML += `
      <div class="card">
        <img
          src="${pokemon.sprites.front_default}"
          alt="${pokemon.name}"
        >

        <h3>
          #${pokemon.id} ${pokemon.name}
        </h3>

        <div>${types}</div>
      </div>
    `;
  });
}
