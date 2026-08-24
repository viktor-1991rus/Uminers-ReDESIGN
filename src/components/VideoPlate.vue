<script setup>
import { ref } from 'vue'

/**
 * The product film, presented plainly: a quiet plate,
 * a poster, one button. The iframe loads only after the click, so the page
 * never pays for YouTube until someone asks for it.
 */
const props = defineProps({
  videoId: { type: String, required: true },
  start: { type: Number, default: 0 },
  poster: { type: String, required: true },
  title: { type: String, default: 'Uminers — the film' },
  caption: { type: String, default: '' }
})

const playing = ref(false)

const src = () =>
  `https://www.youtube-nocookie.com/embed/${props.videoId}` +
  `?autoplay=1&rel=0&modestbranding=1&start=${props.start}`
</script>

<template>
  <figure class="film">
    <div class="film__plate">
      <template v-if="!playing">
        <img class="film__poster" :src="poster" :alt="title" loading="lazy">
        <button class="film__cover" type="button" @click="playing = true">
          <span class="btn btn--primary"><span>Watch the film</span></span>
        </button>
      </template>
      <iframe
        v-else
        :src="src()"
        :title="title"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      />
    </div>
    <figcaption v-if="caption" class="film__meta label">{{ caption }}</figcaption>
  </figure>
</template>
