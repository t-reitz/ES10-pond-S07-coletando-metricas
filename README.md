# Coleta de Métricas com Prometheus e Grafana

Este repositório contém um pequeno exemplo para instrumentação de uma aplicação Node.js, coleta de métricas via Prometheus e visualização através do Grafana. O passo a passo a seguir demonstra como reproduzir o ambiente localmente.

## 1. Configuração do Projeto

1. Clone este repositório e navegue até a pasta.
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Inicie o servidor Node.js:
   ```bash
   npm start
   ```
    A aplicação expõe diversas rotas:
    - `/increment` incrementa um contador simples.
    - `/work` simula uma carga de trabalho e atualiza métricas de duração.
    - `/metrics` expõe todas as métricas no formato Prometheus.
    - `/save-graph` gera um gráfico das métricas atuais e o salva na pasta `docs`.
4. Execute os testes automatizados para validar todas as rotas:
   ```bash
   npm test
   ```

## 2. Preparando Prometheus e Grafana

Utilizaremos **Docker** para subir os serviços. Certifique-se de ter o Docker e o Docker Compose instalados.

1. Construa o container da aplicação Node.js e inicie todos os serviços:
   ```bash
   docker-compose up --build
   ```
2. Acesse o Prometheus em `http://localhost:9090` e verifique se o alvo `node_app` está sendo coletado.
3. Acesse o Grafana em `http://localhost:3001` (usuário e senha padrão: `admin`). Configure o Prometheus como fonte de dados apontando para `http://prometheus:9090`.
4. Crie um dashboard simples e adicione um gráfico exibindo o valor de `example_counter`.
5. Para registrar uma imagem do gráfico gerado, utilize a rota `/save-graph`. Um arquivo PNG será salvo na pasta `docs`.
   Sempre que um gráfico é gerado, o arquivo `docs/graphs.md` é atualizado com uma prévia da imagem.

### Visualização

Abaixo está um exemplo simplificado de como o gráfico pode ser exibido no Grafana. Após executar a rota `/save-graph`, uma imagem semelhante será gerada em `docs/`:

```
+---------------- Grafana Dashboard ---------------+
|                                                 |
|  example_counter                                |
|                                                 |
|  5 ┤ ████▌                                      |
|  4 ┤ ███                                        |
|  3 ┤ ██                                         |
|  2 ┤ █                                          |
|  1 ┤▌                                           |
|                                                 |
+-------------------------------------------------+
```

## 3. Executando os Testes

Os testes automatizados utilizam o módulo `node:test` e garantem que todas as rotas respondem corretamente. Para executá-los:

```bash
npm test
```

## 4. Material de Apoio

- [Alocação de memória](https://www.gta.ufrj.br/~cruz/courses/eel770/slides/9_memoria.pdf)
- [Fundamentals of garbage collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)
- [Manipulação de bits](https://www.youtube.com/watch?v=Tuok3H5Girw)
- Somerville, **Padrões de software**, páginas 458‑460
