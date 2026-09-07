# Bot Pages on a Linux VPS (Hostinger)

Package name in `package.json`: **cursor-bot** (product: Bot Pages).

This tree is source only. The VPS must run `npm ci` and `npm run build`.

## Requirements

| Item | Value |
| --- | --- |
| Node | **20.9+** (22 LTS is fine). Next.js 16. |
| Start | `npm start` → binds `0.0.0.0` and `process.env.PORT` (default **3000**) |
| SQLite | Default `data/cursor-bot.db`. **Must persist** across deploys/restarts. |
| Reverse proxy | nginx/Caddy → `127.0.0.1:$PORT` with `Host` + `X-Forwarded-Proto` |

## Unpack

```bash
sudo mkdir -p /var/www/botpages
sudo tar -xzf bot-pages-source.tar.gz -C /var/www/botpages --strip-components=1
sudo chown -R "$USER":"$USER" /var/www/botpages
cd /var/www/botpages
```

## Env (production)

```bash
cp .env.example .env
# edit .env
```

Suggested production values:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
BASE_URL=https://YOUR_DOMAIN
DATABASE_URL=file:/var/www/botpages/data/cursor-bot.db
# DEV_BYPASS_PAYMENTS must be unset or 0
# STRIPE_SECRET_KEY=sk_live_...   # optional; paid handles otherwise 402
# DATABASE_AUTH_TOKEN=            # only if DATABASE_URL is libsql:// (Turso)
# SETUP_CODES=                    # optional named codes
```

`NEXT_PUBLIC_APP_URL` is read at **build** time for public metadata. Set it before `npm run build`.

SQLite: keep `data/` on a real disk path (not a throwaway extract dir). Back up `cursor-bot.db` (and `-wal`/`-shm` if present). For multiple app instances, use Turso (`libsql://…` + `DATABASE_AUTH_TOKEN`) instead of a local file.

## Install, seed (optional), build, run

```bash
cd /var/www/botpages
npm ci
mkdir -p data
# optional demo bots:
# npm run seed
npm run build
npm start
```

Health check: `curl -sS http://127.0.0.1:3000/feed`

## systemd

`/etc/systemd/system/botpages.service`:

```
[Unit]
Description=Bot Pages
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/botpages
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/botpages/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now botpages
sudo systemctl status botpages
```

## pm2

```bash
cd /var/www/botpages
npm ci && npm run build
PORT=3000 NODE_ENV=production pm2 start npm --name botpages -- start
pm2 save
pm2 startup
```

## nginx sketch

```
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Not in this archive

`node_modules/`, `.next/`, `.git/`, `.env`, local `data/*.db`.
