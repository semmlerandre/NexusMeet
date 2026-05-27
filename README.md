# NexusMeet

Sistema de agendamento de salas de reuniao com FastAPI, React, MongoDB e Docker.

## Stack atual

- Backend: FastAPI, Motor/MongoDB, JWT.
- Frontend: React, Tailwind CSS, Nginx.
- Banco: MongoDB 7.
- Deploy: Docker Compose.

## Deploy rapido em producao

Servidor limpo Ubuntu/Debian:

```bash
git clone <seu-repositorio> nexusmeet
cd nexusmeet
sudo chmod +x install.sh
sudo ./install.sh --with-npm
```

Servidor que ja tem Docker e Nginx Proxy Manager:

```bash
sudo ./install.sh --no-npm
```

O app fica exposto somente no localhost do servidor por padrao:

```text
http://127.0.0.1:3000
```

No Nginx Proxy Manager, aponte seu dominio para:

- NPM no host: `http://127.0.0.1:3000`
- NPM instalado pelo script: `http://nexusmeet-frontend:80`

Veja o guia completo em [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md).

## Deploy manual

```bash
cp .env.example .env
nano .env
docker compose up -d --build
```

## Credenciais iniciais

- Email: `admin@sistema.com`
- Senha: `admin123`

Altere a senha no primeiro acesso.

## Comandos uteis

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

Para apagar banco e uploads:

```bash
docker compose down -v
```

## Funcionalidades

- Login com JWT e perfis de admin/usuario.
- CRUD de salas para administradores.
- Reservas com validacao de conflito de horario.
- Importacao de usuarios por planilha.
- Relatorios e exportacao Excel.
- Configuracao de logo, fundo de login, tema e SMTP pela interface.
