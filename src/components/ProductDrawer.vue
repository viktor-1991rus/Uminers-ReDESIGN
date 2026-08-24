<script setup>
import { watch } from 'vue'
import LeadForm from './LeadForm.vue'

const props = defineProps({
  product: { type: Object, default: null },
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

watch(() => props.open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

function onKey(e) { if (e.key === 'Escape') emit('close') }
</script>

<template>
  <div class="drawer-overlay" :class="{ 'is-on': open }" aria-hidden="true" @click="emit('close')" />

  <aside class="drawer" :class="{ 'is-open': open }" role="dialog" aria-modal="true"
         :aria-label="product ? `${product.brand} ${product.name}` : 'Product'"
         @keydown="onKey">
    <template v-if="product">
      <button class="btn drawer__close" type="button" @click="emit('close')">
        <span>Close</span>
      </button>

      <p class="label label--faded">{{ product.brand }}</p>
      <h3 class="type-l" style="margin-top: 6px">{{ product.name }}</h3>

      <div class="drawer__imgbox">
        <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy">
        <p v-else class="label label--faded">Render on request</p>
      </div>

      <table class="spec-table">
        <tbody>
          <tr v-for="(v, k) in product.specs" :key="k">
            <td>{{ k }}</td>
            <td>{{ v }}</td>
          </tr>
          <tr>
            <td>Price</td>
            <td>{{ product.price ? `$${product.price.toLocaleString('en-US')}` : 'On request — quoted with freight and lead time' }}</td>
          </tr>
        </tbody>
      </table>

      <LeadForm :product="product" />
    </template>
  </aside>
</template>
