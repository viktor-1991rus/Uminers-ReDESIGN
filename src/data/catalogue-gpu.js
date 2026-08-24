/**
 * GPU / video card catalogue — collected 21 Aug 2026.
 *
 * Assortment shape follows the Exxact "Video Cards & Devices" category, but
 * every entry here is a manufacturer product, quoted from the manufacturer's
 * own public page — NVIDIA, AMD, Intel. No Exxact SKUs, no partnership implied.
 *
 * IMAGE PROVENANCE — RESOLVED, AND IT IS A LICENSING QUESTION.
 * The earlier "no Exxact photography" rule was lifted deliberately by the
 * project owner on 22 Aug 2026, who asked for product photography from
 * exxactcorp.com. It was then established by MD5 comparison, file by file,
 * where each asset actually came from. The result, for the first batch of 35:
 *
 *   · 27 are BYTE-IDENTICAL to images served by exxactcorp.com, from
 *     https://images.exxactcorp.com/productimages/large/EXX-IMG-<id>.jpg .
 *     Not "similar" — the same file. Control point: nvidia-rtx-a4000.jpg
 *     (19912 bytes, MD5 78525EE9…) matches EXX-IMG-7627318.jpg exactly.
 *   · 1 (amd-radeon-pro-w7700) is byte-identical to AMD's own product page.
 *   · 2 (intel-arc-pro-b50 / b60) are frames of Intel press slides from
 *     newsroom.intel.com. b50 is a CROP of one — the notice "Renders for
 *     illustrative purposes only" is cut off at the left edge. Replace it with
 *     the full newsroom file; the URL is in the collection report.
 *   · 5 (nvidia-a10, a16, a2, a30, a40) are of UNKNOWN origin. They are
 *     definitely not Exxact — Exxact fits everything to 650 px and these are
 *     larger — and they were not found on the matching nvidia.com pages.
 *
 * The second batch (26 assets, 23 wired) was collected with sources recorded
 * as each file was saved; that table lives with the collection report.
 *
 * So: a large majority of the product photography in this file is a
 * competitor's, copied bit for bit. That is a decision for the owner and their
 * counsel to make knowingly, not a detail to discover after launch. It is
 * recorded here rather than argued.
 *
 * Prices are null throughout: manufacturer pages do not publish them, and the
 * desk quotes per order. Do not invent values here.
 *
 * Fields mirror src/data/products.js exactly, so the arrays can be
 * concatenated and rendered by the same card:
 *   slug     kebab-case id, unique, matches the image file name
 *   category 'gpu' for every entry in this file
 *   brand    manufacturer, shown as the card's eyebrow
 *   name     model, without the brand prefix
 *   summary  one dry sentence; not rendered by the current card, kept for
 *            the product drawer and for meta descriptions
 *   image    absolute public path, or null when no licensed asset exists
 *   dark     true if the render sits on black — card puts it on a dark plate
 *   photo    true if the asset is a photograph, not a cut-out render
 *   price    null = "to order"
 *   card     exactly three short lines for the card face
 *   specs    dict; SPEC_KEYS_GPU picks four rows from it, missing rows are
 *            skipped rather than filled in
 *
 * NOTE — this file deliberately does NOT repeat slugs already present in
 * src/data/catalogue-ai.js: nvidia-b200, nvidia-h200, nvidia-h100,
 * nvidia-a100-80gb, nvidia-l40s, nvidia-l4, nvidia-rtx-6000-ada,
 * nvidia-rtx-pro-6000-blackwell, amd-instinct-mi300x, amd-instinct-mi325x.
 * De-duplicate by slug if both files feed one grid.
 *
 * NOTE — Bandwidth is present only where the vendor publishes it on the
 * product page. NVIDIA does not list memory bandwidth for the RTX Ada and most
 * RTX Ampere workstation cards; those rows are omitted rather than guessed.
 * Do not confuse the "112 GB/s" figure on the A5000 / A4500 / A6000 pages with
 * memory bandwidth — that is the NVLink bridge rate.
 *
 * NOTE — not re-verified at the vendor page at collection time, check the
 * datasheet before these go live: nvidia-rtx-a5500 (page redirected),
 * nvidia-rtx-a400 (404, specs taken from the shared A1000/A400 launch family),
 * nvidia-rtx-4000-sff-ada (form factor), amd-radeon-pro-w7600 (board power
 * omitted for that reason), intel-arc-pro-b60 / b50 (Intel product pages
 * return 403 to fetch; figures are from Intel's launch data sheet as reported,
 * board power for B60 varies by partner design).
 *
 * NOTE — images, superseding the note this replaces (which said every `image`
 * was null; 35 of them no longer are). Each `image` and each `dark` flag below
 * was set from the file on disk, not by eye: the border band of every asset was
 * sampled and its mean luma taken. A ground under 140 gets dark: true and the
 * card's dark plate; anything above it keeps the default multiply, which eats a
 * white studio ground. The two populations here are far apart — white grounds
 * measure 212-255, black ones 15-20 — so the boundary is not delicate. The one
 * asset that made it matter is nvidia-a2, a card on a dark grey gradient at
 * luma 62: it reads as neither, and multiply would have pulled the whole plate
 * grey.
 *
 * Assets still on flat black have NOT been cut to transparent PNG. Running
 * scripts/cut-dark-assets.mjs will pick up any JPEG in the catalogue tree that
 * has no .png sibling, and will refuse the ones that are not actually on black.
 *
 * amd-instinct-mi355x carries no image on purpose, and the reason is not an
 * oversight in collection. The first pass delivered the same file for MI350X
 * and MI355X, which looked like a mix-up; on re-collection it turned out AMD
 * itself publishes that one render on both product pages
 * (3366850-amd-instinct-mi350x-accelerator.jpg). No separate MI355X render
 * exists. MI350X therefore takes it and MI355X stays on a brand plate, rather
 * than two cards showing one photograph.
 *
 * Still without an image, each for a checked reason: nvidia-b200 and
 * nvidia-b300 (NVIDIA publishes only whole-system photos and an abstract die
 * diagram — different products); nvidia-t4 (delisted, every Exxact listing
 * 404s); intel-arc-pro-a40 / a60 and intel-data-center-gpu-flex-140 / 170
 * (intel.com returns 403 to everything including /content/dam/ assets, and the
 * newsroom press kits cover only Gaudi and the Arc Pro B-series).
 */

