<script setup lang="ts">

import Header from '@/components/Header.vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

</script>

<template>
  <main class="h-screen w-screen overflow-hidden flex flex-col">
    <Toaster/>
    <Header/>
    <router-view/>
  </main>
</template>
