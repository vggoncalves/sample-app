# Sample App

Frontend web do projeto **Sample**, desenvolvido com **Angular 22** e **TypeScript**.

O `sample-app` é responsável pela interface web administrativa e pela integração com as APIs do backend.

## Tecnologias

- Angular 22
- TypeScript
- Node.js 24
- npm
- Angular CLI
- SonarQube

## Executar o projeto

Dentro do Dev Container:

```bash
cd /workspaces/sample/sample-app
```

Instale as dependências:

```bash
npm ci
```

Com o backend já iniciado na porta `8080`, execute o Angular com o proxy da API:

```bash
npx ng serve --host 0.0.0.0 --proxy-config proxy.conf.json
```

O `--host 0.0.0.0` permite que o encaminhamento de portas alcance o servidor dentro do Dev Container. O `proxy.conf.json` encaminha as requisições iniciadas em `/api` para `http://localhost:8080`, sem expor credenciais no frontend.

A aplicação estará disponível em:

```text
http://localhost:4200/administracao/unidades
```

No Dev Container, encaminhe também a porta `4200` na aba **Ports** do VS Code e use **Open in Browser**. Não use `npm run start:container` para integração com a API enquanto esse script não incluir `--proxy-config proxy.conf.json`.

Ao carregar a listagem, o navegador solicitará HTTP Basic pela API. Use as credenciais locais definidas antes de iniciar o backend; elas nunca devem ser incluídas no código ou no README.

## Executar testes

Execute os testes:

```bash
npx ng test
```

Para executar os testes sem modo interativo:

```bash
npx ng test --watch=false
```

Para executar os testes com cobertura:

```bash
npx ng test --coverage --watch=false
```

## SonarQube

Execute a análise do projeto:

```bash
npm run sonar -- \
  -Dsonar.projectKey=sample-app \
  -Dsonar.host.url=http://host.docker.internal:9000
```
