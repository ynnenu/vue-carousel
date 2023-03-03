# Events

Events provides more flexibility to intercept carousel navigation changes

## How To Use Events

```html
<Carousel
  @init="handleInit"
  @slide-start="handleSlideStart"
>
  ...
</Carousel>

<script>
  export default defineComponent({
    methods: {
      handleInit() {
        console.log('created')
      },
      handleSlideStart(data) {
        console.log('slide-start', data)
      },
    },
  })
</script>
```

## `@init`

Triggers once the carousel is mounted and completely initialized

## `@slide-start`

Triggers at the binging of sliding function. it emits the following data:

- `slidingToIndex`
- `currentSlideIndex`
- `prevSlideIndex`
- `slidesCount`
  
## `@slide-end`

Triggers after finishing of sliding function and the current slide has been update. it emits the following data:

- `currentSlideIndex`
- `prevSlideIndex`
- `slidesCount`
  
## `@loop`

Triggers after the carousel is going to loop over, only on `wrap-around` mode. it emits the following data:

- `slidingToIndex`
- `currentSlideIndex`
