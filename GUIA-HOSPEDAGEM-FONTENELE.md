# FONTENELE — SISTEMA COMPLETO PARA HOSPEDAGEM

Este é o **projeto completo e editável** da loja Fontenele Moda Masculina, com o catálogo, o carrinho, o painel administrativo, as APIs, as imagens da marca, o layout responsivo e o parallax.

## 1. O que vem no pacote

| Arquivo ou pasta | Finalidade |
| --- | --- |
| `app/` | Páginas do site, rotas API e CSS global (`app/globals.css`) |
| `components/storefront.tsx` | Catálogo público, parallax, menu, filtros, grade de produtos, sacola e pedidos |
| `components/admin-app.tsx` | Painel administrativo e pesquisa de produtos |
| `components/ui/` e `hooks/` | Componentes reutilizáveis e recursos de responsividade |
| `public/` | Logomarca, favicon e fotos da campanha Fontenele |
| `lib/`, `db/` | Regras de negócio, segurança administrativa e acesso ao banco |
| `drizzle/` | Estrutura e migrações do banco de dados |
| `worker/` e `vite.config.ts` | Backend e configuração de execução no Cloudflare Workers |
| `scripts/` e `vendor/` | Scripts de compilação e CSS/recursos necessários |
| `package.json`, `package-lock.json`, `pnpm-lock.yaml` | Dependências e versões do projeto |
| `ABRIR-SISTEMA.bat` e `.ps1` | Inicialização local no Windows |
| `.dev.vars.example` | Modelo para configurar credenciais locais, **sem senhas reais** |

**Importante:** o HTML do catálogo é escrito em React/TypeScript, nos arquivos `.tsx`. O Vite/Vinext transforma esses componentes em HTML, JavaScript e CSS para o navegador. Não apague arquivos `.tsx` só porque não há um `index.html` clássico.

## 2. Layout e estilos incluídos

- Identidade visual Fontenele em verde-floresta, com logotipo e imagens públicas.
- Campanha de abertura com modelo masculino usando camisa polo Fontenele.
- Parallax suave na abertura e na seção institucional, com respeito à preferência por menos movimento.
- Menu adaptável: botão móvel e menu horizontal no computador.
- Grade de produtos: **2 colunas no celular, 3 no tablet, 4 no computador**.
- Fotos proporcionais, pesquisa, categoria e ordenação adaptadas para telas pequenas.
- Ordem dos produtos mantida conforme a classificação da listagem, sem reorganização visual de colunas.
- Janela de produto, tamanhos, cores e sacola adaptadas a telas menores.

Estilos principais: `app/globals.css`, `vendor/shadcn-tailwind-4.13.0.css`, classes Tailwind dentro dos componentes `.tsx`, e configuração `postcss.config.mjs`.

## 3. Requisitos da hospedagem

Este sistema **não é um site HTML estático**. As funções de estoque, autenticação administrativa, pedidos e imagens dependem de serviços de backend.

- Runtime: **Cloudflare Workers**, conforme a configuração atual do projeto.
- Banco de dados: **Cloudflare D1 (SQLite)**, vinculado com o nome `DB`.
- Fotos cadastradas: **Cloudflare R2**, vinculado com o nome `BUCKET`.
- Ferramenta de compilação: Node.js **22.13.0 ou superior**.

Hospedagem comum que só aceite HTML/PHP/cPanel, sem a infraestrutura correspondente, não executará o sistema completo automaticamente. Antes de implantar em outro provedor, será necessária uma adaptação do backend e das integrações.

## 4. Abrir o projeto localmente

