import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const files = ['index.html', 'style.css', 'app.mjs', 'scanner.mjs', 'worker.mjs', 'i18n.mjs', 'icon.svg'];
await mkdir('dist', { recursive: true });
for (const file of files) {
  if (file.endsWith('.mjs')) execFileSync(process.execPath, ['--check', `web/${file}`]);
  await copyFile(`web/${file}`, `dist/${file}`);
}

// Offline build: one file, no server, no module worker. Runs from file:// with the network unplugged.
const parts = {
  css: await readFile('web/style.css', 'utf8'),
  scanner: await readFile('web/scanner.mjs', 'utf8'),
  i18n: await readFile('web/i18n.mjs', 'utf8'),
  app: await readFile('web/app.mjs', 'utf8'),
};
const offline = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<title>BuildPeek — offline</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(await readFile('web/icon.svg', 'utf8'))}">
<style>${parts.css}</style>
</head>
<body>
${(await readFile('web/index.html', 'utf8')).split('<body>')[1].split('</body>')[0]}
<script type="module">
${parts.scanner.replace(/^export /gm, '')}
${parts.i18n.replace(/^export /gm, '')}
${parts.app.replace(/^import .*$/gm, '')}
if ($('version')) $('version').textContent = '0.1.0';
</script>
</body>
</html>
`;
await writeFile('dist/buildpeek-offline.html', offline);
console.log(`Built ${files.length} static assets plus buildpeek-offline.html; no runtime dependencies.`);
