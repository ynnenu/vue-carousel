# Getting started

## Installation

First step is to install it using `yarn` or `npm`:

```bash
npm install vue-carousel-style

# or use yarn
yarn add vue-carousel-style
```

## Basic Using

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
import 'vue-carousel-style/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue-carousel-style'

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
