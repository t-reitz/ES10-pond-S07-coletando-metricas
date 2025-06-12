const { startServer } = require('../src/server');
const assert = require('node:assert');
const test = require('node:test');

let server;
let baseUrl;

test.before(async () => {
  server = startServer(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

test.after(() => {
  server.close();
});

test('GET /increment', async () => {
  const res = await fetch(`${baseUrl}/increment`);
  const text = await res.text();
  assert.strictEqual(text, 'Counter incremented');
});

test('GET /work and metrics', async () => {
  await fetch(`${baseUrl}/work`);
  const metrics = await (await fetch(`${baseUrl}/metrics`)).text();
  assert(metrics.includes('example_counter'));
  assert(metrics.includes('work_time_ms'));
});

test('GET /save-graph generates file and updates markdown', async () => {
  const res = await fetch(`${baseUrl}/save-graph`);
  const text = await res.text();
  assert(text.includes('Gráfico salvo'));
});
