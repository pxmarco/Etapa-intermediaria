/* ══════════════════════════════════════════════════════════════
   POKÉDEX GBA MASTER — script.js
   API: PokéAPI v2  |  386 Pokémon (Gen I–III)
══════════════════════════════════════════════════════════════ */

const API        = "https://pokeapi.co/api/v2";
const SPRITE_URL = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const MINI_URL   = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

/* ── Generation ranges ─────────────────────────────────────── */
const GEN_RANGES = {
    "1": { start: 1,   end: 151  },
    "2": { start: 152, end: 251  },
    "3": { start: 252, end: 386  },
};

/* ── Games → which gens are available ─────────────────────── */
const GAME_GENS = {
    "all":             [1, 2, 3],
    "red-blue":        [1],
    "yellow":          [1],
    "gold-silver":     [1, 2],
    "crystal":         [1, 2],
    "ruby-sapphire":   [3],
    "emerald":         [3],
    "firered-leafgreen":[1],
};

/* ── Type colors (CSS var names) ───────────────────────────── */
const TYPE_COLOR = {
    normal:"#9a9a7a",fire:"#f07030",water:"#6890f0",electric:"#f8d030",
    grass:"#78c850",ice:"#98d8d8",fighting:"#c03028",poison:"#a040a0",
    ground:"#e0c068",flying:"#a890f0",psychic:"#f85888",bug:"#a8b820",
    rock:"#b8a038",ghost:"#705898",dragon:"#7038f8",dark:"#705848",
    steel:"#b8b8d0",fairy:"#ee99ac",
};

/* ── Stat display names ─────────────────────────────────────── */
const STAT_NAMES = {
    hp:"HP",attack:"ATK",defense:"DEF",
    "special-attack":"SP.ATK","special-defense":"SP.DEF",speed:"VEL",
};

/* ── Cache para não re-buscar ───────────────────────────────── */
const cache = {};

