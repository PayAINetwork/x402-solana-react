import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'X402SolanaReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@solana/web3.js', '@solana/spl-token'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@solana/web3.js': 'SolanaWeb3',
          '@solana/spl-token': 'SolanaSplToken',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
