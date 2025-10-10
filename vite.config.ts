import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/s2/',
    build: {
        rollupOptions: {
            // Declare each HTML page we want in the final build
            input: {
                index: 'index.html',
                btree: 'examples/algorithm/btree.html',
                mem01: 'examples/memory/s01-statements-01.html',
                mem02: 'examples/memory/s01-statements-02.html',
                basicAnim: 'examples/test/basic-anim.html',
            },
        },
    },
});
