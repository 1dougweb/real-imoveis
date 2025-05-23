# Laranja Real Imóveis - Aplicação Completa

Este projeto é uma aplicação completa para a imobiliária Real Imóveis, composta de um backend Laravel e um frontend React.

## Estrutura do Projeto

- **Frontend**: React, TypeScript, Vite, React Router, TailwindCSS
- **Backend**: Laravel, JWT Authentication, Spatie Permissions

## Configuração do Ambiente

### Pré-requisitos

- PHP 8.1 ou superior
- Composer
- Node.js 16 ou superior
- NPM ou Bun
- MySQL ou PostgreSQL

### Configuração do Backend (Laravel)

1. Entre na pasta do backend:

```bash
cd laravel-backend
```

2. Copie o arquivo de ambiente e configure-o:

```bash
cp .env.example .env
```

3. Edite o arquivo `.env` e configure as credenciais do banco de dados:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laranja_real_imoveis
DB_USERNAME=root
DB_PASSWORD=
```

4. Instale as dependências do Composer:

```bash
composer install
```

5. Gere a chave da aplicação:

```bash
php artisan key:generate
```

6. Gere a chave JWT:

```bash
php artisan jwt:secret
```

7. Configure o banco de dados e crie os usuários iniciais:

```bash
php artisan setup:fresh
```

8. Inicie o servidor de desenvolvimento:

```bash
php artisan serve
```

O backend estará disponível em `http://localhost:8000`

### Configuração do Frontend (React)

1. Na pasta raiz do projeto, instale as dependências:

```bash
npm install
# ou
bun install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
bun run dev
```

O frontend estará disponível em `http://localhost:8080` ou `http://localhost:8081`

## Credenciais de Acesso

### Administrador
- Email: admin@laranjarealimoveis.com.br
- Senha: admin123

### Gerente
- Email: gerente@laranjarealimoveis.com.br
- Senha: gerente123

### Corretor
- Email: corretor@laranjarealimoveis.com.br
- Senha: corretor123

### Cliente
- Email: cliente@exemplo.com
- Senha: cliente123

## Funcionalidades

### Frontend

- Autenticação de usuários
- Dashboard administrativo
- Listagem e detalhes de imóveis
- Gerenciamento de clientes
- Agendamento de visitas
- Contratos e documentos

### Backend

- API RESTful
- Autenticação JWT
- Gerenciamento de permissões e papéis
- Upload e processamento de imagens
- Geração de PDF para contratos
- Relatórios e análises

## Ambiente de Produção

Para preparar a aplicação para produção:

### Backend

```bash
cd laravel-backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend

```bash
npm run build
# ou
bun run build
```

## Suporte

Para suporte, entre em contato pelo email contato@nicedesigns.com.br
