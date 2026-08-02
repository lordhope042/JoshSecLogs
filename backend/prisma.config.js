// Prisma configuration (CommonJS / JavaScript).
//
// This file replaces the previous `prisma.config.ts`. Prisma v7 auto-discovers
// any `prisma.config.{js,ts,mjs,cjs,mts,cts}` file (see the official "Supported
// file extensions" section of the Prisma config reference), so a `.js` file is
// fully supported and is loaded directly via Node's module loader — it bypasses
// jiti's TypeScript/Babel transpiler entirely.
//
// WHY THE SWITCH:
// The previous `prisma.config.ts` was committing as 161 NUL bytes in the repo
// (a corrupted file — see RECOVERY.md), which made Prisma's config loader fail
// with "ParseError: Unexpected character ''" (the unprintable NUL at 1:0)
// during the Railway/Railpack build's `postinstall: prisma generate` step.
// Even after restoring the file, a `.ts` config still gets transpiled by jiti's
// bundled Babel parser at load time, which is a known fragile point in
// container/CI builds (prisma/prisma issues #28576, #28759, #28573). A plain
// `.js` file needs no transpilation, so the parser is never invoked.
//
// DATABASE_URL handling:
// `prisma generate` (run during `npm install` postinstall and `npm run build`)
// does NOT need a live database connection, but Prisma still loads this config
// file for every command. We therefore use `process.env.DATABASE_URL ?? ''`
// instead of the throwing `env()` helper (or a non-null `!` assertion) so that
// `generate` succeeds in the build environment where DATABASE_URL is not yet
// available. The real value is provided at runtime / migrate time via the
// service's environment variables.
const { defineConfig } = require('prisma/config');

// Load .env in local development. In the build container there is no .env
// (and we don't need one for `generate`), so require() is guarded.
try {
  require('dotenv/config');
} catch {
  /* dotenv not installed or no .env present — fine for `prisma generate` */
}

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
