async function testIntegration() {
    console.log("🧪 Testando conexão com PokéAPI...");
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/1");
        if (res.ok) console.log("✅ Sucesso: API respondendo corretamente.");
        else throw new Error("Erro na resposta");
    } catch (e) {
        console.error("❌ Falha: API inacessível.");
        process.exit(1);
    }
}
testIntegration();