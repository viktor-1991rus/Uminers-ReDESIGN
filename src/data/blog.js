// Real articles pulled from uminers.com/blog/articles (Aug 2026 snapshot).
// Cover art matches the Figma "Uminers Journal" listing (fZKMdrWEf5yJYKLeSIqioD,
// node 2064:103): each article gets one of the illustrated Uminers CDN covers
// picked for the closest fit to its real headline — never an invented topic.
// Assets live in public/assets/blog (downloaded once from Figma's asset CDN,
// which expires ~7 days after export, so they are committed as local files).

export const BLOG_CATEGORIES = [
  'All', "Author's column", 'Bitcoin', 'Blog', 'Company', 'Hardware', 'Market news'
]

// Category tag shown on the card + its Figma accent colour.
const TAG = {
  Hardware: { label: 'Hardware', color: '#ff97ff' },
  Guides: { label: 'Blog', color: '#3f7fff' },
  Infrastructure: { label: 'Company', color: '#ff6464' },
  Market: { label: 'Bitcoin', color: '#28d553' }
}

export const BLOG_POSTS = [
  {
    slug: 'rtx-pro-6000-blackwell-three-versions',
    title: 'NVIDIA RTX PRO 6000 Blackwell: Three Versions of One Flagship',
    category: 'Hardware',
    date: '2026-08-06',
    readMins: 2,
    image: '/assets/blog/circuit-board.jpg',
    excerpt: 'Workstation, Max-Q and Server editions of NVIDIA’s flagship Blackwell GPU compared — same silicon, three very different power and deployment profiles.'
  },
  {
    slug: 'blackwell-architecture-explained',
    title: 'Blackwell Architecture Explained: How NVIDIA RTX PRO 6000 Redefines AI and Rendering GPUs',
    category: 'Hardware',
    date: '2026-08-05',
    readMins: 2,
    image: '/assets/blog/cosmonaut-miner.jpg',
    excerpt: 'What actually changed under the hood from Ada Lovelace to Blackwell, and why it matters for both AI training and rendering workloads.'
  },
  {
    slug: 'whatsminer-m7a-vs-m7b-vs-m7d',
    title: 'Whatsminer M7A vs M7B vs M7D: Which Model is Best for Heat Reuse in 2026',
    category: 'Guides',
    date: '2026-06-19',
    readMins: 5,
    image: '/assets/blog/miner-questions.jpg',
    excerpt: 'A side-by-side on hashrate, efficiency and outlet water temperature to work out which M7 variant actually pays for a heat-reuse project.'
  },
  {
    slug: 'mining-transformers-electrical-infrastructure',
    title: 'Mining Transformers: Why Electrical Infrastructure Determines the Success of Your Operation',
    category: 'Infrastructure',
    date: '2026-05-28',
    readMins: 6,
    image: '/assets/blog/bitcoin-city.jpg',
    excerpt: 'Transformer sizing, tap changers and load balancing — the unglamorous infrastructure decisions that decide whether a farm ever hits nameplate hashrate.'
  },
  {
    slug: 'how-to-choose-mining-container-2026',
    title: 'How to Choose a Mining Container in 2026: Complete Buyer’s Guide',
    category: 'Guides',
    date: '2026-04-29',
    readMins: 7,
    image: '/assets/blog/cosmonaut-miner.jpg',
    excerpt: 'Air, immersion or hydro — a buyer’s walkthrough of container specs, cooling trade-offs and what actually drives total cost of ownership.'
  },
  {
    slug: 'less-than-1-million-bitcoins-left-to-mine',
    title: 'Less Than 1 Million Bitcoins Left to Mine',
    category: 'Market',
    date: '2026-03-12',
    readMins: 2,
    image: '/assets/blog/banana-zone.jpg',
    excerpt: 'More than 95% of Bitcoin’s 21 million supply is already issued — what the shrinking remainder means for miners and for issuance economics.'
  }
]

export function tagFor(category) { return TAG[category] || { label: category, color: '#00c1ad' } }

// "Recent Articles" rail on the Journal hero — real Uminers press/event photography,
// as in Figma (2064:230..280), not the same illustrated covers used in the grid below.
export const RECENT_ARTICLES = [
  {
    slug: 'rtx-pro-6000-blackwell-three-versions',
    tag: 'Company', tagColor: '#ff6464',
    title: 'Blockchain Life 2025: Uminers is the Mining Company of the Year',
    date: '10 Sep 2025',
    image: '/assets/blog/recent-blockchain-life-1.jpg'
  },
  {
    slug: 'blackwell-architecture-explained',
    tag: 'Blog', tagColor: '#3f7fff',
    title: 'Blockchain Life 2025: Uminers is the Mining Company of the Year',
    date: '10 Sep 2025',
    image: '/assets/blog/recent-blockchain-life-2.jpg'
  },
  {
    slug: 'less-than-1-million-bitcoins-left-to-mine',
    tag: null,
    title: 'How I built my company — Batyr Hydyrov',
    date: '10 Sep 2025',
    image: '/assets/blog/recent-founder-portrait.jpg'
  }
]

// Academy data (categories/levels/formats/courses) lives in @/data/academy —
// moved out 24 Aug 2026 when the placeholder 6-course set was replaced with
// 15 real articles across the 5 tracks. formatDate stays here: it is shared
// by blog posts and academy courses, since ArticleView.vue renders both
// through the same template (Figma 2064:2235).
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
