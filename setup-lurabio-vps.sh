#!/usr/bin/env bash
# =============================================================================
# LuraBio VPS Setup — Hetzner
# Domain  : lurabio.com
# Server  : 87.99.156.51
# DB      : lurabio_db
# S3      : s3://lurabio-vault/backups/db/
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
DOMAIN="lurabio.com"
WWW_DOMAIN="www.lurabio.com"
WP_DIR="/var/www/lurabio"
DB_NAME="lurabio_db"
DB_USER="lurabio_user"
DB_PASS="$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 40)"
MYSQL_ROOT_PASS="$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 40)"
WP_ADMIN_USER="lurabio_admin"
WP_ADMIN_PASS="$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24)"
WP_ADMIN_EMAIL="preyeembelegha@gmail.com"
S3_BACKUP_PATH="s3://lurabio-vault/backups/db/"
CREDS_FILE="/root/lurabio_credentials.txt"
PHP_VER="8.3"

log()  { echo -e "\n\033[1;32m[$(date +%T)]\033[0m $*"; }
err()  { echo -e "\n\033[1;31m[ERROR]\033[0m $*" >&2; }
warn() { echo -e "\n\033[1;33m[WARN]\033[0m $*"; }

[[ $EUID -ne 0 ]] && { err "Run as root"; exit 1; }

log "Starting LuraBio VPS setup..."

# ── 1. System update ──────────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

apt-get install -y -qq \
  software-properties-common curl wget gnupg2 ca-certificates \
  lsb-release unzip zip git ufw fail2ban htop vim net-tools

# ── 2. UFW Firewall ───────────────────────────────────────────────────────────
log "Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment 'SSH'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
ufw --force enable

# ── 3. fail2ban ───────────────────────────────────────────────────────────────
log "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true

[nginx-botsearch]
enabled = true
JAIL
systemctl enable fail2ban
systemctl restart fail2ban

# ── 4. Nginx ──────────────────────────────────────────────────────────────────
log "Installing Nginx..."
apt-get install -y -qq nginx
systemctl enable nginx

# ── 5. PHP 8.3-FPM ───────────────────────────────────────────────────────────
log "Installing PHP ${PHP_VER}-FPM + WooCommerce extensions..."
add-apt-repository -y ppa:ondrej/php
apt-get update -qq
apt-get install -y -qq \
  php${PHP_VER}-fpm \
  php${PHP_VER}-mysql \
  php${PHP_VER}-curl \
  php${PHP_VER}-gd \
  php${PHP_VER}-intl \
  php${PHP_VER}-mbstring \
  php${PHP_VER}-soap \
  php${PHP_VER}-xml \
  php${PHP_VER}-zip \
  php${PHP_VER}-bcmath \
  php${PHP_VER}-exif \
  php${PHP_VER}-imagick \
  php${PHP_VER}-opcache \
  php${PHP_VER}-redis \
  php${PHP_VER}-cli

# php.ini tuning
PHP_INI="/etc/php/${PHP_VER}/fpm/php.ini"
sed -i 's/^upload_max_filesize.*/upload_max_filesize = 64M/'  "$PHP_INI"
sed -i 's/^post_max_size.*/post_max_size = 64M/'              "$PHP_INI"
sed -i 's/^memory_limit.*/memory_limit = 256M/'               "$PHP_INI"
sed -i 's/^max_execution_time.*/max_execution_time = 300/'    "$PHP_INI"
sed -i 's/^max_input_time.*/max_input_time = 300/'            "$PHP_INI"
sed -i 's/^;date.timezone.*/date.timezone = UTC/'             "$PHP_INI"

# Opcache
cat >> /etc/php/${PHP_VER}/fpm/conf.d/10-opcache.ini <<'OPCACHE'
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.save_comments=1
OPCACHE

# FPM pool tuning
FPM_POOL="/etc/php/${PHP_VER}/fpm/pool.d/www.conf"
sed -i 's/^pm =.*/pm = dynamic/'                             "$FPM_POOL"
sed -i 's/^pm.max_children.*/pm.max_children = 20/'          "$FPM_POOL"
sed -i 's/^pm.start_servers.*/pm.start_servers = 4/'         "$FPM_POOL"
sed -i 's/^pm.min_spare_servers.*/pm.min_spare_servers = 2/' "$FPM_POOL"
sed -i 's/^pm.max_spare_servers.*/pm.max_spare_servers = 6/' "$FPM_POOL"

systemctl enable php${PHP_VER}-fpm
systemctl restart php${PHP_VER}-fpm

# ── 6. MySQL 8 ────────────────────────────────────────────────────────────────
log "Installing MySQL 8..."
apt-get install -y -qq mysql-server

mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DELETE FROM mysql.user WHERE User='';"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "DROP DATABASE IF EXISTS test;"
mysql -u root -p"${MYSQL_ROOT_PASS}" -e "FLUSH PRIVILEGES;"

mysql -u root -p"${MYSQL_ROOT_PASS}" -e "
  CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
  FLUSH PRIVILEGES;
"

systemctl enable mysql

# ── 7. Redis ──────────────────────────────────────────────────────────────────
log "Installing Redis..."
apt-get install -y -qq redis-server
sed -i 's/^# maxmemory .*/maxmemory 256mb/'                  /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy.*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl restart redis-server

# ── 8. WP-CLI ─────────────────────────────────────────────────────────────────
log "Installing WP-CLI..."
curl -sS https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  -o /usr/local/bin/wp
chmod +x /usr/local/bin/wp
wp --info --allow-root

# ── 9. WordPress ──────────────────────────────────────────────────────────────
log "Downloading WordPress..."
mkdir -p "$WP_DIR"
wp core download --path="$WP_DIR" --allow-root

log "Creating wp-config.php..."
wp config create \
  --path="$WP_DIR" \
  --dbname="$DB_NAME" \
  --dbuser="$DB_USER" \
  --dbpass="$DB_PASS" \
  --dbhost="localhost" \
  --dbcharset="utf8mb4" \
  --dbcollate="utf8mb4_unicode_ci" \
  --allow-root

wp config set WP_CACHE           true  --raw --path="$WP_DIR" --allow-root
wp config set WP_DEBUG           false --raw --path="$WP_DIR" --allow-root
wp config set DISALLOW_FILE_EDIT true  --raw --path="$WP_DIR" --allow-root
wp config set FS_METHOD          direct      --path="$WP_DIR" --allow-root

chown -R www-data:www-data "$WP_DIR"
find "$WP_DIR" -type d -exec chmod 755 {} \;
find "$WP_DIR" -type f -exec chmod 644 {} \;

# ── 10. Nginx site config ─────────────────────────────────────────────────────
log "Writing Nginx config for ${DOMAIN}..."

cat > /etc/nginx/sites-available/lurabio <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    root ${WP_DIR};
    index index.php index.html;

    add_header X-Frame-Options        "SAMEORIGIN"                      always;
    add_header X-Content-Type-Options "nosniff"                         always;
    add_header X-XSS-Protection       "1; mode=block"                   always;
    add_header Referrer-Policy        "strict-origin-when-cross-origin" always;

    client_max_body_size 64m;

    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php${PHP_VER}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_read_timeout 300;
    }

    location ~* /uploads/.*\\.php\$ { deny all; }

    location ~* \\.(css|gif|ico|jpeg|jpg|js|png|svg|webp|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
        log_not_found off;
    }

    location ~ /\\. { deny all; }
    location = /xmlrpc.php { deny all; }

    access_log /var/log/nginx/lurabio_access.log;
    error_log  /var/log/nginx/lurabio_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/lurabio /etc/nginx/sites-enabled/lurabio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ── 11. WordPress install ─────────────────────────────────────────────────────
log "Installing WordPress..."
wp core install \
  --path="$WP_DIR" \
  --url="http://${DOMAIN}" \
  --title="LuraBio -- Laboratory Reagents" \
  --admin_user="$WP_ADMIN_USER" \
  --admin_password="$WP_ADMIN_PASS" \
  --admin_email="$WP_ADMIN_EMAIL" \
  --allow-root

log "Installing WooCommerce..."
wp plugin install woocommerce --activate --path="$WP_DIR" --allow-root
wp theme install storefront --path="$WP_DIR" --allow-root || true

# ── 12. SSL via Certbot ───────────────────────────────────────────────────────
log "Obtaining SSL certificate..."
apt-get install -y -qq certbot python3-certbot-nginx

certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$WP_ADMIN_EMAIL" \
  --domains "${DOMAIN},${WWW_DOMAIN}" \
  --redirect

wp option update siteurl "https://${DOMAIN}" --path="$WP_DIR" --allow-root
wp option update home    "https://${DOMAIN}" --path="$WP_DIR" --allow-root

# ── 13. AWS CLI + S3 backups ──────────────────────────────────────────────────
log "Installing AWS CLI v2..."
curl -sS "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install --update
rm -rf /tmp/awscliv2.zip /tmp/aws

echo ""
echo "----------------------------------------"
echo " AWS credentials for S3 backups"
echo "----------------------------------------"
read -rp  "AWS Access Key ID:      " AWS_KEY
read -rsp "AWS Secret Access Key:  " AWS_SECRET
echo ""
read -rp  "AWS Region [us-east-1]: " AWS_REGION
AWS_REGION="${AWS_REGION:-us-east-1}"

mkdir -p /root/.aws
chmod 700 /root/.aws