/* ══════════════════════════════════════════════════════════════
   GBA LOCATION DATA (por ID)
   Fonte: Bulbapedia / GBA game data
══════════════════════════════════════════════════════════════ */
const GBA_LOCATIONS = {
    // ── Gen I ──────────────────────────────────────────────────
    1:  { loc:"Pallet Town (starter)",  method:"starter" },
    2:  { loc:"Pallet Town (starter)",  method:"starter" },
    3:  { loc:"Pallet Town (starter)",  method:"starter" },
    4:  { loc:"Pallet Town (starter)",  method:"starter" },
    5:  { loc:"Pallet Town (starter)",  method:"starter" },
    6:  { loc:"Pallet Town (starter)",  method:"starter" },
    7:  { loc:"Pallet Town (starter)",  method:"starter" },
    8:  { loc:"Pallet Town (starter)",  method:"starter" },
    9:  { loc:"Pallet Town (starter)",  method:"starter" },
    10: { loc:"Rota 1–25 (grama)",      method:"wild" },
    11: { loc:"Rota 25, Pokémon Mansion",method:"wild" },
    12: { loc:"Rota 12–15 (grama)",     method:"wild" },
    13: { loc:"Rota 12–15 (grama)",     method:"wild" },
    14: { loc:"Rota 12–15 (grama)",     method:"wild" },
    15: { loc:"Rota 12–15 (grama)",     method:"wild" },
    16: { loc:"Rota 16–18 (grama)",     method:"wild" },
    17: { loc:"Rota 16–18 (grama)",     method:"wild" },
    18: { loc:"Rota 16–18 (grama)",     method:"wild" },
    19: { loc:"Rota 1 (grama)",         method:"wild" },
    20: { loc:"Rota 1 (grama)",         method:"wild" },
    21: { loc:"Rota 9, 10 (grama)",     method:"wild" },
    22: { loc:"Safari Zone",            method:"wild" },
    23: { loc:"Pokémon Tower",          method:"wild" },
    24: { loc:"Pokémon Tower",          method:"wild" },
    25: { loc:"Safari Zone / Pwr Plant",method:"wild" },
    26: { loc:"Rota 1 (Thunder Stone)", method:"stone" },
    27: { loc:"Safari Zone (grama)",    method:"wild" },
    28: { loc:"Safari Zone (grama)",    method:"wild" },
    29: { loc:"Rota 35 / Mont Moon",    method:"wild" },
    30: { loc:"Rota 35 / Mont Moon",    method:"wild" },
    31: { loc:"Rota 35 / Mont Moon",    method:"wild" },
    32: { loc:"Rota 22 (grama)",        method:"wild" },
    33: { loc:"Rota 22 (grama)",        method:"wild" },
    34: { loc:"Rota 22 (grama)",        method:"wild" },
    35: { loc:"Mont Moon (grama)",      method:"wild" },
    36: { loc:"Mont Moon (Moon Stone)", method:"stone" },
    37: { loc:"Rota 36 (Fire Stone)",   method:"stone" },
    38: { loc:"Rota 36 (Fire Stone)",   method:"stone" },
    39: { loc:"Mont Moon (grama)",      method:"wild" },
    40: { loc:"Mont Moon (Moon Stone)", method:"stone" },
    41: { loc:"Pokémon Tower / Cavernas",method:"wild" },
    42: { loc:"Pokémon Tower",          method:"wild" },
    43: { loc:"Rota 12 (grama)",        method:"wild" },
    44: { loc:"Rota 12 (grama)",        method:"wild" },
    45: { loc:"Rota 12 (Leaf Stone)",   method:"stone" },
    46: { loc:"Montes & florestas",     method:"wild" },
    47: { loc:"Floresta de Viridian",   method:"wild" },
    48: { loc:"Rota 24–25 (grama)",     method:"wild" },
    49: { loc:"Rota 24–25 (grama)",     method:"wild" },
    50: { loc:"Diglett's Cave",         method:"wild" },
    51: { loc:"Diglett's Cave",         method:"wild" },
    52: { loc:"Rota 5–8 (grama)",       method:"wild" },
    53: { loc:"Rota 5–8 (grama)",       method:"wild" },
    54: { loc:"Safari Zone (água)",     method:"surf" },
    55: { loc:"Safari Zone (água)",     method:"surf" },
    56: { loc:"Safari Zone",            method:"wild" },
    57: { loc:"Safari Zone",            method:"wild" },
    58: { loc:"Cinnabar Lab (trade)",   method:"trade" },
    59: { loc:"Cinnabar Lab (Fire Stone)",method:"stone" },
    60: { loc:"Safari Zone (água)",     method:"surf" },
    61: { loc:"Safari Zone (água)",     method:"surf" },
    62: { loc:"Água (Water Stone)",     method:"stone" },
    63: { loc:"Goldenrod / Safári",     method:"wild" },
    64: { loc:"Goldenrod / Safári",     method:"wild" },
    65: { loc:"Troca",                  method:"trade" },
    66: { loc:"Rota 22 (grama)",        method:"wild" },
    67: { loc:"Rota 22 (grama)",        method:"wild" },
    68: { loc:"Troca",                  method:"trade" },
    69: { loc:"Safari Zone / Rota 12",  method:"wild" },
    70: { loc:"Safari Zone / Rota 12",  method:"wild" },
    71: { loc:"Leaf Stone",             method:"stone" },
    72: { loc:"Cerulean Cave (água)",   method:"surf" },
    73: { loc:"Cerulean Cave (água)",   method:"surf" },
    74: { loc:"Mont Moon (grama)",      method:"wild" },
    75: { loc:"Mont Moon (grama)",      method:"wild" },
    76: { loc:"Troca",                  method:"trade" },
    77: { loc:"Safari Zone",            method:"wild" },
    78: { loc:"Safari Zone (Fire Stone)",method:"stone" },
    79: { loc:"Água (surf)",            method:"surf" },
    80: { loc:"Água (Water Stone)",     method:"stone" },
    81: { loc:"Power Plant",            method:"wild" },
    82: { loc:"Power Plant",            method:"wild" },
    83: { loc:"Vermilion (troca)",      method:"trade" },
    84: { loc:"Rota 9–10",             method:"wild" },
    85: { loc:"Rota 9–10",             method:"wild" },
    86: { loc:"Seafoam Islands (surf)", method:"surf" },
    87: { loc:"Seafoam Islands",        method:"wild" },
    88: { loc:"Safari Zone",            method:"wild" },
    89: { loc:"Safari Zone",            method:"wild" },
    90: { loc:"Água (surf)",            method:"surf" },
    91: { loc:"Água (surf)",            method:"surf" },
    92: { loc:"Pokémon Tower",          method:"wild" },
    93: { loc:"Pokémon Tower",          method:"wild" },
    94: { loc:"Troca ou Lavender",      method:"trade" },
    95: { loc:"Rock Tunnel",            method:"wild" },
    96: { loc:"Safari Zone",            method:"wild" },
    97: { loc:"Safari Zone",            method:"wild" },
    98: { loc:"Água (surf)",            method:"surf" },
    99: { loc:"Água (surf)",            method:"surf" },
    100:{ loc:"Power Plant",            method:"wild" },
    101:{ loc:"Power Plant",            method:"wild" },
    102:{ loc:"Safari Zone",            method:"wild" },
    103:{ loc:"Safari Zone (Leaf Stone)",method:"stone" },
    104:{ loc:"Safari Zone",            method:"wild" },
    105:{ loc:"Safari Zone",            method:"wild" },
    106:{ loc:"Troca",                  method:"trade" },
    107:{ loc:"Troca",                  method:"trade" },
    108:{ loc:"Safari Zone",            method:"wild" },
    109:{ loc:"Pokémon Tower",          method:"wild" },
    110:{ loc:"Pokémon Tower",          method:"wild" },
    111:{ loc:"Safari Zone",            method:"wild" },
    112:{ loc:"Safari Zone",            method:"wild" },
    113:{ loc:"Safari Zone",            method:"wild" },
    114:{ loc:"Safari Zone",            method:"wild" },
    115:{ loc:"Safari Zone",            method:"wild" },
    116:{ loc:"Água (surf) / Seafoam",  method:"surf" },
    117:{ loc:"Água (surf)",            method:"surf" },
    118:{ loc:"Água (pesca)",           method:"fishing" },
    119:{ loc:"Água (pesca super rod)", method:"fishing" },
    120:{ loc:"Água (surf)",            method:"surf" },
    121:{ loc:"Água (Water Stone)",     method:"stone" },
    122:{ loc:"Troca",                  method:"trade" },
    123:{ loc:"Safari Zone",            method:"wild" },
    124:{ loc:"Troca",                  method:"trade" },
    125:{ loc:"Power Plant",            method:"wild" },
    126:{ loc:"Cinnabar Mansion",       method:"wild" },
    127:{ loc:"Safari Zone",            method:"wild" },
    128:{ loc:"Safari Zone",            method:"wild" },
    129:{ loc:"Água (pesca old rod)",   method:"fishing" },
    130:{ loc:"Água (Water Stone)",     method:"stone" },
    131:{ loc:"Seafoam Islands",        method:"wild" },
    132:{ loc:"Cerulean Cave",          method:"wild" },
    133:{ loc:"Celadon (compra)",       method:"gift" },
    134:{ loc:"Celadon (Water Stone)",  method:"stone" },
    135:{ loc:"Celadon (Thunder Stone)",method:"stone" },
    136:{ loc:"Celadon (Fire Stone)",   method:"stone" },
    137:{ loc:"Silph Co. (presente)",   method:"gift" },
    138:{ loc:"Cinnabar Lab (fóssil)",  method:"fossil" },
    139:{ loc:"Cinnabar Lab (fóssil)",  method:"fossil" },
    140:{ loc:"Cinnabar Lab (fóssil)",  method:"fossil" },
    141:{ loc:"Cinnabar Lab (fóssil)",  method:"fossil" },
    142:{ loc:"Cinnabar Lab (fóssil)",  method:"fossil" },
    143:{ loc:"Cerulean Cave",          method:"wild" },
    144:{ loc:"Seafoam Islands",        method:"legendary" },
    145:{ loc:"Power Plant",            method:"legendary" },
    146:{ loc:"Cinnabar Mansion",       method:"legendary" },
    147:{ loc:"Safari Zone",            method:"wild" },
    148:{ loc:"Safari Zone",            method:"wild" },
    149:{ loc:"Safari Zone",            method:"wild" },
    150:{ loc:"Cerulean Cave",          method:"legendary" },
    151:{ loc:"Mew — evento especial",  method:"legendary" },

    // ── Gen II ─────────────────────────────────────────────────
    152:{ loc:"New Bark Town (starter)",method:"starter" },
    155:{ loc:"New Bark Town (starter)",method:"starter" },
    158:{ loc:"New Bark Town (starter)",method:"starter" },
    161:{ loc:"Rota 29 (grama)",        method:"wild" },
    163:{ loc:"Rota 35 (noturno)",      method:"wild" },
    165:{ loc:"Rota 30 (grama)",        method:"wild" },
    167:{ loc:"Rota 30 (grama)",        method:"wild" },
    169:{ loc:"Goldenrod (Moonstone)",  method:"stone" },
    170:{ loc:"Rota 32 (surf)",         method:"surf" },
    172:{ loc:"Rota 29 (Thunder Stone)",method:"stone" },
    173:{ loc:"Mt. Moon (Moon Stone)",  method:"stone" },
    174:{ loc:"Mt. Moon (Moon Stone)",  method:"stone" },
    175:{ loc:"Ovo (Pokémon Day Care)", method:"egg" },
    179:{ loc:"Rota 32 (grama)",        method:"wild" },
    183:{ loc:"Água (surf)",            method:"surf" },
    185:{ loc:"Troca",                  method:"trade" },
    187:{ loc:"Rota 32 (grama)",        method:"wild" },
    190:{ loc:"Goldenrod (noturno)",    method:"wild" },
    193:{ loc:"Rota 35 (surf)",         method:"surf" },
    194:{ loc:"Rota 32 (surf)",         method:"surf" },
    196:{ loc:"Troca (Fire Stone)",     method:"stone" },
    197:{ loc:"Troca (Water Stone)",    method:"stone" },
    198:{ loc:"Rota 35 (noturno)",      method:"wild" },
    200:{ loc:"Rota 35 (noturno)",      method:"wild" },
    201:{ loc:"Ruins of Alph",          method:"wild" },
    202:{ loc:"Rota 35 (caminhada)",    method:"walk" },
    203:{ loc:"Rota 35 (grama)",        method:"wild" },
    204:{ loc:"Rota 30 (grama)",        method:"wild" },
    206:{ loc:"Rota 35 (grama)",        method:"wild" },
    207:{ loc:"Rota 45 (grama)",        method:"wild" },
    209:{ loc:"Goldenrod (Moonstone)",  method:"stone" },
    211:{ loc:"Água (pesca)",           method:"fishing" },
    213:{ loc:"Rota 33 (grama)",        method:"wild" },
    214:{ loc:"Rota 45 (grama)",        method:"wild" },
    215:{ loc:"Ice Path",               method:"wild" },
    216:{ loc:"Ice Path",               method:"wild" },
    218:{ loc:"Rota 36 (lava surf)",    method:"surf" },
    220:{ loc:"Ice Path",               method:"wild" },
    222:{ loc:"Água (pesca)",           method:"fishing" },
    223:{ loc:"Água (pesca)",           method:"fishing" },
    225:{ loc:"Rota 37 (noturno)",      method:"wild" },
    226:{ loc:"Rota 40 (surf)",         method:"surf" },
    227:{ loc:"Rota 45",                method:"wild" },
    228:{ loc:"Mt. Silver",             method:"wild" },
    231:{ loc:"Safari Zone / Rota 45",  method:"wild" },
    233:{ loc:"Troca",                  method:"trade" },
    234:{ loc:"Rota 36 (grama)",        method:"wild" },
    235:{ loc:"Rota 35 (Smeargle)",     method:"wild" },
    236:{ loc:"Mt. Silver",             method:"wild" },
    238:{ loc:"Goldenrod (Moonstone)",  method:"stone" },
    239:{ loc:"Rota 35 (Thunder Stone)",method:"stone" },
    240:{ loc:"Rota 36 (Fire Stone)",   method:"stone" },
    241:{ loc:"Rota 38 (grama)",        method:"wild" },
    242:{ loc:"Rota 38 (nível alto)",   method:"wild" },
    243:{ loc:"Rota 36 — lendário",     method:"legendary" },
    244:{ loc:"Burnt Tower — lendário", method:"legendary" },
    245:{ loc:"Whirl Islands — lendário",method:"legendary" },
    246:{ loc:"Mt. Silver",             method:"wild" },
    249:{ loc:"Whirl Islands — lendário",method:"legendary" },
    250:{ loc:"Tin Tower — lendário",   method:"legendary" },
    251:{ loc:"Ilex Forest — evento",   method:"legendary" },

    // ── Gen III ────────────────────────────────────────────────
    252:{ loc:"Littleroot Town (starter)",method:"starter" },
    255:{ loc:"Littleroot Town (starter)",method:"starter" },
    258:{ loc:"Littleroot Town (starter)",method:"starter" },
    261:{ loc:"Rota 101 (grama)",       method:"wild" },
    263:{ loc:"Rota 101 (grama)",       method:"wild" },
    265:{ loc:"Rota 101 (grama)",       method:"wild" },
    270:{ loc:"Rota 102 (água)",        method:"surf" },
    273:{ loc:"Rota 102 (grama)",       method:"wild" },
    276:{ loc:"Rota 104 (grama)",       method:"wild" },
    278:{ loc:"Rota 104 (surf)",        method:"surf" },
    280:{ loc:"Rota 102 (grama)",       method:"wild" },
    283:{ loc:"Rota 102 (água)",        method:"surf" },
    285:{ loc:"Rota 117 (grama)",       method:"wild" },
    287:{ loc:"Rota 101 (grama/noite)", method:"wild" },
    290:{ loc:"Rota 116 (underground)", method:"wild" },
    293:{ loc:"Rota 116 (grama)",       method:"wild" },
    296:{ loc:"Rota 115 (grama)",       method:"wild" },
    298:{ loc:"Rota 117 (grama)",       method:"wild" },
    299:{ loc:"Granite Cave",           method:"wild" },
    300:{ loc:"Rota 116 (grama)",       method:"wild" },
    302:{ loc:"Granite Cave",           method:"wild" },
    303:{ loc:"Granite Cave (Moonstone)",method:"stone" },
    304:{ loc:"Granite Cave",           method:"wild" },
    307:{ loc:"Rota 115 (grama)",       method:"wild" },
    309:{ loc:"Rota 110 (grama)",       method:"wild" },
    311:{ loc:"Rota 110 (grama)",       method:"wild" },
    312:{ loc:"Rota 110 (grama)",       method:"wild" },
    313:{ loc:"Rota 117 (noturno)",     method:"wild" },
    314:{ loc:"Rota 117 (diurno)",      method:"wild" },
    315:{ loc:"Rota 117 (grama)",       method:"wild" },
    316:{ loc:"Rota 110 (grama)",       method:"wild" },
    318:{ loc:"Rota 118 (surf/pesca)",  method:"fishing" },
    320:{ loc:"Água (surf)",            method:"surf" },
    322:{ loc:"Rota 112 (lava)",        method:"wild" },
    324:{ loc:"Rota 112 (grama)",       method:"wild" },
    325:{ loc:"Rota 115 (grama)",       method:"wild" },
    327:{ loc:"Rota 113 (grama)",       method:"wild" },
    328:{ loc:"Rota 111 (areia)",       method:"wild" },
    331:{ loc:"Rota 111 (areia)",       method:"wild" },
    333:{ loc:"Rota 114 (grama)",       method:"wild" },
    335:{ loc:"Rota 114 (grama)",       method:"wild" },
    336:{ loc:"Rota 114 (grama)",       method:"wild" },
    337:{ loc:"Mt. Pyre (Moon Stone)",  method:"stone" },
    338:{ loc:"Mt. Pyre (Sun Stone)",   method:"stone" },
    339:{ loc:"Água (pesca)",           method:"fishing" },
    341:{ loc:"Água (pesca)",           method:"fishing" },
    343:{ loc:"Rota 111 (areia)",       method:"wild" },
    345:{ loc:"Rota 111 (fóssil)",      method:"fossil" },
    347:{ loc:"Rota 111 (fóssil)",      method:"fossil" },
    349:{ loc:"Água (pesca old rod)",   method:"fishing" },
    351:{ loc:"Rota 119 (grama)",       method:"wild" },
    352:{ loc:"Rota 119 (grama)",       method:"wild" },
    353:{ loc:"Mt. Pyre",               method:"wild" },
    355:{ loc:"Mt. Pyre",               method:"wild" },
    357:{ loc:"Rota 119 (grama)",       method:"wild" },
    358:{ loc:"Rota 119 (grama)",       method:"wild" },
    359:{ loc:"Rota 120 (grama/noite)", method:"wild" },
    360:{ loc:"Ovo (Day Care)",         method:"egg" },
    361:{ loc:"Shoal Cave",             method:"wild" },
    363:{ loc:"Água (surf) / Shoal Cave",method:"surf" },
    364:{ loc:"Água (surf)",            method:"surf" },
    366:{ loc:"Água (pesca)",           method:"fishing" },
    369:{ loc:"Água (pesca super rod)", method:"fishing" },
    370:{ loc:"Água (pesca)",           method:"fishing" },
    371:{ loc:"Meteor Falls",           method:"wild" },
    374:{ loc:"Granite Cave / caves",   method:"wild" },
    377:{ loc:"Granite Cave — lendário",method:"legendary" },
    378:{ loc:"Shoal Cave — lendário",  method:"legendary" },
    379:{ loc:"Abandoned Ship — lendário",method:"legendary" },
    380:{ loc:"Cave of Origin — lendário",method:"legendary" },
    381:{ loc:"Cave of Origin — lendário",method:"legendary" },
    382:{ loc:"Cave of Origin — lendário",method:"legendary" },
    383:{ loc:"Cave of Origin — lendário",method:"legendary" },
    384:{ loc:"Sky Pillar — lendário",  method:"legendary" },
    385:{ loc:"Faraway Island — evento",method:"legendary" },
    386:{ loc:"Birth Island — evento",  method:"legendary" },
};

