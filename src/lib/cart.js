/**
 * A quote cart, not a checkout. Nothing here charges a card — the desk still
 * prices every order by hand, so all this does is remember which SKUs and
 * quantities a visitor picked before they talk to the desk. One reactive
 * singleton, same shape as venomBus.js, persisted to localStorage so the
 * list survives a reload.
 */
import { reactive, computed } from 'vue'

const STORAGE_KEY = 'uminers-cart-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// [{ slug, qty }]
const state = reactive({ lines: load() })

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines))
  } catch {
    /* private mode / storage full — the cart just stops persisting, not a crash */
  }
}

export function addToCart(product, qty = 1) {
  if (!product?.slug) return
  const line = state.lines.find(l => l.slug === product.slug)
  if (line) line.qty += qty
  else state.lines.push({ slug: product.slug, qty })
  persist()
}

export function removeFromCart(slug) {
  const i = state.lines.findIndex(l => l.slug === slug)
  if (i !== -1) state.lines.splice(i, 1)
  persist()
}

export function setQty(slug, qty) {
  const line = state.lines.find(l => l.slug === slug)
  if (!line) return
  if (qty <= 0) return removeFromCart(slug)
  line.qty = qty
  persist()
}

export function qtyFor(slug) {
  return state.lines.find(l => l.slug === slug)?.qty ?? 0
}

export const cartLines = computed(() => state.lines)
export const cartCount = computed(() => state.lines.reduce((n, l) => n + l.qty, 0))
