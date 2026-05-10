const API_URL = "https://pokeapi.co/api/v2/pokemon/";

async function triggerSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const genFilter = document.getElementById('genFilter').value;
    const container = document.getElementById('pokedexContainer');
    
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-danger" role="status"></div></div>';

    try {
        if (searchTerm) {
            const pokemon = await fetch(`${API_URL}${searchTerm}`).then(res => res.json());
            renderCards([pokemon]);
        } else {
            let limit = 151, offset = 0;
            if (genFilter === "2") { limit = 100; offset = 151; }
            if (genFilter === "3") { limit = 135; offset = 251; }
            const data = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`).then(res => res.json());
            const pokemons = await Promise.all(data.results.map(p => fetch(p.url).then(res => res.json())));
            renderCards(pokemons);
        }
    } catch (e) {
        container.innerHTML = '<p class="text-white text-center">Pokémon não encontrado ou erro na API.</p>';
    }
}

function renderCards(pokemons) {
    const container = document.getElementById('pokedexContainer');
    container.innerHTML = "";
    pokemons.forEach(poke => {
        const card = document.createElement('div');
        card.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="poke-card glow-${poke.types[0].type.name}" onclick="openPokeDetails(${poke.id})">
                <div class="card-img-container"><img src="${poke.sprites.other['official-artwork'].front_default}" class="poke-img"></div>
                <div class="card-info">
                    <span class="text-secondary small fw-bold">#${poke.id}</span>
                    <h3 class="h5 text-capitalize">${poke.name}</h3>
                </div>
            </div>`;
        container.appendChild(card);
    });
}
// Mantenha as funções openPokeDetails e renderStat que já tínhamos discutido