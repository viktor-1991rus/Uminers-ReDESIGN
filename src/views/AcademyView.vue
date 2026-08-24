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
import { ACADEMY_CATEGORIES, ACADEMY_LEVELS, ACADEMY_FORMATS, ACADEMY_COURSES } from '@/data/academy'
import { venomMark, venomLayout, MARKS } from '@/lib/venomBus'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sourcing desk', href: '#desk' }
]

/* ── filters: category, format, difficulty, duration ── */
const category = ref('All')
const format = ref('All')
const level = ref('All')
const maxDuration = ref(40)
const PAGE = 6
const shownCount = ref(PAGE)
const PAGE_NUMBERS = 6
const page = ref(1)

function resetPaging() { shownCount.value = PAGE; page.value = 1 }
function pickCategory(c) { category.value = c; resetPaging() }
function pickFormat(f) { format.value = f === format.value ? 'All' : f; resetPaging() }
function pickLevel(l) { level.value = l === level.value ? 'All' : l; resetPaging() }
function clearAll() { category.value = 'All'; format.value = 'All'; level.value = 'All'; maxDuration.value = 40; resetPaging() }

const filtered = computed(() => ACADEMY_COURSES.filter(c =>
  (category.value === 'All' || c.category === category.value) &&
  (format.value === 'All' || c.format === format.value) &&
  (level.value === 'All' || c.level === level.value) &&
  c.durationMins <= maxDuration.value
))
const shown = computed(() => filtered.value.slice(0, shownCount.value))

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
    <!-- ═══ half-height cover ══════════════════════════════════════════════ -->
    <ThemeSection theme="black" venom flush>
      <div class="wrapper hero hero--half">
        <ViewFinder position="top" />
        <div class="hero__body">
          <MicroLabel text="Uminers Academy" block />
          <SplitText tag="h1" class="hero__title--light">
            <span class="line">Knowledge base &amp;</span>
            <span class="line">engineering insights.</span>
          </SplitText>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ listing ═══════════════════════════════════════════════════════ -->
    <ThemeSection theme="black" id="grid" class="section-tight">
      <div class="wrapper">
        <div class="ticks" aria-hidden="true" />
        <MicroLabel text="Courses" block />

        <nav class="catnav" aria-label="Category">
          <button
            class="catnav__pill" :class="{ 'is-on': category === 'All' }"
            type="button" @click="pickCategory('All')"
          >All</button>
          <button
            v-for="c in ACADEMY_CATEGORIES" :key="c"
            class="catnav__pill" :class="{ 'is-on': category === c }"
            type="button" @click="pickCategory(c)"
          >{{ c }}</button>
        </nav>

        <div class="coursefilters">
          <div class="coursefilters__group">
            <p class="coursefilters__label label">Format</p>
            <div class="coursefilters__row">
              <button
                v-for="f in ACADEMY_FORMATS" :key="f"
                class="formatpill" :class="{ 'is-on': format === f }"
                type="button" @click="pickFormat(f)"
              >{{ f }}</button>
            </div>
          </div>
          <div class="coursefilters__group">
            <p class="coursefilters__label label">Difficulty</p>
            <div class="coursefilters__row">
              <button
                v-for="l in ACADEMY_LEVELS" :key="l"
                class="difficultypill" :class="[`difficultypill--${l}`, { 'is-on': level === l }]"
                type="button" @click="pickLevel(l)"
              ><span class="difficultypill__dot" />{{ l }}</button>
            </div>
          </div>
          <div class="coursefilters__group">
            <p class="coursefilters__label label">Duration</p>
            <div class="durationrange">
              <input v-model.number="maxDuration" type="range" min="5" max="40" step="1" @input="resetPaging">
              <span class="durationrange__val">0–{{ maxDuration }}m</span>
            </div>
          </div>
          <button class="btn btn--transparent" type="button" style="align-self: center" @click="clearAll">
            <span>Clear all</span>
          </button>
        </div>

        <p class="label" style="margin-top: var(--spacingL); color: var(--faded)">{{ filtered.length }} results</p>

        <div class="postgrid">
          <RouterLink
            v-for="c in shown" :key="c.slug" :to="`/blog/${c.slug}`"
            class="postcard coursecard"
          >
            <div class="postcard__imgbox">
              <img :src="c.pill" :alt="c.title" loading="lazy">
            </div>
            <p class="coursecard__level" :class="`coursecard__level--${c.level}`">{{ c.level }}</p>
            <h3 class="postcard__title">{{ c.title }}</h3>
            <p class="body" style="margin-top: var(--spacingXS); color: var(--faded)">{{ c.excerpt }}</p>
            <span class="postcard__more">{{ c.format === 'Listen' ? 'Listen' : 'Read' }} <em style="font-style:normal">&rarr;</em></span>
          </RouterLink>
        </div>

        <div v-if="shown.length < filtered.length" class="loadmore">
          <button class="btn btn--transparent" type="button" @click="shownCount += PAGE">
            <span>Load more</span>
          </button>
          <span class="label">{{ shown.length }} of {{ filtered.length }}</span>
        </div>

        <nav class="pager" aria-label="Pagination">
          <button
            v-for="n in PAGE_NUMBERS" :key="n" class="pager__num"
            :class="{ 'is-on': page === n }" type="button" @click="page = n"
          >{{ n }}</button>
        </nav>
      </div>
    </ThemeSection>

    <!-- ═══ consultation ══════════════════════════════════════════════════ -->
    <ThemeSection theme="light" id="desk">
      <div class="wrapper" style="position: relative">
        <GridMarks corners="tl br" />
        <MicroLabel text="Request a consultation" block />
        <SplitText tag="h2" class="type-xl">Not sure where to start?</SplitText>
        <SplitText tag="p" class="body">
          Tell the desk what you already run and what you are trying to learn —
          they point you at the right level and, where it helps, a specialist.
        </SplitText>
        <div style="max-width: 560px">
          <LeadForm compact />
        </div>
      </div>
    </ThemeSection>
  </main>

  <SiteFooter :links="footerLinks" />
</template>
