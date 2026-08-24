<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import DeckMenu from '@/components/DeckMenu.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ThemeSection from '@/components/ThemeSection.vue'
import MicroLabel from '@/components/MicroLabel.vue'
import SplitText from '@/components/SplitText.vue'
import GridMarks from '@/components/GridMarks.vue'
import LeadForm from '@/components/LeadForm.vue'
import { BLOG_POSTS, tagFor, formatDate } from '@/data/blog'
import { ACADEMY_COURSES, ACADEMY_CATEGORIES } from '@/data/academy'
import { venomMark, venomLayout, MARKS } from '@/lib/venomBus'

const route = useRoute()
const router = useRouter()

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/catalogue' },
  { label: 'Blog', href: '/blog' },
  { label: 'Uminers Academy', href: '/academy' }
]

/* One combined, ordered list — a blog post and an academy course are both
   just "an article" once you are on its detail page (Figma 2064:2235 uses
   the same template for both), so prev/next and lookup work across both. */
const ALL = [
  ...BLOG_POSTS.map(p => ({ kind: 'blog', ...p })),
  ...ACADEMY_COURSES.map(c => ({ kind: 'academy', ...c }))
]

const index = computed(() => ALL.findIndex(a => a.slug === route.params.slug))
const article = computed(() => ALL[index.value] ?? null)
const prev = computed(() => ALL[(index.value - 1 + ALL.length) % ALL.length])
const next = computed(() => ALL[(index.value + 1) % ALL.length])

const related = computed(() =>
  ACADEMY_COURSES.filter(c => c.slug !== route.params.slug).slice(0, 3)
)

const heroImage = computed(() => article.value?.pill || article.value?.image)
const level = computed(() => article.value?.level || 'Beginner')
const readMins = computed(() => article.value?.readMins || article.value?.durationMins || 3)
const tagLabel = computed(() => article.value?.kind === 'academy'
  ? article.value.category
  : tagFor(article.value?.category).label)
const dateLabel = computed(() => article.value?.date ? formatDate(article.value.date) : '10 Sep 2025')

/* Real facts about Uminers are never invented here. Academy courses (and any
   blog post that supplies its own `body`) carry full, sourced paragraphs —
   see src/data/academy.js. Anything without one falls back to its excerpt
   plus generic framing rather than fabricated detail. */
const bodyParagraphs = computed(() => {
  const a = article.value
  if (!a) return []
  if (a.body?.length) return a.body
  return [
    a.excerpt,
    'This overview is part of the Uminers knowledge base — written for operators sourcing hardware, ' +
      'planning site infrastructure, or simply trying to understand where the mining market is headed next.',
    'For a deeper walkthrough, or to size this against a specific site or budget, the sourcing desk below ' +
      'is the fastest way to get a specialist on the specifics.'
  ]
})

function catHref(cat) { return `/academy?category=${encodeURIComponent(cat)}` }

const COVER_VENOM = { fit: 0.42, offsetX: -0.30, offsetY: -0.25, settleOverride: 0.85 }
function applyVenom() { venomLayout(COVER_VENOM); venomMark(MARKS.bull) }

onMounted(applyVenom)
watch(() => route.params.slug, () => {
  applyVenom()
  window.scrollTo({ top: 0 })
  if (!article.value) router.replace('/blog')
})
onBeforeUnmount(() => {})
</script>

<template>
  <DeckMenu />

  <main v-if="article">
    <ThemeSection theme="black" venom flush class="section-tight">
      <div class="wrapper" style="padding-top: 96px">
        <p class="crumbs">
          <RouterLink to="/">Main</RouterLink>
          <span class="crumbs__sep">/</span>
          <RouterLink to="/blog">Blog</RouterLink>
          <span class="crumbs__sep">/</span>
          <span>#{{ tagLabel }}</span>
          <span class="crumbs__sep">/</span>
          <span class="crumbs__current">{{ article.title }}</span>
        </p>

        <div class="article-layout">
          <aside class="article-sidebar">
            <a
              v-for="cat in ACADEMY_CATEGORIES" :key="cat"
              :href="catHref(cat)" :class="{ 'is-on': article.category === cat }"
            >{{ cat }}</a>
          </aside>

          <div>
            <div class="article-hero">
              <img :src="heroImage" :alt="article.title" loading="lazy">
            </div>

            <div class="article-meta">
              <span class="article-meta__level">#{{ level }}</span>
              <span>{{ readMins }} minutes reading</span>
              <span>{{ dateLabel }}</span>
            </div>
            <SplitText tag="h1" class="article-title">{{ article.title }}</SplitText>

            <div class="article-body">
              <p v-for="(p, i) in bodyParagraphs" :key="i" class="body">{{ p }}</p>
            </div>

            <div class="article-pagenav">
              <RouterLink :to="`/blog/${prev.slug}`">
                <span class="article-pagenav__eyebrow">&larr; Previous article</span>
                <span class="article-pagenav__title">{{ prev.title }}</span>
              </RouterLink>
              <RouterLink :to="`/blog/${next.slug}`">
                <span class="article-pagenav__eyebrow">Next article &rarr;</span>
                <span class="article-pagenav__title">{{ next.title }}</span>
              </RouterLink>
            </div>

            <div class="sharerow">
              <p class="label" style="font-weight: 700">Share</p>
              <img src="/assets/blog/social-icons.svg" alt="Share on Instagram, Facebook, Telegram, LinkedIn, X" loading="lazy">
            </div>
          </div>
        </div>
      </div>
    </ThemeSection>

    <!-- ═══ related resources ═════════════════════════════════════════════ -->
    <ThemeSection theme="black">
      <div class="wrapper">
        <MicroLabel text="Related resources" block />
        <div class="postgrid">
          <RouterLink v-for="c in related" :key="c.slug" :to="`/blog/${c.slug}`" class="postcard coursecard">
            <div class="postcard__imgbox">
              <img :src="c.pill" :alt="c.title" loading="lazy">
            </div>
            <p class="coursecard__level" :class="`coursecard__level--${c.level}`">{{ c.level }}</p>
            <h3 class="postcard__title">{{ c.title }}</h3>
            <p class="body" style="margin-top: var(--spacingXS); color: var(--faded)">{{ c.excerpt }}</p>
            <span class="postcard__more">Read <em style="font-style:normal">&rarr;</em></span>
          </RouterLink>
        </div>
        <div class="dots" aria-hidden="true">
          <span v-for="n in 5" :key="n" :class="{ 'is-on': n === 3 }" />
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
