import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const ignored = new Set(['node_modules', '.next', '.cache', '.data', 'test-results', 'playwright-report', 'coverage', '.git']);
const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.endsWith('.tsbuildinfo') || (entry.name.startsWith('.env') && entry.name !== '.env.example') || entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(absolute); else files.push(absolute);
  }
}
collect(root);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = new Set([...Object.keys(manifest.dependencies || {}), ...Object.keys(manifest.devDependencies || {})]);
const errors = [];
for (const required of ['README.md', 'AGENTS.md', 'PLAN.md', 'MEMORY.md', 'docs/development/setup.md', 'docs/development/status.md']) {
  if (!fs.existsSync(path.join(root, required))) errors.push(`Missing entry point: ${required}`);
}
for (const file of files) {
  const relative = path.relative(root, file);
  if (file.endsWith('.gitkeep')) errors.push(`Obsolete empty placeholder: ${relative}`);
  if (!/\.(md|tsx?|mjs)$/.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('\ufffd')) errors.push(`Invalid UTF-8 replacement character: ${relative}`);
  if (file.endsWith('.md')) {
    const prose = source.replace(/```[\s\S]*?```/g, '');
    for (const match of prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const destination = match[1].trim().replace(/^<|>$/g, '').split(/\s+"/)[0];
      if (/^[a-z][a-z0-9+.-]*:/i.test(destination) || destination.startsWith('#')) continue;
      const target = decodeURIComponent(destination.split('#')[0]);
      if (!fs.existsSync(path.resolve(path.dirname(file), target))) errors.push(`Broken documentation link: ${relative} -> ${destination}`);
    }
    continue;
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const modules = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) modules.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) modules.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const specifier of modules) {
    if (specifier.startsWith('.') || specifier.startsWith('@/') || specifier.startsWith('node:')) continue;
    const dependency = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (!declared.has(dependency)) errors.push(`Undeclared dependency: ${relative} -> ${dependency}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.info(`Structure checks passed (${files.length} maintained files; documentation links and imported dependencies verified).`);
