import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: resolve(__dirname, '../../node_modules/.vite'),
    test: {
        projects: [{
            test: {
                name: 'lib',
                environment: 'jsdom',
                globals: true,
                include: [
                    '**/*.spec.ts',
                ],
                exclude: [
                    'schematics/**',
                ],
            },
        },
        {
            test: {
                name: 'schematics',
                environment: 'node',
                globals: true,
                isolate: false,
                include: [
                    'schematics/**/*.spec.ts',
                ],
                setupFiles: [
                    'vitest.setup.ts',
                ],
            },
        }],
    },
});
