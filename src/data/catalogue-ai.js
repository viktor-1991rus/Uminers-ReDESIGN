/**
 * AI compute catalogue — collected 21 Aug 2026.
 *
 * Assortment shape (AI workstations / GPU servers / discrete accelerators)
 * follows the Exxact "Deep Learning & AI Workstations" category, but every
 * entry here is a manufacturer product, quoted from the manufacturer's own
 * public page — NVIDIA, ASUS, Supermicro, Gigabyte, Dell, Lenovo, AMD. No
 * Exxact SKUs, no partnership implied.
 *
 * PHOTOGRAPHY — the "no Exxact photography" half of that rule no longer holds,
 * and saying so here matters more than keeping the sentence tidy. The project
 * owner lifted it on 22 Aug 2026 and asked for product photography from
 * exxactcorp.com. Ten assets in public/assets/catalog/ai/ were collected on
 * that basis on 23 Aug 2026 — the four NVIDIA systems (DGX Spark, DGX Station,
 * GB300 NVL72, GH200) and the six OEM GPU servers (ASUS, Dell, Gigabyte,
 * Lenovo, both Supermicro). Per-file sources were recorded as they were saved;
 * see the collection report. The same licensing question applies here as in
 * catalogue-gpu.js, where it is written out in full — read that note before
 * this catalogue goes public.
 *
 * Prices are null throughout: manufacturer pages do not publish them, and the
 * desk quotes per order. Do not invent values here.
 *
 * Fields mirror src/data/products.js exactly, so the two arrays can be
 * concatenated and rendered by the same card:
 *   slug     kebab-case id, unique, matches the image file name
 *   category 'ai' | 'server' | 'gpu'  (see CATEGORIES_AI below)
 *   brand    manufacturer, shown as the card's eyebrow
 *   name     model, without the brand prefix
 *   summary  one dry sentence; not rendered by the current card, kept for
 *            the product drawer and for meta descriptions
 *   image    absolute public path, or null when no licensed asset exists
 *   dark     true if the render sits on black — card puts it on a dark plate
 *   photo    true if the asset is a photograph, not a cut-out render
 *   price    null = "to order"
 *   card     exactly three short lines for the card face
 *   specs    dict; SPEC_KEYS picks four rows from it, missing rows are
 *            skipped rather than filled in
 *
 * NOTE — slugs shared with products.js (nvidia-dgx-b200, nvidia-dgx-h100,
 * nvidia-hgx-b200, nvidia-gb200-nvl72, asus-esc8000a-e12, nvidia-h200,
 * nvidia-h100, nvidia-l40s, nvidia-l4, nvidia-a100-80gb, nvidia-rtx-6000-ada).
 * If both files feed one grid, de-duplicate by slug — this file is the newer
 * and more complete of the two for those entries.
 *
 * NOTE — specs for gigabyte-g593-sd0 and lenovo-thinksystem-sr675-v3 could not
 * be re-read at the vendor page (403 / redirect to a different model). Only
 * fields that are stable and well documented elsewhere are listed; re-check
 * both against the vendor datasheet before these two go live.
 */

export const CATEGORIES_AI = [
  { key: 'ai',     label: 'AI systems',  mark: 'ai' },
  { key: 'server', label: 'GPU servers', mark: 'server' },
  { key: 'gpu',    label: 'Accelerators', mark: 'gpu' }
]

/* facet keys shown as filter chips, per category */
export const FACETS_AI = {
  ai:     ['brand'],
  server: ['brand'],
  gpu:    ['brand']
}

/* the four spec rows a card shows per category — fixed dictionary so every
 * card in a category lines up on the same left column. `field` may list
 * candidate keys; the first one present on the product wins, and the row is
 * dropped entirely if none of them exist. */
