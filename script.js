const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

// Configuração de Limites GBA
const GBA_GENS = {
    "1": { limit: 151, offset: 0 },
    "2": { limit: 100, offset: 151 },
    "3": { limit: 135, offset: 251 },
    "all": { limit: 386, offset: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
    // Carregar todos ao iniciar
    triggerSearch();
    
    // Listener do Botão
    document.getElementById('btnConsultar').addEventListener('click', triggerSearch);
});

async function triggerSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const genFilter = document.getElementById('genFilter').value;
    const container = document.getElementById('pokedexContainer');
    
    container.innerHTML = '<div class="text-center w-100 py-5"><div class="spinner-border text-danger"></div></div>';

    try {
        let results = [];

        if (searchTerm) {
            // Busca Direta
            const poke = await fetchJSON(`${API_URL}${searchTerm}`);
            results = [poke];
        } else {
            // Busca por Geração com Filtro de Tipo Integrado
            const config = GBA_GENS[genFilter];
            const data = await fetchJSON(`${API_URL}?limit=${config.limit}&offset=${config.offset}`);
            
            // Fetch de detalhes em paralelo para filtrar por tipo
            const fullData = await Promise.all(data.results.map(p => fetchJSON(p.url)));
            
            results = fullData.filter(poke => {
                const matchType = typeFilter === 'all' || poke.types.some(t => t.type.name === typeFilter);
                return matchType;
            });
        }

        renderCards(results);
    } catch (e) {
        container.innerHTML = '<p class="text-center">Nenhum Pokémon encontrado com esses critérios.</p>';
    }
}

function renderCards(pokemons) {
    const container = document.getElementById('pokedexContainer');
    container.innerHTML = "";

    pokemons.forEach(poke => {
        const primaryType = poke.types[0].type.name;
        const card = document.createElement('div');
        card.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="poke-card glow-${primaryType}" onclick="openPokeDetails(${poke.id})">
                <div class="card-img-container">
                    <img src="${poke.sprites.other['official-artwork'].front_default}" class="poke-img">
                </div>
                <div class="card-info">
                    <span class="text-secondary small fw-bold">#${poke.id.toString().padStart(4, '0')}</span>
                    <h3 class="h5 text-capitalize">${poke.name}</h3>
                    <div class="mt-2">
                        ${poke.types.map(t => `<span class="type-badge" style="background-color: var(--${t.type.name});">${t.type.name}</span>`).join('')}
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

async function openPokeDetails(id) {
    const modalContent = document.getElementById('modalContentArea');
    modalContent.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-danger"></div></div>';
    
    // Abrir modal do Bootstrap
    const modalElement = document.getElementById('pokeDetailModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

    try {
        const poke = await fetchJSON(`${API_URL}${id}`);
        const species = await fetchJSON(poke.species.url);
        const evoData = await fetchJSON(species.evolution_chain.url);

        // Lógica de Localização GBA (Mock baseado na Gen)
        const location = species.generation.name.includes('generation-i') ? "Kanto - Rota 1 ou Safari Zone" : 
                         species.generation.name.includes('generation-iii') ? "Hoenn - Rota 110 ou Rusturf Tunnel" : "Evolução ou Troca";
        
        const cheatCode = `8202404C ${id.toString(16).toUpperCase().padStart(4, '0')}`;

        modalContent.innerHTML = `
            <div class="modal-header border-0"><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
            <div class="modal-body pt-0">
                <div class="row align-items-center">
                    <div class="col-md-5 text-center">
                        <img src="${poke.sprites.other['official-artwork'].front_default}" class="img-fluid mb-3">
                        <h2 class="fw-bold text-capitalize">${poke.name}</h2>
                        <div class="mb-3">
                             ${poke.types.map(t => `<span class="type-badge" style="background-color: var(--${t.type.name});">${t.type.name}</span>`).join('')}
                        </div>
                    </div>
                    <div class="col-md-7">
                        <h6 class="text-secondary small fw-bold">BASE STATS</h6>
                        ${poke.stats.map(s => `
                            <div class="stat-row">
                                <div class="stat-label"><span>${s.stat.name}</span> <span>${s.base_stat}</span></div>
                                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(s.base_stat/255)*100}%"></div></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="info-box">
                    <h6 class="fw-bold mb-1 text-success"><i class="fa-solid fa-map-location-dot"></i> ONDE ENCONTRAR (GBA):</h6>
                    <small>${location}</small>
                    <h6 class="fw-bold mt-3 mb-1 text-warning"><i class="fa-solid fa-terminal"></i> ENCOUNTER CHEAT CODE:</h6>
                    <code class="cheat-code">${cheatCode}</code>
                </div>

                <div class="evo-cycle-container mt-3">
                    <h6 class="text-center small text-secondary mb-3">CADEIA EVOLUTIVA (CLIQUE PARA NAVEGAR)</h6>
                    <div class="d-flex justify-content-center align-items-center gap-2" id="evoChain">
                        </div>
                </div>
            </div>`;

        renderEvoChain(evoData.chain);

    } catch (e) {
        modalContent.innerHTML = '<div class="p-5 text-center">Erro ao carregar detalhes.</div>';
    }
}

// Função para processar a cadeia evolutiva recursivamente
function renderEvoChain(chain) {
    const container = document.getElementById('evoChain');
    container.innerHTML = "";
    let current = chain;

    while (current) {
        const pokeId = current.species.url.split('/').filter(Boolean).pop();
        const evoItem = document.createElement('div');
        evoItem.className = 'evo-item';
        evoItem.innerHTML = `
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png">
            <div class="small fw-bold text-capitalize">${current.species.name}</div>
        `;
        // Evento para trocar de pokemon no modal sem fechar
        evoItem.onclick = () => openPokeDetails(pokeId);
        
        container.appendChild(evoItem);
        
        if (current.evolves_to.length > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'evo-arrow';
            arrow.innerHTML = '→';
            container.appendChild(arrow);
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return res.json();
}
