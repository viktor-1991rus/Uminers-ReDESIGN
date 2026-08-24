<script setup>
/**
 * A product, full screen.
 *
 * The side drawer read as a footnote to the grid; a machine that costs as much
 * as this one is the page while you are looking at it. Two columns: the render
 * on the left holding its own space, the numbers on the right. No form here —
 * the desk is one click away and a lead form under every product turns reading
 * into filling in.
 */
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  product: { type: Object, default: null },
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

function onKey(e) { if (e.key === 'Escape') emit('close') }

const copied = ref(false)
function copySku() {
  const sku = props.product?.slug?.toUpperCase().replace(/_/g, '-')
  if (!sku) return
  navigator.clipboard?.writeText(sku)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1400)
}

watch(() => props.open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
  v ? addEventListener('keydown', onKey) : removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <section
    class="pscreen" :class="{ 'is-open': open }"
    role="dialog" aria-modal="true"
    :aria-label="product ? `${product.brand} ${product.name}` : 'Product'"
  >
    <template v-if="product">
      <header class="pscreen__bar">
        <p class="label">{{ product.brand }} · {{ product.name }}</p>
        <button class="btn btn--transparent btn--s" type="button" @click="emit('close')">
          <span>Close</span>
        </button>
      </header>

      <div class="pscreen__body">
        <figure class="pscreen__media" :class="{ 'is-dark': product.dark }">
          <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy">
          <p v-else class="label label--faded">Render on request</p>
        </figure>

        <div class="pscreen__main">
          <p class="label label--faded">{{ product.brand }}</p>
          <h2 class="type-xl pscreen__name">{{ product.name }}</h2>

          <ul class="pscreen__points">
            <li v-for="(line, i) in product.card" :key="i" class="body">{{ line }}</li>
          </ul>

          <dl class="pscreen__specs">
            <template v-for="(v, k) in product.specs" :key="k">
              <dt>{{ k }}</dt>
              <dd>{{ v }}</dd>
            </template>
          </dl>
        </div>

        <aside class="pscreen__rail">
          <p v-if="product.price" class="pscreen__price">
            ${{ product.price.toLocaleString('en-US') }}
            <span class="label label--faded pscreen__priceUnit">per unit</span>
          </p>

          <a class="btn btn--primary pscreen__quote" href="#desk" @click="emit('close')">
            <span>{{ product.price ? 'Request quote' : 'Get a quote' }}</span>
          </a>

          <div class="pscreen__railRule" />
          <p class="pscreen__stockStatus">
            {{ product.price ? 'In stock' : 'To order' }}
          </p>
          <p class="label label--faded">
            {{ product.price ? 'Ships in 3–5 days' : 'Lead time 4–6 weeks' }}
          </p>

          <div class="pscreen__railRule" />
          <button class="pscreen__sku" type="button" @click="copySku">
            <span class="label label--faded">SKU</span>
            <span class="pscreen__skuValue">{{ product.slug.toUpperCase() }}</span>
            <span class="pscreen__skuCopy">{{ copied ? 'Copied' : 'Copy' }}</span>
          </button>

          <a class="btn btn--transparent pscreen__mail" href="mailto:info@uminers.com">
            <span>info@uminers.com</span>
          </a>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.pscreen{
  position: fixed; inset: 0; z-index: 10000;
  background: var(--white); color: var(--ink);
  --hairline: rgba(25,24,23,.16); --faded: rgba(25,24,23,.52);
  --elevated: var(--paper);
  display: grid; grid-template-rows: auto minmax(0, 1fr);
  opacity: 0; visibility: hidden;
  transform: translate3d(0, 2vh, 0);
  transition: opacity .4s ease, transform .55s cubic-bezier(.16,.84,.24,1),
              visibility 0s linear .55s;
}
.pscreen.is-open{
  opacity: 1; visibility: visible; transform: none;
  transition-delay: 0s, 0s, 0s;
}

.pscreen__bar{
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--spacingM);
  padding: var(--spacingM) var(--spacingL);
  border-bottom: 1px solid var(--hairline);
}
.pscreen__bar .label{ margin: 0; color: var(--faded) }

