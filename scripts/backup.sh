#!/usr/bin/env bash
set -euo pipefail
: "${BACKUP_PASSPHRASE:?Set BACKUP_PASSPHRASE before backing up}"
set -a; source .env; set +a
stamp=$(date +%Y%m%d-%H%M%S)
destination="storage/app/backups/rotary-$stamp"
mkdir -p "$destination"
if [[ "${DB_CONNECTION:-sqlite}" == pgsql ]]; then
  PGPASSWORD="$DB_PASSWORD" pg_dump --format=custom --file="$destination/database.dump" --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" "$DB_DATABASE"
else
  cp database/database.sqlite "$destination/database.sqlite"
fi
cp .env "$destination/.env"
tar -czf "$destination.tar.gz" -C "$destination" .
openssl enc -aes-256-cbc -salt -pbkdf2 -in "$destination.tar.gz" -out "$destination.tar.gz.enc" -pass env:BACKUP_PASSPHRASE
sha256sum "$destination.tar.gz.enc" > "$destination.sha256"
rm -rf "$destination" "$destination.tar.gz"
echo "Encrypted backup: $destination.tar.gz.enc"