cat > /root/.aws/credentials <<AWSCREDS
[default]
aws_access_key_id     = ${AWS_KEY}
aws_secret_access_key = ${AWS_SECRET}
AWSCREDS

cat > /root/.aws/config <<AWSCFG
[default]
region = ${AWS_REGION}
output = json
AWSCFG

chmod 600 /root/.aws/credentials /root/.aws/config

log "Testing S3 access..."
if aws s3 ls s3://lurabio-vault/ --human-readable; then
  log "S3 access confirmed."
else
  warn "S3 access failed -- check IAM permissions after setup."
fi

# Write the backup script with the real DB password already embedded
BACKUP_SCRIPT="/usr/local/bin/lurabio-db-backup"
cat > "$BACKUP_SCRIPT" <<BACKUP
#!/usr/bin/env bash
set -euo pipefail
TS=\$(date +%Y-%m-%d_%H-%M-%S)
FILE="/tmp/lurabio_db_\${TS}.sql.gz"
mysqldump -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" | gzip > "\$FILE"
aws s3 cp "\$FILE" "${S3_BACKUP_PATH}lurabio_db_\${TS}.sql.gz" --storage-class STANDARD_IA
rm -f "\$FILE"
aws s3 ls "${S3_BACKUP_PATH}" | awk '{print \$4}' | while read -r key; do
  date_str=\$(echo "\$key" | grep -oP '\d{4}-\d{2}-\d{2}' | head -1)
  if [[ -n "\$date_str" ]]; then
    age=\$(( ( \$(date +%s) - \$(date -d "\$date_str" +%s) ) / 86400 ))
    [[ \$age -gt 30 ]] && aws s3 rm "${S3_BACKUP_PATH}\${key}"
  fi
done
echo "Backup complete: \$TS"
BACKUP
chmod +x "$BACKUP_SCRIPT"

# Daily 2 AM cron
(crontab -l 2>/dev/null; echo "0 2 * * * ${BACKUP_SCRIPT} >> /var/log/lurabio-backup.log 2>&1") | crontab -

# ── 14. Plugin directory ──────────────────────────────────────────────────────
log "Creating lurabio-compliance plugin directory..."
PLUGIN_DIR="${WP_DIR}/wp-content/plugins/lurabio-compliance"
mkdir -p "$PLUGIN_DIR"
chown -R www-data:www-data "$PLUGIN_DIR"

# ── 15. Save credentials ──────────────────────────────────────────────────────
log "Writing credentials to ${CREDS_FILE}..."
cat > "$CREDS_FILE" <<CREDS
# LuraBio Server Credentials -- $(date)
# ================================================
# KEEP THIS FILE SECURE

DOMAIN          = ${DOMAIN}
SERVER_IP       = 87.99.156.51

WP_ADMIN_URL    = https://${DOMAIN}/wp-admin
WP_ADMIN_USER   = ${WP_ADMIN_USER}
WP_ADMIN_PASS   = ${WP_ADMIN_PASS}

DB_NAME         = ${DB_NAME}
DB_USER         = ${DB_USER}
DB_PASS         = ${DB_PASS}
MYSQL_ROOT_PASS = ${MYSQL_ROOT_PASS}

S3_BUCKET       = lurabio-vault
S3_BACKUP_PATH  = ${S3_BACKUP_PATH}
AWS_REGION      = ${AWS_REGION}

RESTART_PHP     = systemctl restart php${PHP_VER}-fpm
RELOAD_NGINX    = systemctl reload nginx
NGINX_ERROR_LOG = tail -f /var/log/nginx/lurabio_error.log
BACKUP_LOG      = tail -f /var/log/lurabio-backup.log
RUN_BACKUP      = /usr/local/bin/lurabio-db-backup

PLUGIN_DIR      = ${PLUGIN_DIR}
DEPLOY_CMD      = rsync -avz lurabio-compliance/ root@87.99.156.51:${PLUGIN_DIR}/
CREDS
chmod 600 "$CREDS_FILE"

# ── Done ──────────────────────────────────────────────────────────────────────
log "============================================"
log " LuraBio VPS setup COMPLETE"
log "============================================"
echo ""
cat "$CREDS_FILE"
echo ""
log "NEXT STEPS:"
echo "  1. Re-enable Cloudflare proxy (orange cloud) on lurabio.com DNS"
echo "  2. Visit https://${DOMAIN}/wp-admin to finish WooCommerce setup"
echo "  3. From your local machine, deploy the plugin:"
echo "       rsync -avz lurabio-compliance/ root@87.99.156.51:${PLUGIN_DIR}/"
echo "  4. Activate LuraBio Compliance in WP Admin -> Plugins"
echo "  5. Test backup: /usr/local/bin/lurabio-db-backup"
