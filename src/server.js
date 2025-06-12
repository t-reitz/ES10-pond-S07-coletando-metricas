const express = require('express');
const client = require('prom-client');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

const app = express();

// Coleta métricas padrão do Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Contador simples para demonstrar incremento manual
const counter = new client.Counter({
  name: 'example_counter',
  help: 'Exemplo de contador',
});

// Gauge para monitorar o tempo (em ms) de uma operação simulada
const workTimeGauge = new client.Gauge({
  name: 'work_time_ms',
  help: 'Tempo da última operação em milissegundos',
});

// Histograma para medir a duração das requisições HTTP
const requestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  buckets: [50, 100, 200, 500, 1000],
});

// Configurações do Chart.js para geração de imagens
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// Rota para simular uma carga de trabalho e coletar métricas mais complexas
app.get('/work', async (req, res) => {
  // Início da medição do tempo de requisição
  const end = requestDuration.startTimer();
  const workTime = Math.random() * 400; // tempo aleatório de até 400ms

  // Ajusta o gauge com o tempo calculado
  workTimeGauge.set(workTime);

  // Simula tarefa assíncrona
  await new Promise(r => setTimeout(r, workTime));

  // Finaliza a medição de duração
  end();

  res.send('Trabalho concluído');
});

// Endpoint para gerar e salvar um gráfico na pasta docs. Além da imagem, um
// arquivo Markdown será atualizado com a lista de gráficos gerados.
app.get('/save-graph', async (req, res) => {
  // Coleta os valores atuais do histograma
  const metrics = await client.register.getSingleMetricAsString(
    'http_request_duration_ms_bucket'
  );

  const labels = [];
  const values = [];

  metrics.split('\n').forEach(line => {
    const match = line.match(/http_request_duration_ms_bucket{le="?(\d+)"?} (\d+)/);
    if (match) {
      labels.push(match[1]);
      values.push(parseInt(match[2], 10));
    }
  });

  const data = labels.map((label, idx) => ({
    label,
    value: values[idx],
    sortValue: label === '+Inf' ? Infinity : parseFloat(label),
  }));

  data.sort((a, b) => a.sortValue - b.sortValue);
  const sortedLabels = data.map(d => d.label);
  const sortedValues = data.map(d => d.value);

  const configuration = {
    type: 'bar',
    data: {
      labels: sortedLabels,
      datasets: [{ label: 'Quantidade', data: sortedValues }],
    },
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  const docsDir = path.resolve(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const filePath = path.join(docsDir, `grafico_${Date.now()}.png`);
  fs.writeFileSync(filePath, image);

  // Atualiza o arquivo Markdown com a lista de imagens
  const mdPath = path.join(docsDir, 'graphs.md');
  const relative = path.basename(filePath);
  const line = `![](${relative})\n`;
  fs.appendFileSync(mdPath, line);

  res.send(`Gráfico salvo em ${filePath}`);
});

// Rota para incrementar o contador manualmente
app.get('/increment', (req, res) => {
  counter.inc();
  res.send('Counter incremented');
});

// Endpoint que expõe todas as métricas para scraping pelo Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

function startServer(customPort) {
  const port = customPort !== undefined
    ? customPort
    : (process.env.PORT || 3000);
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
