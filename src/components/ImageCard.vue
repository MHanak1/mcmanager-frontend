<script setup lang="ts">

defineProps<{
  image: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="bg-fg-1 p-4 rounded-xl shadow-md bg-card">
    <img :src=image class="w-full rounded-md shadow-shadow inset-shadow-md mb-2" onerror="this.onerror=null;this.src='https://placehold.co/256x256/orange/white'"/>
    <p class="text-2xl">{{title}}</p>
    <p class="text-muted-foreground">{{description}}</p>
  </div>
</template>

<style scoped>

</style>
