CORREÇÃO — CADASTRO DE PRODUTOS / ENVIO DE IMAGENS

O que foi alterado:
- Fotos rasterizadas selecionadas no painel são redimensionadas para até 1600 px e convertidas para WebP antes do envio, buscando manter cada arquivo abaixo de aproximadamente 1,8 MB.
- O limite de segurança de 5 MB por arquivo continua aplicado no servidor.
- O painel agora lê a resposta do servidor de forma segura, inclusive quando a resposta não é JSON, e apresenta uma mensagem específica para HTTP 413 (Payload Too Large).
- A mesma preparação de imagem é usada no envio da logo pelas configurações.
- Layout, cadastro de produtos, regras de estoque e demais módulos foram mantidos.

Como aplicar:
1. Faça uma cópia de segurança da pasta atual do sistema.
2. Extraia esta versão em uma pasta nova (ou substitua os arquivos mantendo sua cópia de segurança).
3. Mantenha suas configurações locais e credenciais de ambiente.
4. Inicie o sistema normalmente e teste o cadastro com uma foto grande e outra pequena.

Observação de validação:
A verificação completa de build/TypeScript não foi possível neste ambiente porque as dependências do projeto (incluindo os tipos do Node.js e Cloudflare) não estão instaladas. Os arquivos alterados foram revisados estaticamente.
