// Teste de Integração Simples usando Fetch
// Objetivo: Validar se a PokéAPI está respondendo no formato esperado pela nossa aplicação

async function testPokeApiIntegration() {
    console.log("🧪 Iniciando Teste de Integração: PokéAPI...");
    
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/charizard");
        const data = await response.json();

        // Validação 1: Status da Resposta
        if (response.status !== 200) throw new Error("API fora do ar");

        // Validação 2: Estrutura de Dados Necessária para o Modal
        const hasStats = data.stats && data.stats.length > 0;
        const hasSprite = data.sprites.other['official-artwork'].front_default !== null;
        const hasName = data.name === "charizard";

        if (hasStats && hasSprite && hasName) {
            console.log("✅ Teste Passou: A API retornou dados íntegros para o Modal Analítico.");
        } else {
            throw new Error("Dados da API incompletos ou em formato inesperado.");
        }
    } catch (error) {
        console.error("❌ Teste Falhou:", error.message);
        process.exit(1); // Indica falha para o GitHub Actions
    }
}

// Executa o teste
testPokeApiIntegration();