/* facet keys shown as filter chips */
export const FACETS_GPU = {
  gpu: ['brand']
}

/* the four spec rows a card shows — fixed dictionary so every card lines up on
 * the same left column. `field` may list candidate keys; the first one present
 * on the product wins, and the row is dropped entirely if none exist. */
export const SPEC_KEYS_GPU = {
  gpu: [
    { key: 'MEM',  label: 'Memory',      field: ['Memory'] },
    { key: 'BW',   label: 'Bandwidth',   field: ['Bandwidth'] },
    { key: 'PWR',  label: 'TDP',         field: ['TDP', 'Power'] },
    { key: 'FORM', label: 'Form factor', field: ['Form factor'] }
  ]
}

export const PRODUCTS_GPU = [
  /* ── NVIDIA RTX PRO, Blackwell workstation ─────────────────────────────── */
  {
    slug: 'nvidia-rtx-pro-6000-max-q', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 6000 Blackwell Max-Q',
    summary: 'The 96 GB Blackwell workstation card held to a 300 W envelope, so four of them fit one chassis instead of one.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-6000-max-q.jpg', price: null,
    card: ['96 GB GDDR7 ECC', '1792 GB/s · 300 W', 'Dual-slot · up to 4 per box'],
    specs: {
      Memory: '96 GB GDDR7 ECC',
      Bandwidth: '1792 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-6000-server', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 6000 Blackwell Server Edition',
    summary: 'Rack version of the 96 GB Blackwell card — passive, MIG-capable, air- or liquid-cooled, lower clocked memory than the workstation part.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-6000-server.jpg', price: null,
    card: ['96 GB GDDR7 ECC', '1597 GB/s · up to 600 W', 'FHFL passive · MIG'],
    specs: {
      Memory: '96 GB GDDR7 ECC, 512-bit',
      Bandwidth: '1597 GB/s',
      TDP: 'Up to 600 W, configurable',
      'Form factor': 'Dual-slot FHFL air-cooled, or single-slot FHXL liquid-cooled',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-5000-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 5000 Blackwell',
    summary: 'Mid-stack Blackwell workstation card offered in 48 GB and 72 GB versions at the same 300 W.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-5000-blackwell.jpg', price: null,
    card: ['48 / 72 GB GDDR7 ECC', '1344 GB/s · 300 W', 'Dual-slot active'],
    specs: {
      Memory: '48 GB or 72 GB GDDR7 ECC',
      Bandwidth: '1344 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-4500-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 4500 Blackwell',
    summary: '32 GB of GDDR7 at 200 W — the point in the line where the card still runs on a standard workstation PSU.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-4500-blackwell.jpg', price: null,
    card: ['32 GB GDDR7 ECC', '896 GB/s · 200 W', 'Dual-slot active'],
    specs: {
      Memory: '32 GB GDDR7 ECC',
      Bandwidth: '896 GB/s',
      TDP: '200 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-4000-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 4000 Blackwell',
    summary: 'Single-slot 145 W Blackwell card with 24 GB — density part for multi-GPU workstations.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-4000-blackwell.jpg', price: null,
    card: ['24 GB GDDR7 ECC', '672 GB/s · 145 W', 'Single-slot'],
    specs: {
      Memory: '24 GB GDDR7 ECC',
      Bandwidth: '672 GB/s',
      TDP: '145 W',
      'Form factor': 'Single-slot, 4.4" × 9.5", active',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-4000-sff-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 4000 Blackwell SFF',
    summary: '24 GB inside a 70 W slot-powered card — the largest memory pool available without an auxiliary power connector.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-4000-sff-blackwell.jpg', price: null,
    card: ['24 GB GDDR7 ECC', '432 GB/s · 70 W', 'SFF · no aux power'],
    specs: {
      Memory: '24 GB GDDR7 ECC',
      Bandwidth: '432 GB/s',
      TDP: '70 W',
      'Form factor': 'Dual-slot low-profile, 2.7" × 6.6", active',
      Outputs: '4× DisplayPort 2.1b',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-rtx-pro-2000-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 2000 Blackwell',
    summary: 'Entry Blackwell professional card — 16 GB, 70 W, low-profile, for CAD seats and light inference.',
    image: '/assets/catalog/gpu/nvidia-rtx-pro-2000-blackwell.jpg', price: null,
    card: ['16 GB GDDR7 ECC', '288 GB/s · 70 W', 'Low-profile SFF'],
    specs: {
      Memory: '16 GB GDDR7 ECC',
      Bandwidth: '288 GB/s',
      TDP: '70 W',
      'Form factor': 'Dual-slot low-profile, 2.7" × 6.6", active',
      Outputs: '4× Mini DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },

  /* ── NVIDIA RTX, Ada Lovelace workstation ──────────────────────────────── */
  {
    slug: 'nvidia-rtx-5000-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 5000 Ada',
    summary: '32 GB of ECC GDDR6 at 250 W — the Ada card for seats that need capacity but not the 6000-class power budget.',
    image: '/assets/catalog/gpu/nvidia-rtx-5000-ada.jpg', price: null,
    card: ['32 GB GDDR6 ECC', '250 W · dual-slot', '4× DisplayPort 1.4a'],
    specs: {
      Memory: '32 GB GDDR6 ECC',
      TDP: '250 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-4500-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 4500 Ada',
    summary: '24 GB ECC workstation card at 210 W — viewport work and mid-size model inference on the same seat.',
    image: '/assets/catalog/gpu/nvidia-rtx-4500-ada.jpg', price: null,
    card: ['24 GB GDDR6 ECC', '210 W · dual-slot', '4× DisplayPort 1.4a'],
    specs: {
      Memory: '24 GB GDDR6 ECC',
      TDP: '210 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-4000-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 4000 Ada',
    summary: 'Single-slot 130 W card with 20 GB — fits chassis where a dual-slot board would block the next PCIe port.',
    image: '/assets/catalog/gpu/nvidia-rtx-4000-ada.jpg', price: null,
    card: ['20 GB GDDR6 ECC', '130 W · single-slot', '4× DisplayPort 1.4a'],
    specs: {
      Memory: '20 GB GDDR6 ECC',
      TDP: '130 W',
      'Form factor': 'Single-slot, 4.4" × 9.5", active',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-4000-sff-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 4000 SFF Ada',
    summary: '20 GB in a 70 W low-profile board — the Ada part for small-form-factor and edge chassis.',
    image: '/assets/catalog/gpu/nvidia-rtx-4000-sff-ada.jpg', price: null,
    card: ['20 GB GDDR6 ECC', '70 W · low-profile', '4× Mini DisplayPort 1.4a'],
    specs: {
      Memory: '20 GB GDDR6 ECC',
      TDP: '70 W',
      'Form factor': 'Dual-slot low-profile, 2.7" × 6.6", active',
      Outputs: '4× Mini DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-2000-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 2000 Ada',
    summary: 'Entry Ada professional card on a PCIe Gen4 x8 link, 16 GB, slot-powered.',
    image: '/assets/catalog/gpu/nvidia-rtx-2000-ada.jpg', price: null,
    card: ['16 GB GDDR6 ECC', '70 W · PCIe Gen4 x8', 'Low-profile SFF'],
    specs: {
      Memory: '16 GB GDDR6 ECC',
      TDP: '70 W',
      'Form factor': 'Dual-slot low-profile, 2.7" × 6.6", active',
      Interface: 'PCIe Gen 4 x8',
      Outputs: '4× Mini DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },

  /* ── NVIDIA RTX A-series, Ampere workstation ───────────────────────────── */
  {
    slug: 'nvidia-rtx-a6000', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A6000',
    summary: 'Ampere 48 GB workstation card with NVLink — the previous generation flagship, still common on the secondary market.',
    image: '/assets/catalog/gpu/nvidia-rtx-a6000.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '768 GB/s · 300 W', 'NVLink pair → 96 GB'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '768 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Interconnect: 'NVLink, 112 GB/s bridge, 2-way',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a5500', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A5500',
    summary: 'The 24 GB step above the A5000 in the Ampere line, same slot and same power envelope.',
    image: '/assets/catalog/gpu/nvidia-rtx-a5500.jpg', price: null,
    card: ['24 GB GDDR6 ECC', '230 W · dual-slot', 'NVLink 2-way'],
    specs: {
      Memory: '24 GB GDDR6 ECC',
      TDP: '230 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Interconnect: 'NVLink, 2-way',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a5000', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A5000',
    summary: '24 GB Ampere card with NVLink — the volume workstation part of its generation.',
    image: '/assets/catalog/gpu/nvidia-rtx-a5000.jpg', price: null,
    card: ['24 GB GDDR6 ECC', '768 GB/s · 230 W', 'NVLink pair → 48 GB'],
    specs: {
      Memory: '24 GB GDDR6 ECC',
      Bandwidth: '768 GB/s',
      TDP: '230 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Interconnect: 'NVLink Gen3, 112 GB/s bridge, 2-way',
      Outputs: '4× DisplayPort 1.4',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a4500', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A4500',
    summary: '20 GB Ampere card at 200 W, NVLink-capable in a two-slot bridge.',
    image: '/assets/catalog/gpu/nvidia-rtx-a4500.jpg', price: null,
    card: ['20 GB GDDR6 ECC', '200 W · dual-slot', 'NVLink 2-way'],
    specs: {
      Memory: '20 GB GDDR6 ECC',
      TDP: '200 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Interconnect: 'NVLink, 2-way low-profile bridge',
      Outputs: '4× DisplayPort 1.4',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a4000', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A4000',
    summary: 'Single-slot 140 W Ampere card with 16 GB — the densest professional board of its generation.',
    image: '/assets/catalog/gpu/nvidia-rtx-a4000.jpg', price: null,
    card: ['16 GB GDDR6 ECC', '140 W · single-slot', '4× DisplayPort 1.4'],
    specs: {
      Memory: '16 GB GDDR6 ECC',
      TDP: '140 W',
      'Form factor': 'Single-slot, 4.4" × 9.5", active',
      Outputs: '4× DisplayPort 1.4',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a2000-12gb', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A2000 12 GB',
    summary: 'Low-profile 70 W Ampere card in 6 GB and 12 GB versions — CAD seats and compact chassis.',
    image: '/assets/catalog/gpu/nvidia-rtx-a2000-12gb.jpg', price: null,
    card: ['6 / 12 GB GDDR6 ECC', '70 W · slot-powered', 'Low-profile SFF'],
    specs: {
      Memory: '6 GB or 12 GB GDDR6 ECC',
      TDP: '70 W',
      'Form factor': 'Dual-slot low-profile, 2.7" × 6.6", active',
      Interface: 'PCIe Gen 4 x16',
      Outputs: '4× Mini DisplayPort 1.4',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a1000', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A1000',
    summary: 'Single-slot 50 W card with 8 GB — four 4K displays from a chassis with no spare power.',
    image: '/assets/catalog/gpu/nvidia-rtx-a1000.jpg', price: null,
    card: ['8 GB GDDR6', '50 W · single-slot', 'PCIe Gen4 x8'],
    specs: {
      Memory: '8 GB GDDR6',
      TDP: '50 W',
      'Form factor': 'Single-slot low-profile, 2.7" × 6.4", active',
      Interface: 'PCIe Gen 4 x8',
      Outputs: '4× Mini DisplayPort 1.4a',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-rtx-a400', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX A400',
    summary: 'Entry 4 GB card of the same low-profile family as the A1000 — display output and light acceleration only.',
    image: '/assets/catalog/gpu/nvidia-rtx-a400.jpg', price: null,
    card: ['4 GB GDDR6', '50 W · single-slot', 'PCIe Gen4 x8'],
    specs: {
      Memory: '4 GB GDDR6',
      TDP: '50 W',
      'Form factor': 'Single-slot low-profile, active',
      Interface: 'PCIe Gen 4 x8',
      Outputs: '4× Mini DisplayPort 1.4a',
      Architecture: 'Ampere'
    }
  },

  /* ── NVIDIA data centre cards ──────────────────────────────────────────── */
  {
    slug: 'nvidia-l40', category: 'gpu', brand: 'NVIDIA',
    name: 'L40',
    summary: 'Ada data-centre card with display outputs and 48 GB of ECC GDDR6 — virtual workstations, rendering and inference in one 300 W slot.',
    image: '/assets/catalog/gpu/nvidia-l40.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '864 GB/s · 300 W', 'Dual-slot passive'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '864 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", passive',
      Outputs: '4× DisplayPort 1.4a',
      Media: '3× NVENC, 3× NVDEC, AV1',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-a40', category: 'gpu', brand: 'NVIDIA',
    name: 'A40',
    summary: 'Ampere 48 GB data-centre card with NVLink — the graphics-capable predecessor of L40, scales to 96 GB in a pair.',
    image: '/assets/catalog/gpu/nvidia-a40.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '696 GB/s · 300 W', 'NVLink pair → 96 GB'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '696 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", passive',
      Interconnect: 'NVLink 112.5 GB/s, PCIe Gen4 64 GB/s',
      Outputs: '3× DisplayPort 1.4',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-a30', category: 'gpu', brand: 'NVIDIA',
    name: 'A30 Tensor Core',
    summary: 'HBM2 card at 165 W with MIG — FP64 tensor work and inference in mainstream enterprise servers.',
    image: '/assets/catalog/gpu/nvidia-a30.jpg', price: null,
    card: ['24 GB HBM2', '933 GB/s · 165 W', 'MIG up to 4 instances'],
    specs: {
      Memory: '24 GB HBM2',
      Bandwidth: '933 GB/s',
      TDP: '165 W',
      'Form factor': 'Dual-slot FHFL, passive',
      Interconnect: 'PCIe Gen4 64 GB/s, NVLink Gen3 200 GB/s with bridge',
      MIG: 'Up to 4 instances of 6 GB',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-a10', category: 'gpu', brand: 'NVIDIA',
    name: 'A10 Tensor Core',
    summary: 'Single-slot 150 W card with 24 GB — VDI, 3D visualisation and inference where slot count is the constraint.',
    image: '/assets/catalog/gpu/nvidia-a10.jpg', price: null,
    card: ['24 GB GDDR6', '600 GB/s · 150 W', 'Single-slot FHFL'],
    specs: {
      Memory: '24 GB GDDR6',
      Bandwidth: '600 GB/s',
      TDP: '150 W',
      'Form factor': 'Single-slot FHFL, passive',
      Performance: '31.2 TFLOPS FP32, 250 TOPS INT8',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-a16', category: 'gpu', brand: 'NVIDIA',
    name: 'A16',
    summary: 'Four GPUs on one board with 16 GB each — built for user density in virtual desktop deployments, not for training.',
    image: '/assets/catalog/gpu/nvidia-a16.jpg', dark: true, price: null,
    card: ['4× 16 GB GDDR6 ECC', '4× 200 GB/s · 250 W', 'Up to 64 users per board'],
    specs: {
      Memory: '4× 16 GB GDDR6 ECC',
      Bandwidth: '4× 200 GB/s',
      TDP: '250 W',
      'Form factor': 'Dual-slot FHFL, passive',
      Media: '4× NVENC, 8× NVDEC, AV1 decode',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-a2', category: 'gpu', brand: 'NVIDIA',
    name: 'A2 Tensor Core',
    summary: 'Low-profile 40–60 W card — inference at the edge in servers that cannot take a full-height board.',
    image: '/assets/catalog/gpu/nvidia-a2.jpg', dark: true, price: null,
    card: ['16 GB GDDR6', '200 GB/s · 40–60 W', 'Single-slot low-profile'],
    specs: {
      Memory: '16 GB GDDR6',
      Bandwidth: '200 GB/s',
      TDP: '40–60 W, configurable',
      'Form factor': 'Single-slot low-profile PCIe',
      Interface: 'PCIe Gen4 x8',
      Performance: '4.5 TFLOPS FP32, 36 TOPS INT8',
      Architecture: 'Ampere'
    }
  },

  /* ── AMD Radeon PRO, RDNA 3 workstation ────────────────────────────────── */
  {
    slug: 'amd-radeon-pro-w7900', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7900',
    summary: 'RDNA 3 flagship with 48 GB of ECC GDDR6 on a 384-bit bus — the non-NVIDIA route to a 48 GB seat.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7900.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '864 GB/s · 295 W', 'Triple-slot workstation'],
    specs: {
      Memory: '48 GB GDDR6 ECC, 384-bit',
      Bandwidth: '864 GB/s',
      TDP: '295 W typical board power',
      'Form factor': 'Triple-slot, active',
      Architecture: 'RDNA 3'
    }
  },
  {
    slug: 'amd-radeon-pro-w7900-dual-slot', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7900 Dual Slot',
    summary: 'Same 48 GB board narrowed to two slots so several fit one workstation — aimed at local model inference.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7900-dual-slot.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '864 GB/s · 295 W', 'Dual-slot · multi-GPU'],
    specs: {
      Memory: '48 GB GDDR6 ECC, 384-bit',
      Bandwidth: '864 GB/s',
      TDP: '295 W typical board power',
      'Form factor': 'Dual-slot, active',
      Architecture: 'RDNA 3'
    }
  },
  {
    slug: 'amd-radeon-pro-w7800', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7800',
    summary: '32 GB of ECC GDDR6 at 260 W — the capacity tier below the W7900 on the same architecture.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7800.jpg', price: null,
    card: ['32 GB GDDR6 ECC', '576 GB/s · 260 W', 'Dual-slot workstation'],
    specs: {
      Memory: '32 GB GDDR6 ECC, 256-bit',
      Bandwidth: '576 GB/s',
      TDP: '260 W typical board power',
      'Form factor': 'Dual-slot, active',
      Architecture: 'RDNA 3'
    }
  },
  {
    slug: 'amd-radeon-pro-w7700', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7700',
    summary: '16 GB card at 190 W — mid-range CAD and visualisation seat.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7700.jpg', price: null,
    card: ['16 GB GDDR6 ECC', '576 GB/s · 190 W', 'Dual-slot workstation'],
    specs: {
      Memory: '16 GB GDDR6 ECC, 256-bit',
      Bandwidth: '576 GB/s',
      TDP: '190 W typical board power',
      'Form factor': 'Dual-slot, active',
      Architecture: 'RDNA 3'
    }
  },
  {
    slug: 'amd-radeon-pro-w7600', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7600',
    summary: 'Single-slot 8 GB RDNA 3 card for standard CAD seats.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7600.jpg', price: null,
    card: ['8 GB GDDR6', '288 GB/s · 128-bit', 'Single-slot workstation'],
    specs: {
      Memory: '8 GB GDDR6, 128-bit',
      Bandwidth: '288 GB/s',
      'Form factor': 'Single-slot, active',
      Architecture: 'RDNA 3'
    }
  },
  {
    slug: 'amd-radeon-pro-w7500', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W7500',
    summary: 'Slot-powered 70 W card — entry professional graphics without an auxiliary power cable.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w7500.jpg', price: null,
    card: ['8 GB GDDR6', 'Up to 173 GB/s', '70 W · slot-powered'],
    specs: {
      Memory: '8 GB GDDR6, 128-bit',
      Bandwidth: 'Up to 173 GB/s',
      TDP: '70 W typical board power',
      'Form factor': 'Single-slot, active',
      Architecture: 'RDNA 3'
    }
  },

  /* ── AMD Instinct accelerators ─────────────────────────────────────────── */
  {
    slug: 'amd-instinct-mi210', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI210',
    summary: 'CDNA 2 PCIe card with 64 GB of HBM2e — FP64 HPC work in a standard dual-slot server slot.',
    image: '/assets/catalog/gpu/amd-instinct-mi210.jpg', price: null,
    card: ['64 GB HBM2e', '1.6 TB/s · 300 W', 'Dual-slot PCIe passive'],
    specs: {
      Memory: '64 GB HBM2e',
      Bandwidth: 'Up to 1.6 TB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot FHFL PCIe, passive',
      Interconnect: '3× Infinity Fabric links, PCIe Gen4',
      Performance: '45.3 TFLOPS FP64 matrix',
      Architecture: 'CDNA 2'
    }
  },
  {
    slug: 'amd-instinct-mi350x', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI350X',
    summary: 'CDNA 4 OAM module with 288 GB of HBM3E, air-cooled at 1000 W.',
    image: '/assets/catalog/gpu/amd-instinct-mi350x.jpg', dark: true, price: null,
    card: ['288 GB HBM3E', '8 TB/s · 1000 W', 'OAM · air-cooled'],
    specs: {
      Memory: '288 GB HBM3E',
      Bandwidth: '8 TB/s',
      TDP: '1000 W total board power',
      'Form factor': 'OAM module, passive, air-cooled',
      Performance: '9.2 PFLOPS MXFP4',
      Architecture: 'CDNA 4'
    }
  },
  {
    slug: 'amd-instinct-mi355x', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI355X',
    summary: 'Liquid-cooled 1400 W CDNA 4 module — same 288 GB pool as MI350X at higher clocks.',
    image: null, price: null,
    card: ['288 GB HBM3E', '8 TB/s · 1400 W', 'OAM · liquid-cooled'],
    specs: {
      Memory: '288 GB HBM3E',
      Bandwidth: '8 TB/s',
      TDP: '1400 W total board power',
      'Form factor': 'OAM module, liquid cooling required',
      Performance: '10.1 PFLOPS MXFP4',
      Architecture: 'CDNA 4'
    }
  },

  /* ── Intel Arc Pro ─────────────────────────────────────────────────────── */
  {
    slug: 'intel-arc-pro-b60', category: 'gpu', brand: 'Intel',
    name: 'Arc Pro B60',
    summary: '24 GB Xe2 professional card sold through board partners in single- and dual-GPU designs.',
    image: '/assets/catalog/gpu/intel-arc-pro-b60.jpg', dark: true, price: null,
    card: ['24 GB GDDR6 · 192-bit', '456 GB/s', '120–200 W · PCIe Gen5 x8'],
    specs: {
      Memory: '24 GB GDDR6, 192-bit',
      Bandwidth: '456 GB/s',
      TDP: '120–200 W depending on partner board',
      'Form factor': 'Partner designs, incl. passive and dual-GPU',
      Interface: 'PCIe Gen 5 x8',
      Architecture: 'Xe2 (Battlemage)'
    }
  },
  {
    slug: 'intel-arc-pro-b50', category: 'gpu', brand: 'Intel',
    name: 'Arc Pro B50',
    summary: 'Slot-powered 70 W low-profile card with 16 GB — small-form-factor workstations and light local inference.',
    image: '/assets/catalog/gpu/intel-arc-pro-b50.jpg', dark: true, price: null,
    card: ['16 GB GDDR6 · 128-bit', '224 GB/s', '70 W · low-profile'],
    specs: {
      Memory: '16 GB GDDR6, 128-bit',
      Bandwidth: '224 GB/s',
      TDP: '70 W total board power, slot-powered',
      'Form factor': 'Dual-slot low-profile, 168 × 69 mm',
      Interface: 'PCIe Gen 5 x8',
      Architecture: 'Xe2 (Battlemage)'
    }
  },

  /* ══ SECOND COLLECTION PASS — 22 Aug 2026 ═══════════════════════════════
     Added as one block at the end rather than spliced into the vendor groups
     above, so that "what the first pass carried" and "what the second added"
     stay separable on sight. The grid sorts on array order under Featured, so
     these land after the reviewed entries within each category, which is the
     order they should be read in.

     Two NVIDIA entries from this pass are NOT here: GB300 NVL72 and the GH200
     Grace Hopper Superchip are rack/system-class and went to catalogue-ai.js,
     because catalogue.js documents the invariant that every entry in THIS file
     is category 'gpu'. */

  /* ── NVIDIA — Blackwell Ultra and Hopper SKUs missing from the first pass ─ */
  {
    slug: 'nvidia-b300', category: 'gpu', brand: 'NVIDIA',
    name: 'B300 Tensor Core',
    summary: 'Blackwell Ultra SXM module with 288 GB of HBM3e — the memory-doubled follow-on to B200, again supplied only on an eight-GPU baseboard.',
    image: null, price: null,
    card: ['288 GB HBM3e', '8 TB/s bandwidth', 'SXM · up to 1400 W'],
    specs: {
      Memory: '288 GB HBM3e',
      Bandwidth: '8 TB/s',
      TDP: 'Up to 1400 W',
      'Form factor': 'SXM module, HGX baseboard only',
      Architecture: 'Blackwell Ultra'
    }
  },
  {
    slug: 'nvidia-h100-nvl', category: 'gpu', brand: 'NVIDIA',
    name: 'H100 NVL',
    summary: 'Dual-GPU PCIe pair bridged by NVLink, 94 GB per card — the H100 SKU for large-model inference in servers with no SXM baseboard.',
    image: '/assets/catalog/gpu/nvidia-h100-nvl.jpg', price: null,
    card: ['94 GB HBM3', '3.9 TB/s bandwidth', 'PCIe dual-slot · NVLink bridge'],
    specs: {
      Memory: '94 GB HBM3',
      Bandwidth: '3.9 TB/s',
      TDP: '350–400 W, configurable',
      'Form factor': 'PCIe dual-slot, air-cooled',
      Interconnect: 'NVLink bridge 600 GB/s + PCIe Gen5 128 GB/s',
      Architecture: 'Hopper'
    }
  },
  {
    slug: 'nvidia-a100-40gb', category: 'gpu', brand: 'NVIDIA',
    name: 'A100 40GB PCIe',
    summary: 'The original Ampere data-centre card at 40 GB — less memory, bandwidth and power than the later 80 GB revision, on the same board.',
    image: '/assets/catalog/gpu/nvidia-a100-40gb.jpg', price: null,
    card: ['40 GB HBM2e', '1555 GB/s bandwidth', 'PCIe dual-slot · 250 W'],
    specs: {
      Memory: '40 GB HBM2e',
      Bandwidth: '1555 GB/s',
      TDP: '250 W',
      'Form factor': 'PCIe dual-slot, air-cooled',
      Interconnect: 'NVLink bridge, 600 GB/s (2-GPU pair)',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-t4', category: 'gpu', brand: 'NVIDIA',
    name: 'T4',
    summary: 'Small 70 W Turing inference card — long past its generation, still widely deployed for video transcode and light inference in dense servers.',
    image: null, price: null,
    card: ['16 GB GDDR6', '320 GB/s bandwidth', 'Single-slot · 70 W'],
    specs: {
      Memory: '16 GB GDDR6',
      Bandwidth: '320 GB/s',
      TDP: '70 W',
      'Form factor': 'Single-slot low-profile PCIe Gen3 x16',
      Architecture: 'Turing'
    }
  },
  {
    slug: 'nvidia-rtx-5880-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 5880 Ada Generation',
    summary: '48 GB Ada workstation card without NVLink — sits one step under the RTX 6000 Ada in the professional line.',
    image: '/assets/catalog/gpu/nvidia-rtx-5880-ada.jpg', price: null,
    card: ['48 GB GDDR6 ECC', '960 GB/s · 285 W', 'Dual-slot workstation'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '960 GB/s',
      TDP: '285 W',
      'Form factor': 'Dual-slot, 4.4" × 10.5", active',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-t1000', category: 'gpu', brand: 'NVIDIA',
    name: 'T1000',
    summary: 'Single-slot 50 W Turing card with 4 GB — a four-display seat, not compute headroom.',
    image: '/assets/catalog/gpu/nvidia-t1000.jpg', price: null,
    card: ['4 GB GDDR6', '160 GB/s bandwidth', 'Single-slot · 50 W'],
    specs: {
      Memory: '4 GB GDDR6',
      Bandwidth: 'Up to 160 GB/s',
      TDP: '50 W',
      'Form factor': 'Single-slot, 2.713" × 6.137", active',
      Outputs: '4× Mini DisplayPort 1.4',
      Architecture: 'Turing'
    }
  },
  {
    slug: 'nvidia-t400', category: 'gpu', brand: 'NVIDIA',
    name: 'T400',
    summary: 'The smallest Turing professional card — 2 GB and 30 W, bought for display output rather than acceleration.',
    image: '/assets/catalog/gpu/nvidia-t400.jpg', price: null,
    card: ['2 GB GDDR6', '80 GB/s bandwidth', 'Single-slot · 30 W'],
    specs: {
      Memory: '2 GB GDDR6',
      Bandwidth: 'Up to 80 GB/s',
      TDP: '30 W',
      'Form factor': 'Single-slot, 2.713" × 6.137", active',
      Outputs: '3× Mini DisplayPort 1.4',
      Architecture: 'Turing'
    }
  },

  /* ── AMD Instinct — CDNA 2 and CDNA 1, older than the MI300 series above ── */
  {
    slug: 'amd-instinct-mi250x', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI250X',
    summary: 'CDNA 2 dual-die OAM module with 128 GB of HBM2e — the accelerator behind the Frontier exascale system.',
    image: '/assets/catalog/gpu/amd-instinct-mi250x.jpg', dark: true, price: null,
    card: ['128 GB HBM2e', '3.2 TB/s · 500 W', 'OAM · passive'],
    specs: {
      Memory: '128 GB HBM2e, 8192-bit',
      Bandwidth: '3.2 TB/s',
      TDP: '500 W, 560 W liquid-cooled',
      'Form factor': 'OAM module, passive',
      Performance: '95.7 TFLOPS FP64 matrix, 383 TFLOPS FP16/BF16',
      Architecture: 'CDNA 2'
    }
  },
  {
    slug: 'amd-instinct-mi100', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI100',
    summary: 'First-generation CDNA card with 32 GB of HBM2 — AMD’s original data-centre GPU, before the OAM form factor.',
    image: '/assets/catalog/gpu/amd-instinct-mi100.jpg', price: null,
    card: ['32 GB HBM2', '1.23 TB/s · 300 W', 'Dual-slot PCIe passive'],
    specs: {
      Memory: '32 GB HBM2, 4096-bit',
      Bandwidth: '1.23 TB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot FHFL PCIe, passive',
      Interconnect: '3× Infinity Fabric links, PCIe Gen4 x16',
      Architecture: 'CDNA'
    }
  },

  /* ── AMD Radeon PRO — RDNA 2, the generation below the W7000 series above ─ */
  {
    slug: 'amd-radeon-pro-w6800', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W6800',
    summary: 'RDNA 2 workstation flagship of its generation, 32 GB of GDDR6 on a dual-slot board.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w6800.jpg', price: null,
    card: ['32 GB GDDR6 ECC', '512 GB/s · 250 W', 'Dual-slot workstation'],
    specs: {
      Memory: '32 GB GDDR6 ECC',
      Bandwidth: '512 GB/s',
      TDP: '250 W',
      'Form factor': 'Full-height, dual-slot, active',
      Architecture: 'RDNA 2'
    }
  },
  {
    slug: 'amd-radeon-pro-w6600', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W6600',
    summary: 'Single-slot RDNA 2 card with 8 GB — a mainstream CAD seat below the W6800.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w6600.jpg', price: null,
    card: ['8 GB GDDR6 · 128-bit', '224 GB/s · 130 W', 'Single-slot workstation'],
    specs: {
      Memory: '8 GB GDDR6, 128-bit',
      Bandwidth: '224 GB/s',
      TDP: '130 W total board power',
      'Form factor': 'Full-height, single-slot, active',
      Architecture: 'RDNA 2'
    }
  },
  {
    slug: 'amd-radeon-pro-w6400', category: 'gpu', brand: 'AMD',
    name: 'Radeon PRO W6400',
    summary: 'Slot-powered 50 W low-profile card with 4 GB — entry workstation graphics for compact OEM chassis.',
    image: '/assets/catalog/gpu/amd-radeon-pro-w6400.jpg', price: null,
    card: ['4 GB GDDR6 · 64-bit', '128 GB/s · 50 W', 'Low-profile single-slot'],
    specs: {
      Memory: '4 GB GDDR6, 64-bit',
      Bandwidth: '128 GB/s',
      TDP: '50 W, slot-powered',
      'Form factor': 'Half-height, single-slot, active',
      Interface: 'PCIe Gen 4 x4',
      Architecture: 'RDNA 2'
    }
  },

  /* ── Intel Gaudi — OAM AI accelerators, catalogued like the Instinct OAMs ─ */
  {
    slug: 'intel-gaudi-3', category: 'gpu', brand: 'Intel',
    name: 'Gaudi 3',
    summary: 'Third-generation Intel AI accelerator with 128 GB of HBM2e, sold as an OAM module and, separately, as a lower-power PCIe card.',
    image: '/assets/catalog/gpu/intel-gaudi-3.jpg', dark: true, price: null,
    card: ['128 GB HBM2e', '3.7 TB/s · 900 W', 'OAM · air-cooled'],
    specs: {
      Memory: '128 GB HBM2e',
      Bandwidth: '3.7 TB/s',
      TDP: '900 W (OAM)',
      'Form factor': 'OAM 2.0 mezzanine module, air-cooled',
      Interface: 'PCIe Gen 5 x16 host link',
      Architecture: 'Intel Gaudi'
    }
  },
  {
    slug: 'intel-gaudi-2', category: 'gpu', brand: 'Intel',
    name: 'Gaudi 2',
    summary: 'The 7 nm predecessor to Gaudi 3, 96 GB of HBM2e on an OAM mezzanine module.',
    image: '/assets/catalog/gpu/intel-gaudi-2.jpg', price: null,
    card: ['96 GB HBM2e', '2.45 TB/s · 600 W', 'OAM mezzanine'],
    specs: {
      Memory: '96 GB HBM2e',
      Bandwidth: '2.45 TB/s',
      TDP: '600 W',
      'Form factor': 'OCP OAM 1.1 mezzanine module',
      Interface: 'PCIe Gen 4 x16 host link',
      Architecture: 'Intel Gaudi'
    }
  },

  /* ── Intel Data Center GPU Flex — media transcode and inference ─────────── */
  {
    slug: 'intel-data-center-gpu-flex-170', category: 'gpu', brand: 'Intel',
    name: 'Data Center GPU Flex 170',
    summary: 'Single-GPU Xe-HPG card with 16 GB of GDDR6 — media transcode and inference in a standard dual-slot server slot.',
    image: null, price: null,
    card: ['16 GB GDDR6 ECC', '576 GB/s · 150 W', 'Full-height dual-slot'],
    specs: {
      Memory: '16 GB GDDR6 ECC',
      Bandwidth: '576 GB/s',
      TDP: '150 W',
      'Form factor': 'Full-height, dual-slot, passive',
      Interface: 'PCIe Gen 4 x16',
      Architecture: 'Xe-HPG'
    }
  },
  {
    /* Bandwidth is absent deliberately — see the note at the foot of this file */
    slug: 'intel-data-center-gpu-flex-140', category: 'gpu', brand: 'Intel',
    name: 'Data Center GPU Flex 140',
    summary: 'Two Xe-HPG GPUs on one slot-powered low-profile card, 6 GB of GDDR6 each — density first, for media and inference.',
    image: null, price: null,
    card: ['12 GB GDDR6 · 2 GPUs', '75 W · slot-powered', 'Low-profile single-slot'],
    specs: {
      /* kept short on purpose: the full gloss "one per GPU" wrapped this row to
         two lines and pushed the card taller than the rest of its row */
      Memory: '12 GB GDDR6 (2× 6 GB)',
      TDP: '75 W, slot-powered',
      'Form factor': 'Low-profile, single-slot, passive',
      Interface: 'PCIe Gen 4 x8',
      Architecture: 'Xe-HPG'
    }
  },

  /* ── Intel Arc Pro — Xe-HPG, the A-series under the B-series above ──────── */
  {
    slug: 'intel-arc-pro-a60', category: 'gpu', brand: 'Intel',
    name: 'Arc Pro A60',
    summary: 'Xe-HPG workstation card with 12 GB — the highest-memory Arc Pro A-series desktop card.',
    image: null, price: null,
    card: ['12 GB GDDR6 · 192-bit', '384 GB/s · 130 W', 'Dual-slot workstation'],
    specs: {
      Memory: '12 GB GDDR6, 192-bit',
      Bandwidth: '384 GB/s',
      TDP: '130 W',
      'Form factor': 'Dual-slot, active',
      Architecture: 'Xe-HPG'
    }
  },
  {
    slug: 'intel-arc-pro-a40', category: 'gpu', brand: 'Intel',
    name: 'Arc Pro A40',
    summary: 'Slot-powered 50 W entry card with 6 GB and no auxiliary power connector.',
    image: null, price: null,
    card: ['6 GB GDDR6 · 96-bit', '192 GB/s · 50 W', 'Single-slot · slot-powered'],
    specs: {
      Memory: '6 GB GDDR6, 96-bit',
      Bandwidth: '192 GB/s',
      TDP: '50 W, slot-powered',
      'Form factor': 'Single-slot, active',
      Architecture: 'Xe-HPG'
    }
  }
]

export default PRODUCTS_GPU

/**
 * SECOND PASS — sourcing notes, 22 Aug 2026
 *
 * Confirmed against a first-party vendor page or an NVIDIA-hosted datasheet PDF
 * read in full: h100-nvl, t4, rtx-5880-ada (3156635.FEB24), t1000 (1670054-r4),
 * t400 (1670004-r5).
 *
 * Softer, and worth a re-check before these go in front of a buyer:
 *
 *   · nvidia-b300 — NVIDIA's Blackwell Ultra spec sheet sits behind a lead-
 *     capture form and would not render. The 288 GB is corroborated by NVIDIA's
 *     own DGX B300 page (8 × 288 GB = 2.3 TB); the 8 TB/s and the 1400 W are
 *     from launch coverage, not a first-party table. TDP is the softest number
 *     in this file.
 *   · nvidia-a100-40gb — the A100 product page tables the 80 GB parts only;
 *     1555 GB/s and 250 W are from NVIDIA product brief PB-10137-001.
 *   · every Intel entry — intel.com and ark.intel.com return 403 to automated
 *     fetch (the same problem the first pass hit on Arc Pro B60/B50), so these
 *     came from Intel- and Habana-hosted datasheet PDFs and ARK specification
 *     snippets rather than a page read directly.
 *   · AMD entries — amd.com timed out on direct fetch; figures are from AMD's
 *     own linked PDF datasheets and cached snippets of the same amd.com URLs.
 *
 * intel-data-center-gpu-flex-140 carries no Bandwidth row on purpose. The
 * collected figure was 336 GB/s, and it could not be confirmed anywhere — Intel
 * does not publish it on the ARK entry, and it does not reconcile with the
 * memory clock ARK does publish. Dropped rather than shipped as a guess, per
 * the rule the rest of this file follows. The 12 GB / 75 W are confirmed; note
 * that sources disagreeing at 6 GB are quoting one of the card's two GPUs.
 */
