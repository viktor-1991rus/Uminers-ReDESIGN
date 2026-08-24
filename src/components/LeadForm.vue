<script setup>
import { ref, reactive } from 'vue'

/**
 * One lead form for the whole catalogue. With a product it is a quote
 * request; without one it is the open sourcing-desk form. Submission
 * composes a mail to the sales desk — no backend yet — and confirms inline.
 */
const props = defineProps({
  product: { type: Object, default: null },
  compact: { type: Boolean, default: false }
})

const sent = ref(false)
const f = reactive({ name: '', company: '', email: '', qty: '', country: '', note: '' })

function submit() {
  const subject = props.product
    ? `Quote request — ${props.product.brand} ${props.product.name}`
    : 'Sourcing request'
  const lines = [
    props.product ? `Product: ${props.product.brand} ${props.product.name}` : null,
    `Name: ${f.name}`,
    f.company ? `Company: ${f.company}` : null,
    `Email: ${f.email}`,
    f.qty ? `Quantity: ${f.qty}` : null,
    f.country ? `Destination: ${f.country}` : null,
    f.note ? `\n${f.note}` : null
  ].filter(Boolean)
  location.href = `mailto:info@uminers.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
  sent.value = true
}
</script>

<template>
  <div v-if="sent" class="form__ok">
    <p class="label">Request sent</p>
    <p class="body">A quote and a lead time come back inside a week. If the mail window did not open, write to info@uminers.com directly.</p>
  </div>

  <form v-else class="form" @submit.prevent="submit">
    <div class="form__row">
      <div class="field">
        <label class="label" for="lf-name">Name</label>
        <input id="lf-name" v-model="f.name" required autocomplete="name">
      </div>
      <div class="field">
        <label class="label" for="lf-company">Company</label>
        <input id="lf-company" v-model="f.company" autocomplete="organization">
      </div>
    </div>
    <div class="field">
      <label class="label" for="lf-email">Email</label>
      <input id="lf-email" v-model="f.email" type="email" required autocomplete="email">
    </div>
    <div class="form__row">
      <div class="field">
        <label class="label" for="lf-qty">Quantity</label>
        <input id="lf-qty" v-model="f.qty" inputmode="numeric" placeholder="1+">
      </div>
      <div class="field">
        <label class="label" for="lf-country">Destination</label>
        <input id="lf-country" v-model="f.country" autocomplete="country-name">
      </div>
    </div>
    <div v-if="!compact" class="field">
      <label class="label" for="lf-note">What should run on it</label>
      <textarea id="lf-note" v-model="f.note" placeholder="One paragraph is enough to start." />
    </div>
    <div class="actions">
      <button class="btn btn--primary" type="submit">
        <span>{{ product ? 'Request a quote' : 'Send the brief' }}</span>
      </button>
    </div>
  </form>
</template>
