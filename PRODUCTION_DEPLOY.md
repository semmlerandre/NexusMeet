# NexusMeet - deploy em servidor Linux

Este projeto roda em Docker com tres servicos:

- `mongodb`: banco interno, sem porta publica.
- `backend`: API FastAPI interna, sem porta publica.
- `frontend`: Nginx com React e proxy interno para `/api` e `/uploads`.

Em producao, o Nginx Proxy Manager deve publicar apenas o frontend.

## Instalacao do zero

No servidor Ubuntu/Debian:

```bash
git clone <seu-repositorio> nexusmeet
cd nexusmeet
sudo chmod +x install.sh
sudo ./install.sh --with-npm
```

O script instala pacotes base, Docker, Docker Compose, cria `.env`, sobe a aplicacao e instala o Nginx Proxy Manager se ele nao existir.

## Se Docker ou Nginx Proxy Manager ja existem

Use:

```bash
sudo ./install.sh --no-npm
```

O script reutiliza Docker/Compose existentes e nao altera o Nginx Proxy Manager ja instalado.

## Configurar no Nginx Proxy Manager

Se o Nginx Proxy Manager estiver instalado diretamente no host:

- Scheme: `http`
- Forward Hostname/IP: `127.0.0.1`
- Forward Port: porta exibida pelo instalador, normalmente `3000`
- Websockets Support: opcional
- SSL: solicitar certificado Let's Encrypt para seu dominio

Se o Nginx Proxy Manager foi instalado pelo `install.sh --with-npm`:

- Scheme: `http`
- Forward Hostname/IP: `nexusmeet-frontend`
- Forward Port: `80`
- SSL: solicitar certificado Let's Encrypt para seu dominio

## Deploy manual sem script

```bash
cp .env.example .env
nano .env
docker compose up -d --build
```

Por padrao, o app fica disponivel somente no localhost do servidor:

```env
BIND_ADDRESS=127.0.0.1
FRONTEND_PORT=3000
```

## Comandos uteis

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

Para apagar dados do banco e uploads:

```bash
docker compose down -v
```

## Credenciais iniciais

- Email: `admin@sistema.com`
- Senha: `admin123`

Altere essa senha no primeiro acesso.
