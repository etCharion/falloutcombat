# TERMLINK // Wasteland Bestiary

Fallout‑laděný nástroj pro správu NPC a boje (initiative / combat tracker) ve stylu
terminálu a Pip‑Boye. Určeno pro stolní RPG (Fallout 2d20).

Vytvořeno jako prototyp v Claude Design a nasazeno jako statická webová aplikace.

## Funkce

- Tři rozvržení: **Detail**, **Grid** a **Pip‑Boy**
- Sledování iniciativy, kol a stavu bojovníků
- Životy (HP), zásahové zóny těla, odolnosti (DR) podle typu zranění
- Editor příšer + bestiář se šablonami (Raider, Ghoul, Super Mutant, …)
- Stavové efekty, útoky, schopnosti, inventář
- Čtyři barevné motivy (Green / Amber / Sci / Rad), CRT efekty, zvuky
- Dvojjazyčné rozhraní (mix EN/CZ nebo čistá čeština)
- Data se ukládají do prohlížeče (localStorage)

## Spuštění

Jde o statickou stránku (React + Babel se načítají z CDN, JSX se překládá přímo
v prohlížeči). Stačí soubory naservírovat přes libovolný webový server, například:

```bash
python3 -m http.server 8000
# pak otevři http://localhost:8000/
```

Otevření `index.html` přímo přes `file://` nemusí fungovat kvůli načítání
sousedních `.jsx` souborů — použij lokální server (viz výše) nebo GitHub Pages.

### GitHub Pages

Repozitář je připraven na hostování přes GitHub Pages: v **Settings → Pages**
zvol branch `main` a složku `/ (root)`. Vstupním bodem je `index.html`.

## Struktura

| Soubor | Popis |
| --- | --- |
| `index.html` | vstupní stránka, načítá styly a skripty |
| `styles.css` | kompletní design systém (CRT terminál + Pip‑Boy) |
| `i18n.jsx` | překlady (mix / čeština) |
| `data.jsx` | výchozí bestiář, atributy, herní termíny |
| `components-base.jsx` | základní UI prvky, boot obrazovka, zvuky |
| `components-sidebar.jsx` | panel iniciativy |
| `components-main.jsx` | detailní pohled na bojovníka |
| `components-detail.jsx` | bojový log, editor příšer, výběr šablon |
| `components-grid.jsx` | kartové rozvržení (grid / Pip‑Boy) |
| `tweaks-panel.jsx` | plovoucí panel nastavení |
| `app.jsx` | hlavní aplikace, stav, klávesové zkratky |

## Klávesové zkratky

`N` nová příšera · `T` bestiář · `R` seřadit podle iniciativy · `mezerník` další tah