1. Instale Node.js 22.13.0 ou superior.
2. Extraia a pasta completa do ZIP; não copie apenas `app/` ou `public/`.
3. Crie um arquivo `.dev.vars` ao lado de `package.json`, baseado em `.dev.vars.example`.
4. Defina credenciais únicas: `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `SESSION_SECRET` (uma chave aleatória com **pelo menos 32 caracteres**).
5. Execute `npm ci` e depois `npm run dev`, ou abra `ABRIR-SISTEMA.bat` no Windows.
6. Acesse a URL indicada no terminal para o catálogo e acrescente `/admin` para administrar.
7. O pacote contém migrações em `drizzle/`; se o banco estiver vazio, crie as tabelas antes de utilizar as APIs. Consulte a seção seguinte.

**Não copie** `.dev.vars` para um repositório público nem para uma pasta pública da hospedagem.

## 5. Preparação para publicar no Cloudflare

Esta seção descreve os recursos necessários; os nomes e identificadores exatos dependem da **sua conta Cloudflare** e não estão configurados neste ZIP.

1. Faça login na conta Cloudflare com a ferramenta `wrangler`.
2. Crie um banco D1 de produção, por exemplo, `fontenele-prod`, e um bucket R2 privado, por exemplo, `fontenele-imagens`.
3. Configure o binding D1 `DB` com o **ID real** do seu banco, e o binding R2 `BUCKET` com o **nome real** do seu bucket. A configuração atual de desenvolvimento, em `vite.config.ts`, possui um **ID de banco temporário** e nomes de exemplo — eles NÃO são válidos para produção.
4. Em um **banco novo e vazio**, aplique as migrações SQL na ordem: `drizzle/0000_atelier_verde.sql`, `drizzle/0001_store_customization.sql`, `drizzle/0002_preserve_order_items_on_product_delete.sql`. **Não execute novamente** migrações já aplicadas em bancos existentes; antes faça backup.
5. Configure no Worker, pelo gerenciador de **segredos**, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (senha exclusiva e forte) e `SESSION_SECRET` (chave aleatória de ao menos 32 caracteres). Não coloque os valores no código nem em arquivos publicados.
6. Execute `npm run build`, que gera a saída de publicação em `dist/`. Verifique o arquivo gerado `dist/server/wrangler.json`: nome do Worker, bindings D1/R2, identificador do banco e bucket devem apontar para **seus serviços reais**. Ajustes feitos diretamente em `dist/` precisam ser refeitos após cada nova compilação, por isso prefira configurar os valores de origem antes do build.
7. Faça a implantação do Worker e dos arquivos estáticos gerados com a ferramenta de implantação suportada por sua conta e versão de Vinext/Cloudflare. Teste `/`, `/admin`, `/api/products` e o envio de imagens.

**Cuidado:** não publique um banco novo vazio achando que seus produtos aparecerão automaticamente. O banco local não é importado pelo ZIP do código.

### Comandos úteis (Cloudflare)

```bash
npx wrangler login
npx wrangler d1 create fontenele-prod
npx wrangler r2 bucket create fontenele-imagens
npm ci
npm run build
```

Para aplicar **cada migração em um banco remoto novo**, depois de configurá-lo:

```bash
npx wrangler d1 execute fontenele-prod --remote --file drizzle/0000_atelier_verde.sql
npx wrangler d1 execute fontenele-prod --remote --file drizzle/0001_store_customization.sql
npx wrangler d1 execute fontenele-prod --remote --file drizzle/0002_preserve_order_items_on_product_delete.sql
```

Esses comandos não substituem a configuração dos bindings, dos segredos e a publicação final do Worker. Não os rode em um banco que já possui suas tabelas ou dados sem verificar seu histórico de migrações.

## 6. Seus produtos e pedidos cadastrados

- **Código-fonte e dados são coisas diferentes**: este ZIP inclui a estrutura do banco (`drizzle/`), não o conteúdo atual de seus cadastros.
- Os dados locais do sistema anterior ficam na pasta oculta `.wrangler` do **computador em que você cadastrou as peças**, junto com as imagens enviadas ao armazenamento local.
- Antes de mudar de hospedagem, faça um backup completo da pasta original do sistema. Exporte os registros do D1 e os arquivos do R2 para importar na hospedagem real.
- Existe também um ZIP separado de backup da pasta `.wrangler` que estava na **versão compartilhada para edição**. Ele pode não conter cadastros adicionados depois no seu computador.
- A migração dos dados para um D1 remoto e dos objetos para o R2 remoto é uma **etapa separada**. Não copie `.wrangler` para um diretório público e não presuma que ela será lida pelo servidor hospedado.

## 7. Segurança antes de abrir a loja ao público

- Troque a senha administrativa por uma senha **nova, forte e exclusiva**.
- Configure um `SESSION_SECRET` aleatório e exclusivo; a versão de publicação **não usa senha de exemplo nem segredo fixo**.
- Não publique `.dev.vars`, `.env` com senhas, `.wrangler` ou cópias do banco.
- Faça backup e teste a restauração dos dados, especialmente antes de executar migrações.
- Verifique HTTPS, domínio, políticas de acesso e custos/limites de Workers, D1 e R2 com o provedor.
- Faça um teste real de cadastro, imagem, estoque e pedido **antes** de anunciar o endereço da loja.

## 8. O que não vem no pacote de código — de propósito

- `node_modules/`: dependências pesadas, instaladas novamente com `npm ci`.
- `dist/`, `.next/`, `.vinext/`, `.sites-runtime/`: arquivos gerados que serão recriados no build.
- `.dev.vars`: senhas e tokens privados; há um modelo `.dev.vars.example`.
- `.wrangler/`: banco e imagens locais; a cópia disponível é entregue **separadamente** como backup, não deve ser enviada à hospedagem pública.

### Próximo passo

Informe o nome da hospedagem escolhida (por exemplo, Cloudflare Workers ou outro provedor). Com isso é possível adaptar os comandos e o arquivo de configuração de implantação aos serviços que ela realmente oferece.
