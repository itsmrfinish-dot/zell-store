/**
 * ÙØ´ØºÙÙ Ø­Ø§ÙØ§Øª Ø§ÙÙØªØ¬Ø± â ÙÙØ·Ù Ø®Ø§ÙØµ Ø¨Ø³Ø ÙÙ ØºÙØ± Ø¯Ø§ØªØ§Ø¨ÙØ² ÙÙØ§ Ø´Ø¨ÙØ© ÙÙØ§ ÙØªØºÙØ±Ø§Øª Ø¨ÙØ¦Ø© (0021-D2 W2).
 *
 * Ø§ÙØ§Ø³ØªØ®Ø¯Ø§Ù:  pnpm --filter @zell/storefront cases
 *
 * Ø²Ù apps/admin/scripts/run-cases.mjs: Ø¨ÙØ­ÙÙÙ ÙÙÙØ§Øª ÙÙ ÙØ¬ÙØ¯ ÙÙ SUITES Ø¨Ù TypeScript (ÙÙØ¬ÙØ¯ Ø£ØµÙÙØ§ ÙÙ devDependencies â
 * ÙÙÙØ´ dependency Ø¬Ø¯ÙØ¯Ø© ÙÙØ§ ØªØºÙÙØ± ÙÙ pnpm-lock.yaml) ÙÙ CommonJS ÙÙ ÙØ¬ÙØ¯ ÙØ¤ÙØªØ ÙØ¨ÙØ´ØºÙÙ Ø¯Ø§ÙØ© Ø§ÙØ­Ø§ÙØ§Øª ÙØ¹ÙÙÙØ§.
 * Ø§ÙÙØ±Ù: ÙÙÙØ§Øª Ø§ÙÙØªØ¬Ø± Ø¨ØªØ³ØªÙØ±Ø¯ @zell/coreØ ÙØ§ÙÙØ´ØºÙÙ Ø¨ÙØ­ÙÙÙ packages/core/src ÙÙØ§Ù ÙÙ node_modules/@zell/core Ø§ÙÙØ¤ÙØª.
 *
 * â ï¸ Ø§ÙÙÙÙØ§Øª Ø§ÙÙÙ Ø¨ØªØªØ´ØºÙÙ ÙØ§Ø²Ù ØªÙÙÙ Ø®Ø§ÙÙØ© ÙÙ server-only ÙÙÙ Ø£Ù Ø§Ø³ØªÙØ±Ø§Ø¯ ÙÙÙØ© Ø¨Ø±ÙÙ Ø§ÙÙØ¬ÙØ¯ ØºÙØ± @zell/core
 *    (Ø§Ø³ØªÙØ±Ø§Ø¯ Ø§ÙØ£ÙÙØ§Ø¹ Ø¨Ø³ ÙØ³ÙÙØ­ ÙØ£ÙÙ Ø¨ÙØªØ´Ø§Ù ÙÙØª Ø§ÙØªØ­ÙÙÙ). Ø§Ø³ØªØ«ÙØ§Ø¡: ÙØ¬ÙØ¯Ø§Øª also ÙÙ Ø§ÙÙ suite Ø¨ØªØªØ­ÙÙÙ ÙØ¨ÙÙØ§
 *    (Ø§ÙÙØ¬ÙØ¯ ÙÙØ³Ù Ø¨Ø³Ø ÙÙ ØºÙØ± Ø§ÙÙÙ Ø¬ÙØ§Ù)Ø ÙØ§Ø³ØªÙØ±Ø§Ø¯ ÙÙÙØ© ÙÙÙØ§ ÙØ³ÙÙØ­.
 * suite ÙÙÙØ§ core: true = ÙÙÙ Ø­Ø§ÙØ§Øª ÙÙ packages/core/src ÙÙØ³ÙØ Ø¨ÙØªØ´ØºÙÙ ÙÙ node_modules/@zell/core Ø§ÙÙØ¤ÙØª.
 *
 * Ø³Ø·Ø± Ø§ÙÙØªÙØ¬Ø©:  ZELL_STOREFRONT_CASES_RESULT pass=<n> fail=<n>
 * ÙØ§ÙØ®Ø±ÙØ¬ Ø¨ÙÙØ¯ 1 ÙÙ ÙÙÙ Ø£Ù ÙØ´ÙØ Ø£Ù ÙÙ ÙÙÙØ´ ÙÙØ§ Ø­Ø§ÙØ© Ø§ØªØ´ØºÙÙØª.
 */

import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const coreSrc = join(appRoot, '..', '..', 'packages', 'core', 'src')

