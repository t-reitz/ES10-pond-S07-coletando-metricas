const baseUrl = 'http://localhost:3000';

async function checkMetric(name, metricsText) {
  return metricsText.split('\n').some(line => line.startsWith(name));
}

async function call(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const text = await res.text();
  console.log(`${path} -> ${text}`);
  return text;
}

async function main() {
  console.log('Demonstrando os objetivos deste repositório:');
  console.log('1) Coleta de métricas');
  console.log('2) Exposição via Prometheus');
  console.log('3) Geração de gráficos.\n');

  await call('/increment');
  await call('/work');

  const metrics = await call('/metrics');
  const hasCounter = await checkMetric('example_counter', metrics);
  const hasGauge = await checkMetric('work_time_ms', metrics);

  console.log('\nVerificações:');
  console.log(`- example_counter presente? ${hasCounter}`);
  console.log(`- work_time_ms presente? ${hasGauge}`);

  await call('/save-graph');
}

main().catch(err => {
  console.error('Erro durante a execução do demo:', err);
  process.exit(1);
});
