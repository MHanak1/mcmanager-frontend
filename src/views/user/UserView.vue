<script setup lang="ts">

import { useUserStore } from '@/stores/user.ts'
import ImageUpload from '@/components/ImageUpload.vue'
import Header from '@/components/Header.vue'
import { Progress } from '@/components/ui/progress'
import { useUserWorldsStore } from '@/stores/world.ts'

const userStore = useUserStore()
const worlds = useUserWorldsStore()
const user = userStore.user

worlds.refreshAllWorlds()

</script>

<template>
  <main class="h-screen w-screen overflow-hidden flex flex-col gap-2">
    <Header/>
    <div class="flex flex-col items-center overflow-y-scroll">
      <div class="flex flex-col max-w-4xl w-full p-4 gap-4">
        <div class="flex gap-4">
          <div class="xl:size-60 size-40">
            <ImageUpload :icon_src="`/api/users/${user.id}/icon`" :icon_id="user.id" hover_text="" class="rounded-full"/>
          </div>
          <div class="flex flex-col justify-center">
            <span class="text-4xl font-bold">{{user.username}}</span>
            <span class="text-2xl ">{{user.group.name}}</span>
          </div>
        </div>


        <div v-if="user.group.world_limit">
          <span class="text-lg font-bold">Worlds</span>: {{Object.values(worlds.worlds).length}}/{{user.group.world_limit}}
          <Progress :model-value="Object.values(worlds.worlds).length * 100 / user.group.world_limit "  />
        </div>

        <div v-if="user.group.active_world_limit">
          <span class="text-lg font-bold">Worlds Running</span>: {{Object.values(worlds.worlds).filter(world => world.enabled).length}}/{{user.group.active_world_limit}}
          <Progress :model-value="Object.values(worlds.worlds).filter(world => world.enabled).length * 100 / user.group.active_world_limit "  />
        </div>

        <div v-if="user.group.total_memory_limit">
          <span class="text-lg font-bold">Memory Used</span>: {{user.total_memory_usage}}/{{user.group.total_memory_limit}}MB
          <Progress :model-value="user.total_memory_usage * 100 / user.group.total_memory_limit"  />
        </div>

        <!-- <div v-for="(value, key) in user.group">
          {{key}}: {{value}}
        </div> -->
      </div>
    </div>
  </main>
</template>

<style scoped>

</style>
