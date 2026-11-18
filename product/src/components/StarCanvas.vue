<template>
  <div class="canvas-box" :data-background="appearance.backgroundMode" :style="backgroundStyle">
    <canvas v-show="appearance.backgroundMode === 'stars'" ref="canvasEl">你的浏览器不支持canvas</canvas>
  </div>
</template>

<script setup>
/**
 * 星空背景（由原 src/lottery/canvas.js 平移）
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({ appearance: { type: Object, required: true } })
const backgroundStyle = computed(() => ({ width:'100vw', height:'100vh', backgroundColor: props.appearance.backgroundColor, backgroundImage: props.appearance.backgroundMode === 'image' ? `url(${JSON.stringify(props.appearance.backgroundImage)})` : 'none', backgroundSize:'cover', backgroundPosition:'center' }))

const canvasEl = ref(null)

let rafId = null
let animate = true
let canvas = null
let ctx = null
let stars = []
let centerX = 0
let centerY = 0
let focalLength = 0
let radius = '0.5'
let running = false

const NUM_STARS = 800

function initializeStars() {
  stars = []
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: '0.' + Math.floor(Math.random() * 99) + 1
    })
  }
  centerX = canvas.width / 2
  centerY = canvas.height / 2
  focalLength = canvas.width * 2
}

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initializeStars()
}

function moveStars() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    star.z--
    if (star.z <= 0) {
      star.z = canvas.width
    }
  }
}

function drawStars() {
  let pixelX, pixelY, pixelRadius
  // 尺寸变化时重置
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    resize()
  }

  ctx.fillStyle = props.appearance.backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    pixelX = (star.x - centerX) * (focalLength / star.z)
    pixelX += centerX
    pixelY = (star.y - centerY) * (focalLength / star.z)
    pixelY += centerY
    pixelRadius = 1 * (focalLength / star.z)

    ctx.fillStyle = 'rgba(209, 255, 255, ' + star.o + ')'
    ctx.fillRect(pixelX, pixelY, pixelRadius, pixelRadius)
  }
}

function executeFrame() {
  if (!animate || document.hidden || props.appearance.backgroundMode !== 'stars') { rafId = null; return }
  moveStars()
  drawStars()
  rafId = requestAnimationFrame(executeFrame)
}

function resume() {
  if (!canvas) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  executeFrame()
}
watch(() => props.appearance.backgroundMode, resume)
onMounted(() => {
  canvas = canvasEl.value
  ctx = canvas.getContext('2d')
  radius = '0.' + Math.floor(Math.random() * 9) + 1
  resize()
  window.addEventListener('resize', resize)
  animate = true
  executeFrame()
  document.addEventListener('visibilitychange', resume)
})

onBeforeUnmount(() => {
  animate = false
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', resume)
})
</script>
