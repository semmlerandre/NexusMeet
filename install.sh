#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="NexusMeet"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_PORT_DEFAULT="3000"
BIND_ADDRESS_DEFAULT="127.0.0.1"
INSTALL_NPM="ask"
ORIGINAL_ARGS=("$@")
REQUIRED_PACKAGES=(ca-certificates curl git gnupg lsb-release openssl iproute2)

usage() {
  cat <<EOF
Usage: sudo ./install.sh [options]

Options:
  --with-npm          Install Nginx Proxy Manager if it is not detected.
  --no-npm           Do not install Nginx Proxy Manager.
  --frontend-port N  Local port for NexusMeet, default: 3000.
  --bind-address IP  Host bind address, default: 127.0.0.1.
  -h, --help         Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-npm)
      INSTALL_NPM="yes"
      shift
      ;;
    --no-npm)
      INSTALL_NPM="no"
      shift
      ;;
    --frontend-port)
      FRONTEND_PORT_DEFAULT="${2:?Missing port}"
      shift 2
      ;;
    --bind-address)
      BIND_ADDRESS_DEFAULT="${2:?Missing bind address}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

log() { printf "\n[%s] %s\n" "$APP_NAME" "$*"; }
ok() { printf "[OK] %s\n" "$*"; }
warn() { printf "[WARN] %s\n" "$*"; }
fail() { printf "[ERROR] %s\n" "$*" >&2; exit 1; }

if [[ "${EUID}" -ne 0 ]]; then
  exec sudo "$0" "${ORIGINAL_ARGS[@]}"
fi

if [[ ! -f "${APP_DIR}/docker-compose.yml" ]]; then
  fail "Run this script from the project root or keep install.sh beside docker-compose.yml."
fi

if [[ ! -f /etc/os-release ]]; then
  fail "Linux distribution not detected."
fi

. /etc/os-release

if ! command -v apt-get >/dev/null 2>&1; then
  fail "This installer supports Debian/Ubuntu servers with apt-get."
fi

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    return 127
  fi
}

port_in_use() {
  local port="$1"
  ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${port}$"
}

find_free_port() {
  local port="$1"
  while [[ "$port" -lt 65535 ]]; do
    if ! port_in_use "$port"; then
      echo "$port"
      return 0
    fi
    port=$((port + 1))
  done
  return 1
}

random_secret() {
  openssl rand -hex 32
}

package_installed() {
  local package="$1"
  dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q "install ok installed"
}

ensure_dpkg_ready() {
  if dpkg --audit | grep -q .; then
    warn "dpkg has interrupted packages; repairing before continuing."
    dpkg --configure -a
  fi

  apt-get install -f -y
}

systemd_unit_exists() {
  local unit="$1"
  systemctl list-unit-files "$unit" >/dev/null 2>&1 || systemctl status "$unit" >/dev/null 2>&1
}

install_docker_engine() {
  log "Installing Docker Engine"
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  rm -f /tmp/get-docker.sh
  ok "Docker Engine installed"
}

start_docker_daemon() {
  if docker info >/dev/null 2>&1; then
    ok "Docker daemon is running"
    return 0
  fi

  if systemd_unit_exists docker.service; then
    systemctl enable docker >/dev/null 2>&1 || true
    systemctl start docker
  elif systemd_unit_exists snap.docker.dockerd.service; then
    systemctl enable snap.docker.dockerd.service >/dev/null 2>&1 || true
    systemctl start snap.docker.dockerd.service
  else
    warn "Docker command exists, but no known systemd service was found."
  fi

  if ! docker info >/dev/null 2>&1; then
    warn "Docker daemon did not start; reinstalling/repairing Docker Engine."
    install_docker_engine
    if systemd_unit_exists docker.service; then
      systemctl enable docker >/dev/null 2>&1 || true
      systemctl start docker
    fi
  fi

  docker info >/dev/null 2>&1 || fail "Docker daemon is not running. Check it with: systemctl status docker or systemctl status snap.docker.dockerd"
  ok "Docker daemon is running"
}

ensure_base_packages() {
  log "Checking base prerequisites"
  ensure_dpkg_ready

  local missing_packages=()
  local package

  for package in "${REQUIRED_PACKAGES[@]}"; do
    if package_installed "$package"; then
      ok "$package already installed"
    else
      missing_packages+=("$package")
    fi
  done

  if [[ "${#missing_packages[@]}" -gt 0 ]]; then
    log "Installing missing packages: ${missing_packages[*]}"
    apt-get update
    apt-get install -y "${missing_packages[@]}"
  else
    ok "All base prerequisites are installed"
  fi
}