const SUITES = [
  { name: 'delivery', dir: 'lib/orders', entry: 'deliverySettings.cases.ts', run: 'runDeliverySettingsCases' },
  { name: 'install', dir: 'lib/install', entry: 'installChoice.cases.ts', run: 'runInstallChoiceCases' },
  { name: 'home', dir: 'lib/home', entry: 'homeLayout.cases.ts', run: 'runHomeLayoutCases' },
  { name: 'track', dir: 'lib/orders', entry: 'trackOrder.cases.ts', run: 'runTrackOrderCases' },
  { name: 'shipping', dir: 'lib/orders', entry: 'shipping.cases.ts', run: 'runShippingCases' },
  { name: 'installer-shipping', dir: 'lib/orders', entry: 'installerShipping.cases.ts', run: 'runInstallerShippingCases' },
  { name: 'size', dir: 'lib/size', entry: 'sizeEntry.cases.ts', run: 'runSizeCases' },
  { name: 'size-texts', dir: 'lib/size', entry: 'sizeTexts.cases.ts', run: 'runSizeTextsCases' },
  { name: 'nav', dir: 'lib/nav', entry: 'storeNav.cases.ts', run: 'runStoreNavCases' },
  { name: 'policies', dir: 'lib/policies', entry: 'policies.cases.ts', run: 'runPolicyCases' },
  { name: 'seo', dir: 'lib/seo', entry: 'structuredData.cases.ts', run: 'runSeoCases' },
  { name: 'buy-now', dir: 'lib/buy', entry: 'buyNow.cases.ts', run: 'runBuyNowCases' },
  { name: 'reveal', dir: 'lib/reveal', entry: 'reveal.cases.ts', run: 'runRevealCases' },
  { name: 'inspection', dir: 'lib/install', entry: 'inspection.cases.ts', run: 'runInspectionCases', also: ['lib/data'] },
  // Ø£ÙÙØ§Ø¯ Ø§ÙØ®ØµÙ: Ø§ÙØ­Ø§ÙØ§Øª ÙØ§ÙØª Ø¨ØªØªØ¹ÙÙ typecheck Ø¨Ø³ ÙÙØ§Ø¨ØªØªØ´ØºÙÙØ´ (ÙØ±Ø§Ø¬Ø¹Ø© Ø£ÙÙÙØ© 2026-11).
  { name: 'coupon', dir: 'lib/orders', entry: 'coupon.cases.ts', run: 'runStorefrontCouponCases' },
  { name: 'coupon-checkout', dir: 'lib/orders', entry: 'couponCheckout.cases.ts', run: 'runCheckoutCouponCases', also: ['lib', 'lib/size'] },
  { name: 'core-coupons', core: true, entry: 'coupons.cases.ts', run: 'runCouponCases' },
  // META-PIXEL Â§Ù¤-Ù¡ â Ø§ÙØ¹ÙÙØ§Ù Ø§ÙÙØ¶ÙÙ ÙØ§ÙÙ referrer ÙØ´Ø±Ø· Ø§ÙØªÙÙØ¦Ø© ÙØ§ÙÙ runtime Ø¨Ø¨ÙØ¦Ø© ÙØ²ÙÙÙØ©
  { name: 'meta-pixel', dir: 'lib/analytics', entry: 'metaPixel.cases.ts', run: 'runMetaPixelCases' },
]

const COMPILER_OPTIONS = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
  esModuleInterop: true,
  isolatedModules: true,
}

function transpileDir(srcDir, outDir) {
  mkdirSync(outDir, { recursive: true })
  for (const file of readdirSync(srcDir)) {
    if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue
    const source = readFileSync(join(srcDir, file), 'utf8')
    const result = ts.transpileModule(source, { fileName: file, reportDiagnostics: true, compilerOptions: COMPILER_OPTIONS })
    if (result.diagnostics && result.diagnostics.length > 0) {
      const text = ts.formatDiagnostics(result.diagnostics, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => srcDir,
        getNewLine: () => '\n',
      })
      throw new Error('ØªØ­ÙÙÙ ' + srcDir + '/' + file + ' ÙØ´Ù:\n' + text)
    }
    writeFileSync(join(outDir, file.replace(/\.ts$/, '.js')), result.outputText)
  }
}

const outRoot = mkdtempSync(join(tmpdir(), 'zell-storefront-cases-'))
writeFileSync(join(outRoot, 'package.json'), '{ "type": "commonjs" }\n')
const require = createRequire(join(outRoot, 'index.js'))

let totalPass = 0
let totalFail = 0

try {
  const coreOut = join(outRoot, 'node_modules', '@zell', 'core')
  transpileDir(coreSrc, coreOut)
  writeFileSync(join(coreOut, 'package.json'), '{ "name": "@zell/core", "type": "commonjs", "main": "index.js" }\n')

  for (const suite of SUITES) {
    let outDir = coreOut
    if (!suite.core) {
      for (const extra of suite.also || []) transpileDir(join(appRoot, extra), join(outRoot, extra))
      outDir = join(outRoot, suite.dir)
      transpileDir(join(appRoot, suite.dir), outDir)
    }
    const mod = require(join(outDir, suite.entry.replace(/\.ts$/, '.js')))
    const runner = mod[suite.run]
    if (typeof runner !== 'function') throw new Error(suite.entry + ' ÙØ§ÙÙÙÙØ´ ' + suite.run)

    const report = await runner()
    for (const failure of report.failures) {
      console.error('FAIL [' + suite.name + '] ' + failure.name)
      console.error('  expected: ' + failure.expected)
      console.error('  actual:   ' + failure.actual)
    }
    console.log('ZELL_STOREFRONT_CASES suite=' + suite.name + ' pass=' + report.passed + ' fail=' + report.failures.length)
    totalPass += report.passed
    totalFail += report.failures.length
  }
} finally {
  rmSync(outRoot, { recursive: true, force: true })
}

console.log('ZELL_STOREFRONT_CASES_RESULT pass=' + totalPass + ' fail=' + totalFail)
process.exitCode = totalFail > 0 || totalPass === 0 ? 1 : 0
