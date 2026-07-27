/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    server: {
        port: 3000
    },
    build: {
        emptyOutDir: true,
        copyPublicDir: false,
        lib: {
            entry: path.resolve(__dirname, 'src/index.tsx'),
            name: 'mgwdev-m365-components',
            formats: ['es', 'umd'],
            fileName: (format) => `mgwdev-m365-components.${format}.js`,
        },
        rollupOptions: {
            external: (id) => {
                return [
                    'react',
                    'react/jsx-runtime',
                    'react/jsx-dev-runtime',
                    'react-dom',
                    '@fluentui/react-components',
                    'mgwdev-m365-helpers',
                ].includes(id) || id.startsWith('mgwdev-m365-helpers/');
            },
            output: {
                globals: (id) => {
                    if (id === 'react') return 'React';
                    if (id === 'react/jsx-runtime') return 'jsxRuntime';
                    if (id === 'react/jsx-dev-runtime') return 'jsxDevRuntime';
                    if (id === 'react-dom') return 'ReactDOM';
                    if (id === '@fluentui/react-components') return 'FluentUIReactComponents';
                    if (id === 'mgwdev-m365-helpers' || id.startsWith('mgwdev-m365-helpers/')) return 'mgwdevM365Helpers';
                    return id;
                },
            },
        },
    },
});