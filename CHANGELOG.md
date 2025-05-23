# Changelog

## [Não lançado]

### Melhorias
- **Frontend**:
  - Implementado design responsivo no Dashboard administrativo para melhor visualização em dispositivos móveis
  - Adicionado layout responsivo para o Dashboard do cliente
  - Implementado sidebar móvel com toggle para o painel administrativo
  - Melhorado o footer para melhor visualização em dispositivos móveis
  - Adicionado breakpoint 'xs' (480px) ao Tailwind para melhor controle da responsividade

### Correções
- **Backend**:
  - Corrigido erro de middleware no PropertyController removendo a chamada incorreta do método middleware() no construtor
  - Configurado middleware nas rotas da API para autenticação adequada

- **Frontend**:
  - Adicionado verificações de nulo e tratamento adequado de resposta da API nos componentes de listagem de imóveis
  - Adicionado interface ApiPropertyResponse para mapear corretamente a estrutura de resposta da API
  - Implementado adaptador no propertyService para converter entre formatos de resposta
  - Corrigido erro "Cannot read properties of undefined (reading 'length')" nos componentes de listagem 