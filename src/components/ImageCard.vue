<script setup lang="ts">
import { useImage } from '@vueuse/core';

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="bg-fg-1 p-4 rounded-xl shadow-md shadow-shadow bg-card hoverable">
    <div class="overflow-hidden">
      <div class="w-full rounded-md">
        <slot/>
      </div>
      <p class="text-2xl">{{title}}</p>
      <p class="text-muted-foreground">{{description}}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
