import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const REQUIRED = [
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/lib/i18n.ts',
  'src/locales/en.json',
  'src/locales/fr.json',
  'src/locales/pt.json',
  'src/locales/ar.json',
  'tsconfig.json',
  'vitest.config.ts',
  'next.config.ts',
  '.env.example',
];

// Deleting these is the point of Task 1 Step 10, and a future
// `create-next-app` rerun would quietly bring them back.
const FORBIDDEN = [
  'src/app/page.tsx',
  'public/next.svg',
  'public/vercel.svg',
  'public/file.svg',
  'public/globe.svg',
  'public/window.svg',
  'tailwind.config.ts',
  'tailwind.config.js',
  'AGENTS.md',
];

describe('app skeleton', () => {
  for (const file of REQUIRED) {
    it(`has ${file}`, () => {
      expect(existsSync(file), `${file} is missing`).toBe(true);
    });
  }

  for (const file of FORBIDDEN) {
    it(`does not have ${file}`, () => {
      expect(existsSync(file), `${file} should have been removed`).toBe(false);
    });
  }
});

describe('typescript configuration', () => {
  const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8')) as {
    compilerOptions: Record<string, unknown>;
  };

  it('enables strict mode', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('enables noUncheckedIndexedAccess', () => {
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
  });

  it('maps the @ alias to src', () => {
    expect(tsconfig.compilerOptions.paths).toMatchObject({ '@/*': ['./src/*'] });
  });
});

describe('globals.css', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');

  it('imports tailwind', () => {
    expect(css).toContain('@import "tailwindcss"');
  });

  it('does not round-trip to google fonts', () => {
    expect(css).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  });
});

/*
 * The colour guard that stood here is gone. It forbade colour literals
 * anywhere under `src/` outside the `@theme` block, which is incompatible
 * with the decision to transcribe the approved prototype's inline styles
 * verbatim — see docs/superpowers/specs/2026-08-14-prototype-styling-parity-design.md
 * (D2). Two narrower alternatives, a presentation-layer exception and a
 * palette allowlist, were offered and declined.
 *
 * What still guards the palette: tests/unit/tokens.test.ts holds the need
 * colours to WCAG AA by computing their contrast ratios, and it is the
 * reason two of them (training, funding) are deliberately darker than the
 * prototype's own values. That suite is load-bearing and must not be
 * relaxed to make a transcription match.
 */

describe('root layout', () => {
  const layout = readFileSync('src/app/layout.tsx', 'utf8');

  it('gates robots metadata on the deployment environment', () => {
    expect(layout).toMatch(/robots:\s*isIndexable\(\)/);
  });

  it('does not import a font from next/font/google', () => {
    expect(layout).not.toContain('next/font/google');
  });

  it('takes its title and description from the locale file', () => {
    // <title> and <meta description> are user-facing, so they go through t().
    expect(layout).toMatch(/title:\s*t\(/);
    expect(layout).toMatch(/description:\s*t\(/);
  });
});
