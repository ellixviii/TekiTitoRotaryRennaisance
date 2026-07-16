$ErrorActionPreference = 'Stop'
php artisan down --retry=60
try {
    composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader
    npm ci
    npm run build
    php artisan migrate --force
    php artisan optimize
} finally {
    php artisan up
}
