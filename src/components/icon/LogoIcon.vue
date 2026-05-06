<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    class="logo-icon"
    :class="{ 'logo-icon--gradient': gradient }"
  >
    <g v-if="gradient">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--brand-primary, #8b5cf6)" />
          <stop offset="100%" stop-color="var(--brand-secondary, #10b981)" />
        </linearGradient>
      </defs>
      <!-- 背景圆 -->
      <circle cx="100" cy="100" r="96" fill="url(#logoGrad)" opacity="0.08" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="url(#logoGrad)" stroke-width="2" opacity="0.2" />
      <!-- 盒子 -->
      <rect x="45" y="85" width="110" height="80" rx="14" fill="url(#logoGrad)" />
      <!-- 盒子开口 -->
      <rect x="55" y="75" width="90" height="20" rx="8" fill="#1a1a2e" opacity="0.3" />
      <!-- 小丑帽 -->
      <path d="M 100 28 L 68 78 L 132 78 Z" fill="url(#logoGrad)" />
      <circle cx="100" cy="24" r="10" fill="url(#logoGrad)" />
      <circle cx="100" cy="24" r="4" fill="#fff" />
      <!-- 帽子褶皱 -->
      <path d="M 84 78 Q 100 65 116 78" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.4" />
      <!-- 笑脸 -->
      <circle cx="80" cy="125" r="6" fill="#fff" />
      <circle cx="120" cy="125" r="6" fill="#fff" />
      <path d="M 75 142 Q 100 158 125 142" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      <!-- 装饰线 -->
      <path d="M 55 85 L 145 85" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.3" />
    </g>
    <g v-else>
      <!-- 纯色模式（用于 favicon 或单色场景） -->
      <circle cx="100" cy="100" r="96" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="2" opacity="0.2" />
      <rect x="45" y="85" width="110" height="80" rx="14" fill="currentColor" />
      <rect x="55" y="75" width="90" height="20" rx="8" fill="#000" opacity="0.2" />
      <path d="M 100 28 L 68 78 L 132 78 Z" fill="currentColor" />
      <circle cx="100" cy="24" r="10" fill="currentColor" />
      <circle cx="100" cy="24" r="4" fill="#fff" />
      <path d="M 84 78 Q 100 65 116 78" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.4" />
      <circle cx="80" cy="125" r="6" fill="#fff" />
      <circle cx="120" cy="125" r="6" fill="#fff" />
      <path d="M 75 142 Q 100 158 125 142" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      <path d="M 55 85 L 145 85" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.3" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
    gradient?: boolean
  }>(),
  {
    size: 40,
    gradient: true,
  }
)
</script>

<style scoped>
.logo-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
