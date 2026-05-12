
Copiar

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
 
// Ao carregar, mostra os iniciais da Gen 1
window.onload = () => triggerSearch();
 
async function triggerSearch() {
    const search = document.getElementById('searchInput').value.toLowerCase().trim();
    const gen = document.getElementById('genFilter').value;
    const type = document.getElementById('typeFilter').value;
    const container = document.getElementById('pokedexContainer');
 
    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border text-danger"></div></div>';
 
    try {
        let list = [];
 
        // Define limites por geração
        let limit = 151, offset = 0;
        if (gen === "2") { limit = 100; offset = 151; }
        if (gen === "3") { limit = 135; offset = 251; }
 
        if (search) {
            // Tenta busca direta pelo nome/número exato primeiro
            const exactRes = await fetch(`${API_URL}${search}`);
            if (exactRes.ok) {
                list = [await exactRes.json()];
            } else {
                // Busca parcial: carrega a gen atual e filtra por nome
                const data = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`).then(res => res.json());
                const matched = data.results.filter(p => p.name.includes(search));
                list = await Promise.all(matched.map(item => fetch(item.url).then(res => res.json())));
            }
        } else {
            const data = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`).then(res => res.json());
            list = await Promise.all(data.results.map(item => fetch(item.url).then(res => res.json())));
        }
 
        // Filtro de tipo
        if (type !== 'all') {
            list = list.filter(p => p.types.some(t => t.type.name === type));
        }
 
        render(list);
    } catch (e) {
        container.innerHTML = '<p class="text-center w-100">Não encontrado.</p>';
    }
}
 
function render(pokes) {
    const container = document.getElementById('pokedexContainer');
    if (!pokes.length) {
        container.innerHTML = '<p class="text-center w-100">Nenhum resultado encontrado.</p>';
        return;
    }
    container.innerHTML = pokes.map(p => `
        <div class="col">
            <div class="poke-card glow-${p.types[0].type.name}" onclick="openDetails(${p.id})">
                <img src="${p.sprites.other['official-artwork'].front_default}" class="poke-img">
                <div class="mt-2">
                    <small>#${p.id}</small>
                    <h6 class="text-capitalize">${p.name}</h6>
                    ${p.types.map(t => `<span class="type-badge" style="background:var(--${t.type.name})">${t.type.name}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}
 
async function openDetails(id) {
    const p = await fetch(`${API_URL}${id}`).then(res => res.json());
    const species = await fetch(p.species.url).then(res => res.json());
    const evo = await fetch(species.evolution_chain.url).then(res => res.json());
    
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <div class="modal-body pt-0">
            <div class="row align-items-center">
                <div class="col-md-5 text-center">
                    <img src="${p.sprites.other['official-artwork'].front_default}" class="img-fluid">
                    <small class="text-muted">#${p.id}</small>
                    <h3 class="text-capitalize mt-1">${p.name}</h3>
                    <div class="mb-2">${p.types.map(t => `<span class="type-badge" style="background:var(--${t.type.name})">${t.type.name}</span>`).join('')}</div>
                </div>
                <div class="col-md-7">
                    ${p.stats.map(s => `
                        <small class="text-uppercase">${s.stat.name}: ${s.base_stat}</small>
                        <div class="stat-bar"><div class="stat-fill" style="width:${(s.base_stat/255)*100}%"></div></div>
                    `).join('')}
                </div>
            </div>
            <hr>
            <div class="text-center">
                <h6>Evoluções</h6>
                <div class="d-flex justify-content-center" id="evoPath"></div>
            </div>
        </div>
    `;
    
    // Processa evolução de forma simples
    const path = document.getElementById('evoPath');
    let curr = evo.chain;
    while(curr) {
        const name = curr.species.name;
        const idEv = curr.species.url.split('/')[6];
        path.innerHTML += `<div class="evo-item" onclick="openDetails(${idEv})">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idEv}.png" width="50"><br>
            <small>${name}</small>
        </div>`;
        curr = curr.evolves_to[0];
    }
 
    const modalEl = document.getElementById('pokeModal');
    const existing = bootstrap.Modal.getInstance(modalEl);
    if (existing) {
        modalEl.addEventListener('hidden.bs.modal', () => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
            new bootstrap.Modal(modalEl).show();
        }, { once: true });
        existing.hide();
    } else {
        new bootstrap.Modal(modalEl).show();
    }
}
