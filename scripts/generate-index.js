// scripts/generate-index.js
//
// Escanea la raíz del repo buscando carpetas "practicaN_100033745" o
// "proyectoN_100033745" que tengan un index.html adentro, y regenera
// automáticamente el bloque de enlaces en index.html y la tabla en README.md.
//
// No requiere dependencias externas (solo el Node.js que trae GitHub Actions).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_URL = 'https://axelramos54.github.io/Ejercicios-HTML';

const START_MARKER = '<!-- PRACTICAS:START -->';
const END_MARKER = '<!-- PRACTICAS:END -->';

// Tipos de carpeta soportados: practicaN_100033745 y proyectoN_100033745
const TYPES = {
  practica: { label: 'Práctica', badge: 'PRA' },
  proyecto: { label: 'Proyecto', badge: 'PRO' },
};
const TYPE_ORDER = Object.keys(TYPES); // ['practica', 'proyecto'] → orden en que se listan
const FOLDER_PATTERN = new RegExp(`^(${TYPE_ORDER.join('|')})(\\d+)_100033745$`);

function findPracticas() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => FOLDER_PATTERN.test(name))
    .filter((name) => fs.existsSync(path.join(ROOT, name, 'index.html')))
    .map((folder) => {
      const [, type, numStr] = folder.match(FOLDER_PATTERN);
      const num = parseInt(numStr, 10);
      const html = fs.readFileSync(path.join(ROOT, folder, 'index.html'), 'utf8');
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      const description = descMatch ? descMatch[1] : `${TYPES[type].label} ${num}`;
      return { folder, type, num, description };
    })
    .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.num - b.num);
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
          <span class="task__index">${TYPES[p.type].badge}${String(p.num).padStart(2, '0')}</span>
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
  const header = '| # | Carpeta | Descripción | Código | Página publicada |\n|---|---------|--------------|--------|-------------------|';
  const rows = practicas
    .map(
      (p) =>
        `| ${TYPES[p.type].badge}${String(p.num).padStart(2, '0')} | \`${p.folder}\` | ${p.description} | [ver carpeta](./${p.folder}) | [abrir →](${PAGES_URL}/${p.folder}/) |`
    )
    .join('\n');
  return `${header}\n${rows}`;
}

const practicas = findPracticas();
console.log(`${practicas.length} práctica(s) encontrada(s): ${practicas.map((p) => p.folder).join(', ')}`);

replaceBlock(path.join(ROOT, 'index.html'), buildIndexHtmlBlock(practicas));
replaceBlock(path.join(ROOT, 'README.md'), buildReadmeBlock(practicas));

//test