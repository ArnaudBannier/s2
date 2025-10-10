import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/s2/',
    build: {
        rollupOptions: {
            // Declare each HTML page we want in the final build
            input: {
                index: 'index.html',
                btrSee: 'examples/algorithm/btree.html',
                memS01Stat01: 'examples/memory/s01-statements-01.html',
                memS01Stat02: 'examples/memory/s01-statements-02.html',
                memS01Cond01: 'examples/memory/s01-conditionals-01.html',
                basicAnim: 'examples/test/basic-anim.html',
            },
        },
    },
});
