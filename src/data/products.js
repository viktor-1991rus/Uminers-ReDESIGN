/**
 * Catalogue data — collected 17 Aug 2026 from public pages.
 *
 * ASIC, container and GasCore entries: uminers.com catalogue (prices as
 * listed there — ASIC in USDT, containers/GasCore in USD). AI, GPU and
 * networking entries: manufacturer public pages (NVIDIA, ASUS) — cynto.ai
 * publishes category descriptions only, no SKUs. No partnership implied
 * anywhere; prices absent on manufacturer pages stay null ("on request").
 * Do not invent values here.
 */

export const CATEGORIES = [
  { key: 'ai',        label: 'AI compute',  mark: 'ai' },
  { key: 'asic',      label: 'ASIC miners', mark: 'asic' },
  { key: 'gpu',       label: 'GPUs',        mark: 'gpu' },
  { key: 'server',    label: 'Networking',  mark: 'server' },
  { key: 'container', label: 'Containers',  mark: 'container' },
  { key: 'power',     label: 'Power gear',  mark: 'power' }
]

/* facet keys shown as filter chips, per category */
export const FACETS = {
  ai:        ['brand'],
  asic:      ['brand', 'cooling', 'algo'],
  gpu:       [],
  server:    [],
  container: ['cooling'],
  power:     []
}

/* the four rows a spec dl shows per category — a fixed dictionary so every
 * card in a category lines up on the same left column, not whatever order
 * that product's `specs` object happens to hold. `field` may be a list of
 * candidate keys (naming varies between manufacturer sources); the first
 * one present on the product wins, and a row is skipped entirely if none
 * of its candidates exist on that product — never invented. */
export const SPEC_KEYS = {
  ai: [
    { key: 'GPU',  label: 'GPUs',         field: ['GPUs'] },
    { key: 'MEM',  label: 'GPU memory',   field: ['GPU memory', 'Memory'] },
    { key: 'NET',  label: 'Interconnect', field: ['Interconnect', 'Network'] },
    { key: 'PWR',  label: 'Power',        field: ['Power', 'TDP'] }
  ],
  asic: [
    { key: 'HASH', label: 'Hashrate',   field: ['Hashrate'] },
    { key: 'PWR',  label: 'Power',      field: ['Power'] },
    { key: 'EFF',  label: 'Efficiency', field: ['Efficiency'] },
    { key: 'COOL', label: 'Cooling',    field: ['Cooling'] }
  ],
  gpu: [
    { key: 'MEM',  label: 'Memory',      field: ['Memory'] },
    { key: 'BW',   label: 'Bandwidth',   field: ['Bandwidth'] },
    { key: 'PWR',  label: 'TDP',         field: ['TDP'] },
    { key: 'FORM', label: 'Form factor', field: ['Form factor'] }
  ],
  server: [
    { key: 'SPD',  label: 'Speed',       field: ['Speed', 'Ports'] },
    { key: 'THR',  label: 'Throughput',  field: ['Throughput'] },
    { key: 'PROTO',label: 'Protocols',   field: ['Protocols', 'Role', 'Features'] },
    { key: 'FORM', label: 'Form factor', field: ['Form factor'] }
  ],
  container: [
    { key: 'CAP',  label: 'Capacity', field: ['Capacity'] },
    { key: 'PWR',  label: 'Power',    field: ['Power'] },
    { key: 'COOL', label: 'Cooling',  field: ['Cooling'] },
    { key: 'SIZE', label: 'Size',     field: ['Size'] }
  ],
  power: [
    { key: 'OUT',  label: 'Output',      field: ['Output'] },
    { key: 'FUEL', label: 'Fuel',        field: ['Fuel', 'Engine'] },
    { key: 'EFF',  label: 'Efficiency',  field: ['Efficiency'] },
    { key: 'FORM', label: 'Form factor', field: ['Form factor', 'Note'] }
  ]
}

