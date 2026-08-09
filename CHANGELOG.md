# Changelog

## 1.3.0 — Estrada Premium

- nova Home pública com posicionamento visual do motoclube;
- Escudo Digital redesenhado como patch/colete, com rockers, rebites e lema;
- patente representada com estrelas e destaque específico para Diretoria;
- QR ganhou moldura visual própria e contador mais legível;
- navegação inferior refinada com SOS 24H como ação central;
- hero contextual muda conforme a área ativa do associado;
- aba atual preservada em `sessionStorage`;
- cenário de estrada gerado apenas com CSS para manter baixo peso no 4G;
- microinterações e animações respeitam `prefers-reduced-motion`;
- PWA instalável com manifest, ícone vetorial e service worker;
- fallback offline explícito;
- API e QR excluídos da estratégia de cache por segurança;
- título, theme-color e metadados alinhados à marca “Irmãos do Asfalto”.

## 1.2.0 — Operação Mobile da Diretoria

- identidade visual consolidada em “Irmãos do Asfalto”;
- cadastro de associado;
- portal comercial de parceiros;
- sessão JWT exclusiva para parceiros;
- leitura de QR por câmera quando `BarcodeDetector` estiver disponível;
- fallback de validação manual;
- registro persistente de validações de QR;
- modelos `Partner`, `Benefit` e `QrValidation`;
- benefícios passaram a vir do MongoDB;
- painel Diretoria passou a usar dados reais;
- Diretoria pode alterar patente e status de assinatura;
- cadastro de parceiros e benefícios direto no painel mobile da Diretoria;
- busca de membros no painel;
- endpoints administrativos para cadastrar e listar parceiros e benefícios;
- seed local para criação de ambiente demo;
- limpeza de componentes e middleware legados;
- documentação e Blueprint do Render atualizados.
