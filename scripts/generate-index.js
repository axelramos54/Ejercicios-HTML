// scripts/generate-index.js
//
// Escanea la raíz del repo buscando carpetas "practicaN_100033745" que
// tengan un index.html adentro, y regenera automáticamente el bloque de
// enlaces en index.html y la tabla en README.md.
//
// No requiere dependencias externas (solo el Node.js que trae GitHub Actions).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_URL = 'https://axelramos54.github.io/Ejercicios-HTML';

const START_MARKER = '<!-- PRACTICAS:START -->';
const END_MARKER = '<!-- PRACTICAS:END -->';

function findPracticas() {
    return fs
        .readdirSync(ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => /^practica\d+_100033745$/.test(name))
        .filter((name) => fs.existsSync(path.join(ROOT, name, 'index.html')))
        .map((folder) => {
            const num = parseInt(folder.match(/^practica(\d+)_100033745$/)[1], 10);
            const html = fs.readFileSync(path.join(ROOT, folder, 'index.html'), 'utf8');
            const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
            const description = descMatch ? descMatch[1] : `Práctica ${num}`;
            return { folder, num, description };
        })
        .sort((a, b) => a.num - b.num);
}

function replaceBlock(filePath, buildContent) {
    if (!fs.existsSync(filePath)) {
        console.warn(`No existe ${filePath}, se omite.`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        console.warn(`No se encontraron los marcadores PRACTICAS:START/END en ${filePath}, se omite.`);
        return;
    }
    const before = content.slice(0, startIdx + START_MARKER.length);
    const after = content.slice(endIdx);
    const updated = `${before}\n${buildContent}\n${after}`;
    fs.writeFileSync(filePath, updated);
    console.log(`Actualizado: ${path.relative(ROOT, filePath)}`);
}

function buildIndexHtmlBlock(practicas) {
    return practicas
        .map(
            (p) => `      <li class="task">
        <a class="task__link" href="${p.folder}/">
          <span class="task__index">${String(p.num).padStart(2, '0')}</span>
          <span class="task__body">
            <span class="task__label">${p.folder}/</span>
            <span class="task__desc">${p.description}</span>
          </span>
          <span class="task__go">abrir →</span>
        </a>
      </li>`
        )
        .join('\n');
}

function buildReadmeBlock(practicas) {
    const header = '| # | Práctica | Descripción | Código | Página publicada |\n|---|----------|--------------|--------|-------------------|';
    const rows = practicas
        .map(
            (p) =>
                `| ${String(p.num).padStart(2, '0')} | \`${p.folder}\` | ${p.description} | [ver carpeta](./${p.folder}) | [abrir →](${PAGES_URL}/${p.folder}/) |`
        )
        .join('\n');
    return `${header}\n${rows}`;
}

const practicas = findPracticas();
console.log(`${practicas.length} práctica(s) encontrada(s): ${practicas.map((p) => p.folder).join(', ')}`);

replaceBlock(path.join(ROOT, 'index.html'), buildIndexHtmlBlock(practicas));
replaceBlock(path.join(ROOT, 'README.md'), buildReadmeBlock(practicas));