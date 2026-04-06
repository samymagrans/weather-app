import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * Vitest config for NestJS.
 *
 * NestJS relies on TypeScript decorator metadata (emitDecoratorMetadata).
 * Vitest's default esbuild transform does not support this, so we replace
 * it with SWC via unplugin-swc, which does support metadata reflection.
 *
 * The pool is set to 'forks' instead of the default 'threads' to avoid
 * issues with NestJS's dependency injection container when tests run in
 * parallel worker threads.
 */
export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
  },
  plugins: [
    swc.vite({
      // Do NOT set module.type here — Vitest 2 runs in ESM mode and
      // forcing 'commonjs' output causes "Vitest cannot be imported in
      // a CommonJS module" errors. SWC still handles decorator metadata.
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
        },
        target: 'es2021',
      },
    }),
  ],
});
