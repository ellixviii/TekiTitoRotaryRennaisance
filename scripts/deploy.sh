#!/usr/bin/env bash
set -euo pipefail
php artisan down --retry=60
trap 'php artisan up' EXIT
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
