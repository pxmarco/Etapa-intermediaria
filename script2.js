async function openPokeDetails(id) {
    const poke = await fetchPokemonData(id);
    const speciesRes = await fetch(poke.species.url);
    const speciesData = await speciesRes.json();
    
    // Preparar conteúdo do modal (Gráficos de status)
    const statsHtml = poke.stats.map(s => renderStat(s.stat.name, s.base_stat)).join('');
    
    document.getElementById('modalContentArea').innerHTML = `
        <div class="modal-header border-0">
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
            <div class="row align-items-center">
                <div class="col-md-5 text-center">
                    <img src="${poke.sprites.other['official-artwork'].front_default}" class="img-fluid mb-3" style="max-height: 280px;">
                    <h2 class="fw-bold text-capitalize">${poke.name}</h2>
                    <div class="mb-3">
                        ${poke.types.map(t => `<span class="type-badge" style="background-color: var(--${t.type.name});">${t.type.name}</span>`).join('')}
                    </div>
                </div>
                <div class="col-md-7">
                    <h5 class="text-uppercase small fw-bold text-secondary mb-4">Base Stats (GBA Analysis)</h5>
                    ${statsHtml}
                </div>
            </div>
            <div id="evoChainArea" class="evo-cycle-container text-center">
                <div class="spinner-border spinner-border-sm text-danger"></div> Carregando evoluções...
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('pokeDetailModal'));
    modal.show();

    // Animação das barras
    setTimeout(() => {
        document.querySelectorAll('.stat-bar-fill').forEach(bar => {
            bar.style.width = (bar.getAttribute('data-val') / 255 * 100) + '%';
        });
    }, 200);

    // Carregar Evoluções (Chamada extra)
    loadEvolutions(speciesData.evolution_chain.url);
}