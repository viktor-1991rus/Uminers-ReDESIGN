<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DeckMenu from '@/components/DeckMenu.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ThemeSection from '@/components/ThemeSection.vue'
import ViewFinder from '@/components/ViewFinder.vue'
import MicroLabel from '@/components/MicroLabel.vue'
import SplitText from '@/components/SplitText.vue'
import GridMarks from '@/components/GridMarks.vue'
import LeadForm from '@/components/LeadForm.vue'
import { BLOG_CATEGORIES, BLOG_POSTS, RECENT_ARTICLES, tagFor, formatDate } from '@/data/blog'
import { venomMark, venomLayout, MARKS } from '@/lib/venomBus'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Uminers Academy', href: '/academy' },
  { label: 'Sourcing desk', href: '#desk' }
]

/* ── category + search filter ── */
const active = ref('All')
const search = ref('')
const PAGE = 6
const shownCount = ref(PAGE)
function pick(cat) { active.value = cat; shownCount.value = PAGE }

const filtered = computed(() => BLOG_POSTS.filter(p => {
  const inCat = active.value === 'All' || tagFor(p.category).label === active.value
  const inSearch = !search.value.trim() ||
    p.title.toLowerCase().includes(search.value.trim().toLowerCase())
  return inCat && inSearch
}))
const page = computed(() => filtered.value.slice(0, shownCount.value))

const COVER_VENOM = { fit: 0.42, offsetX: -0.30, offsetY: -0.25, settleOverride: 0.85 }

let fadeTicking = false
function coverFade() {
  if (fadeTicking) return
  fadeTicking = true
  requestAnimationFrame(() => {
    fadeTicking = false
    const end = document.getElementById('grid')?.offsetTop || window.innerHeight
    const p = Math.min(1, Math.max(0, window.scrollY / (end * 0.72)))
    venomLayout({ ...COVER_VENOM, opacity: 1 - p })
  })
}

onMounted(() => {
  venomLayout(COVER_VENOM)
  venomMark(MARKS.bull)
  addEventListener('scroll', coverFade, { passive: true })
  coverFade()
})
onBeforeUnmount(() => removeEventListener('scroll', coverFade))
</script>

<template>
  <DeckMenu />

  <main>
    <!-- ═══ Uminers Journal hero + Recent Articles ═══════════════════════ -->
    <ThemeSection theme="black" venom flush>
      <div class="wrapper hero hero--half">
        <ViewFinder position="top" />
        <div class="hero__body journal-hero">
          <div class="journal-hero__mark">
            <img src="/assets/logo/uminers-academy-mark.png" alt="Uminers Academy" loading="lazy">
          </div>
          <MicroLabel text="Blog" block />
          <SplitText tag="h1" class="hero__title--light">
            <span class="line">Uminers Journal</span>
          </SplitText>
          <p class="journal-hero__sub">Mining news and events</p>

          <div class="recent-rail">
            <p class="label recent-rail__head">Recent Articles</p>
            <RouterLink
              v-for="r in RECENT_ARTICLES" :key="r.title + r.date"
              :to="`/blog/${r.slug}`" class="recent-rail__item"
            >
              <div class="recent-rail__thumb"><img :src="r.image" :alt="r.title" loading="lazy"></div>
              <div class="recent-rail__body">
                <p class="recent-rail__meta">
                  <span v-if="r.tag">#{{ r.tag }}</span>
                  <span>{{ r.date }}</span>
                </p>
                <p class="recent-rail__title">{{ r.title }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ listing ═══════════════════════════════════════════════════════ -->
    <ThemeSection theme="black" id="grid" class="section-tight">
      <div class="wrapper">
        <div class="ticks" aria-hidden="true" />
        <MicroLabel text="Articles" block />

        <div class="catnav-row">
          <nav class="catnav" aria-label="Categories">
            <button
              v-for="c in BLOG_CATEGORIES" :key="c"
              class="catnav__pill" :class="{ 'is-on': active === c }"
              type="button" @click="pick(c)"
            >{{ c }}</button>
          </nav>
          <div class="searchbar">
            <input v-model="search" type="search" placeholder="Start your search">
            <button class="searchbar__go" type="button" aria-label="Search">→</button>
          </div>
        </div>

        <div class="postgrid">
          <RouterLink v-for="p in page" :key="p.slug" :to="`/blog/${p.slug}`" class="postcard">
            <div class="postcard__imgbox">
              <img :src="p.image" :alt="p.title" loading="lazy">
            </div>
            <p class="postcard__meta label">
              <span class="chip" :style="{ color: tagFor(p.category).color }">#{{ tagFor(p.category).label }}</span>
              <span>{{ formatDate(p.date) }}</span>
              <span>· {{ p.readMins }} min reading</span>
            </p>
            <h3 class="postcard__title">{{ p.title }}</h3>
            <p class="body" style="margin-top: var(--spacingXS); color: var(--faded)">{{ p.excerpt }}</p>
            <span class="postcard__more">Read more <em style="font-style:normal">&rarr;</em></span>
          </RouterLink>
        </div>

        <div v-if="page.length < filtered.length" class="loadmore">
          <button class="btn btn--transparent" type="button" @click="shownCount += PAGE">
            <span>Load more</span>
          </button>
          <span class="label">{{ page.length }} of {{ filtered.length }}</span>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ consultation ══════════════════════════════════════════════════ -->
    <ThemeSection theme="light" id="desk">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tl br" />
        <MicroLabel text="Request a consultation" block />
        <SplitText tag="h2" class="type-xl">Have a question for a specialist?</SplitText>
        <SplitText tag="p" class="body">
          Leave a note on what you are trying to build or troubleshoot, and the
          desk answers with a plan and a lead time — not a sales script.
        </SplitText>
        <div style="max-width: 560px">
          <LeadForm compact />
        </div>
      </div>
    </ThemeSection>
  </main>

  <SiteFooter :links="footerLinks" />
</template>
