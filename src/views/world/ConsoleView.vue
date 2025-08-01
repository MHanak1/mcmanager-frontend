<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useConsole } from '@/stores/console.ts'
import { tryOnScopeDispose, tryOnUnmounted, useScroll } from '@vueuse/core'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { onBeforeRouteLeave } from 'vue-router'
import { CgSpinner } from 'vue-icons-plus/cg'

const props = defineProps<{
  class?: string,
  id: string,
}>()


const server_console = useConsole();
const consoleContainer = ref<HTMLDivElement | null>(null);

const show_console_loading_message = ref(false)
setTimeout(() => show_console_loading_message.value = true, 1000)

const { arrivedState } = useScroll(consoleContainer, {
  throttle: 100,
  offset: { bottom: 10 },
})

watch(
  () => server_console.logs.length,
  () => {
    if (arrivedState.bottom) {
      nextTick(() => {
        if (consoleContainer.value) {
          consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
        }
      })
    }
  }
)

onMounted(async () => {
  await server_console.init()
  await server_console.attach(props.id)

  nextTick(() => {
    if (consoleContainer.value) {
      consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight
    }
  })
})

onBeforeRouteLeave(async () => {
  await server_console.detach()
})

const command = ref('')

</script>

<template>
  <div :class="`bg-black text-white p-2 rounded-md h-[50vh] flex flex-col ${props.class ?? ''}`">
    <div class="relative bg-red-500 rounded-md px-2 text-lg flex items-center gap-1" v-if="server_console.failed">
      Console Disconnected
    </div>
    <div class="relative bg-yellow-500 rounded-md px-2 text-lg flex items-center gap-1" v-else-if="server_console.id == null && show_console_loading_message">
      <CgSpinner class="animate-spin" />
      Connecting Console
    </div>
    <div ref="consoleContainer" class="overflow-auto">
      <code v-for="(line, i) of server_console.logs" :key="i">
        {{line}}
      </code>
    </div>
    <div class="flex-1"/>
    <div class="flex gap-2" v-if="server_console.world_status?.status == 'running' && server_console.id != null && !server_console.failed">
      <code>
        >
      </code>
      <code class="w-full">
        <input
          @keydown.enter="() => {
            server_console.write_console(command)
            command = ''
          }"
          v-model="command"
          class="border-none outline-none w-full "
        />
      </code>
    </div>
  </div>
</template>

<style scoped>

</style>
