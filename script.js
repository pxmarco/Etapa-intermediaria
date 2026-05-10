/**
 * POKEDEX GBA MASTER - SCRIPT DE INTEGRAÇÃO V2
 * Focado em performance, filtros cumulativos e navegação fluida.
 */

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

// Configuração de Gerações GBA
const GBA_CONFIG = {
    "1": { limit: 151, offset: 0 },
    "2": { limit: 100, offset: 151 },
    "3": { limit: 135, offset: 251 }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa com a Gen 1 por padrão
    triggerSearch();

    // Listener do Botão de Consulta
    document.getElementById('btnConsultar').addEventListener('click', triggerSearch);
});

/**
 * Função Principal de Busca e Filtragem
 */
async function triggerSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const typeFilter = document.getElementById('typeFilter').value;
    const genFilter = document.getElementById('genFilter').value;
    const container = document.getElementById('pokedexContainer');

    // Feedback visual de carregamento
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-2 text-secondary">Sincronizando com a PokéAPI...</p>
        </div>`;

    try {
        let pokemonsParaExibir = [];

        if (searchTerm) {
            // Busca específica por Nome ou ID
            const poke = await fetchJSON(`${API_URL}${searchTerm}`);
            pokemonsParaExibir = [poke];
        } else {
            // Busca por Geração
            const config = GBA_CONFIG[genFilter];
            const data = await fetchJSON(`${API_URL}?limit=${config.limit}&offset=${config.offset}`);
            
            // Carrega detalhes de todos da geração em paralelo (Performance Máxima)
            const todosDetalhes = await Promise.all(
                data.results.map(p => fetchJSON(p.url))
            );

            // Aplica Filtro Cumulativo de Tipo
            pokemonsParaExibir = todosDetalhes.filter(poke => {
                return typeFilter === 'all' || poke.types.some(t => t.type.name === typeFilter);
            });
        }

        renderCards(pokemonsParaExibir);

    } catch (error) {
        console.error("Erro na busca:", error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Pokémon não encontrado ou erro de conexão.</p>
            </div>`;
    }
}

/**
 * Renderiza os cards no Grid principal
 */
function renderCards(pokemons) {
    const container = document.getElementById('pokedexContainer');
    container.innerHTML = "";

    if (pokemons.length === 0) {
        container.innerHTML = '<p class="text-center w-100 text-secondary">Nenhum resultado para os filtros aplicados.</p>';
        return;
    }

    pokemons.forEach(poke => {
        const mainType = poke.types[0].type.name;
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="poke-card glow-${mainType}" onclick="openDetails(${poke.id})">
                <div class="card-img-wrapper">
                    <img src="${poke.sprites.other['official-artwork'].front_default}" class="poke-img" alt="${poke.name}">
                </div>
                <div class="text-center">
                    <span class="text-secondary small fw-bold">#${poke.id.toString().padStart(3, '0')}</span>
                    <h3 class="h6 text-capitalize mb-2">${poke.name}</h3>
                    <div class="d-flex justify-content-center gap-1">
                        ${poke.types.map(t => `<span class="type-badge" style="background-color: var(--${t.type.name})">${t.type.name}</span>`).join('')}
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

/**
 * Abre o Modal com detalhes e evolução
 */
async function openDetails(id) {
    const modalContent = document.getElementById('modalContent');
    // Mostra loading dentro do modal se ele já estiver aberto (navegação)
    modalContent.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-danger"></div></div>';
    
    // Ativa o modal do Bootstrap
    const modalInstance = new bootstrap.Modal(document.getElementById('pokeModal'));
    if (!document.querySelector('.modal.show')) {
        modalInstance.show();
    }

    try {
        const poke = await fetchJSON(`${API_URL}${id}`);
        const species = await fetchJSON(poke.species.url);
        const evolution = await fetchJSON(species.evolution_chain.url);

        modalContent.innerHTML = `
            <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pt-0">
                <div class="row align-items-center">
                    <div class="col-lg-5 text-center mb-4 mb-lg-0">
                        <img src="${poke.sprites.other['official-artwork'].front_default}" class="img-fluid" style="max-height: 250px;">
                        <div class="mt-3">
                            ${poke.types.map(t => `<span class="type-badge px-3 py-2" style="background-color: var(--${t.type.name})">${t.type.name}</span>`).join('')}
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <h2 class="text-capitalize fw-bold mb-1">${poke.name}</h2>
                        <p class="text-secondary small mb-4">ID #${poke.id.toString().padStart(3, '0')}</p>
                        
                        <div class="stats-panel">
                            ${poke.stats.map(s => `
                                <div class="stat-row">
                                    <div class="stat-label">
                                        <span>${s.stat.name.replace('-', ' ')}</span>
                                        <span>${s.base_stat}</span>
                                    </div>
                                    <div class="stat-bar-bg">
                                        <div class="stat-bar-fill" style="width: ${(s.base_stat / 255) * 100}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="evo-container">
                    <h6 class="text-center text-secondary small text-uppercase fw-bold mb-4">Cadeia Evolutiva (GBA Line)</h6>
                    <div class="d-flex justify-content-around align-items-center flex-wrap" id="evoPath">
                        </div>
                </div>
            </div>`;

        processEvolution(evolution.chain);

    } catch (error) {
        modalContent.innerHTML = '<div class="p-5 text-center text-danger">Erro ao carregar detalhes do Pokémon.</div>';
    }
}

/**
 * Processa e renderiza a cadeia de evolução clicável
 */
async function processEvolution(chain) {
    const container = document.getElementById('evoPath');
    let current = chain;
    const evoList = [];

    // Percorre a árvore de evolução de forma linear (comum no GBA)
    while (current) {
        const id = current.species.url.split('/').filter(Boolean).pop();
        evoList.push({ id, name: current.species.name });
        current = current.evolves_to[0]; 
    }

    container.innerHTML = evoList.map((evo, index) => `
        <div class="evo-item" onclick="openDetails(${evo.id})">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" alt="${evo.name}">
            <p class="small text-capitalize mb-0 ${evo.name === document.querySelector('h2').innerText.toLowerCase() ? 'text-danger fw-bold' : ''}">${evo.name}</p>
        </div>
        ${index < evoList.length - 1 ? '<i class="fa-solid fa-chevron-right text-muted opacity-25"></i>' : ''}
    `).join('');
}

/**
 * Helper para fetch de JSON
 */
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}