.pscreen__body{
  display: grid; grid-template-columns: minmax(0,520px) minmax(0,1fr) 320px;
  gap: var(--spacingXL);
  overflow-y: auto;
}

.pscreen__media{
  margin: 0; display: grid; place-items: center;
  background: var(--elevated);
  padding: var(--spacingL);
  border-right: 1px solid var(--hairline);
}
.pscreen__media img{
  width: 100%; max-height: 76vh; object-fit: contain;
  mix-blend-mode: multiply;
}
/* dark product renders are cut out on black, so multiply would sink them */
.pscreen__media.is-dark{ background: var(--black) }
.pscreen__media.is-dark img{ mix-blend-mode: normal }

.pscreen__main{
  padding: var(--spacingXXL) 0;
  align-content: start;
  display: grid; gap: var(--spacingS);
  min-width: 0;
}
.pscreen__name{ margin: 0 }

.pscreen__points{
  list-style: none; margin: var(--spacingM) 0 0; padding: 0;
  display: grid; gap: var(--spacingXS);
}
.pscreen__points li{ margin: 0 }

.pscreen__specs{
  margin: var(--spacingL) 0 0; display: grid;
  grid-template-columns: 88px minmax(0,1fr); row-gap: var(--spacingS);
}
.pscreen__specs dt{
  font-family: var(--fontMono); font-size: 10px; text-transform: uppercase;
  letter-spacing: .06em; color: var(--faded); align-self: start; padding-top: 2px;
}
.pscreen__specs dd{ margin: 0; font-size: 14px; line-height: 1.4 }

/* the quote rail — sticky so the CTA stays reachable while specs scroll */
.pscreen__rail{
  position: sticky; top: var(--spacingXXL); align-self: start;
  padding: var(--spacingXXL) var(--spacingXL) var(--spacingXL) 0;
  display: grid; gap: var(--spacingS);
}
.pscreen__price{
  margin: 0; font-size: var(--headingXL); font-weight: var(--weightMid);
  letter-spacing: var(--letterSpacingTight);
  font-variant-numeric: tabular-nums;
  display: grid; gap: 2px;
}
.pscreen__priceUnit{ font-weight: var(--weightBody) }
.pscreen__quote{ width: 100%; height: 48px; margin-top: var(--spacingXS) }
.pscreen__railRule{ height: 1px; background: var(--hairline); margin-top: var(--spacingXS) }
.pscreen__stockStatus{ margin: 0; font-weight: var(--weightBold); font-size: 14px }
.pscreen__sku{
  all: unset; cursor: pointer; box-sizing: border-box; width: 100%;
  display: flex; align-items: center; gap: 8px;
}
.pscreen__skuValue{ font-family: var(--fontMono); font-size: 13px; flex: 1 }
.pscreen__skuCopy{ font-family: var(--fontMono); font-size: 11px; color: var(--faded) }
.pscreen__sku:hover .pscreen__skuCopy{ color: var(--accent) }
.pscreen__mail{ width: 100%; margin-top: var(--spacingXS) }

@media (max-width: 1100px){
  .pscreen__body{ grid-template-columns: minmax(0,440px) minmax(0,1fr); }
  .pscreen__rail{
    grid-column: 1 / -1; position: static; padding: 0 0 var(--spacingL);
    border-bottom: 1px solid var(--hairline);
  }
}
@media (max-width: 900px){
  .pscreen__body{ grid-template-columns: 1fr; gap: 0 }
  .pscreen__media{ border-right: 0; border-bottom: 1px solid var(--hairline); padding: var(--spacingL) }
  .pscreen__media img{ max-height: 38vh }
  .pscreen__main{ padding: var(--spacingL) }
  .pscreen__rail{ padding: var(--spacingL) }
}
</style>
