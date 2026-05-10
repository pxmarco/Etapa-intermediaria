// Configurações globais
const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

// Função principal de busca (Acionada pelo botão Consultar)
async function triggerSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const genFilter = document.getElementById('genFilter').value;
    
    const container = document.getElementById('pokedexContainer');
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-danger" role="status"></div></div>';

    try {
        // Para uma busca real por nome ou ID
        if (searchTerm) {
            const pokemon = await fetchPokemonData(searchTerm);
            renderCards([pokemon]);
        } else {
            // Se não houver nome, buscamos uma lista baseada na geração GBA
            // Gen 1-3 vai até o ID 386 (Deoxys)
            const list = await fetchPokemonList(genFilter);
            renderCards(list);
        }
    } catch (error) {
        container.innerHTML = `<p class="text-danger">Erro ao buscar dados. Verifique o nome ou conexão.</p>`;
    }
}

// Busca dados detalhados de um Pokémon específico
async function fetchPokemonData(idOrName) {
    const response = await fetch(`${API_URL}${idOrName}`);
    const data = await response.json();
    return data;
}

// Busca lista por Geração (Simplificado para o desafio)
async function fetchPokemonList(gen) {
    let limit = 151, offset = 0;
    if (gen === "2") { limit = 100; offset = 151; }
    if (gen === "3") { limit = 135; offset = 251; }
    if (gen === "all") { limit = 386; offset = 0; }

    const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    
    // Faz o fetch de cada um da lista para ter os detalhes (tipos/imagens)
    return Promise.all(data.results.map(p => fetchPokemonData(p.name)));
}