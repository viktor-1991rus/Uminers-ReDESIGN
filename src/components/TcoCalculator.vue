<script setup>
/**
 * TCO calculator — a rail widget on the product screen, not a separate page.
 * The buyer is already looking at one product; the calculator should answer
 * "what does owning N of these actually cost over N years" without making
 * them re-enter what the catalogue already knows.
 *
 * Formula, spelled out because a number with no visible formula reads as a
 * guess to the audience this is built for (investors, partners, large buyers):
 *
 *   capex   = price × units
 *   opex    = watts/1000 × units × tariff($/kWh) × 24 × 365 × uptime% × years
 *   upkeep  = capex × upkeepPct/100 × years        (explicitly labelled ESTIMATE)
 *   TCO     = capex + opex + upkeep
 *
 * Power is read from the product's own specs (Power / TDP field) wherever it
 * parses to a number. It never invents a wattage: a spec string that doesn't
 * parse (missing field, prose with no number) leaves the field blank and the
 * calculator asks the visitor to enter it, with a visible notice instead of a
 * silently fabricated default. A spec range ("350–700 W") uses the upper
 * bound — the honest side to be wrong on for a cost estimate.
 */
import { computed, ref, watch } from 'vue'

const props = defineProps({
  product: { type: Object, default: null }
})

/* ── read what the catalogue already knows ────────────────────────────── */

function parsePowerWatts(raw) {
  if (!raw || typeof raw !== 'string') return null
  // normalise thousand-separator spaces inside a run of digits: "11 020" -> "11020"
  const compact = raw.replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1$2')
  const matches = [...compact.matchAll(/(\d+(?:\.\d+)?)\s*(k?W)\b/gi)]
  if (!matches.length) return null
  // a range or an "up to" figure — take the highest number found, the
  // honest side to be wrong on when estimating a running cost
  let max = 0
  for (const [, num, unit] of matches) {
    const watts = parseFloat(num) * (/^k/i.test(unit) ? 1000 : 1)
    if (watts > max) max = watts
  }
  return max || null
}

const specPowerRaw = computed(() => {
  const specs = props.product?.specs
  if (!specs) return null
  return specs.Power ?? specs.TDP ?? null
})
const specPowerWatts = computed(() => parsePowerWatts(specPowerRaw.value))

const hasPrice = computed(() => typeof props.product?.price === 'number' && props.product.price > 0)

/* ── inputs the visitor controls ──────────────────────────────────────── */

const units = ref(1)
const years = ref(3)
const tariff = ref(0.055)          // USD/kWh — matches the hosting tariff quoted elsewhere on the site
const uptimePct = ref(97)          // %
const upkeepPct = ref(4)           // % of capex per year — explicit estimate, not a quoted figure
const manualWatts = ref(null)      // used only when the catalogue has no parseable power figure

const wattsPerUnit = computed(() => specPowerWatts.value ?? manualWatts.value)
const needsManualPower = computed(() => specPowerWatts.value == null)

watch(() => props.product, () => {
  units.value = 1
  years.value = 3
  manualWatts.value = null
})

/* ── the sum itself ────────────────────────────────────────────────────── */

const capex = computed(() => hasPrice.value ? props.product.price * units.value : null)

const opex = computed(() => {
  const w = wattsPerUnit.value
  if (!w || w <= 0) return null
  const kw = w / 1000
  const hoursPerYear = 24 * 365 * (uptimePct.value / 100)
  return kw * units.value * tariff.value * hoursPerYear * years.value
})

const upkeep = computed(() => {
  if (capex.value == null) return null
  return capex.value * (upkeepPct.value / 100) * years.value
})

const total = computed(() => {
  if (capex.value == null || opex.value == null || upkeep.value == null) return null
  return capex.value + opex.value + upkeep.value
})

const money = n => n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US')

const open = ref(false)
</script>

