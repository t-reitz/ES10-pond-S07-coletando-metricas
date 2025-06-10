// Exemplo de servidor Express instrumentado com Prometheus
// Todos os comentários estão em português para facilitar o entendimento
const express = require('express');
const client = require('prom-client');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

const app = express();
// Coleta das métricas padrão do Node.js (uso de CPU, memória etc.)
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

// Endpoint para gerar e salvar um gráfico na pasta docs
app.get('/save-graph', async (req, res) => {
  // Coleta os valores atuais do histograma
  const metrics = await client.register.getSingleMetricAsString('http_request_duration_ms_bucket');

  const labels = [];
  const values = [];

  metrics.split('\n').forEach(line => {
    const match = line.match(/http_request_duration_ms_bucket{le="?(\d+)"?} (\d+)/);
    if (match) {
      labels.push(match[1]);
      values.push(parseInt(match[2], 10));
    }
  });

  const configuration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Quantidade', data: values }],
    },
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const filePath = path.join(docsDir, `grafico_${Date.now()}.png`);
  fs.writeFileSync(filePath, image);

  res.send(`Gráfico salvo em ${filePath}`);
});

app.get('/increment', (req, res) => {
  counter.inc();
  res.send('Counter incremented');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
