/**
 * Vue 3 Carousel 0.4.14
 * (c) 2023
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VueCarousel = {}, global.Vue));
})(this, (function (exports, vue) { 'use strict';

  const defaultConfigs = {
      itemsToShow: 1,
      itemsToScroll: 1,
      modelValue: 0,
      transition: 300,
      autoplay: 0,
      snapAlign: 'center',
      wrapAround: false,
      throttle: 16,
      pauseAutoplayOnHover: false,
      mouseDrag: true,
      touchDrag: true,
      dir: 'ltr',
      breakpoints: undefined,
  };

  const carouselProps = {
      // count of items to showed per view
      itemsToShow: {
          default: defaultConfigs.itemsToShow,
          type: Number,
      },
      // count of items to be scrolled
      itemsToScroll: {
          default: defaultConfigs.itemsToScroll,
          type: Number,
      },
      // control infinite scrolling mode
      wrapAround: {
          default: defaultConfigs.wrapAround,
          type: Boolean,
      },
      // control max drag
      throttle: {
          default: defaultConfigs.throttle,
          type: Number,
      },
      // control snap position alignment
      snapAlign: {
          default: defaultConfigs.snapAlign,
          validator(value) {
              // The value must match one of these strings
              return ['start', 'end', 'center', 'center-even', 'center-odd'].includes(value);
          },
      },
      // sliding transition time in ms
      transition: {
          default: defaultConfigs.transition,
          type: Number,
      },
      // an object to store breakpoints
      breakpoints: {
          default: defaultConfigs.breakpoints,
          type: Object,
      },
      // time to auto advance slides in ms
      autoplay: {
          default: defaultConfigs.autoplay,
          type: Number,
      },
      // pause autoplay when mouse hover over the carousel
      pauseAutoplayOnHover: {
          default: defaultConfigs.pauseAutoplayOnHover,
          type: Boolean,
      },
      // slide number number of initial slide
      modelValue: {
          default: undefined,
          type: Number,
      },
      // toggle mouse dragging.
      mouseDrag: {
          default: defaultConfigs.mouseDrag,
          type: Boolean,
      },
      // toggle mouse dragging.
      touchDrag: {
          default: defaultConfigs.touchDrag,
          type: Boolean,
      },
      // control snap position alignment
      dir: {
          default: defaultConfigs.dir,
          validator(value) {
              // The value must match one of these strings
              return ['rtl', 'ltr'].includes(value);
          },
      },
      // an object to pass all settings
      settings: {
          default() {
              return {};
          },
          type: Object,
      },
  };

  function getMaxSlideIndex({ config, slidesCount }) {
      const { snapAlign, wrapAround, itemsToShow = 1 } = config;
      if (wrapAround) {
          return Math.max(slidesCount - 1, 0);
      }
      let output;
      switch (snapAlign) {
          case 'start':
              output = slidesCount - itemsToShow;
              break;
          case 'end':
              output = slidesCount - 1;
              break;
          case 'center':
          case 'center-odd':
              output = slidesCount - Math.ceil((itemsToShow - 0.5) / 2);
              break;
          case 'center-even':
              output = slidesCount - Math.ceil(itemsToShow / 2);
              break;
          default:
              output = 0;
              break;
      }
      return Math.max(output, 0);
  }

  function getMinSlideIndex({ config, slidesCount }) {
      const { wrapAround, snapAlign, itemsToShow = 1 } = config;
      let output = 0;
      if (wrapAround || itemsToShow > slidesCount) {
          return output;
      }
      switch (snapAlign) {
          case 'start':
              output = 0;
              break;
          case 'end':
              output = itemsToShow - 1;
              break;
          case 'center':
          case 'center-odd':
              output = Math.floor((itemsToShow - 1) / 2);
              break;
          case 'center-even':
              output = Math.floor((itemsToShow - 2) / 2);
              break;
          default:
              output = 0;
              break;
      }
      return output;
  }

  function getNumberInRange({ val, max, min }) {
      if (max < min) {
          return val;
      }
      return Math.min(Math.max(val, min), max);
  }

  function getSlidesToScroll({ config, currentSlide, slidesCount }) {
      const { snapAlign, wrapAround, itemsToShow = 1 } = config;
      let output = currentSlide;
      switch (snapAlign) {
          case 'center':
          case 'center-odd':
              output -= (itemsToShow - 1) / 2;
              break;
          case 'center-even':
              output -= (itemsToShow - 2) / 2;
              break;
          case 'end':
              output -= itemsToShow - 1;
              break;
      }
      if (wrapAround) {
          return output;
      }
      return getNumberInRange({
          val: output,
          max: slidesCount - itemsToShow,
          min: 0,
      });
  }

  function getSlidesVNodes(vNode) {
      var _a, _b, _c, _d;
      // Return empty array if there's any node
      if (!vNode)
          return [];
      // Check if the Slides components are added directly without v-for (#72)
      if (((_a = vNode[0]) === null || _a === void 0 ? void 0 : _a.children) === "v-if" || ((_c = (_b = vNode[0]) === null || _b === void 0 ? void 0 : _b.type) === null || _c === void 0 ? void 0 : _c.name) === 'CarouselSlide')
          return vNode.filter((node) => { var _a; return ((_a = node.type) === null || _a === void 0 ? void 0 : _a.name) === "CarouselSlide"; });
      return ((_d = vNode[0]) === null || _d === void 0 ? void 0 : _d.children) || [];
  }

  function mapNumberToRange({ val, max, min = 0 }) {
      if (val > max) {
          return mapNumberToRange({ val: val - (max + 1), max, min });
      }
      if (val < min) {
          return mapNumberToRange({ val: val + (max + 1), max, min });
      }
      return val;
  }

  /**
   * return a throttle version of the function
   * Throttling
   *
   */
  // eslint-disable-next-line no-unused-vars
  function throttle(fn, limit) {
      let inThrottle;
      if (!limit) {
          return fn;
      }
      return function (...args) {
          const self = this;
          if (!inThrottle) {
              fn.apply(self, args);
              inThrottle = true;
              setTimeout(() => (inThrottle = false), limit);
          }
      };
  }

  /**
   * return a debounced version of the function
   * @param fn
   * @param delay
   */
  // eslint-disable-next-line no-unused-vars
  function debounce(fn, delay) {
      let timerId;
      return function (...args) {
          if (timerId) {
              clearTimeout(timerId);
          }
          timerId = setTimeout(() => {
              fn(...args);
              timerId = null;
          }, delay);
      };
  }

  var ARIAComponent = vue.defineComponent({
      name: 'ARIA',
      setup() {
          const currentSlide = vue.inject('currentSlide', vue.ref(0));
          const slidesCount = vue.inject('slidesCount', vue.ref(0));
          return () => vue.h('div', {
              class: ['carousel__liveregion', 'carousel__sr-only'],
              'aria-live': 'polite',
              'aria-atomic': 'true',
          }, `Item ${currentSlide.value + 1} of ${slidesCount.value}`);
      },
  });

  var Carousel = vue.defineComponent({
      name: 'Carousel',
      props: carouselProps,
      setup(props, { slots, emit, expose }) {
          var _a;
          const root = vue.ref(null);
          const slides = vue.ref([]);
          const slideWidth = vue.ref(0);
          const slidesCount = vue.ref(0);
          let breakpoints = vue.ref({});
          // generate carousel configs
          let __defaultConfig = Object.assign({}, defaultConfigs);
          // current config
          const config = vue.reactive(Object.assign({}, __defaultConfig));
          // slides
          const currentSlideIndex = vue.ref((_a = props.modelValue) !== null && _a !== void 0 ? _a : 0);
          const prevSlideIndex = vue.ref(0);
          const middleSlideIndex = vue.ref(0);
          const maxSlideIndex = vue.ref(0);
          const minSlideIndex = vue.ref(0);
          let autoplayTimer;
          let transitionTimer;
          vue.provide('config', config);
          vue.provide('slidesCount', slidesCount);
          vue.provide('currentSlide', currentSlideIndex);
          vue.provide('maxSlide', maxSlideIndex);
          vue.provide('minSlide', minSlideIndex);
          vue.provide('slideWidth', slideWidth);
          /**
           * Configs
           */
          function initDefaultConfigs() {
              // generate carousel configs
              const mergedConfigs = Object.assign(Object.assign({}, props), props.settings);
              // Set breakpoints
              breakpoints = vue.ref(Object.assign({}, mergedConfigs.breakpoints));
              // remove extra values
              __defaultConfig = Object.assign(Object.assign({}, mergedConfigs), { settings: undefined, breakpoints: undefined });
              bindConfigs(__defaultConfig);
          }
          function updateBreakpointsConfigs() {
              const breakpointsArray = Object.keys(breakpoints.value)
                  .map((key) => Number(key))
                  .sort((a, b) => +b - +a);
              let newConfig = Object.assign({}, __defaultConfig);
              breakpointsArray.some((breakpoint) => {
                  const isMatched = window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
                  if (isMatched) {
                      newConfig = Object.assign(Object.assign({}, newConfig), breakpoints.value[breakpoint]);
                      return true;
                  }
                  return false;
              });
              bindConfigs(newConfig);
          }
          function bindConfigs(newConfig) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              Object.entries(newConfig).forEach(([key, val]) => (config[key] = val));
          }
          const handleWindowResize = debounce(() => {
              if (Object.keys(breakpoints.value).length) {
                  updateBreakpointsConfigs();
                  updateSlidesData();
              }
              updateSlideWidth();
          }, 16);
          /**
           * Setup functions
           */
          function updateSlideWidth() {
              if (!root.value)
                  return;
              const rect = root.value.getBoundingClientRect();
              slideWidth.value = rect.width / config.itemsToShow;
          }
          function updateSlidesData() {
              if (slidesCount.value <= 0)
                  return;
              middleSlideIndex.value = Math.ceil((slidesCount.value - 1) / 2);
              maxSlideIndex.value = getMaxSlideIndex({ config, slidesCount: slidesCount.value });
              minSlideIndex.value = getMinSlideIndex({ config, slidesCount: slidesCount.value });
              if (!config.wrapAround) {
                  currentSlideIndex.value = getNumberInRange({
                      val: currentSlideIndex.value,
                      max: maxSlideIndex.value,
                      min: minSlideIndex.value,
                  });
              }
          }
          vue.onMounted(() => {
              if (Object.keys(breakpoints.value).length) {
                  updateBreakpointsConfigs();
              }
              vue.nextTick(() => {
                  updateSlidesData();
                  updateSlideWidth();
                  createDragListener();
                  emit('init');
              });
              initAutoplay();
              window.addEventListener('resize', handleWindowResize, { passive: true });
          });
          vue.onUnmounted(() => {
              if (transitionTimer) {
                  clearTimeout(transitionTimer);
              }
              if (autoplayTimer) {
                  clearInterval(autoplayTimer);
              }
              /**
               * use the same options as in onMounted
               * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
               */
              window.removeEventListener('resize', handleWindowResize, {
                  passive: true,
              });
          });
          /**
           * Carousel Event listeners
           */
          let isTouch = false;
          const startPosition = { x: 0, y: 0 };
          const endPosition = { x: 0, y: 0 };
          const dragged = vue.reactive({ x: 0, y: 0 });
          const isHover = vue.ref(false);
          const handleMouseEnter = () => {
              isHover.value = true;
          };
          const handleMouseLeave = () => {
              isHover.value = false;
          };
          function handleDragStart(event) {
              if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
                  return;
              }
              isTouch = event.type === 'touchstart';
              if ((!isTouch && event.button !== 0) || isSliding.value) {
                  return;
              }
              if (!isTouch) {
                  event.preventDefault();
              }
              startPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
              startPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
              document.addEventListener(isTouch ? 'touchmove' : 'mousemove', handleDragging, true);
              document.addEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd, true);
          }
          let handleDragging = () => { };
          function createDragListener() {
              var _a;
              handleDragging = throttle((event) => {
                  endPosition.x = isTouch ? event.touches[0].clientX : event.clientX;
                  endPosition.y = isTouch ? event.touches[0].clientY : event.clientY;
                  const deltaX = endPosition.x - startPosition.x;
                  const deltaY = endPosition.y - startPosition.y;
                  dragged.y = deltaY;
                  dragged.x = deltaX;
              }, (_a = config.throttle) !== null && _a !== void 0 ? _a : 16);
          }
          function handleDragEnd() {
              const direction = config.dir === 'rtl' ? -1 : 1;
              const tolerance = Math.sign(dragged.x) * 0.4;
              const draggedSlides = Math.round(dragged.x / slideWidth.value + tolerance) * direction;
              // Prevent clicking if there is clicked slides
              if (draggedSlides && !isTouch) {
                  const captureClick = (e) => {
                      e.stopPropagation();
                      window.removeEventListener('click', captureClick, true);
                  };
                  window.addEventListener('click', captureClick, true);
              }
              slideTo(currentSlideIndex.value - draggedSlides);
              dragged.x = 0;
              dragged.y = 0;
              document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', handleDragging, true);
              document.removeEventListener(isTouch ? 'touchend' : 'mouseup', handleDragEnd, true);
          }
          /**
           * Autoplay
           */
          function initAutoplay() {
              if (!config.autoplay || config.autoplay <= 0) {
                  return;
              }
              autoplayTimer = setInterval(() => {
                  if (config.pauseAutoplayOnHover && isHover.value) {
                      return;
                  }
                  next();
              }, config.autoplay);
          }
          function resetAutoplay() {
              if (autoplayTimer) {
                  clearInterval(autoplayTimer);
                  autoplayTimer = null;
              }
              initAutoplay();
          }
          /**
           * Navigation function
           */
          const isSliding = vue.ref(false);
          function slideTo(slideIndex) {
              const currentVal = config.wrapAround
                  ? slideIndex
                  : getNumberInRange({
                      val: slideIndex,
                      max: maxSlideIndex.value,
                      min: minSlideIndex.value,
                  });
              if (currentSlideIndex.value === currentVal || isSliding.value) {
                  return;
              }
              emit('slide-start', {
                  slidingToIndex: slideIndex,
                  currentSlideIndex: currentSlideIndex.value,
                  prevSlideIndex: prevSlideIndex.value,
                  slidesCount: slidesCount.value,
              });
              isSliding.value = true;
              prevSlideIndex.value = currentSlideIndex.value;
              currentSlideIndex.value = currentVal;
              transitionTimer = setTimeout(() => {
                  if (config.wrapAround) {
                      const mappedNumber = mapNumberToRange({
                          val: currentVal,
                          max: maxSlideIndex.value,
                          min: 0,
                      });
                      if (mappedNumber !== currentSlideIndex.value) {
                          currentSlideIndex.value = mappedNumber;
                          emit('loop', {
                              currentSlideIndex: currentSlideIndex.value,
                              slidingToIndex: slideIndex,
                          });
                      }
                  }
                  emit('update:modelValue', currentSlideIndex.value);
                  emit('slide-end', {
                      currentSlideIndex: currentSlideIndex.value,
                      prevSlideIndex: prevSlideIndex.value,
                      slidesCount: slidesCount.value,
                  });
                  isSliding.value = false;
                  resetAutoplay();
              }, config.transition);
          }
          function next() {
              slideTo(currentSlideIndex.value + config.itemsToScroll);
          }
          function prev() {
              slideTo(currentSlideIndex.value - config.itemsToScroll);
          }
          const nav = { slideTo, next, prev };
          vue.provide('nav', nav);
          vue.provide('isSliding', isSliding);
          /**
           * Track style
           */
          const slidesToScroll = vue.computed(() => getSlidesToScroll({
              config,
              currentSlide: currentSlideIndex.value,
              slidesCount: slidesCount.value,
          }));
          vue.provide('slidesToScroll', slidesToScroll);
          const trackStyle = vue.computed(() => {
              const direction = config.dir === 'rtl' ? -1 : 1;
              const xScroll = slidesToScroll.value * slideWidth.value * direction;
              return {
                  transform: `translateX(${dragged.x - xScroll}px)`,
                  transition: `${isSliding.value ? config.transition : 0}ms`,
                  margin: config.wrapAround ? `0 -${slidesCount.value * slideWidth.value}px` : '',
                  width: `100%`,
              };
          });
          function restartCarousel() {
              initDefaultConfigs();
              updateBreakpointsConfigs();
              updateSlidesData();
              updateSlideWidth();
              resetAutoplay();
          }
          // Update the carousel on props change
          Object.keys(carouselProps).forEach((prop) => {
              if (['modelValue'].includes(prop))
                  return;
              vue.watch(() => props[prop], restartCarousel);
          });
          // Handle changing v-model value
          vue.watch(() => props['modelValue'], (val) => {
              if (val !== currentSlideIndex.value) {
                  slideTo(Number(val));
              }
          });
          // Handel when slides added/removed
          vue.watch(slidesCount, updateSlidesData);
          // Init carousel
          initDefaultConfigs();
          const data = {
              config,
              slidesCount,
              slideWidth,
              next,
              prev,
              slideTo,
              currentSlide: currentSlideIndex,
              maxSlide: maxSlideIndex,
              minSlide: minSlideIndex,
              middleSlide: middleSlideIndex,
          };
          expose({
              updateBreakpointsConfigs,
              updateSlidesData,
              updateSlideWidth,
              initDefaultConfigs,
              restartCarousel,
              slideTo,
              next,
              prev,
              nav,
              data,
          });
          const slotSlides = slots.default || slots.slides;
          const slotAddons = slots.addons;
          const slotsProps = vue.reactive(data);
          return () => {
              const slidesElements = getSlidesVNodes(slotSlides === null || slotSlides === void 0 ? void 0 : slotSlides(slotsProps));
              const addonsElements = (slotAddons === null || slotAddons === void 0 ? void 0 : slotAddons(slotsProps)) || [];
              slidesElements.forEach((el, index) => (el.props.index = index));
              let output = slidesElements;
              if (config.wrapAround) {
                  const slidesBefore = slidesElements.map((el, index) => vue.cloneVNode(el, {
                      index: -slidesElements.length + index,
                      isClone: true,
                      key: `clone-before-${index}`,
                  }));
                  const slidesAfter = slidesElements.map((el, index) => vue.cloneVNode(el, {
                      index: slidesElements.length + index,
                      isClone: true,
                      key: `clone-after-${index}`,
                  }));
                  output = [...slidesBefore, ...slidesElements, ...slidesAfter];
              }
              slides.value = slidesElements;
              slidesCount.value = Math.max(slidesElements.length, 1);
              const trackEl = vue.h('ol', {
                  class: 'carousel__track',
                  style: trackStyle.value,
                  onMousedownCapture: config.mouseDrag
                      ? handleDragStart
                      : null,
                  onTouchstartPassiveCapture: config.touchDrag
                      ? handleDragStart
                      : null,
              }, output);
              const viewPortEl = vue.h('div', { class: 'carousel__viewport' }, trackEl);
              return vue.h('section', {
                  ref: root,
                  class: {
                      carousel: true,
                      'carousel--rtl': config.dir === 'rtl',
                  },
                  dir: config.dir,
                  'aria-label': 'Gallery',
                  tabindex: '0',
                  onMouseenter: handleMouseEnter,
                  onMouseleave: handleMouseLeave,
              }, [viewPortEl, addonsElements, vue.h(ARIAComponent)]);
          };
      },
  });

  const icons = {
      arrowUp: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
      arrowDown: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
      arrowRight: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
      arrowLeft: 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z',
  };

  const Icon = (props) => {
      const iconName = props.name;
      if (!iconName || typeof iconName !== 'string') {
          return;
      }
      const path = icons[iconName];
      const pathEl = vue.h('path', { d: path });
      const iconTitle = (props.title || iconName);
      const titleEl = vue.h('title', iconTitle);
      return vue.h('svg', {
          class: 'carousel__icon',
          viewBox: '0 0 24 24',
          role: 'img',
          ariaLabel: iconTitle,
      }, [titleEl, pathEl]);
  };
  Icon.props = { name: String, title: String };

  const Navigation = (props, { slots, attrs }) => {
      const { next: slotNext, prev: slotPrev } = slots || {};
      const config = vue.inject('config', vue.reactive(Object.assign({}, defaultConfigs)));
      const maxSlide = vue.inject('maxSlide', vue.ref(1));
      const minSlide = vue.inject('minSlide', vue.ref(1));
      const currentSlide = vue.inject('currentSlide', vue.ref(1));
      const nav = vue.inject('nav', {});
      const { dir, wrapAround } = config;
      const isRTL = dir === 'rtl';
      const prevButton = vue.h('button', {
          type: 'button',
          class: [
              'carousel__prev',
              !wrapAround && currentSlide.value <= minSlide.value && 'carousel__prev--disabled',
              attrs === null || attrs === void 0 ? void 0 : attrs.class,
          ],
          'aria-label': `Navigate to previous slide`,
          onClick: nav.prev,
      }, (slotPrev === null || slotPrev === void 0 ? void 0 : slotPrev()) || vue.h(Icon, { name: isRTL ? 'arrowRight' : 'arrowLeft' }));
      const nextButton = vue.h('button', {
          type: 'button',
          class: [
              'carousel__next',
              !wrapAround && currentSlide.value >= maxSlide.value && 'carousel__next--disabled',
              attrs === null || attrs === void 0 ? void 0 : attrs.class,
          ],
          'aria-label': `Navigate to next slide`,
          onClick: nav.next,
      }, (slotNext === null || slotNext === void 0 ? void 0 : slotNext()) || vue.h(Icon, { name: isRTL ? 'arrowLeft' : 'arrowRight' }));
      return [prevButton, nextButton];
  };

  const Pagination = () => {
      const maxSlide = vue.inject('maxSlide', vue.ref(1));
      const minSlide = vue.inject('minSlide', vue.ref(1));
      const currentSlide = vue.inject('currentSlide', vue.ref(1));
      const nav = vue.inject('nav', {});
      const isActive = (slide) => mapNumberToRange({
          val: currentSlide.value,
          max: maxSlide.value,
          min: 0,
      }) === slide;
      const children = [];
      for (let slide = minSlide.value; slide < maxSlide.value + 1; slide++) {
          const button = vue.h('button', {
              type: 'button',
              class: {
                  'carousel__pagination-button': true,
                  'carousel__pagination-button--active': isActive(slide),
              },
              'aria-label': `Navigate to slide ${slide + 1}`,
              onClick: () => nav.slideTo(slide),
          });
          const item = vue.h('li', { class: 'carousel__pagination-item', key: slide }, button);
          children.push(item);
      }
      return vue.h('ol', { class: 'carousel__pagination' }, children);
  };

  var Slide = vue.defineComponent({
      name: 'CarouselSlide',
      props: {
          index: {
              type: Number,
              default: 1,
          },
          isClone: {
              type: Boolean,
              default: false,
          },
      },
      setup(props, { slots }) {
          const config = vue.inject('config', vue.reactive(Object.assign({}, defaultConfigs)));
          const currentSlide = vue.inject('currentSlide', vue.ref(0));
          const slidesToScroll = vue.inject('slidesToScroll', vue.ref(0));
          const slideWidth = vue.inject('slideWidth', vue.ref(0));
          const isSliding = vue.inject('isSliding', vue.ref(false));
          const slideStyle = vue.computed(() => ({
              width: slideWidth.value ? `${slideWidth.value}px` : `100%`,
          }));
          const isActive = () => props.index === currentSlide.value;
          const isPrev = () => props.index === currentSlide.value - 1;
          const isNext = () => props.index === currentSlide.value + 1;
          const isVisible = () => {
              const min = Math.floor(slidesToScroll.value);
              const max = Math.ceil(slidesToScroll.value + config.itemsToShow - 1);
              return props.index >= min && props.index <= max;
          };
          return () => {
              var _a;
              return vue.h('li', {
                  style: slideStyle.value,
                  class: {
                      carousel__slide: true,
                      'carousel_slide--clone': props.isClone,
                      'carousel__slide--visible': isVisible(),
                      'carousel__slide--active': isActive(),
                      'carousel__slide--prev': isPrev(),
                      'carousel__slide--next': isNext(),
                      'carousel__slide--sliding': isSliding.value,
                  },
                  'aria-hidden': !isVisible(),
              }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots));
          };
      },
  });

  exports.Carousel = Carousel;
  exports.Icon = Icon;
  exports.Navigation = Navigation;
  exports.Pagination = Pagination;
  exports.Slide = Slide;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