<template>
  <section v-if="product" class="tco" :class="{ 'is-open': open }">
    <button type="button" class="tco__toggle" @click="open = !open">
      <span class="label">TCO calculator</span>
      <span class="tco__toggleHint">{{ open ? 'Hide' : `Estimate ${years}-year cost of ownership` }}</span>
    </button>

    <div v-if="open" class="tco__body">
      <p class="tco__lede body">
        Capital cost plus power over time, using this unit's own price and power draw.
        Maintenance is a planning estimate you can adjust — not a quoted figure.
      </p>

      <div class="tco__grid">
        <label class="tco__field">
          <span class="label label--faded">Units</span>
          <input type="number" min="1" step="1" v-model.number="units">
        </label>
        <label class="tco__field">
          <span class="label label--faded">Years</span>
          <input type="number" min="1" max="15" step="1" v-model.number="years">
        </label>
        <label class="tco__field">
          <span class="label label--faded">Power tariff, $/kWh</span>
          <input type="number" min="0" step="0.001" v-model.number="tariff">
        </label>
        <label class="tco__field">
          <span class="label label--faded">Uptime, %</span>
          <input type="number" min="1" max="100" step="1" v-model.number="uptimePct">
        </label>
        <label class="tco__field">
          <span class="label label--faded">Upkeep, % of capex / yr (est.)</span>
          <input type="number" min="0" max="30" step="0.5" v-model.number="upkeepPct">
        </label>
        <label v-if="needsManualPower" class="tco__field">
          <span class="label label--faded">Power draw, W (manual)</span>
          <input type="number" min="0" step="1" placeholder="not published" v-model.number="manualWatts">
        </label>
      </div>

      <p v-if="needsManualPower && !manualWatts" class="tco__warn">
        No parseable power figure in this product's specs — enter watts per unit above to include running cost.
        Without it, operating cost and total are left blank rather than guessed.
      </p>
      <p v-else-if="!hasPrice" class="tco__warn">
        This product has no listed price — it's quoted per order, so capital cost and total are left blank.
      </p>

      <dl class="tco__breakdown">
        <div class="tco__row">
          <dt>Capital cost</dt>
          <dd>{{ money(capex) }}</dd>
        </div>
        <div class="tco__row">
          <dt>Power over {{ years }}y <span class="tco__rowNote">({{ wattsPerUnit ?? '—' }} W/unit × {{ uptimePct }}% uptime)</span></dt>
          <dd>{{ money(opex) }}</dd>
        </div>
        <div class="tco__row">
          <dt>Maintenance <span class="tco__rowNote">(estimate)</span></dt>
          <dd>{{ money(upkeep) }}</dd>
        </div>
        <div class="tco__row tco__row--total">
          <dt>Total {{ years }}-year TCO</dt>
          <dd>{{ money(total) }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.tco{ border-top: 1px solid var(--hairline, rgba(25,24,23,.16)) }
.tco__toggle{
  all: unset; box-sizing: border-box; cursor: pointer; width: 100%;
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  padding: var(--spacingS) 0;
}
.tco__toggle .label{ margin: 0 }
.tco__toggleHint{
  font-size: 12px; color: var(--faded, rgba(25,24,23,.52));
}
.tco__body{ padding-bottom: var(--spacingS); display: grid; gap: var(--spacingS) }
.tco__lede{ margin: 0; color: var(--faded, rgba(25,24,23,.52)); font-size: 13px; line-height: 1.4 }

.tco__grid{
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.tco__field{ display: grid; gap: 4px }
.tco__field .label{ margin: 0 }
.tco__field input{
  all: unset; box-sizing: border-box; width: 100%;
  border: 1px solid var(--hairline, rgba(25,24,23,.16)); border-radius: var(--radiusS, 4px);
  padding: 7px 8px; font-variant-numeric: tabular-nums; font-size: 13px;
}
.tco__field input:focus-visible{ border-color: var(--accent) }

.tco__warn{
  margin: 0; font-size: 12px; line-height: 1.4; color: var(--accent-warm);
  border: 1px solid currentColor; border-radius: var(--radiusS, 4px);
  padding: 8px 10px;
}

.tco__breakdown{ margin: 0; display: grid; gap: 0 }
.tco__row{
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  padding: 7px 0; border-top: 1px solid var(--hairline, rgba(25,24,23,.16));
  font-size: 13px;
}
.tco__row dt{ font-weight: var(--weightBody) }
.tco__row dd{ margin: 0; font-variant-numeric: tabular-nums; font-weight: var(--weightMid) }
.tco__rowNote{ font-size: 11px; color: var(--faded, rgba(25,24,23,.52)); font-weight: var(--weightBody) }
.tco__row--total{
  border-top: 1px solid var(--ink, currentColor); margin-top: 2px;
  font-size: 14px;
}
.tco__row--total dt, .tco__row--total dd{ font-weight: var(--weightBold) }
</style>