/* ── Method icons & labels ─────────────────────────────────── */
const METHOD_META = {
    wild:     { icon:"fa-seedling",    color:"#78c850", label:"Encontrar na grama" },
    surf:     { icon:"fa-water",       color:"#6890f0", label:"Surf / Água" },
    fishing:  { icon:"fa-fish",        color:"#6890f0", label:"Pescaria" },
    stone:    { icon:"fa-gem",         color:"#e0c068", label:"Pedra evolutiva" },
    trade:    { icon:"fa-right-left",  color:"#a890f0", label:"Troca" },
    walk:     { icon:"fa-shoe-prints", color:"#f8d030", label:"Caminhar" },
    egg:      { icon:"fa-egg",         color:"#ee99ac", label:"Chocar ovo" },
    gift:     { icon:"fa-gift",        color:"#98d8d8", label:"Presente / NPC" },
    fossil:   { icon:"fa-bone",        color:"#b8a038", label:"Ressuscitar fóssil" },
    legendary:{ icon:"fa-star",        color:"#f8d030", label:"Lendário" },
    starter:  { icon:"fa-flag",        color:"#f07030", label:"Pokémon inicial" },
};

/* ── Cheat codes (GameShark/CodeBreaker) ────────────────────── */
// Slot-1 wild encounter: jogo -> [master code (optional), encounter code prefix]
const GAME_CHEATS = {
    "firered-leafgreen": {
        name: "FireRed / LeafGreen",
        master: "000014D1 000A\n1003DAE6 0007",
        encounter: id => {
            const hex = id.toString(16).toUpperCase().padStart(3,"0");
            return `82031DBC ${hex}01`;
        },
    },
    "emerald": {
        name: "Pokémon Emerald",
        master: "9266061E 8BB15B4C\nA47FB2DC 1AF3CA86",
        encounter: id => {
            const hex = id.toString(16).toUpperCase().padStart(4,"0");
            return `EB34F751 A96B854D\n78DA95DF 44018CB4`;
        },
    },
    "ruby-sapphire": {
        name: "Ruby / Sapphire",
        master: "0000B138 000A\n1003A82A 0007",
        encounter: id => {
            const hex = id.toString(16).toUpperCase().padStart(3,"0");
            return `82005274 ${hex}01`;
        },
    },
};

