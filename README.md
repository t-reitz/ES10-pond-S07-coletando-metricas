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
   A aplicação expõe uma rota `/metrics` com métricas no formato Prometheus e uma rota `/increment` para incrementar um contador de exemplo.

## 2. Preparando Prometheus e Grafana

Utilizaremos **Docker** para subir os serviços. Certifique-se de ter o Docker e o Docker Compose instalados.

1. Construa o container da aplicação Node.js e inicie todos os serviços:
   ```bash
   docker-compose up --build
   ```
2. Acesse o Prometheus em `http://localhost:9090` e verifique se o alvo `node_app` está sendo coletado.
3. Acesse o Grafana em `http://localhost:3001` (usuário e senha padrão: `admin`). Configure o Prometheus como fonte de dados apontando para `http://prometheus:9090`.
4. Crie um dashboard simples e adicione um gráfico exibindo o valor de `example_counter`.

### Visualização

Abaixo está um exemplo simplificado de como o gráfico pode ser exibido no Grafana:

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

## 3. Material de Apoio

- [Alocação de memória](https://www.gta.ufrj.br/~cruz/courses/eel770/slides/9_memoria.pdf)
- [Fundamentals of garbage collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)
- [Manipulação de bits](https://www.youtube.com/watch?v=Tuok3H5Girw)
- Somerville, **Padrões de software**, páginas 458‑460

---

Este repositório serve como base para estudos de instrumentação e visualização de métricas. Personalize conforme necessário para seus experimentos.
