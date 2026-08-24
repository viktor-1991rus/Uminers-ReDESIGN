<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import DeckMenu from '@/components/DeckMenu.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ThemeSection from '@/components/ThemeSection.vue'
import ViewFinder from '@/components/ViewFinder.vue'
import MicroLabel from '@/components/MicroLabel.vue'
import SplitText from '@/components/SplitText.vue'
import GridMarks from '@/components/GridMarks.vue'
import LeadForm from '@/components/LeadForm.vue'
import ProductScreen from '@/components/ProductScreen.vue'
import { CATEGORIES, FACETS, PRODUCTS, SPEC_KEYS } from '@/data/catalogue'
import { venomMark, venomLayout, MARKS } from '@/lib/venomBus'

// the four-row spec dictionary for a category, resolved against what this
// particular product actually has — a row is dropped, never invented, when
// none of its candidate fields exist on that product
function specRows(p) {
  const dict = SPEC_KEYS[p.category] ?? []
  return dict
    .map(({ key, label, field }) => {
      const f = field.find(name => p.specs?.[name] != null)
      return f ? { key, label, value: p.specs[f] } : null
    })
    .filter(Boolean)
}

const route = useRoute()

const navLinks = [
  { label: 'Home', route: '/' },
  { label: 'Categories', href: '#grid', half: true },
  { label: 'Sourcing desk', href: '#desk', half: true }
]
const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '#grid' },
  { label: 'Blog', href: '/blog' },
  { label: 'Uminers Academy', href: '/academy' },
  { label: 'Sourcing desk', href: '#desk' }
]

/* ── category ── */
const active = ref('ai')
const activeCat = computed(() => CATEGORIES.find(c => c.key === active.value))

function pick(key, scroll = false) {
  active.value = key
  shownCount.value = PAGE
  clearFilters()
  // the substance re-assembles as the category's product
  venomMark(MARKS[CATEGORIES.find(c => c.key === key)?.mark ?? 'bull'])
  if (scroll) document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })
}

/* ── filters ── */
const picked = reactive({})           // facetKey -> Set of values
function clearFilters() { for (const k of Object.keys(picked)) delete picked[k] }
function toggle(facet, value) {
  const set = picked[facet] ?? (picked[facet] = new Set())
  set.has(value) ? set.delete(value) : set.add(value)
  if (!set.size) delete picked[facet]
}

const inCategory = computed(() => PRODUCTS.filter(p => p.category === active.value))

const facets = computed(() =>
  (FACETS[active.value] ?? []).map(key => ({
    key,
    values: [...new Set(inCategory.value.map(p => p[key]).filter(Boolean))]
  })).filter(f => f.values.length > 1)
)

const PAGE = 24
const shownCount = ref(PAGE)
const sort = ref('featured')
const shown = computed(() => {
  let list = inCategory.value.filter(p =>
    Object.entries(picked).every(([k, set]) => set.has(p[k]))
  )
  if (sort.value === 'price-asc')  list = [...list].sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12))
  if (sort.value === 'price-desc') list = [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
  return list
})
const page = computed(() => shown.value.slice(0, shownCount.value))

/* ── drawer ── */
const current = ref(null)
const drawerOpen = ref(false)
function openProduct(p) { current.value = p; drawerOpen.value = true }
function closeDrawer() { drawerOpen.value = false }

/* The cover is a band, not a screen: the mark reads as a subject over the
   heading, not as a wall behind it.

   `fit` is the half-width of the sampling window, so it reads inverted — a
   bigger fit is a WIDER window and a SMALLER figure. It was 0.19, which is the
   tightest crop on the site and put a wall of substance across the top of the
   page; the comment next to it claimed "small" because the number is small,
   which is exactly backwards. At 0.42 the mark sits in the corner at about the
   size the heading can carry. */
const COVER_VENOM = {
  fit: 0.42, offsetX: -0.30, offsetY: -0.25, settleOverride: 0.85
}

/* ── the cover hands the page over as it leaves ──
   The director's zone handling is binary: the substance is on inside a venom
   zone and off outside it, crossfaded by #venom.is-on over 0.9s. On a page
   whose first screen IS the zone, that reads as the top of the page staying
   dark through the whole scroll and then dropping in one step. This tracks the
   scroll instead, so the substance thins out continuously and is gone by the
   time the grid reaches the top. */
let fadeTicking = false
function coverFade() {
  if (fadeTicking) return
  fadeTicking = true
  requestAnimationFrame(() => {
    fadeTicking = false
    const end = document.getElementById('grid')?.offsetTop || window.innerHeight
    // fully gone a little before the grid lands, not exactly at it — the
    // substance should have finished leaving before the products arrive
    const p = Math.min(1, Math.max(0, window.scrollY / (end * 0.72)))
    venomLayout({ ...COVER_VENOM, opacity: 1 - p })
  })
}

onMounted(() => {
  venomLayout(COVER_VENOM)
  addEventListener('scroll', coverFade, { passive: true })
  coverFade()   // restore the right opacity when the page loads part-scrolled

  // arriving from the home tiles: #asic, #ai, #gpu, #servers, #containers, #power
  const hash = (route.hash || '').replace('#', '').replace('servers', 'server').replace('containers', 'container')
  const found = CATEGORIES.find(c => c.key === hash)
  pick(found ? found.key : activeCat.value.key)
})

onBeforeUnmount(() => removeEventListener('scroll', coverFade))
</script>

