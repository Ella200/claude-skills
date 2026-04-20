import { defineConfig, devices } from '@playwright/test';

export default defineConfig( {
    testDir: './tests',
    fullyParallel: false,
    retries: 1,
    reporter: [ [ 'list' ], [ 'html', { open: 'never' } ] ],
    use: {
        baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:8888',
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices[ 'Desktop Chrome' ] },
        },
    ],
} );