install_docker_if_needed() {
  log "Checking Docker"
  if command -v docker >/dev/null 2>&1; then
    ok "Docker already installed: $(docker --version)"
  else
    install_docker_engine
  fi

  start_docker_daemon

  if docker compose version >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1; then
    ok "Docker Compose available: $(compose version)"
  else
    log "Installing Docker Compose plugin"
    if ! apt-get install -y docker-compose-plugin; then
      warn "docker-compose-plugin package unavailable; installing standalone docker-compose."
      local compose_version
      compose_version="$(curl -fsSL https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | cut -d '"' -f 4)"
      curl -fsSL "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
    fi
  fi

  compose version >/dev/null 2>&1 || fail "Docker Compose is not available after installation."
}

npm_detected() {
  docker ps -a --format '{{.Names}}' | grep -Eiq '^(nginx-proxy-manager|npm|npm-app)$'
}

install_nginx_proxy_manager() {
  if npm_detected; then
    ok "Nginx Proxy Manager container already detected; leaving it untouched."
    return 0
  fi

  if port_in_use 80 || port_in_use 81 || port_in_use 443; then
    warn "Ports 80, 81 or 443 are already in use. Skipping Nginx Proxy Manager installation."
    warn "Use your existing proxy and point it to this app."
    return 0
  fi

  log "Installing Nginx Proxy Manager"
  mkdir -p "${APP_DIR}/nginx-proxy-manager/data" "${APP_DIR}/nginx-proxy-manager/letsencrypt"
  cat > "${APP_DIR}/nginx-proxy-manager/docker-compose.yml" <<'EOF'
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - nexusmeet-network

networks:
  nexusmeet-network:
    external: true
EOF
  (cd "${APP_DIR}/nginx-proxy-manager" && compose up -d)
  ok "Nginx Proxy Manager available at http://SERVER_IP:81"
}

write_env() {
  local frontend_port="$1"
  local bind_address="$2"

  if [[ -f "${APP_DIR}/.env" ]]; then
    cp "${APP_DIR}/.env" "${APP_DIR}/.env.backup.$(date +%Y%m%d%H%M%S)"
    warn "Existing .env backed up before writing production values."
  fi

  cat > "${APP_DIR}/.env" <<EOF
# NexusMeet production settings
BIND_ADDRESS=${bind_address}
FRONTEND_PORT=${frontend_port}
REACT_APP_BACKEND_URL=

DB_NAME=sala_reservas
MONGO_ROOT_PASSWORD=$(random_secret)

JWT_SECRET=$(random_secret)
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=*

SMTP_SERVER=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Sistema de Reservas
EOF
}

main() {
  log "Starting production installation on ${PRETTY_NAME:-Linux}"
  ensure_base_packages
  install_docker_if_needed

  local frontend_port
  frontend_port="$(find_free_port "${FRONTEND_PORT_DEFAULT}")"
  [[ -n "${frontend_port}" ]] || fail "No free port found for the frontend."

  write_env "${frontend_port}" "${BIND_ADDRESS_DEFAULT}"

  log "Building and starting NexusMeet"
  (cd "${APP_DIR}" && compose up -d --build)

  case "${INSTALL_NPM}" in
    yes)
      install_nginx_proxy_manager
      ;;
    no)
      ok "Skipping Nginx Proxy Manager installation by request."
      ;;
    ask)
      if [[ -t 0 ]]; then
        read -r -p "Install Nginx Proxy Manager if missing? [Y/n]: " answer
        if [[ ! "${answer}" =~ ^[Nn]$ ]]; then
          install_nginx_proxy_manager
        fi
      else
        warn "Non-interactive shell: skipping Nginx Proxy Manager. Use --with-npm to install it."
      fi
      ;;
  esac

  log "Installation finished"
  echo "Local app URL: http://${BIND_ADDRESS_DEFAULT}:${frontend_port}"
  echo ""
  echo "Nginx Proxy Manager configuration:"
  echo "  If NPM is installed directly on the host, use Forward Hostname/IP: 127.0.0.1 and Forward Port: ${frontend_port}."
  echo "  If NPM is the container installed by this script, use Forward Hostname/IP: nexusmeet-frontend and Forward Port: 80."
  echo ""
  echo "Default login:"
  echo "  Email: admin@sistema.com"
  echo "  Password: admin123"
  echo ""
  echo "Useful commands:"
  echo "  cd ${APP_DIR}"
  echo "  docker compose ps"
  echo "  docker compose logs -f"
}

main
