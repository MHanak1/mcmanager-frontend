<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { useConsole } from '@/stores/console.ts'
import { tryOnUnmounted, useScroll } from '@vueuse/core'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: string,
  disabled?: boolean,
  id: string,
}>()


const server_console = useConsole();
const consoleContainer = ref<HTMLDivElement | null>(null);

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

tryOnUnmounted(async () => {
  await server_console.detach()
})

const command = ref('')

</script>

<template>
  <div :class="`bg-black text-white p-2 rounded-md h-[50vh] flex flex-col ${props.class ?? ''}`">
    <div ref="consoleContainer" class="overflow-auto">
      <code v-for="(line, i) of server_console.logs" :key="i">
        {{line}}
      </code>
    </div>
    <div class="flex-1"/>
    <div class="flex gap-2">
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
          :disabled="props.disabled"
          class="border-none outline-none w-full "
        />
      </code>
    </div>
  </div>
</template>

<style scoped>

</style>
