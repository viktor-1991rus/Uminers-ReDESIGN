/**
 * The catalogue the grid actually renders — products.js and catalogue-ai.js
 * composed into one set of four exports with the same names and shapes the
 * view already consumes.
 *
 * It exists as its own module rather than as logic inside CatalogueView so the
 * two source files stay editable on their own terms: products.js is the older
 * hand-kept list, catalogue-ai.js is collected against manufacturer pages and
 * will be re-collected. Neither has to know about the other.
 *
 * Two things have to be resolved here, and both are resolved in one direction
 * only, so re-running the collector cannot change the outcome:
 *
 *   1. `server` means two different things in the two files. In products.js it
 *      is NETWORKING — four switches and a NIC, sitting under the "Networking"
 *      label. In catalogue-ai.js it is GPU SERVERS — eight rack machines. Left
 *      alone, the merge files eight servers under Networking. The AI file's
 *      eight are remapped onto their own `gpuserver` key and get their own tab;
 *      products.js keeps `server` and keeps its label.
 *
 *   2. Eleven slugs exist in both files. The AI file is the newer and more
 *      complete of the two for those entries (its own header says so), so it
 *      wins on collision, wholesale — the entry is replaced, not field-merged,
 *      because a half-and-half product is a thing neither file was reviewed as.
 */
import {
  CATEGORIES as CATEGORIES_BASE,
  FACETS as FACETS_BASE,
  SPEC_KEYS as SPEC_KEYS_BASE,
  PRODUCTS as PRODUCTS_BASE
} from './products'

import {
  FACETS_AI,
  SPEC_KEYS_AI,
  PRODUCTS_AI
} from './catalogue-ai'

import {
  PRODUCTS_GPU
} from './catalogue-gpu'

/* the remap described in (1) above — applied on read, so catalogue-ai.js is
   never rewritten and the collector can keep emitting its own vocabulary */
const AI_CATEGORY = { ai: 'ai', gpu: 'gpu', server: 'gpuserver' }

/* catalogue-gpu.js needs no remap — every entry there is category 'gpu', which
   means the same thing in all three files. It goes through the same dedupe for
   the same reason: it is collected, and a collector re-run must not be able to
   double an entry. */
const remapped = [
  ...PRODUCTS_AI.map(p => ({
    ...p,
    category: AI_CATEGORY[p.category] ?? p.category
  })),
  ...PRODUCTS_GPU
]

/* GPU servers sit between the turnkey AI systems and the bare accelerators,
   which is the order a buyer narrows in: whole machine, rack machine, card */
export const CATEGORIES = CATEGORIES_BASE.flatMap(c =>
  c.key === 'ai'
    ? [c, { key: 'gpuserver', label: 'GPU servers', mark: 'server' }]
    : [c]
)

export const FACETS = {
  ...FACETS_BASE,
  ai: FACETS_AI.ai ?? FACETS_BASE.ai,
  gpu: FACETS_AI.gpu ?? FACETS_BASE.gpu,
  gpuserver: FACETS_AI.server ?? ['brand']
}

export const SPEC_KEYS = {
  ...SPEC_KEYS_BASE,
  gpuserver: SPEC_KEYS_AI.server
}

/* AI file wins on slug collision; everything else keeps products.js order, and
   the new entries are appended after the ones already reviewed */
const byAiSlug = new Map(remapped.map(p => [p.slug, p]))

export const PRODUCTS = [
  ...PRODUCTS_BASE.map(p => byAiSlug.get(p.slug) ?? p),
  ...remapped.filter(p => !PRODUCTS_BASE.some(b => b.slug === p.slug))
]