// Fallback genérico (ID encounter)
function buildCheat(id, game) {
    const entry = GAME_CHEATS[game];
    if (entry) {
        return { master: entry.master, encounter: entry.encounter(id), gameName: entry.name };
    }
    // Gen I/II jogos não têm GameShark GBA nativo → exibir info
    const hex = id.toString(16).toUpperCase().padStart(4, "0");
    return {
        master: null,
        encounter: `01${hex}D8CF`,
        gameName: game ? game : "GBA",
    };
}

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
let allPokemon   = [];   // lista completa carregada
let filtered     = [];   // lista após filtros
let activeGame   = "all";
let activeGen    = "all";
let activeType   = "all";
let activeSearch = "";

/* ══════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
    bindUI();
    await loadAllPokemon();
    applyFilters();
});

/* ══════════════════════════════════════════════════════════════
   UI BINDINGS
══════════════════════════════════════════════════════════════ */
function bindUI() {
    document.getElementById("btnSearch").addEventListener("click", () => {
        readFilters();
        applyFilters();
        renderChips();
    });

    document.getElementById("searchInput").addEventListener("keydown", e => {
        if (e.key === "Enter") {
            readFilters();
            applyFilters();
            renderChips();
        }
    });

    document.getElementById("btnClear").addEventListener("click", () => {
        document.getElementById("gameFilter").value = "all";
        document.getElementById("genFilter").value  = "all";
        document.getElementById("typeFilter").value = "all";
        document.getElementById("searchInput").value = "";
        activeGame = activeGen = activeType = "all";
        activeSearch = "";
        applyFilters();
        renderChips();
    });

    // Sync game → gen
    document.getElementById("gameFilter").addEventListener("change", () => {
        const game = document.getElementById("gameFilter").value;
        const gens = GAME_GENS[game] || [1,2,3];
        const genSel = document.getElementById("genFilter");
        // Se o gen ativo não está disponível, resetar
        if (activeGen !== "all" && !gens.includes(+activeGen)) {
            genSel.value = "all";
        }
    });

    // Close modal
    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").addEventListener("click", e => {
        if (e.target === document.getElementById("modalOverlay")) closeModal();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

function readFilters() {
    activeGame   = document.getElementById("gameFilter").value;
    activeGen    = document.getElementById("genFilter").value;
    activeType   = document.getElementById("typeFilter").value;
    activeSearch = document.getElementById("searchInput").value.trim().toLowerCase();
}

/* ══════════════════════════════════════════════════════════════
   DATA LOADING
   Estratégia: carrega só lista básica (1 request) → renderiza
   imediatamente com sprites estáticos por ID. Detalhes (tipos,
   stats) são buscados em background em batches pequenos e os
   cards são atualizados conforme chegam.
══════════════════════════════════════════════════════════════ */

// Mapa de nome → dados completos (preenchido em background)
const detailCache = {};

async function loadAllPokemon() {
    showLoader("CARREGANDO...");

    // 1 request: lista com nome + ID extraído da URL
    const listRes = await fetchJSON(`${API}/pokemon?limit=386&offset=0`);
    allPokemon = listRes.results.map((p, i) => ({
        id:    i + 1,
        name:  p.name,
        url:   p.url,
        types: [],        // será preenchido em background
        _loaded: false,
    }));

    updateHeroCount(`386 Pokémon disponíveis`);

    // Renderiza imediatamente (cards sem tipo ainda)
    applyFilters();

    // Background: busca detalhes em batches de 20, atualiza cards
    fetchDetailsInBackground();
}

async function fetchDetailsInBackground() {
    const BATCH = 20;
    for (let i = 0; i < allPokemon.length; i += BATCH) {
        const batch = allPokemon.slice(i, i + BATCH);
        const details = await Promise.all(batch.map(p => fetchJSON(p.url).catch(() => null)));
        details.forEach((data, j) => {
            if (!data) return;
            const idx = i + j;
            allPokemon[idx] = { ...allPokemon[idx], ...data, _loaded: true };
            detailCache[data.id] = data;
            // Atualiza o card já renderizado sem re-renderizar tudo
            updateCardTypes(data);
        });
    }
}

// Atualiza tipos e barra colorida de um card já no DOM
function updateCardTypes(poke) {
    const card = document.querySelector(`.poke-card[data-id="${poke.id}"]`);
    if (!card) return;
    const primary = poke.types[0]?.type.name;
    const clr     = TYPE_COLOR[primary] || "#888";
    const bar = card.querySelector(".card-type-bar");
    if (bar) bar.style.background = clr;
    const glow = card.querySelector(".card-img-glow");
    if (glow) glow.style.setProperty("--type-clr", clr);
    const typesEl = card.querySelector(".card-types");
    if (typesEl) {
        typesEl.innerHTML = poke.types.map(t =>
            `<span class="type-pill" style="background:${TYPE_COLOR[t.type.name]||"#888"}">${t.type.name}</span>`
        ).join("");
    }
}

/* ══════════════════════════════════════════════════════════════
   FILTERS
══════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 48;
let currentPage = 0;

function applyFilters() {
    const gens = GAME_GENS[activeGame] || [1,2,3];

    filtered = allPokemon.filter(p => {
        const pGen = getGen(p.id);
        if (activeGame !== "all" && !gens.includes(pGen)) return false;
        if (activeGen  !== "all" && pGen !== +activeGen)  return false;
        if (activeType !== "all") {
            if (!p._loaded) return false;  // aguarda detalhes
            if (!p.types.some(t => t.type.name === activeType)) return false;
        }
        if (activeSearch) {
            const numMatch  = p.id.toString() === activeSearch;
            const nameMatch = p.name.includes(activeSearch);
            if (!numMatch && !nameMatch) return false;
        }
        return true;
    });

    currentPage = 0;
    renderPage();
}

function renderPage() {
    const start = currentPage * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);
    const isFirstPage = currentPage === 0;

    renderGrid(slice, isFirstPage);

    const total = filtered.length;
    const shown = Math.min(start + PAGE_SIZE, total);
    document.getElementById("resultsCount").innerHTML =
        `<strong>${shown}</strong> de <strong>${total}</strong> Pokémon`;

    const old = document.getElementById("btnMore");
    if (old) old.remove();
    if (shown < total) {
        const btn = document.createElement("button");
        btn.id = "btnMore";
        btn.className = "btn-search";
        btn.style.cssText = "margin:24px auto 0;display:flex;max-width:220px;";
        btn.innerHTML = `<i class="fa-solid fa-chevron-down"></i>&nbsp;VER MAIS`;
        btn.onclick = () => { currentPage++; renderPage(); };
        document.getElementById("pokedexGrid").insertAdjacentElement("afterend", btn);
    }
}

function getGen(id) {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    return 3;
}

/* ══════════════════════════════════════════════════════════════
   CHIPS
══════════════════════════════════════════════════════════════ */
function renderChips() {
    const container = document.getElementById("activeFilters");
    container.innerHTML = "";

    const add = (label, onRemove) => {
        const chip = document.createElement("span");
        chip.className = "filter-chip";
        chip.innerHTML = `${label} <button title="Remover">✕</button>`;
        chip.querySelector("button").onclick = onRemove;
        container.appendChild(chip);
    };

    if (activeGame !== "all") {
        const opt = document.querySelector(`#gameFilter option[value="${activeGame}"]`);
        add(`🎮 ${opt ? opt.textContent : activeGame}`, () => {
            document.getElementById("gameFilter").value = "all";
            activeGame = "all"; applyFilters(); renderChips();
        });
    }
    if (activeGen !== "all") {
        add(`Gen ${activeGen}`, () => {
            document.getElementById("genFilter").value = "all";
            activeGen = "all"; applyFilters(); renderChips();
        });
    }
    if (activeType !== "all") {
        add(`● ${activeType}`, () => {
            document.getElementById("typeFilter").value = "all";
            activeType = "all"; applyFilters(); renderChips();
        });
    }
    if (activeSearch) {
        add(`"${activeSearch}"`, () => {
            document.getElementById("searchInput").value = "";
            activeSearch = ""; applyFilters(); renderChips();
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   RENDER GRID
══════════════════════════════════════════════════════════════ */
function renderGrid(list, replace = true) {
    const grid = document.getElementById("pokedexGrid");
    if (replace) grid.innerHTML = "";

    if (!list.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-xmark"></i>
                <p>NENHUM POKÉMON<br>ENCONTRADO</p>
            </div>`;
        return;
    }

    list.forEach((p, idx) => {
        // types pode estar vazio enquanto background fetch não terminou
        const primary = p.types?.[0]?.type?.name || null;
        const clr     = primary ? (TYPE_COLOR[primary] || "#888") : "#2a2a3a";
        // Usa sprite pequeno (PNG ~2KB) para carregamento imediato
        const img     = MINI_URL(p.id);

        const card = document.createElement("div");
        card.className = "poke-card";
        card.dataset.id = p.id;
        card.style.animationDelay = `${Math.min(idx * 0.025, 0.8)}s`;
        card.innerHTML = `
            <div class="card-type-bar" style="background:${clr};"></div>
            <div class="card-img-wrap">
                <div class="card-img-glow" style="--type-clr:${clr};"></div>
                <img src="${img}" alt="${p.name}" loading="lazy" width="96" height="96">
            </div>
            <div class="card-body-inner">
                <span class="card-num">#${String(p.id).padStart(4,"0")}</span>
                <span class="card-name">${p.name}</span>
                <div class="card-types">
                    ${primary
                        ? p.types.map(t =>
                            `<span class="type-pill" style="background:${TYPE_COLOR[t.type.name]||"#888"}">${t.type.name}</span>`
                          ).join("")
                        : `<span style="font-size:.6rem;color:var(--muted);">carregando...</span>`
                    }
                </div>
            </div>`;
        card.addEventListener("click", () => openModal(p.id));
        grid.appendChild(card);
    });
}

/* ══════════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════════ */
async function openModal(id) {
    const overlay = document.getElementById("modalOverlay");
    const content = document.getElementById("modalContent");

    content.innerHTML = `
        <div style="padding:60px;text-align:center;">
            <div class="gba-spinner" style="margin:0 auto;"></div>
            <p style="font-family:'Press Start 2P',monospace;font-size:.45rem;color:var(--muted);margin-top:16px;">LOADING...</p>
        </div>`;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    try {
        const poke    = await fetchCached(`${API}/pokemon/${id}`);
        const species = await fetchCached(poke.species.url);
        const evoChain= await fetchCached(species.evolution_chain.url);

        const primaryType = poke.types[0].type.name;
        const clr         = TYPE_COLOR[primaryType] || "#888";

        // location & method
        const locData = GBA_LOCATIONS[id] || { loc:"Desconhecido", method:"wild" };
        const methodM = METHOD_META[locData.method] || METHOD_META["wild"];

        // cheat
        const game   = activeGame !== "all" ? activeGame : detectBestGame(id);
        const cheat  = buildCheat(id, game);

        // flavor text
        const flavorEntry = species.flavor_text_entries.find(f => f.language.name === "en");
        const flavor = flavorEntry ? flavorEntry.flavor_text.replace(/\f/g," ") : "";

        // physical
        const heightM = (poke.height / 10).toFixed(1);
        const weightK = (poke.weight / 10).toFixed(1);

        content.innerHTML = `
            <div class="modal-header-band" style="background:${clr};"></div>
            <div class="modal-hero">
                <div class="modal-img-wrap">
                    <div class="modal-img-glow" style="background:${clr};"></div>
                    <img src="${SPRITE_URL(id)}" alt="${poke.name}"
                         onerror="this.src='${MINI_URL(id)}'">
                </div>
                <div class="modal-id-name">
                    <span class="modal-num">#${String(id).padStart(4,"0")}</span>
                    <h2>${poke.name}</h2>
                    <div class="card-types">
                        ${poke.types.map(t =>
                            `<span class="type-pill" style="background:${TYPE_COLOR[t.type.name]||"#888"}">${t.type.name}</span>`
                        ).join("")}
                    </div>
                    <div class="phys-row" style="margin-top:12px;">
                        <span class="phys-pill"><i class="fa-solid fa-ruler-vertical"></i>${heightM} m</span>
                        <span class="phys-pill"><i class="fa-solid fa-weight-hanging"></i>${weightK} kg</span>
                        <span class="phys-pill"><i class="fa-solid fa-dna"></i>${species.generation.name.replace("generation-","Gen ").toUpperCase()}</span>
                    </div>
                    ${flavor ? `<p style="font-size:.78rem;color:var(--muted);margin-top:10px;font-style:italic;max-width:340px;">${flavor}</p>` : ""}
                </div>
            </div>

            <div class="modal-body-inner">
                <!-- STATS -->
                <div class="stats-grid">
                    ${poke.stats.map(s => {
                        const label = STAT_NAMES[s.stat.name] || s.stat.name;
                        const pct   = Math.round((s.base_stat / 255) * 100);
                        const barClr = s.base_stat >= 100 ? "#78c850" : s.base_stat >= 60 ? "#f8d030" : "#e63946";
                        return `
                        <div class="stat-row">
                            <div class="stat-meta">
                                <span class="stat-name">${label}</span>
                                <span class="stat-val">${s.base_stat}</span>
                            </div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width:${pct}%;background:${barClr};"></div>
                            </div>
                        </div>`;
                    }).join("")}
                </div>

                <!-- INFO: localização + cheat -->
                <div class="info-section">
                    <div class="info-box">
                        <div class="info-box-title" style="color:${methodM.color};">
                            <i class="fa-solid ${methodM.icon}"></i> LOCALIZAÇÃO GBA
                        </div>
                        <div class="info-item">
                            <strong>Local</strong>${locData.loc}
                        </div>
                        <div class="info-item" style="margin-top:8px;">
                            <strong>Método</strong>
                            <span style="color:${methodM.color};">
                                <i class="fa-solid ${methodM.icon}" style="margin-right:5px;"></i>${methodM.label}
                            </span>
                        </div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-title" style="color:#00ff88;">
                            <i class="fa-solid fa-terminal"></i> CHEAT CODE
                        </div>
                        <div class="cheat-grid">
                            ${cheat.master ? `
                                <div class="cheat-entry">
                                    <div class="cheat-label">Master Code (${cheat.gameName})</div>
                                    <code class="cheat-code">${cheat.master}</code>
                                </div>` : ""}
                            <div class="cheat-entry">
                                <div class="cheat-label">Wild Encounter</div>
                                <code class="cheat-code">${cheat.encounter}</code>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- EVOLUTION CHAIN -->
                <div class="evo-section">
                    <div class="evo-title">CADEIA EVOLUTIVA</div>
                    <div class="evo-chain" id="evoChain">
                        <div class="gba-spinner" style="width:28px;height:28px;"></div>
                    </div>
                </div>
            </div>`;

        // Render evo chain async
        renderEvoChain(evoChain.chain, id);

    } catch(err) {
        console.error(err);
        content.innerHTML = `
            <div style="padding:60px;text-align:center;color:var(--muted);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;margin-bottom:12px;"></i>
                <p style="font-family:'Press Start 2P',monospace;font-size:.45rem;">ERRO AO CARREGAR</p>
            </div>`;
    }
}

function closeModal() {
    document.getElementById("modalOverlay").classList.remove("open");
    document.body.style.overflow = "";
}

/* ══════════════════════════════════════════════════════════════
   EVOLUTION CHAIN
══════════════════════════════════════════════════════════════ */
async function renderEvoChain(chain, currentId) {
    const container = document.getElementById("evoChain");
    if (!container) return;
    container.innerHTML = "";

    // Flatten chain (handles branched evolutions)
    const nodes = flattenChain(chain);

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pokeId = extractId(node.species.url);

        // Arrow + trigger between nodes
        if (i > 0) {
            const prev = nodes[i - 1];
            const trigger = getEvoTrigger(prev.evolves_to, node);
            const arrow = document.createElement("div");
            arrow.className = "evo-trigger";
            arrow.innerHTML = `
                <i class="fa-solid fa-arrow-right" style="font-size:.7rem;"></i>
                <span>${trigger}</span>`;
            container.appendChild(arrow);
        }

        const evoNode = document.createElement("div");
        evoNode.className = "evo-node" + (pokeId == currentId ? " active" : "");
        evoNode.innerHTML = `
            <img src="${MINI_URL(pokeId)}" alt="${node.species.name}"
                 onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png'">
            <span class="evo-node-name">${node.species.name}</span>
            <span class="evo-node-num">#${String(pokeId).padStart(3,"0")}</span>`;
        evoNode.addEventListener("click", () => {
            closeModal();
            setTimeout(() => openModal(pokeId), 80);
        });
        container.appendChild(evoNode);
    }
}

// Flattens chain (picks first branch at each fork)
function flattenChain(chain) {
    const nodes = [];
    let current = chain;
    while (current) {
        nodes.push(current);
        current = current.evolves_to.length > 0 ? current.evolves_to[0] : null;
    }
    return nodes;
}

// Extract evolution trigger label
function getEvoTrigger(evolvesTo, targetNode) {
    if (!evolvesTo || !evolvesTo.length) return "";
    const evoEntry = evolvesTo.find(e => e.species.name === targetNode.species.name);
    if (!evoEntry || !evoEntry.evolution_details.length) return "→";

    const det = evoEntry.evolution_details[0];
    if (det.trigger.name === "level-up") {
        if (det.min_level)       return `Nv.${det.min_level}`;
        if (det.min_happiness)   return `Felicidade`;
        if (det.time_of_day)     return `Nv.↑ (${det.time_of_day})`;
        if (det.min_beauty)      return `Beleza`;
        return "Nv.↑";
    }
    if (det.trigger.name === "use-item") {
        const item = det.item?.name.replace(/-/g," ") || "item";
        return item;
    }
    if (det.trigger.name === "trade") {
        return det.held_item ? `Troca c/ ${det.held_item.name.replace(/-/g," ")}` : "Troca";
    }
    if (det.trigger.name === "shed") return "Nv.20 + vaga";
    return det.trigger.name.replace(/-/g," ");
}

function extractId(url) {
    return url.split("/").filter(Boolean).pop();
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function detectBestGame(id) {
    if (id <= 151) return "firered-leafgreen";
    if (id <= 251) return "gold-silver";
    return "emerald";
}

function showLoader(msg = "LOADING...") {
    document.getElementById("pokedexGrid").innerHTML = `
        <div class="loader-wrap">
            <div class="gba-spinner"></div>
            <span class="loader-label">${msg}</span>
        </div>`;
}

function updateHeroCount(text) {
    document.getElementById("heroCount").textContent = text;
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
}

async function fetchCached(url) {
    if (cache[url]) return cache[url];
    const data = await fetchJSON(url);
    cache[url] = data;
    return data;
}
