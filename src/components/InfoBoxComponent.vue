<script setup lang="ts">
import { GoInfo, GoAlert } from "vue-icons-plus/go";

defineProps<{
  title: string
  type: string
  message: string
}>()
</script>


.translucent_box {
border-radius: 10px;
background-color: rgba(0, 0, 0, 0.2);
border: none;
}


<template>
  <div class="flex flex-col p-4 rounded-xl" :style="{'background-color': type === 'warning' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)' }">
    <div class="flex flex-row gap-2 items-center pb-2">
      <GoInfo v-if="type === 'info'" />
      <GoAlert v-else-if="type === 'warning'" />
      <span class="text-2xl">{{title}}</span>
    </div>
    <hr class="pb-2" />
    <span>{{message}}</span>
  </div>
</template>

<style scoped>

</style>