export const PRODUCTS = [
  /* ── AI compute — manufacturer platforms, quoted by the sourcing desk ─── */
  {
    slug: 'nvidia-gb200-nvl72', category: 'ai', brand: 'NVIDIA',
    name: 'GB200 NVL72',
    image: '/assets/catalog/ai/nvidia-gb200-nvl72.jpg', dark: true, price: null,
    card: ['72× Blackwell + 36× Grace', '13.4 TB HBM3e · NVLink', 'Rack-scale · liquid-cooled'],
    specs: { GPUs: '72× Blackwell, 36× Grace CPUs', 'GPU memory': '13.4 TB HBM3e', Interconnect: 'NVLink, 130 TB/s total', 'Form factor': 'Single rack, liquid-cooled' }
  },
  {
    slug: 'nvidia-dgx-b200', category: 'ai', brand: 'NVIDIA',
    name: 'DGX B200',
    image: '/assets/catalog/ai/nvidia-dgx-b200.jpg', dark: true, price: null,
    card: ['8× Blackwell · 1.44 TB', '72 PFLOPS FP8', '10U · ~14.3 kW'],
    specs: { GPUs: '8× NVIDIA Blackwell', 'GPU memory': '1440 GB total', CPU: '2× Intel Xeon Platinum 8570', Performance: '72 PFLOPS FP8', 'Form factor': '10U', Power: '~14.3 kW max' }
  },
  {
    slug: 'nvidia-dgx-h100', category: 'ai', brand: 'NVIDIA',
    name: 'DGX H100',
    image: '/assets/catalog/ai/nvidia-dgx-h100.jpg', dark: true, price: null,
    card: ['8× H100 SXM · 640 GB', '400 Gb/s InfiniBand', '8U · ~10.2 kW'],
    specs: { GPUs: '8× NVIDIA H100 SXM', 'GPU memory': '640 GB total', Network: '8× ConnectX-7, up to 400 Gb/s', 'Form factor': '8U', Power: '~10.2 kW max' }
  },
  {
    slug: 'nvidia-hgx-b200', category: 'ai', brand: 'NVIDIA',
    name: 'HGX B200 platform',
    image: '/assets/catalog/ai/nvidia-hgx-b200.jpg', dark: true, price: null,
    card: ['8× Blackwell SXM · 1.4 TB', 'NVLink 5 · 1.8 TB/s', 'OEM baseboard platform'],
    specs: { GPUs: '8× NVIDIA Blackwell SXM', 'GPU memory': '1.4 TB total', Interconnect: 'NVLink 5, 14.4 TB/s total', 'Form factor': '8-GPU baseboard for OEM servers' }
  },
  {
    slug: 'asus-esc8000a-e12', category: 'ai', brand: 'ASUS',
    name: 'ESC8000A-E12',
    image: '/assets/catalog/ai/asus-esc8000a-e12.png', price: null,
    card: ['Up to 8× PCIe GPUs', '2× AMD EPYC 9004', '4U · 4× 3000 W'],
    specs: { GPUs: 'Up to 8× dual-slot PCIe, NVLink bridge', CPU: '2× AMD EPYC 9004', Memory: '24× DIMM DDR5-4800', 'Form factor': '4U', PSU: '4× 3000 W Titanium' }
  },

  /* ── ASIC miners — uminers.com listings, prices in USDT ────────────────── */
  {
    slug: 'antminer-s21j-xp-hyd', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S21j XP Hyd', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s21j-xp-hyd.png', price: 6188,
    card: ['SHA-256 · 495 TH/s', '5940 W · 12 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '495 TH/s', Power: '5940 W', Efficiency: '12 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'antminer-s23-hyd', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S23 Hyd', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s23-hyd.png', price: 7400,
    card: ['SHA-256 · 296 TH/s', '2812 W · 9.5 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '296 TH/s', Power: '2812 W', Efficiency: '9.5 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'antminer-s23-hyd-3u', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S23 Hyd 3U', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s23-hyd-3u.png', price: 7900,
    card: ['SHA-256 · 1.16 PH/s', '11020 W · 9.5 J/TH', 'Hydro · 3U'],
    specs: { Algorithm: 'SHA-256', Hashrate: '1.16 PH/s', Power: '11 020 W', Efficiency: '9.5 J/TH', Cooling: 'Hydro', 'Form factor': '3U' }
  },
  {
    slug: 'antminer-s23e-u2h', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S23e U2H', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s23e-u2h.png', price: 19030,
    card: ['SHA-256 · 865 TH/s', '8650 W · 10 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '865 TH/s', Power: '8650 W', Efficiency: '10 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'antminer-s21-pro', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S21 Pro', cooling: 'Air', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s21-pro.png', price: 1887,
    card: ['SHA-256 · 245 TH/s', '3675 W · 15 J/TH', 'Air-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '245 TH/s ± 3%', Power: '3675 W ± 5%', Efficiency: '15 J/TH', Cooling: 'Air' }
  },
  {
    slug: 'antminer-s21-plus', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S21+', cooling: 'Air', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s21-plus.png', price: 2835,
    card: ['SHA-256 · 225 TH/s', '3712 W · 16.5 J/TH', 'Air-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '225 TH/s ± 3%', Power: '3712.5 W ± 5%', Efficiency: '16.5 J/TH', Cooling: 'Air' }
  },
  {
    slug: 'antminer-s21-plus-hyd', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S21+ Hyd', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s21-plus-hyd.png', price: 2197,
    card: ['SHA-256 · 338 TH/s', '5070 W · 15 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '338 TH/s', Power: '5070 W', Efficiency: '15 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'antminer-s21e-hyd', category: 'asic', brand: 'Bitmain',
    name: 'Antminer S21e Hyd', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/antminer-s21e-hyd.png', price: 1693,
    card: ['SHA-256 · 332 TH/s', '5644 W · 17 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '332 TH/s', Power: '5644 W', Efficiency: '17 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'antminer-ks7', category: 'asic', brand: 'Bitmain',
    name: 'Antminer KS7', algo: 'kHeavyHash',
    image: '/assets/catalog/asic/antminer-ks7.png', price: 1820,
    card: ['kHeavyHash · 45 TH/s', '3465 W · 77 J/TH', 'Kaspa'],
    specs: { Algorithm: 'kHeavyHash', Hashrate: '45 TH/s', Power: '3465 W', Efficiency: '77 J/TH', Coin: 'KAS' }
  },
  {
    slug: 'antminer-l11', category: 'asic', brand: 'Bitmain',
    name: 'Antminer L11', cooling: 'Air', algo: 'Scrypt',
    image: '/assets/catalog/asic/antminer-l11.png', price: 5600,
    card: ['Scrypt · 20 GH/s', '3680 W', 'LTC + DOGE · air'],
    specs: { Algorithm: 'Scrypt', Hashrate: '20 GH/s', Power: '3680 W', Efficiency: '184 J/GH', Cooling: 'Air', Coins: 'LTC, DOGE' }
  },
  {
    slug: 'antminer-z15-pro', category: 'asic', brand: 'Bitmain',
    name: 'Antminer Z15 Pro', cooling: 'Air', algo: 'EquiHash',
    image: '/assets/catalog/asic/antminer-z15-pro.png', price: 3499,
    card: ['EquiHash · 840 kH/s', '2780 W · 3.3 J/kH', 'Air-cooled'],
    specs: { Algorithm: 'EquiHash', Hashrate: '840 kH/s', Power: '2780 W', Efficiency: '3.3 J/kH', Cooling: 'Air' }
  },
  {
    slug: 'whatsminer-m73', category: 'asic', brand: 'MicroBT',
    name: 'WhatsMiner M73', algo: 'SHA-256',
    image: '/assets/catalog/asic/whatsminer-m73.png', price: 4934,
    card: ['SHA-256 · 514 TH/s', '7200 W · 14.1 J/TH', 'WhatsMiner flagship'],
    specs: { Algorithm: 'SHA-256', Hashrate: '514 TH/s', Power: '7200 W', Efficiency: '14.1 J/TH' }
  },
  {
    slug: 'whatsminer-m70', category: 'asic', brand: 'MicroBT',
    name: 'WhatsMiner M70', cooling: 'Air', algo: 'SHA-256',
    image: '/assets/catalog/asic/whatsminer-m70.png', price: 2486,
    card: ['SHA-256 · 222 TH/s', '3330 W · 15 J/TH', 'Air-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '222 TH/s', Power: '3330 W', Efficiency: '15 J/TH', Cooling: 'Air' }
  },
  {
    slug: 'whatsminer-m63s-plus', category: 'asic', brand: 'MicroBT',
    name: 'WhatsMiner M63S+', algo: 'SHA-256',
    image: '/assets/catalog/asic/whatsminer-m63s-plus.png', price: 3124,
    card: ['SHA-256 · 428 TH/s', '7310 W · 17.1 J/TH', 'High-density'],
    specs: { Algorithm: 'SHA-256', Hashrate: '428 TH/s', Power: '7310 W', Efficiency: '17.1 J/TH' }
  },
  {
    slug: 'whatsminer-m66s', category: 'asic', brand: 'MicroBT',
    name: 'WhatsMiner M66S', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/whatsminer-m66s.png', price: 1956,
    card: ['SHA-256 · 268 TH/s', '5092 W · 19 J/TH', 'Hydro-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '268 TH/s', Power: '5092 W', Efficiency: '19 J/TH', Cooling: 'Hydro' }
  },
  {
    slug: 'sealminer-a3-pro-hydro', category: 'asic', brand: 'Bitdeer',
    name: 'Sealminer A3 Pro Hydro', cooling: 'Hydro', algo: 'SHA-256',
    image: '/assets/catalog/asic/sealminer-a3-pro-hydro.png', price: 9702,
    card: ['SHA-256 · 660 TH/s', '8250 W · 12.5 J/TH', 'Hydro · in stock, HK'],
    specs: { Algorithm: 'SHA-256', Hashrate: '660 TH/s ± 10%', Power: '8250 W ± 10%', Efficiency: '12.5 J/TH', Cooling: 'Hydro', Stock: 'In stock, Hong Kong' }
  },
  {
    slug: 'sealminer-a2-pro-air', category: 'asic', brand: 'Bitdeer',
    name: 'Sealminer A2 Pro Air', cooling: 'Air', algo: 'SHA-256',
    image: '/assets/catalog/asic/sealminer-a2-pro-air.png', price: 3019,
    card: ['SHA-256 · 258 TH/s', '3999 W · 15.5 J/TH', 'Air-cooled'],
    specs: { Algorithm: 'SHA-256', Hashrate: '258 TH/s ± 10%', Power: '3999 W ± 5%', Efficiency: '15.5 J/TH', Cooling: 'Air' }
  },
  {
    slug: 'avalon-q', category: 'asic', brand: 'Canaan',
    name: 'Avalon Q', cooling: 'Air', algo: 'SHA-256',
    image: '/assets/catalog/asic/avalon-q.png', price: 1340,
    card: ['SHA-256 · 90 TH/s', '1674 W · 18.6 J/TH', 'Compact · air'],
    specs: { Algorithm: 'SHA-256', Hashrate: '90 TH/s', Power: '1674 W', Efficiency: '18.6 J/TH', Cooling: 'Air' }
  },
  {
    slug: 'aleo-ae3', category: 'asic', brand: 'IceRiver',
    name: 'ALEO AE3', cooling: 'Air', algo: 'zkSNARK',
    image: '/assets/catalog/asic/aleo-ae3.png', price: 5780,
    card: ['zkSNARK · 2 GH/s', '3400 W', 'Aleo · air'],
    specs: { Algorithm: 'zkSNARK', Hashrate: '2 GH/s ± 5%', Power: '3400 W ± 10%', Cooling: 'Air', Coin: 'ALEO' }
  },

  /* ── GPUs — manufacturer public specs, quoted on request ──────────────── */
  {
    slug: 'nvidia-h200', category: 'gpu', brand: 'NVIDIA',
    name: 'H200 Tensor Core',
    image: '/assets/catalog/gpu/nvidia-h200.png', price: null,
    card: ['141 GB HBM3e', '4.8 TB/s bandwidth', 'SXM / NVL PCIe'],
    specs: { Memory: '141 GB HBM3e', Bandwidth: '4.8 TB/s', TDP: 'Up to 700 W (SXM)', 'Form factor': 'SXM or NVL dual-slot PCIe' }
  },
  {
    slug: 'nvidia-h100', category: 'gpu', brand: 'NVIDIA',
    name: 'H100 Tensor Core',
    image: '/assets/catalog/gpu/nvidia-h100.png', price: null,
    card: ['80 / 94 GB HBM3', 'NVLink 900 GB/s', 'SXM / NVL PCIe'],
    specs: { Memory: '80 GB (SXM) / 94 GB (NVL) HBM3', Bandwidth: '3.35–3.9 TB/s', TDP: '350–700 W', 'Form factor': 'SXM or PCIe dual-slot' }
  },
  {
    slug: 'nvidia-l40s', category: 'gpu', brand: 'NVIDIA',
    name: 'L40S',
    image: '/assets/catalog/gpu/nvidia-l40s.jpg', photo: true, price: null,
    card: ['48 GB GDDR6 ECC', '350 W · PCIe Gen4', 'Inference + graphics'],
    specs: { Memory: '48 GB GDDR6 ECC', Bandwidth: '864 GB/s', TDP: '350 W', 'Form factor': 'Dual-slot PCIe, passive', Architecture: 'Ada Lovelace' }
  },
  {
    slug: 'nvidia-rtx-6000-ada', category: 'gpu', brand: 'NVIDIA',
    name: 'RTX 6000 Ada',
    image: '/assets/catalog/gpu/nvidia-rtx-6000-ada.png', price: null,
    card: ['48 GB GDDR6 ECC', '300 W · active', 'Workstation class'],
    specs: { Memory: '48 GB GDDR6 ECC', TDP: '300 W', 'Form factor': 'Dual-slot, active cooling', Outputs: '4× DisplayPort 1.4a' }
  },
  {
    slug: 'nvidia-l4', category: 'gpu', brand: 'NVIDIA',
    name: 'L4',
    image: '/assets/catalog/gpu/nvidia-l4.png', price: null,
    card: ['24 GB · 72 W', 'Single-slot low-profile', 'Video + inference'],
    specs: { Memory: '24 GB', Bandwidth: '300 GB/s', TDP: '72 W', 'Form factor': 'Single-slot low-profile PCIe' }
  },
  {
    slug: 'nvidia-a100-80gb', category: 'gpu', brand: 'NVIDIA',
    name: 'A100 80 GB',
    image: '/assets/catalog/gpu/nvidia-a100-80gb.jpg', price: null,
    card: ['80 GB HBM2e', 'NVLink 600 GB/s', 'SXM / PCIe'],
    specs: { Memory: '80 GB HBM2e', Bandwidth: 'Up to 2.04 TB/s', TDP: '300–400 W', 'Form factor': 'SXM or PCIe dual-slot' }
  },

  /* ── Networking — the fabric an AI hall actually needs ────────────────── */
  {
    slug: 'nvidia-qm9700', category: 'server', brand: 'NVIDIA',
    name: 'Quantum-2 QM9700',
    image: '/assets/catalog/server/nvidia-qm9700.png', price: null,
    card: ['64× 400G NDR InfiniBand', '51.2 Tb/s bidirectional', '1U · air or liquid'],
    specs: { Ports: '64× 400 Gb/s NDR (or 128× 200 Gb/s)', Throughput: '51.2 Tb/s', 'Form factor': '1U' }
  },
  {
    slug: 'nvidia-sn5600', category: 'server', brand: 'NVIDIA',
    name: 'Spectrum-4 SN5600',
    image: '/assets/catalog/server/nvidia-sn5600.png', price: null,
    card: ['64× 800GbE OSFP', '51.2 Tb/s · 2U', 'Splittable to 256 ports'],
    specs: { Ports: '64× 800 GbE OSFP', Throughput: '51.2 Tb/s', Buffer: '160 MB shared', 'Form factor': '2U' }
  },
  {
    slug: 'nvidia-connectx-7', category: 'server', brand: 'NVIDIA',
    name: 'ConnectX-7 adapter',
    image: '/assets/catalog/server/nvidia-connectx-7.png', price: null,
    card: ['Up to 400 Gb/s', 'InfiniBand + Ethernet', 'GPUDirect RDMA'],
    specs: { Speed: 'Up to 400 Gb/s', Protocols: 'InfiniBand NDR, Ethernet', Features: 'RDMA, GPUDirect', 'Form factor': 'PCIe HHHL' }
  },
  {
    slug: 'nvidia-bluefield-3', category: 'server', brand: 'NVIDIA',
    name: 'BlueField-3 DPU',
    image: '/assets/catalog/server/nvidia-bluefield-3.png', price: null,
    card: ['400 Gb/s DPU', 'SDN, storage, security', 'Offloads the host'],
    specs: { Speed: '400 Gb/s', Role: 'Line-rate SDN, storage and security offload' }
  },

  /* ── Containers — Uminers' own line, uminers.com listings, USD ────────── */
  {
    slug: 'hydrocore-240-3u', category: 'container', brand: 'Uminers',
    name: 'HydroCore 240/3U', cooling: 'Hydro',
    image: '/assets/catalog/container/hydrocore-240-3u.png', price: 140000,
    card: ['240× WhatsMiner or 168× 3U', '2400 kW · hydro', '40 ft · 90-day production'],
    specs: { Capacity: '240× WhatsMiner or 168× Antminer 3U hydro', Power: '2400 kW max', Cooling: 'Hydro, closed-loop dry cooling', Size: '40 ft', 'Operating temp': '−35…+45 °C', Production: '90 days', Warranty: '1 year' }
  },
  {
    slug: 'hydrocore-480', category: 'container', brand: 'Uminers',
    name: 'HydroCore 480', cooling: 'Hydro',
    image: '/assets/catalog/container/hydrocore-480.png', price: 164000,
    card: ['480× Antminer hydro', '2700 kW · hydro', '40 ft · dual loops'],
    specs: { Capacity: '480× Antminer hydro series', Power: '2700 kW max', Cooling: 'Hydro, dual dry-cooling loops, IP54', Size: '40 ft', 'Operating temp': '−35…+45 °C', Production: '90 days', Warranty: '1 year' }
  },
  {
    slug: 'hydrocore-420', category: 'container', brand: 'Uminers',
    name: 'HydroCore 420', cooling: 'Hydro',
    image: '/assets/catalog/container/hydrocore-420.png', price: 140000,
    card: ['420× Antminer Hyd', '2400 kW · hydro', '40 ft · IP54'],
    specs: { Capacity: '420× Antminer S19/S21 Hyd', Power: '2400 kW max', Cooling: 'Hydro, dual dry-cooling loops', Size: '40 ft', 'Operating temp': '−35…+45 °C', Production: '90 days', Warranty: '1 year' }
  },
  {
    slug: 'deepcore-128', category: 'container', brand: 'Uminers',
    name: 'DeepCore 128', cooling: 'Immersion',
    image: '/assets/catalog/container/deepcore-128.png', price: 150000,
    card: ['128× WhatsMiner immersion', '1100 kW · immersion', '40 ft · 1.1 MW dry cooler'],
    specs: { Capacity: '128× WhatsMiner', Power: '1100 kW max', Cooling: 'Immersion; Güntner/Kelvion dry cooler, Grundfos pumps, SWEP exchangers', Size: '40 ft', 'Operating temp': '−35…+45 °C', Production: '90 days', Warranty: '1 year' }
  },
  {
    slug: 'deepcore-160', category: 'container', brand: 'Uminers',
    name: 'DeepCore 160', cooling: 'Immersion',
    image: '/assets/catalog/container/deepcore-160.png', price: 128500,
    card: ['160–192× Antminer', '1100 kW · immersion', '40 ft · 90-day production'],
    specs: { Capacity: '192× Antminer S19/S21 or 160× S21 Imm', Power: '1100 kW max', Cooling: 'Immersion', Size: '40 ft', 'Operating temp': '−35…+45 °C', Production: '90 days', Warranty: '1 year' }
  },
  {
    slug: 'aircore-max-north', category: 'container', brand: 'Uminers',
    name: 'AirCore MAX North Edition', cooling: 'Air',
    image: '/assets/catalog/container/aircore-max-north-edition.png', price: 32000,
    card: ['288× modern ASICs', '1320 kW · air', '40 ft · cold-climate'],
    specs: { Capacity: '288× Antminer, WhatsMiner and other ASICs', Power: '1320 kW max', Cooling: 'Air', Size: '40 ft', 'Operating temp': '−35…+35 °C', Production: '90 days', Warranty: '1 year' }
  },

  /* ── Power gear ────────────────────────────────────────────────────────── */
  {
    slug: 'gascore-1000', category: 'power', brand: 'Uminers',
    name: 'GasCore 1000',
    image: '/assets/catalog/power/gascore-1000.png', price: 345000,
    card: ['1000 kW continuous', 'Natural / associated gas', '40 ft generator container'],
    specs: { Output: '1000 kW continuous (line 250–2000 kW)', Fuel: 'Natural or associated gas', Engine: 'WEICHAI 16M33D1280NG10', Efficiency: 'Up to 40% electrical', Voltage: '400 V, 50 Hz', 'Form factor': '40 ft container, IP23' }
  },
  {
    slug: 'transformer-skid', category: 'power', brand: 'Specified per site',
    name: 'Transformer skid',
    image: null, price: null,
    card: ['Specified per site', 'Commissioned by Uminers', 'Quoted with the build'],
    specs: { Note: 'Specified for the site, commissioned at handover' }
  },
  {
    slug: 'switchgear-distribution', category: 'power', brand: 'Specified per site',
    name: 'Switchgear and distribution',
    image: null, price: null,
    card: ['LV/MV distribution', 'Specified per site', 'Quoted with the build'],
    specs: { Note: 'Specified for the site, commissioned at handover' }
  }
]
