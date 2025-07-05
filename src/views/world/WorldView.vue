<script setup lang="ts">
import { mande } from 'mande'
import {onBeforeMount, ref} from "vue";
import type {ModLoader, World} from "@/lib/types.ts";
import {useUserStore} from "@/stores/user.ts";
import {useServerDataStore} from "@/stores/server.ts";
import {useRoute} from "vue-router";


const api = mande("/api")
const user = useUserStore()
const server = useServerDataStore()
const world = ref({} as World)
const route = useRoute()
const id = route.params.id


/*
let max_memory = user.group.per_world_memory_limit
let remaining_total_memory = user.group.total_memory_limit
if (remaining_total_memory != null) {
  for (const world of worlds.value) {
    remaining_total_memory -= world.allocated_memory;
  }
}

// this horrible logic brought to you by typescript
if (max_memory != null && remaining_total_memory != null) {
  if (max_memory > remaining_total_memory) {
    max_memory = remaining_total_memory;
  }
} else {
  max_memory = remaining_total_memory ?? max_memory;
}
 */

onBeforeMount(async () => {
  world.value = await api.get(`worlds/${id}`) as World
});
</script>

<template>
  <div class="grid grid-cols-3 grid-rows-1 flex-1">
    <div class="col-span-1 h-full bg-card/50 shadow-shadow shadow-lg mb-0" >

    </div>
    <div class="col-span-2 h-full">
      {{world}}
    </div>
  </div>

</template>

<style scoped>

</style>
