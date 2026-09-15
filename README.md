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

Antes do SonarQube, gere a evidência de cobertura:

```bash
npm run test:coverage
test -f coverage/sample-app/lcov.info && echo "LCOV gerado"
```

O arquivo `coverage/sample-app/lcov.info` é o relatório LCOV: ele informa ao SonarQube quais linhas, funções e ramificações foram exercitadas pelos testes. Não publique uma análise sem confirmar esse arquivo, pois o SonarQube poderá registrar cobertura `0,0%` mesmo que os testes tenham sido executados.
O comando só termina com sucesso se a suíte retornar código `0` e se o LCOV tiver sido gerado na execução corrente. O limite padrão é de 120 segundos; ajuste-o, quando necessário, com `SAMPLE_TEST_TIMEOUT_SECONDS`. Ao exceder o prazo, o comando retorna `124` e bloqueia a análise.

## SonarQube

Execute a análise somente após a geração e conferência do LCOV:

O `presonar` executa a cobertura novamente e só inicia o scanner após essa validação. Portanto, não use um LCOV preexistente como evidência de sucesso.

```bash
npm run sonar -- \
  -Dsonar.projectKey=sample-app \
  -Dsonar.host.url=http://host.docker.internal:9000
```

## Rascunhos de tradução offline

Após reconstruir o Dev Container com o Argos Translate, baixe os modelos uma única vez e gere os rascunhos:

```bash
npm run i18n:drafts -- --install-models
```

Nas execuções posteriores, os modelos já instalados são usados localmente:

```bash
npm run i18n:drafts
```

Os arquivos `src/locale/messages.*.xlf` gerados recebem o estado `needs-review-translation`. Eles são rascunhos: exigem revisão humana proficiente e aprovação em Pull Request antes de homologação.

O aviso de compilação `Locale data for 'pt-BR' cannot be found. Using locale data for 'pt'.` é esperado: `pt-BR` permanece o locale-fonte e o Angular usa os dados regionais genéricos de `pt`. Esse fallback não impede build, testes nem a análise pelo SonarQube.