export const SPEC_KEYS_AI = {
  ai: [
    { key: 'GPU',  label: 'GPUs',         field: ['GPUs'] },
    { key: 'MEM',  label: 'GPU memory',   field: ['GPU memory', 'Memory'] },
    { key: 'NET',  label: 'Interconnect', field: ['Interconnect', 'Network'] },
    { key: 'PWR',  label: 'Power',        field: ['Power', 'TDP'] }
  ],
  server: [
    { key: 'GPU',  label: 'GPUs',         field: ['GPUs'] },
    { key: 'CPU',  label: 'CPU',          field: ['CPU'] },
    { key: 'MEM',  label: 'Memory',       field: ['Memory'] },
    { key: 'FORM', label: 'Form factor',  field: ['Form factor'] }
  ],
  gpu: [
    { key: 'MEM',  label: 'Memory',       field: ['Memory'] },
    { key: 'BW',   label: 'Bandwidth',    field: ['Bandwidth'] },
    { key: 'PWR',  label: 'TDP',          field: ['TDP'] },
    { key: 'FORM', label: 'Form factor',  field: ['Form factor'] }
  ]
}

export const PRODUCTS_AI = [
  /* ── AI systems — NVIDIA first-party platforms ────────────────────────── */
  {
    slug: 'nvidia-dgx-spark', category: 'ai', brand: 'NVIDIA',
    name: 'DGX Spark',
    summary: 'Desktop Grace Blackwell box with 128 GB of unified memory — model prototyping and fine-tuning at the desk, before the job moves to a rack.',
    image: '/assets/catalog/ai/nvidia-dgx-spark.jpg', dark: true, price: null,
    card: ['GB10 · 128 GB unified', '1 PFLOP FP4', '240 W · desktop'],
    specs: {
      GPUs: '1× GB10 Grace Blackwell Superchip',
      'GPU memory': '128 GB LPDDR5X coherent unified',
      CPU: '20-core Arm (10× Cortex-X925, 10× Cortex-A725)',
      Bandwidth: '273 GB/s',
      Performance: 'Up to 1 PFLOP FP4',
      Storage: '4 TB self-encrypting NVMe M.2',
      Network: 'ConnectX-7 200 Gb/s, 10 GbE RJ-45',
      Power: '240 W PSU',
      'Form factor': 'Desktop'
    }
  },
  {
    slug: 'nvidia-dgx-station-gb300', category: 'ai', brand: 'NVIDIA',
    name: 'DGX Station',
    summary: 'Deskside Blackwell Ultra with 748 GB of coherent memory — single-user training and inference on models that will not fit a workstation GPU.',
    image: '/assets/catalog/ai/nvidia-dgx-station-gb300.jpg', dark: true, price: null,
    card: ['GB300 · 748 GB coherent', '252 GB HBM3e · 7.1 TB/s', 'ConnectX-8 · 800 Gb/s'],
    specs: {
      GPUs: '1× NVIDIA Blackwell Ultra (GB300 Desktop Superchip)',
      'GPU memory': '252 GB HBM3e, 7.1 TB/s',
      CPU: '1× Grace 72-core Neoverse V2, 496 GB LPDDR5X',
      Memory: '748 GB total coherent',
      Performance: 'Up to 20 PFLOPS AI',
      Network: 'ConnectX-8 SuperNIC, up to 800 Gb/s Ethernet',
      'Form factor': 'Deskside'
    }
  },
  {
    slug: 'nvidia-dgx-b200', category: 'ai', brand: 'NVIDIA',
    name: 'DGX B200',
    summary: 'Eight Blackwell GPUs in 10U — the standard training node for teams that buy compute by the rack rather than by the card.',
    image: '/assets/catalog/ai/nvidia-dgx-b200.jpg', dark: true, price: null,
    card: ['8× Blackwell · 1.44 TB', '72 PFLOPS FP8', '10U · ~14.3 kW'],
    specs: {
      GPUs: '8× NVIDIA Blackwell',
      'GPU memory': '1440 GB total HBM3e',
      CPU: '2× Intel Xeon Platinum 8570',
      Performance: '72 PFLOPS FP8 training, 144 PFLOPS FP4 inference',
      Network: '8× ConnectX-7, up to 400 Gb/s',
      'Form factor': '10U',
      Power: '~14.3 kW max'
    }
  },
  {
    slug: 'nvidia-dgx-h100', category: 'ai', brand: 'NVIDIA',
    name: 'DGX H100',
    summary: 'Eight H100 SXM in 8U with 640 GB of HBM3 — the Hopper-generation node, still the volume unit on the secondary market.',
    image: '/assets/catalog/ai/nvidia-dgx-h100.jpg', dark: true, price: null,
    card: ['8× H100 SXM · 640 GB', '400 Gb/s InfiniBand', '8U · ~10.2 kW'],
    specs: {
      GPUs: '8× NVIDIA H100 SXM',
      'GPU memory': '640 GB total HBM3',
      CPU: '2× Intel Xeon Platinum 8480C',
      Network: '8× ConnectX-7, up to 400 Gb/s',
      'Form factor': '8U',
      Power: '~10.2 kW max'
    }
  },
  {
    slug: 'nvidia-hgx-b200', category: 'ai', brand: 'NVIDIA',
    name: 'HGX B200 platform',
    summary: 'Eight-GPU Blackwell baseboard supplied to OEMs — the same silicon as DGX B200, integrated into a chassis of the buyer’s choosing.',
    image: '/assets/catalog/ai/nvidia-hgx-b200.jpg', dark: true, price: null,
    card: ['8× Blackwell SXM · 1.4 TB', 'NVLink 5 · 1.8 TB/s per GPU', 'OEM baseboard platform'],
    specs: {
      GPUs: '8× NVIDIA Blackwell SXM',
      'GPU memory': '1.4 TB total HBM3e',
      Interconnect: 'NVLink 5, 1.8 TB/s per GPU, 14.4 TB/s aggregate',
      'Form factor': '8-GPU baseboard for OEM servers'
    }
  },
  {
    slug: 'nvidia-gb200-nvl72', category: 'ai', brand: 'NVIDIA',
    name: 'GB200 NVL72',
    summary: 'Rack-scale liquid-cooled system: 72 Blackwell GPUs on one NVLink domain, addressed by the software as a single accelerator.',
    image: '/assets/catalog/ai/nvidia-gb200-nvl72.jpg', dark: true, price: null,
    card: ['72× Blackwell + 36× Grace', '13.4 TB HBM3e · NVLink', 'Rack-scale · liquid-cooled'],
    specs: {
      GPUs: '72× Blackwell, 36× Grace CPUs',
      'GPU memory': '13.4 TB HBM3e',
      Interconnect: 'NVLink 5, 130 TB/s aggregate',
      'Form factor': 'Single rack, liquid-cooled'
    }
  },

  {
    slug: 'nvidia-gb300-nvl72', category: 'ai', brand: 'NVIDIA',
    name: 'GB300 NVL72',
    summary: 'Rack-scale liquid-cooled successor to GB200 NVL72 — the same 72-GPU NVLink domain, rebuilt on Blackwell Ultra for more GPU memory per rack.',
    image: '/assets/catalog/ai/nvidia-gb300-nvl72.jpg', dark: true, price: null,
    card: ['72× Blackwell Ultra + 36× Grace', '20 TB GPU memory · NVLink', 'Rack-scale · liquid-cooled'],
    specs: {
      GPUs: '72× NVIDIA Blackwell Ultra, 36× Grace CPUs',
      'GPU memory': '20 TB HBM3e',
      Interconnect: 'NVLink 5, 130 TB/s aggregate',
      'Form factor': 'Single rack, liquid-cooled'
    }
  },
  {
    slug: 'nvidia-gh200-grace-hopper', category: 'ai', brand: 'NVIDIA',
    name: 'GH200 Grace Hopper Superchip',
    summary: 'Grace CPU and Hopper GPU on one coherent module with up to 624 GB of fast memory — sold as a building block for MGX servers rather than as a finished rack.',
    image: '/assets/catalog/ai/nvidia-gh200-grace-hopper.jpg', dark: true, price: null,
    card: ['H100 GPU + Grace CPU', 'Up to 624 GB fast memory', 'NVLink-C2C · 900 GB/s'],
    specs: {
      GPUs: '1× NVIDIA H100 Tensor Core GPU',
      'GPU memory': 'Up to 96 GB HBM3 or 144 GB HBM3e, up to 4.9 TB/s',
      CPU: '72-core Grace, Arm Neoverse V2, up to 480 GB LPDDR5X ECC',
      Memory: 'Up to 624 GB combined CPU+GPU fast-access memory',
      Interconnect: 'NVLink-C2C, 900 GB/s bidirectional CPU-to-GPU',
      Power: 'Programmable 450–1000 W',
      'Form factor': 'Superchip module, air- or liquid-cooled'
    }
  },

  /* ── GPU servers — OEM chassis, air-cooled unless noted ────────────────── */
  {
    slug: 'asus-esc-n8-e11', category: 'server', brand: 'ASUS',
    name: 'ESC N8-E11',
    summary: 'HGX H100 8-GPU baseboard in a 7U ASUS chassis with a dedicated one-GPU-to-one-NIC topology.',
    image: '/assets/catalog/ai/asus-esc-n8-e11.png', price: null,
    card: ['HGX H100 8-GPU SXM', '2× Xeon Scalable 4th/5th gen', '7U · 3000 W redundant'],
    specs: {
      GPUs: 'NVIDIA HGX H100 8-GPU SXM5',
      CPU: '2× Intel Xeon Scalable 4th/5th gen',
      Memory: '32× DIMM DDR5',
      'Form factor': '7U',
      PSU: '3000 W redundant, Titanium'
    }
  },
  {
    slug: 'asus-esc8000a-e12', category: 'server', brand: 'ASUS',
    name: 'ESC8000A-E12',
    summary: 'Four-rack-unit PCIe GPU server on dual EPYC — the flexible option when the accelerator mix changes between projects.',
    image: '/assets/catalog/ai/asus-esc8000a-e12.png', price: null,
    card: ['Up to 8× PCIe GPUs', '2× AMD EPYC 9004', '4U · 4× 3000 W'],
    specs: {
      GPUs: 'Up to 8× dual-slot PCIe, NVLink bridge',
      CPU: '2× AMD EPYC 9004',
      Memory: '24× DIMM DDR5-4800',
      'Form factor': '4U',
      PSU: '4× 3000 W Titanium'
    }
  },
  {
    slug: 'asus-esc4000a-e12', category: 'server', brand: 'ASUS',
    name: 'ESC4000A-E12',
    summary: 'Single-socket 2U with four dual-slot GPUs — inference and small-scale training where a full 8-GPU node is oversized.',
    image: '/assets/catalog/ai/asus-esc4000a-e12.jpg', price: null,
    card: ['Up to 4× dual-slot GPUs', '1× AMD EPYC 9004', '2U rack'],
    specs: {
      GPUs: 'Up to 4× dual-slot PCIe',
      CPU: '1× AMD EPYC 9004',
      Memory: '12× DIMM DDR5',
      'Form factor': '2U'
    }
  },
  {
    slug: 'supermicro-sys-821ge-tnhr', category: 'server', brand: 'Supermicro',
    name: 'SYS-821GE-TNHR',
    summary: 'Eight-rack-unit HGX H100/H200 node — Supermicro’s volume SXM platform, shipped with the full eight-NIC east-west fabric.',
    image: '/assets/catalog/ai/supermicro-sys-821ge-tnhr.jpg', price: null,
    card: ['HGX H100/H200 8-GPU', '2× Xeon Scalable 4th/5th gen', '8U · 6× 3000 W'],
    specs: {
      GPUs: 'NVIDIA HGX H100 or H200 8-GPU SXM5',
      CPU: '2× Intel Xeon Scalable 4th/5th gen',
      Memory: '32× DIMM DDR5',
      'Form factor': '8U',
      PSU: '6× 3000 W redundant, Titanium'
    }
  },
  {
    slug: 'supermicro-as-4125gs-tnrt', category: 'server', brand: 'Supermicro',
    name: 'AS-4125GS-TNRT',
    summary: 'Dual-root 4U PCIe GPU server on dual EPYC — takes eight double-width cards without an SXM baseboard.',
    image: '/assets/catalog/ai/supermicro-as-4125gs-tnrt.jpg', price: null,
    card: ['Up to 8× dual-width PCIe', '2× AMD EPYC 9004', '4U · dual-root'],
    specs: {
      GPUs: 'Up to 8× dual-width PCIe 5.0',
      CPU: '2× AMD EPYC 9004',
      Memory: '24× DIMM DDR5',
      'Form factor': '4U'
    }
  },
  {
    slug: 'gigabyte-g593-sd0', category: 'server', brand: 'Gigabyte',
    name: 'G593-SD0',
    summary: 'Five-rack-unit HGX H100 node — the densest air-cooled SXM chassis of its generation.',
    image: '/assets/catalog/ai/gigabyte-g593-sd0.jpg', price: null,
    card: ['HGX H100 8-GPU SXM', '2× Xeon Scalable 4th gen', '5U air-cooled'],
    specs: {
      GPUs: 'NVIDIA HGX H100 8-GPU SXM5',
      CPU: '2× Intel Xeon Scalable 4th gen',
      Memory: '32× DIMM DDR5',
      'Form factor': '5U'
    }
  },
  {
    slug: 'dell-poweredge-xe9680', category: 'server', brand: 'Dell',
    name: 'PowerEdge XE9680',
    summary: 'Six-rack-unit eight-GPU node that takes either NVIDIA SXM or AMD OAM baseboards — useful where the accelerator vendor is not yet fixed.',
    image: '/assets/catalog/ai/dell-poweredge-xe9680.jpg', price: null,
    card: ['8× H100/H200 SXM or MI300X', '2× Xeon Scalable 4th/5th gen', '6U rack'],
    specs: {
      GPUs: '8× NVIDIA H100/H200 SXM or 8× AMD Instinct MI300X OAM',
      CPU: '2× Intel Xeon Scalable 4th/5th gen',
      Memory: '32× DIMM DDR5',
      'Form factor': '6U'
    }
  },
  {
    slug: 'lenovo-thinksystem-sr675-v3', category: 'server', brand: 'Lenovo',
    name: 'ThinkSystem SR675 V3',
    summary: 'Three-rack-unit EPYC node configurable either as eight PCIe GPUs or as a four-GPU HGX baseboard.',
    image: '/assets/catalog/ai/lenovo-thinksystem-sr675-v3.png', price: null,
    card: ['8× PCIe GPU or HGX 4-GPU', '2× AMD EPYC 9004/9005', '3U rack'],
    specs: {
      GPUs: 'Up to 8× double-wide PCIe, or NVIDIA HGX 4-GPU SXM',
      CPU: '2× AMD EPYC 9004/9005',
      Memory: '24× DIMM DDR5',
      'Form factor': '3U'
    }
  },

  /* ── Accelerators — discrete cards and OAM modules ─────────────────────── */
  {
    slug: 'nvidia-b200', category: 'gpu', brand: 'NVIDIA',
    name: 'B200 Tensor Core',
    summary: 'Blackwell SXM module, 180 GB HBM3e — supplied on an eight-GPU baseboard, not as a standalone card.',
    image: null, price: null,
    card: ['180 GB HBM3e', '8 TB/s bandwidth', 'SXM · up to 1000 W'],
    specs: {
      Memory: '180 GB HBM3e',
      Bandwidth: '8 TB/s',
      TDP: 'Up to 1000 W',
      'Form factor': 'SXM module, HGX baseboard only',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'nvidia-h200', category: 'gpu', brand: 'NVIDIA',
    name: 'H200 Tensor Core',
    summary: 'Hopper with 141 GB of HBM3e — the memory-bound refresh of H100, same power envelope and same sockets.',
    image: '/assets/catalog/gpu/nvidia-h200.png', price: null,
    card: ['141 GB HBM3e', '4.8 TB/s bandwidth', 'SXM / NVL PCIe'],
    specs: {
      Memory: '141 GB HBM3e',
      Bandwidth: '4.8 TB/s',
      TDP: 'Up to 700 W (SXM)',
      'Form factor': 'SXM or NVL dual-slot PCIe',
      Architecture: 'Hopper'
    }
  },
  {
    slug: 'nvidia-h100', category: 'gpu', brand: 'NVIDIA',
    name: 'H100 Tensor Core',
    summary: 'The Hopper baseline — still the reference point most training cost models are written against.',
    image: '/assets/catalog/gpu/nvidia-h100.png', price: null,
    card: ['80 / 94 GB HBM3', 'NVLink 900 GB/s', 'SXM / NVL PCIe'],
    specs: {
      Memory: '80 GB (SXM) / 94 GB (NVL) HBM3',
      Bandwidth: '3.35–3.9 TB/s',
      TDP: '350–700 W',
      'Form factor': 'SXM or PCIe dual-slot',
      Architecture: 'Hopper'
    }
  },
  {
    slug: 'nvidia-a100-80gb', category: 'gpu', brand: 'NVIDIA',
    name: 'A100 80 GB',
    summary: 'Ampere data-centre card — past its peak, but the cheapest route to 80 GB of HBM per GPU.',
    image: '/assets/catalog/gpu/nvidia-a100-80gb.jpg', price: null,
    card: ['80 GB HBM2e', 'NVLink 600 GB/s', 'SXM / PCIe'],
    specs: {
      Memory: '80 GB HBM2e',
      Bandwidth: 'Up to 2.04 TB/s',
      TDP: '300–400 W',
      'Form factor': 'SXM or PCIe dual-slot',
      Architecture: 'Ampere'
    }
  },
  {
    slug: 'nvidia-l40s', category: 'gpu', brand: 'NVIDIA',
    name: 'L40S',
    summary: 'Ada card with 48 GB of GDDR6 ECC — inference, rendering and video in the same 350 W slot.',
    image: '/assets/catalog/gpu/nvidia-l40s.jpg', photo: true, price: null,
    card: ['48 GB GDDR6 ECC', '350 W · PCIe Gen4', 'Inference + graphics'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '864 GB/s',
      TDP: '350 W',
      'Form factor': 'Dual-slot PCIe, passive',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-l4', category: 'gpu', brand: 'NVIDIA',
    name: 'L4',
    summary: 'Single-slot 72 W card — video decode and low-latency inference in servers with no spare power budget.',
    image: '/assets/catalog/gpu/nvidia-l4.png', price: null,
    card: ['24 GB · 72 W', 'Single-slot low-profile', 'Video + inference'],
    specs: {
      Memory: '24 GB GDDR6',
      Bandwidth: '300 GB/s',
      TDP: '72 W',
      'Form factor': 'Single-slot low-profile PCIe',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-6000-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 6000 Ada',
    summary: 'Actively cooled 48 GB workstation card with display outputs — for desks, not for dense racks.',
    image: '/assets/catalog/gpu/nvidia-rtx-6000-ada.png', price: null,
    card: ['48 GB GDDR6 ECC', '300 W · active', 'Workstation class'],
    specs: {
      Memory: '48 GB GDDR6 ECC',
      Bandwidth: '960 GB/s',
      TDP: '300 W',
      'Form factor': 'Dual-slot, active cooling',
      Outputs: '4× DisplayPort 1.4a',
      Architecture: 'Ada Lovelace'
    }
  },
  {
    slug: 'nvidia-rtx-pro-6000-blackwell', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX PRO 6000 Blackwell',
    summary: 'Workstation Blackwell with 96 GB of GDDR7 — the largest single-card memory pool available outside HBM parts.',
    image: null, price: null,
    card: ['96 GB GDDR7 ECC', '1792 GB/s · 600 W', 'Dual-slot workstation'],
    specs: {
      Memory: '96 GB GDDR7 ECC',
      Bandwidth: '1792 GB/s',
      TDP: '600 W',
      'Form factor': 'Dual-slot, 5.4" × 12.0", double flow-through',
      Outputs: '4× DisplayPort 2.1',
      Architecture: 'Blackwell'
    }
  },
  {
    slug: 'amd-instinct-mi300x', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI300X',
    summary: 'CDNA 3 OAM module with 192 GB of HBM3 — fits large models on fewer GPUs, at the cost of a smaller software ecosystem.',
    image: null, price: null,
    card: ['192 GB HBM3', '5.3 TB/s bandwidth', 'OAM · 750 W'],
    specs: {
      Memory: '192 GB HBM3',
      Bandwidth: '5.3 TB/s',
      TDP: '750 W peak',
      'Form factor': 'OAM module, 8-GPU baseboard',
      Architecture: 'CDNA 3'
    }
  },
  {
    slug: 'amd-instinct-mi325x', category: 'gpu', brand: 'AMD',
    name: 'Instinct MI325X',
    summary: '256 GB of HBM3e on a module pin-compatible with MI300X — a memory upgrade that reuses the existing platform.',
    image: null, price: null,
    card: ['256 GB HBM3e', '6 TB/s bandwidth', 'OAM · up to 1000 W'],
    specs: {
      Memory: '256 GB HBM3e',
      Bandwidth: '6 TB/s',
      TDP: 'Up to 1000 W',
      Performance: '1.3 PFLOPS FP16, 2.6 PFLOPS FP8',
      'Form factor': 'OAM module, pin-compatible with MI300X',
      Architecture: 'CDNA 3'
    }
  }
]

export default PRODUCTS_AI
