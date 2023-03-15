# Vue 3 Carousel

Modern lightweight Vue 3 carousel component revamped and styled!





## Credits

The whole component was built by: https://ismail9k.github.io/ and style by me for a modern feel and look!

https://ismail9k.github.io/vue-carousel-style-style/

## Features

- [x] Responsive breakpoints
- [x] Mouse/touch dragging
- [x] Infinity scroll (wrapping around)
- [x] Auto play
- [x] Add classes for active and for visible slides
- [x] RTL
- [x] Enrich a11y

## Getting started

### Installation

First step is to install it using `yarn` or `npm`:

```bash
npm install vue-carousel-style

# or use yarn
yarn add vue-carousel-style
```

### Basic Using

```vue
<template>
  <carousel :items-to-show="1.5">
    <slide v-for="slide in 10" :key="slide">
      {{ slide }}
    </slide>

    <template #addons>
      <navigation />
      <pagination />
    </template>
  </carousel>
</template>

<script>
// If you are using PurgeCSS, make sure to whitelist the carousel CSS classes
import 'vue-carousel-style-style/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue-carousel-style-style'

export default {
  name: 'App',
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
}
</script>
```