<template>
  <DeckMenu />

  <main>
    <!-- ═══ half-height cover — the substance holds the category's product ═ -->
    <ThemeSection theme="light" venom flush>
      <div class="wrapper hero hero--half">
        <ViewFinder position="top" />
        <div class="hero__body">
          <MicroLabel text="Catalogue" block />
          <SplitText tag="h1" class="hero__title--light">
            <span class="line">Everything that</span>
            <span class="line">runs here.</span>
          </SplitText>

        </div>
      </div>
    </ThemeSection>

    <!-- ═══ the grid — products above the fold ════════════════════════════ -->
    <ThemeSection theme="white" id="grid" class="section-tight">
      <div class="wrapper">
        <div class="ticks" aria-hidden="true" />
        <MicroLabel :text="activeCat.label" block />

        <div class="catalog">
          <!-- filters carry a rule, not a fill: a filled panel reads as a slab
               dropped on the paper -->
          <aside class="sidefilter">
            <p class="label sidefilter__head">Categories</p>
            <ul class="sidefilter__cats">
              <li v-for="c in CATEGORIES" :key="c.key">
                <button
                  class="sidefilter__cat" :class="{ 'is-on': active === c.key }"
                  type="button" @click="pick(c.key)"
                >{{ c.label }}</button>
              </li>
            </ul>

            <template v-if="facets.length">
              <div v-for="f in facets" :key="f.key" class="sidefilter__group">
                <p class="label sidefilter__head">{{ f.key }}</p>
                <ul class="sidefilter__opts">
                  <li v-for="v in f.values" :key="v">
                    <button
                      class="sidefilter__opt" :class="{ 'is-on': picked[f.key]?.has(v) }"
                      type="button" @click="toggle(f.key, v)"
                    >
                      <span class="sidefilter__tick" aria-hidden="true" />
                      <span class="sidefilter__optlabel">{{ v }}</span>
                      <span class="sidefilter__optcount">{{ inCategory.filter(p => p[f.key] === v).length }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </aside>

          <div class="catalog__main">
            <div class="toolbar">
              <span class="label toolbar__count">{{ shown.length }} items</span>
              <select v-model="sort" class="filters__sort" aria-label="Sort">
                <option value="featured">Featured</option>
                <option value="price-asc">Price, low first</option>
                <option value="price-desc">Price, high first</option>
              </select>
            </div>

        <!-- the whole tile opens the drawer: in a grid the plate is the biggest
             target on the card and clicking a product photo has to do what
             clicking its name does -->
        <div class="plist">
          <article v-for="p in page" :key="p.slug" class="pcard" @click="openProduct(p)">
            <!-- `dark` describes the ASSET, so it only applies when there is one:
                 on an empty plate it just hides the brand fallback in its own
                 background -->
            <div class="pcard__imgbox" :class="{ 'pcard__imgbox--dark': p.dark && p.image }">
              <img
                v-if="p.image" :src="p.image" :alt="p.name" loading="lazy"
                :class="{ 'is-cut': p.image.endsWith('.png') }"
              >
              <p v-else class="label label--faded">{{ p.brand }}</p>
            </div>

            <p class="label pcard__status">
              {{ p.brand }} <span class="pcard__dot" :class="{ 'is-stock': p.price }" />
              {{ p.price ? 'IN STOCK' : 'TO ORDER' }}
            </p>

            <div class="pcard__body">
              <p class="pcard__name">{{ p.name }}</p>
              <dl class="pcard__specs">
                <!-- three rows, not four: the fourth is what pushes a tile past
                     the height where a row of them still scans as one band -->
                <template v-for="row in specRows(p).slice(0, 3)" :key="row.key">
                  <dt>{{ row.label }}</dt>
                  <dd>{{ row.value }}</dd>
                </template>
              </dl>
            </div>

            <div>
              <div class="pcard__rule" />
              <div class="pcard__foot">
                <p class="pcard__price" :class="{ 'pcard__price--none': !p.price }">
                  {{ p.price ? '$' + p.price.toLocaleString('en-US') : 'On request' }}
                </p>
                <button class="btn btn--transparent btn--s" type="button" @click.stop="openProduct(p)">
                  <span>Specs</span>
                </button>
              </div>
            </div>
          </article>
        </div>

            <div v-if="page.length < shown.length" class="loadmore">
              <button class="btn btn--transparent" type="button" @click="shownCount += PAGE">
                <span>Load more</span>
              </button>
              <span class="label">{{ page.length }} of {{ shown.length }}</span>
            </div>
          </div>
        </div>

        <p v-if="active === 'asic'" class="label label--faded" style="margin-top: var(--spacingL)">
          ASIC prices in USDT, as listed on uminers.com · freight and lead time quoted per order
        </p>
      </div>
    </ThemeSection>

    <!-- ═══ sourcing desk ═════════════════════════════════════════════════ -->
    <ThemeSection theme="light" id="desk">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tl br" />
        <MicroLabel text="Sourcing desk" block />
        <SplitText tag="h2" class="type-xl">Not on the list. Still gets quoted.</SplitText>
        <SplitText tag="p" class="body">
          The catalogue is the shortlist, not the limit. Say what should run
          and where, and the desk prices it against machines it has already moved.
        </SplitText>
        <div style="max-width: 560px">
          <LeadForm />
        </div>
      </div>
    </ThemeSection>
  </main>

  <SiteFooter :links="footerLinks" />

  <ProductScreen :product="current" :open="drawerOpen" @close="closeDrawer" />
</template>
