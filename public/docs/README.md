# Documentação Laranja Real Imóveis

Este diretório contém a documentação completa do sistema Laranja Real Imóveis, incluindo documentação de backend e frontend.

## Estrutura da Documentação

A documentação está organizada da seguinte forma:

- `index.html` - Página inicial com links para todas as seções da documentação
- `../backend-documentation.html` - Documentação completa do backend (Laravel)
- `frontend/` - Documentação do frontend (React)
  - `index.html` - Visão geral da arquitetura frontend
  - `components.html` - Documentação dos componentes UI
  - `hooks.html` - Documentação dos hooks personalizados 
  - `api-integration.html` - Detalhes da integração com a API

## Como Acessar

Para acessar a documentação em ambiente de desenvolvimento:

1. Certifique-se de que o servidor Laravel está rodando: `cd laravel-backend && php artisan serve`
2. Acesse `http://localhost:8000/docs/index.html` em seu navegador

Em ambiente de produção, a documentação estará disponível em:
`https://laranjarealimoveis.com.br/docs/index.html`

## Atualização da Documentação

A documentação deve ser mantida atualizada sempre que houver mudanças significativas no código. Para atualizar:

1. Edite os arquivos HTML correspondentes à seção que deseja atualizar
2. Atualize a data da última atualização no rodapé de cada página
3. Certifique-se de que todos os links internos e exemplos de código estão funcionando corretamente

## Formato e Estilo

A documentação segue um formato consistente com:

- Exemplos de código para todas as funcionalidades principais
- Tabelas para descrição de parâmetros e retornos
- Destaque para informações importantes usando caixas de notificação
- Navegação intuitiva entre as diferentes seções

## Contato

Se encontrar algum problema ou inconsistência na documentação, por favor entre em contato com o time de desenvolvimento. 