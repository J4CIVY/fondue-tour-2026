// Assembles a static bundle for a sub-path host such as GitHub Pages.
//
// vinext's own `output: 'export'` prerender requests "/" even when basePath is
// set, so it 404s on this project. The client assets it emits are correct, so
// this script builds normally, serves the worker once, captures the rendered
// HTML for the base path, and lays the files out as the published root.
import { spawn } from 'node:child_process';
import { cp, mkdir, rm, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const outDir = path.join(root, process.env.STATIC_OUT_DIR ?? 'dist-static');
const port = Number(process.env.STATIC_PORT ?? 8811);

if (!basePath.startsWith('/') || basePath.endsWith('/')) {
  throw new Error(`NEXT_PUBLIC_BASE_PATH must look like "/repo-name", got "${basePath}"`);
}

const clientDir = path.join(root, 'dist/client');
const nextDir = path.join(clientDir, basePath.slice(1), '_next');
if (!existsSync(nextDir)) {
  throw new Error(`Missing ${nextDir}. Run the build first with VINEXT_STATIC_EXPORT=1 and NEXT_PUBLIC_BASE_PATH set.`);
}

console.log(`Serving the built worker on :${port} to capture ${basePath}/`);
const server = spawn(
  'npx',
  ['wrangler', 'dev', '--config', 'dist/server/wrangler.json', '--port', String(port)],
  { cwd: root, stdio: 'ignore' },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}${basePath}/`);
      if (response.ok) return response;
    } catch {
      // server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('The local worker never became ready');
}

let html;
try {
  const response = await waitForServer();
  html = await response.text();
} finally {
  server.kill('SIGTERM');
}

if (!html.includes(`${basePath}/_next/`)) {
  throw new Error('Captured HTML does not reference the base path; check the build environment');
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Everything the page references lives under the base path, and the published
// root *is* the base path, so copy the client assets up one level.
for (const entry of await readdir(clientDir, { withFileTypes: true })) {
  if (entry.name === '_headers' || entry.name === basePath.slice(1)) continue;
  await cp(path.join(clientDir, entry.name), path.join(outDir, entry.name), { recursive: true });
}
await cp(nextDir, path.join(outDir, '_next'), { recursive: true });

await writeFile(path.join(outDir, 'index.html'), html);
// Single route, so unknown paths should still render the roadbook.
await writeFile(path.join(outDir, '404.html'), html);
// Without this, GitHub Pages runs Jekyll and drops every _next directory.
await writeFile(path.join(outDir, '.nojekyll'), '');

console.log(`Wrote ${path.relative(root, outDir)} for publication at ${basePath}/`);
