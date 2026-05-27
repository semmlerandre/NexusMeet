# Guia de instalacao - NexusMeet

Use este guia para publicar o NexusMeet em producao com Docker e Nginx Proxy Manager.

## Servidor limpo

```bash
git clone <seu-repositorio> nexusmeet
cd nexusmeet
sudo chmod +x install.sh
sudo ./install.sh --with-npm
```

O script instala Docker, Docker Compose, cria o `.env`, sobe MongoDB, backend e frontend, e instala o Nginx Proxy Manager se ele ainda nao existir.

## Servidor que ja tem Docker e Nginx Proxy Manager

```bash
sudo ./install.sh --no-npm
```

O app sera publicado somente no localhost do servidor, normalmente em:

```text
http://127.0.0.1:3000
```

## Configuracao no Nginx Proxy Manager

NPM instalado no host:

- Scheme: `http`
- Forward Hostname/IP: `127.0.0.1`
- Forward Port: `3000` ou a porta exibida pelo instalador

NPM instalado pelo script:

- Scheme: `http`
- Forward Hostname/IP: `nexusmeet-frontend`
- Forward Port: `80`

Depois ative SSL pelo Let's Encrypt no proprio NPM.

## Comandos uteis

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

Para reinstalar apagando banco e uploads:

```bash
docker compose down -v
sudo ./install.sh --no-npm
```

## Login inicial

- Email: `admin@sistema.com`
- Senha: `admin123`

Altere a senha no primeiro acesso.

Mais detalhes em [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md).
