import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/Browser',
    use: { baseURL: 'http://127.0.0.1:8891', trace: 'retain-on-failure' },
    webServer: {
        command: 'php artisan serve --host=127.0.0.1 --port=8891',
        url: 'http://127.0.0.1:8891/up',
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
