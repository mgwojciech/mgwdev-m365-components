/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from "path";

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
        lib: {
            entry: path.resolve(__dirname, 'src/index.tsx'),
            name: 'mgwdev-m365-components',
            formats: ['es'], //, 'umd'
            fileName: (format) => `mgwdev-m365-components.${format}.js`,
        },
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                redirect: resolve(__dirname, "redirect.html"), // ← Redirect bridge entry
            },
            external: ['react', 'react-dom'],
            output: {
                inlineDynamicImports: false ,
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});