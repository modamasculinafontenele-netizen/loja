# Sistema Fontenele Moda Masculina

Este pacote contém o código-fonte editável do catálogo digital e do painel administrativo, os estilos, os componentes e as imagens públicas. Os dados locais e as senhas NÃO estão incluídos no pacote para hospedagem. Leia **GUIA-HOSPEDAGEM-FONTENELE.md** antes de publicar.

## Como abrir no Windows

1. Extraia todo o conteúdo do arquivo ZIP para uma pasta comum do computador.
2. Instale o **Node.js 22 ou mais recente** pelo site <https://nodejs.org/>.
3. Crie o arquivo `.dev.vars` a partir de `.dev.vars.example`, preenchendo suas próprias credenciais.
4. Dê dois cliques em **ABRIR-SISTEMA.bat**.
5. Na primeira execução, aguarde a instalação automática das dependências.
6. Quando aparecer o endereço local, abra no navegador:

- Catálogo: <http://127.0.0.1:5173/>
- Administração: <http://127.0.0.1:5173/admin>

## Acesso administrativo

Defina seu usuário, uma senha forte e a chave `SESSION_SECRET` no arquivo `.dev.vars` para desenvolvimento local. Na produção, cadastre os mesmos nomes como segredos privados do serviço de hospedagem. O pacote não possui senha administrativa de teste ou senha de acesso embutida.

## Como fazer alterações

Abra esta pasta no Visual Studio Code ou em outro editor. As partes principais estão em:

- `components/storefront.tsx`: catálogo público, carrinho e finalização de pedido.
- `components/admin-app.tsx`: painel administrativo.
- `app/globals.css`: estilos gerais e identidade visual.
- `app/api`: operações do catálogo, produtos, pedidos, configurações e uploads.
- `lib/store.ts`: regras de banco de dados, estoque e configurações.
- `public`: logo e arquivos públicos.
- `drizzle`: estrutura e atualizações do banco.

O servidor atualiza a página automaticamente quando os arquivos são salvos.

## Dados e imagens existentes

A pasta `.wrangler` do seu computador contém o banco local e as imagens cadastradas. Ela foi excluída do pacote de PUBLICAÇÃO para não expor dados dos seus clientes. Guarde uma cópia separada dessa pasta. Esta versão inclui as migrações necessárias para preservar o histórico das vendas.

Se o sistema estiver conectado a um banco de produção separado, aplique a migração `drizzle/0002_preserve_order_items_on_product_delete.sql` nesse banco antes de publicar esta versão. A migração mantém nome, tamanho, cor, quantidade e valores dos itens vendidos no histórico dos pedidos.

## Parar o sistema

Volte para a janela preta que foi aberta e pressione `Ctrl + C`. Depois, confirme o encerramento se o Windows perguntar.

## Observação importante

Este pacote foi preparado para desenvolvimento e testes locais. Para colocar o sistema no ar será necessário configurar hospedagem, banco de dados, armazenamento de imagens e credenciais próprias de produção.
