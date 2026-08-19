<template>
  <svg :width="size || 38" :height="size || 38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="24" fill="url(#kemenagGrad)" />
    <!-- Islamic Geometric 8-Point Star Outer -->
    <path
      d="M50 15L59 28L75 25L72 41L85 50L72 59L75 75L59 72L50 85L41 72L25 75L28 59L15 50L28 41L25 25L41 28L50 15Z"
      fill="white"
      fill-opacity="0.18"
    />
    <!-- Dome & Minaret Silhouette SVG -->
    <path
      d="M50 26C41.5 26 35 34.5 35 45V68H65V45C65 34.5 58.5 26 50 26Z"
      fill="white"
    />
    <!-- Crescent & Star on top of Dome -->
    <circle cx="50" cy="22" r="4" fill="#FDE047" />
    <!-- Inner Arch Portal -->
    <path
      d="M50 48C45.5 48 42 52.5 42 58V68H58V58C58 52.5 54.5 48 50 48Z"
      fill="url(#archGrad)"
    />
    <!-- Accent line -->
    <rect x="30" y="70" width="40" height="4" rx="2" fill="white" fill-opacity="0.8" />
    <defs>
      <linearGradient id="kemenagGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stop-color="#047857" />
        <stop offset="0.5" stop-color="#059669" />
        <stop offset="1" stop-color="#0D9488" />
      </linearGradient>
      <linearGradient id="archGrad" x1="50" y1="48" x2="50" y2="68" gradientUnits="userSpaceOnUse">
        <stop stop-color="#065F46" />
        <stop offset="1" stop-color="#047857" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number;
}>();
</script>
